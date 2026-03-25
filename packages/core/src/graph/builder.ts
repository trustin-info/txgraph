import type { TxGraph, TxNode, TxEdge } from '../types'
import type { DataSource } from '../adapter/types'
import { aggregateTransactions } from './aggregator'
import { RateLimiter } from '../utils/rate-limiter'

export interface BuilderOptions {
  maxDepth?: number
  maxNodesPerDepth?: number
  direction?: 'in' | 'out' | 'all'
  token?: string
  fromDate?: string
  toDate?: string
  onProgress?: (event: ProgressEvent) => void
}

export interface ProgressEvent {
  currentDepth: number
  maxDepth: number
  nodesProcessed: number
  totalNodes: number
}

export class GraphBuilder {
  private adapter: DataSource
  private options: Required<Pick<BuilderOptions, 'maxDepth' | 'maxNodesPerDepth' | 'direction'>> &
    BuilderOptions

  constructor(adapter: DataSource, options: BuilderOptions = {}) {
    this.adapter = adapter
    this.options = {
      maxDepth: 3,
      maxNodesPerDepth: 20,
      direction: 'out',
      ...options,
    }
  }

  async explore(address: string, chain: string): Promise<TxGraph> {
    if (this.adapter.capabilities.returnsPrebuiltGraph && this.adapter.exploreGraph) {
      return this.adapter.exploreGraph({
        address,
        chain,
        direction: this.options.direction,
        token: this.options.token,
        maxDepth: this.options.maxDepth,
        fromDate: this.options.fromDate,
        toDate: this.options.toDate,
      })
    }

    return this.bfsExplore(address, chain)
  }

  async expandNode(
    address: string,
    chain: string,
    existing: TxGraph
  ): Promise<TxGraph> {
    if (this.adapter.capabilities.returnsPrebuiltGraph && this.adapter.exploreGraph) {
      const data = await this.adapter.exploreGraph({
        address,
        chain,
        direction: this.options.direction,
        token: this.options.token,
        maxDepth: 1,
      })
      return this.mergeGraphs(existing, data)
    }

    return this.bfsExpandNode(address, chain, existing)
  }

  private async bfsExplore(rootAddress: string, chain: string): Promise<TxGraph> {
    const nodes = new Map<string, TxNode>()
    const allEdges: TxEdge[] = []
    const visited = new Set<string>()
    const rateLimiter = new RateLimiter(this.adapter.capabilities.rateLimit)

    const rootNode: TxNode = {
      address: rootAddress,
      depth: 0,
      is_root: true,
      risk_level: 'unknown',
      tags: [],
      total_neighbors: 0,
      visible_neighbors: 0,
      is_stopped: false,
      chain,
    }
    nodes.set(rootAddress, rootNode)

    let currentLayer = [rootAddress]

    for (let depth = 0; depth < this.options.maxDepth && currentLayer.length > 0; depth++) {
      const nextLayer: string[] = []

      for (const addr of currentLayer) {
        if (visited.has(addr)) continue
        visited.add(addr)

        this.options.onProgress?.({
          currentDepth: depth,
          maxDepth: this.options.maxDepth,
          nodesProcessed: visited.size,
          totalNodes: nodes.size,
        })

        await rateLimiter.acquire()

        let page = 1
        let hasMore = true
        const allTxs = []

        while (hasMore) {
          const result = await this.adapter.fetchTransactions({
            address: addr,
            chain,
            direction: this.options.direction,
            token: this.options.token,
            page,
            pageSize: 100,
          })
          allTxs.push(...result.transactions)
          hasMore = result.hasMore
          page++

          if (hasMore) {
            await rateLimiter.acquire()
          }
        }

        const edges = aggregateTransactions(allTxs, this.options.direction)
        allEdges.push(...edges)

        const node = nodes.get(addr)
        if (node) {
          node.total_neighbors = new Set(
            allTxs.flatMap((tx) => [tx.from, tx.to].filter((a) => a !== addr))
          ).size
        }

        // Collect neighbor addresses for next layer
        let neighborCount = 0
        for (const edge of edges) {
          const neighbor = edge.from === addr ? edge.to : edge.from
          if (!nodes.has(neighbor) && neighborCount < this.options.maxNodesPerDepth) {
            nodes.set(neighbor, {
              address: neighbor,
              depth: depth + 1,
              is_root: false,
              risk_level: 'unknown',
              tags: [],
              total_neighbors: 0,
              visible_neighbors: 0,
              is_stopped: false,
              chain,
            })
            nextLayer.push(neighbor)
            neighborCount++
          }
        }

        if (node) {
          node.visible_neighbors = neighborCount
          if (node.total_neighbors > neighborCount) {
            node.is_stopped = true
            node.stop_reason = `Limited to ${this.options.maxNodesPerDepth} nodes per depth`
          }
        }
      }

      currentLayer = nextLayer
    }

    const nodeArray = Array.from(nodes.values())
    const nodeAddresses = new Set(nodeArray.map((n) => n.address))
    const filteredEdges = allEdges.filter(
      (e) => nodeAddresses.has(e.from) && nodeAddresses.has(e.to)
    )
    // Deduplicate edges by (from, to)
    const edgeMap = new Map<string, TxEdge>()
    for (const edge of filteredEdges) {
      const key = `${edge.from}->${edge.to}`
      if (!edgeMap.has(key)) {
        edgeMap.set(key, edge)
      }
    }

    return {
      nodes: nodeArray,
      edges: Array.from(edgeMap.values()),
      stats: {
        total_nodes: nodeArray.length,
        total_edges: edgeMap.size,
        max_depth_reached: Math.max(...nodeArray.map((n) => n.depth)),
        stopped_nodes: nodeArray.filter((n) => n.is_stopped).length,
      },
    }
  }

  private async bfsExpandNode(
    address: string,
    chain: string,
    existing: TxGraph
  ): Promise<TxGraph> {
    const rateLimiter = new RateLimiter(this.adapter.capabilities.rateLimit)
    await rateLimiter.acquire()

    let page = 1
    let hasMore = true
    const allTxs = []

    while (hasMore) {
      const result = await this.adapter.fetchTransactions({
        address,
        chain,
        direction: this.options.direction,
        token: this.options.token,
        page,
        pageSize: 100,
      })
      allTxs.push(...result.transactions)
      hasMore = result.hasMore
      page++
      if (hasMore) await rateLimiter.acquire()
    }

    const edges = aggregateTransactions(allTxs, this.options.direction)
    const existingAddrs = new Set(existing.nodes.map((n) => n.address))
    const sourceNode = existing.nodes.find((n) => n.address === address)
    const baseDepth = sourceNode ? sourceNode.depth : 0

    const newNodes: TxNode[] = []
    let count = 0
    for (const edge of edges) {
      const neighbor = edge.from === address ? edge.to : edge.from
      if (!existingAddrs.has(neighbor) && count < this.options.maxNodesPerDepth) {
        newNodes.push({
          address: neighbor,
          depth: baseDepth + 1,
          is_root: false,
          risk_level: 'unknown',
          tags: [],
          total_neighbors: 0,
          visible_neighbors: 0,
          is_stopped: false,
          chain,
        })
        count++
      }
    }

    const expandedGraph: TxGraph = {
      nodes: newNodes,
      edges,
      stats: {
        total_nodes: newNodes.length,
        total_edges: edges.length,
        max_depth_reached: baseDepth + 1,
        stopped_nodes: 0,
      },
    }

    return this.mergeGraphs(existing, expandedGraph)
  }

  private mergeGraphs(existing: TxGraph, incoming: TxGraph): TxGraph {
    const existingAddrs = new Set(existing.nodes.map((n) => n.address))
    const newNodes = incoming.nodes.filter((n) => !existingAddrs.has(n.address))

    const existingEdgeKeys = new Set(existing.edges.map((e) => `${e.from}->${e.to}`))
    const newEdges = incoming.edges.filter(
      (e) => !existingEdgeKeys.has(`${e.from}->${e.to}`)
    )

    const allNodes = [...existing.nodes, ...newNodes]
    const allEdges = [...existing.edges, ...newEdges]

    return {
      nodes: allNodes,
      edges: allEdges,
      stats: {
        total_nodes: allNodes.length,
        total_edges: allEdges.length,
        max_depth_reached: Math.max(
          existing.stats?.max_depth_reached ?? 0,
          incoming.stats?.max_depth_reached ?? 0
        ),
        stopped_nodes: allNodes.filter((n) => n.is_stopped).length,
      },
    }
  }
}
