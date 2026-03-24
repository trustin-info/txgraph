import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeProps,
  BaseEdge,
  EdgeLabelRenderer,
  useNodes,
  useEdges,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AlertTriangle, Plus, Loader2 } from 'lucide-react'
import Dagre from '@dagrejs/dagre'
import type { TxNode, TxEdge, TxGraphStats, GraphExplorerProps } from './types'

// ─── Dark mode hook ───────────────────────────────────────────────────────────

function useDarkMode(): boolean {
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  )
  useEffect(() => {
    if (typeof document === 'undefined') return
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return isDark
}

// ─── Risk color helpers ───────────────────────────────────────────────────────

function riskBorderColor(risk: string): string {
  switch (risk) {
    case 'high':   return '#ef4444'
    case 'medium': return '#f59e0b'
    case 'low':    return '#22c55e'
    default:       return '#6b7280'
  }
}

function riskBgColor(risk: string): string {
  switch (risk) {
    case 'high':   return 'rgba(239,68,68,0.08)'
    case 'medium': return 'rgba(245,158,11,0.08)'
    case 'low':    return 'rgba(34,197,94,0.08)'
    default:       return 'rgba(107,114,128,0.06)'
  }
}

// ─── Callbacks context ────────────────────────────────────────────────────────

interface ExplorerCtx {
  onNodeSelect?: (node: TxNode | null) => void
  onNodeExpand?: (address: string) => void
  onNodeDelete?: (address: string) => void
  expandingNode: string | null
}

const ExplorerCallbacksCtx = createContext<ExplorerCtx>({ expandingNode: null })

// ─── Custom Node data type ────────────────────────────────────────────────────

interface ExplorerNodeData extends Record<string, unknown> {
  nodeInfo: TxNode
}

// ─── Custom Node Component ────────────────────────────────────────────────────

function ExplorerNode({ data, id }: NodeProps) {
  const { onNodeSelect, onNodeExpand, onNodeDelete, expandingNode } = useContext(ExplorerCallbacksCtx)
  const d = data as ExplorerNodeData & { isSelected?: boolean; isOnPath?: boolean; isDimmed?: boolean }
  const node = d.nodeInfo
  const isLoading = expandingNode === node.address
  const isSelected = d.isSelected === true
  const isDimmed = d.isDimmed === true

  const shortAddr = node.address
    ? `${node.address.slice(0, 6)}…${node.address.slice(-4)}`
    : id.slice(0, 6) + '…' + id.slice(-4)

  const primaryTag = node.tags?.[0]
  const borderColor = node.is_root ? '#3b82f6' : riskBorderColor(node.risk_level)
  const bg = node.is_root ? 'rgba(59,130,246,0.08)' : riskBgColor(node.risk_level)
  const borderStyle = node.is_stopped && !node.is_root ? 'dashed' : 'solid'
  const borderWidth = node.is_root ? 2 : 1.5

  return (
    <div
      style={{
        position: 'relative',
        border: `${borderWidth}px ${borderStyle} ${borderColor}`,
        borderRadius: 8,
        width: 180,
        minHeight: 70,
        padding: '8px 12px',
        background: bg,
        boxShadow: isSelected
          ? `0 0 0 3px rgba(59,130,246,0.6), 0 0 12px rgba(59,130,246,0.3)`
          : node.is_root
            ? `0 0 0 3px rgba(59,130,246,0.25)`
            : '0 1px 4px rgba(0,0,0,0.12)',
        cursor: 'pointer',
        userSelect: 'none',
        overflow: 'hidden',
        opacity: isDimmed ? 0.25 : 1,
        transition: 'opacity 0.2s, box-shadow 0.2s',
      }}
      onClick={() => onNodeSelect?.(node)}
    >
      {/* Left handles */}
      <Handle type="target" id="target-left" position={Position.Left} style={{ background: '#6b7280', width: 8, height: 8, top: '40%' }} />
      <Handle type="source" id="source-left" position={Position.Left} style={{ background: '#06b6d4', width: 8, height: 8, top: '60%' }} />

      {/* Loading overlay */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 7,
            zIndex: 10,
          }}
        >
          <Loader2 size={20} style={{ color: '#60a5fa', animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* Top row: badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4, flexWrap: 'wrap' }}>
        {node.is_root && (
          <span
            style={{
              fontSize: 9,
              padding: '1px 5px',
              borderRadius: 4,
              background: '#3b82f6',
              color: '#fff',
              fontWeight: 700,
              letterSpacing: '0.06em',
            }}
          >
            ROOT
          </span>
        )}
        {node.is_stopped && (
          <AlertTriangle size={11} style={{ color: '#f59e0b', flexShrink: 0 }} />
        )}
        {primaryTag && (
          <span
            style={{
              fontSize: 9,
              padding: '1px 5px',
              borderRadius: 4,
              background: 'rgba(99,102,241,0.15)',
              color: '#818cf8',
              fontWeight: 600,
              maxWidth: 100,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {primaryTag.primaryCategory || primaryTag.name}
          </span>
        )}
      </div>

      {/* Address */}
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: 11,
          color: 'var(--tx-heading, #ffffff)',
          fontWeight: 400,
          letterSpacing: '0.02em',
        }}
      >
        {shortAddr}
      </div>

      {/* Risk + depth row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
        <span
          style={{
            fontSize: 9,
            padding: '1px 5px',
            borderRadius: 4,
            background: riskBorderColor(node.risk_level) + '22',
            color: riskBorderColor(node.risk_level),
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        >
          {node.risk_level}
        </span>
        <span style={{ fontSize: 9, color: 'var(--tx-caption, #64748b)' }}>d{node.depth}</span>
      </div>

      {/* Expand button */}
      {!node.is_root && !node.is_stopped && onNodeExpand && (
        <button
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#3b82f6',
            border: 'none',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            zIndex: 5,
          }}
          onClick={(e) => {
            e.stopPropagation()
            onNodeExpand(node.address)
          }}
          title="Expand from this node"
        >
          <Plus size={11} />
        </button>
      )}

      {/* Delete button */}
      {!node.is_root && onNodeDelete && (
        <button
          style={{
            position: 'absolute',
            top: 4,
            right: !node.is_stopped && onNodeExpand ? 26 : 4,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#6b7280',
            border: 'none',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            zIndex: 5,
            opacity: 0.7,
          }}
          onClick={(e) => {
            e.stopPropagation()
            onNodeDelete(node.address)
          }}
          title="Remove this node"
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.opacity = '1'
            ;(e.currentTarget as HTMLElement).style.background = '#ef4444'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.opacity = '0.7'
            ;(e.currentTarget as HTMLElement).style.background = '#6b7280'
          }}
        >
          ✕
        </button>
      )}

      {/* Right handles */}
      <Handle type="source" id="source-right" position={Position.Right} style={{ background: '#8b5cf6', width: 8, height: 8, top: '40%' }} />
      <Handle type="target" id="target-right" position={Position.Right} style={{ background: '#6b7280', width: 8, height: 8, top: '60%' }} />
    </div>
  )
}

const nodeTypes = { explorerNode: ExplorerNode }

// ─── Custom Edge ──────────────────────────────────────────────────────────────

const STRAIGHT_LINE_LENGTH = 100
const LINE_SPACE = 30
const SAME_LEVEL_THRESHOLD = 200

function AmountEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  label,
  source,
  target,
  data,
}: EdgeProps) {
  const nodes = useNodes()
  const edges = useEdges()

  const selfFromNode = nodes.find((n) => n.id === source)
  const selfToNode = nodes.find((n) => n.id === target)

  const sameLevelEdges = edges.filter((e) => {
    const fromNode = nodes.find((n) => n.id === e.source)
    const toNode = nodes.find((n) => n.id === e.target)
    if (!fromNode || !toNode || !selfFromNode || !selfToNode) return false
    return (
      (Math.abs(fromNode.position.x - selfFromNode.position.x) < SAME_LEVEL_THRESHOLD &&
        Math.abs(toNode.position.x - selfToNode.position.x) < SAME_LEVEL_THRESHOLD) ||
      (Math.abs(fromNode.position.x - selfToNode.position.x) < SAME_LEVEL_THRESHOLD &&
        Math.abs(toNode.position.x - selfFromNode.position.x) < SAME_LEVEL_THRESHOLD)
    )
  })

  let labelX = (sourceX + targetX) / 2
  let labelY = (sourceY + targetY) / 2
  let path: string

  if (sameLevelEdges.length <= 1) {
    const midX = (sourceX + targetX) / 2
    path = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`
  } else {
    type EdgeInfo = { edgeId: string; idealY: number }
    const edgeInfos: EdgeInfo[] = sameLevelEdges.map((e) => {
      const sn = nodes.find((n) => n.id === e.source)
      const tn = nodes.find((n) => n.id === e.target)
      const sY = sn?.position?.y ?? 0
      const tY = tn?.position?.y ?? 0
      return { edgeId: e.id, idealY: (sY + tY) / 2 }
    })
    edgeInfos.sort((a, b) => a.idealY - b.idealY)

    const assignedYs: number[] = []
    for (let i = 0; i < edgeInfos.length; i++) {
      if (i === 0) {
        assignedYs.push(edgeInfos[i].idealY)
      } else {
        assignedYs.push(Math.max(edgeInfos[i].idealY, assignedYs[i - 1] + LINE_SPACE))
      }
    }

    const medianIdeal = edgeInfos[Math.floor(edgeInfos.length / 2)].idealY
    const medianAssigned = assignedYs[Math.floor(assignedYs.length / 2)]
    const shift = medianIdeal - medianAssigned
    for (let i = 0; i < assignedYs.length; i++) {
      assignedYs[i] += shift
    }

    const selfIdx = edgeInfos.findIndex((ei) => ei.edgeId === id)
    const straightY = selfIdx >= 0 ? assignedYs[selfIdx] : (sourceY + targetY) / 2
    const remainX = Math.max((Math.abs(targetX - sourceX) - STRAIGHT_LINE_LENGTH) / 2, 20)

    if (targetX > sourceX) {
      const c1EndX = sourceX + remainX
      const c2StartX = targetX - remainX
      path = `M ${sourceX},${sourceY} C ${sourceX + remainX * 0.5},${sourceY} ${sourceX + remainX * 0.5},${straightY} ${c1EndX},${straightY} L ${c2StartX},${straightY} C ${targetX - remainX * 0.5},${straightY} ${targetX - remainX * 0.5},${targetY} ${targetX},${targetY}`
    } else {
      const c1EndX = sourceX - remainX
      const c2StartX = targetX + remainX
      path = `M ${sourceX},${sourceY} C ${sourceX - remainX * 0.5},${sourceY} ${sourceX - remainX * 0.5},${straightY} ${c1EndX},${straightY} L ${c2StartX},${straightY} C ${targetX + remainX * 0.5},${straightY} ${targetX + remainX * 0.5},${targetY} ${targetX},${targetY}`
    }

    labelX = (sourceX + targetX) / 2
    labelY = straightY
  }

  return (
    <>
      <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transformOrigin: 'center',
              textAlign: 'center',
              transform: `translate(-50%, -100%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
            }}
            className="nodrag nopan"
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 500,
                color: 'var(--tx-body, #94a3b8)',
                background: 'var(--tx-elevated, #1e293b)',
                padding: '1px 5px',
                borderRadius: 3,
                whiteSpace: 'nowrap',
                border: '1px solid var(--tx-divider, rgba(51,65,85,0.5))',
              }}
            >
              {(data as Record<string, string>)?.token && <TokenIcon token={(data as Record<string, string>).token} />}
              {label as React.ReactNode}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

function TokenIcon({ token }: { token: string }) {
  const t = token.toLowerCase()
  if (t === 'usdt') {
    return (
      <svg width="12" height="12" viewBox="0 0 32 32" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 2 }}>
        <circle cx="16" cy="16" r="16" fill="#26A17B" />
        <path d="M17.9 17.9v-.003c-.1.007-.6.04-1.8.04-1 0-1.5-.03-1.7-.04v.004c-3.4-.15-5.9-.74-5.9-1.45 0-.71 2.5-1.3 5.9-1.45v2.31c.2.015.7.05 1.7.05 1.2 0 1.6-.04 1.8-.05V15c3.4.15 5.9.74 5.9 1.45 0 .71-2.5 1.3-5.9 1.45zm0-3.13V12.8h5v-2.6H9.2v2.6h5v1.97c-3.8.17-6.7.93-6.7 1.83s2.9 1.66 6.7 1.83v6.57h3.5v-6.57c3.8-.17 6.7-.93 6.7-1.83s-2.9-1.66-6.7-1.83z" fill="#fff" />
      </svg>
    )
  }
  if (t === 'usdc') {
    return (
      <svg width="12" height="12" viewBox="0 0 32 32" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 2 }}>
        <circle cx="16" cy="16" r="16" fill="#2775CA" />
        <path d="M20.4 18c0-2.1-1.3-2.8-3.8-3.1-1.8-.3-2.2-.7-2.2-1.4s.6-1.2 1.8-1.2c1 0 1.6.4 1.8 1.2.1.1.2.2.3.2h1c.2 0 .3-.2.3-.3-.2-1.2-1-2.1-2.3-2.4v-1.4c0-.2-.1-.3-.3-.3h-.8c-.2 0-.3.1-.3.3V11c-1.7.3-2.8 1.3-2.8 2.7 0 2 1.2 2.7 3.7 3 1.6.3 2.2.6 2.2 1.5s-.8 1.4-1.9 1.4c-1.5 0-2-.6-2.2-1.4 0-.2-.1-.2-.3-.2h-1c-.2 0-.3.1-.3.3.3 1.4 1.1 2.2 2.8 2.5v1.4c0 .2.1.3.3.3h.8c.2 0 .3-.1.3-.3v-1.4c1.8-.2 2.9-1.3 2.9-2.8z" fill="#fff" />
      </svg>
    )
  }
  return null
}

const edgeTypes = { amountEdge: AmountEdge }

// ─── Dagre layout ─────────────────────────────────────────────────────────────

function layoutGraph(
  apiNodes: TxNode[],
  apiEdges: TxEdge[],
): { flowNodes: Node[]; flowEdges: Edge[] } {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 280 })

  apiNodes.forEach((n) => g.setNode(n.address, { width: 180, height: 70 }))
  apiEdges.forEach((e) => {
    try {
      g.setEdge(e.from, e.to)
    } catch {
      // ignore invalid edges
    }
  })
  Dagre.layout(g)

  const flowNodes: Node[] = apiNodes.map((n) => {
    const pos = g.node(n.address)
    return {
      id: n.address,
      type: 'explorerNode',
      position: { x: pos ? pos.x - 90 : 0, y: pos ? pos.y - 35 : 0 },
      data: { nodeInfo: n } as ExplorerNodeData,
    }
  })

  const stoppedSet = new Set(apiNodes.filter((n) => n.is_stopped).map((n) => n.address))

  const posMap = new Map<string, { x: number; y: number }>()
  apiNodes.forEach((n) => {
    const pos = g.node(n.address)
    if (pos) posMap.set(n.address, { x: pos.x, y: pos.y })
  })

  const flowEdges: Edge[] = apiEdges.map((e, i) => {
    const isOutflow = e.direction === 'out'
    const edgeColor = isOutflow ? '#8b5cf6' : '#06b6d4'
    const isStopped = stoppedSet.has(e.to) || stoppedSet.has(e.from)

    const srcPos = posMap.get(e.from)
    const tgtPos = posMap.get(e.to)
    const srcIsLeft = srcPos && tgtPos ? srcPos.x <= tgtPos.x : isOutflow
    const sourceHandle = srcIsLeft ? 'source-right' : 'source-left'
    const targetHandle = srcIsLeft ? 'target-left' : 'target-right'

    const token = e.token || (e.formatted_amount.includes('USDT') ? 'usdt' : e.formatted_amount.includes('USDC') ? 'usdc' : '')

    return {
      id: `edge-${i}-${e.from}-${e.to}`,
      source: e.from,
      target: e.to,
      sourceHandle,
      targetHandle,
      type: 'amountEdge',
      animated: false,
      data: { token },
      label: e.last_timestamp
        ? `${e.formatted_amount} · ${new Date(e.last_timestamp * 1000).toISOString().replace('T', ' ').slice(0, 10)}`
        : e.formatted_amount,
      style: {
        stroke: edgeColor,
        strokeWidth: 1.5,
        strokeDasharray: isStopped ? '4 3' : undefined,
      },
      markerEnd: {
        type: 'arrowclosed' as const,
        color: edgeColor,
        width: 16,
        height: 16,
      },
    }
  })

  return { flowNodes, flowEdges }
}

// ─── GraphExplorer ────────────────────────────────────────────────────────────

export default function GraphExplorer({
  nodes: apiNodes,
  edges: apiEdges,
  stats,
  loading = false,
  expandingNode = null,
  onNodeSelect,
  onNodeExpand,
  onNodeDelete,
  selectedAddress = null,
}: GraphExplorerProps) {
  const isDark = useDarkMode()

  const { flowNodes, flowEdges } = useMemo(
    () => layoutGraph(apiNodes, apiEdges),
    [apiNodes, apiEdges],
  )

  const pathInfo = useMemo(() => {
    if (!selectedAddress) return { pathNodes: new Set<string>(), pathEdges: new Set<string>() }

    const rootAddr = apiNodes.find((n) => n.is_root)?.address
    if (!rootAddr || selectedAddress === rootAddr) return { pathNodes: new Set<string>([selectedAddress]), pathEdges: new Set<string>() }

    const fwd = new Map<string, Array<{ to: string; edgeId: string }>>()
    for (let i = 0; i < apiEdges.length; i++) {
      const e = apiEdges[i]
      if (!fwd.has(e.from)) fwd.set(e.from, [])
      fwd.get(e.from)!.push({ to: e.to, edgeId: `edge-${i}-${e.from}-${e.to}` })
    }

    const pathNodes = new Set<string>()
    const pathEdges = new Set<string>()

    const visiting = new Set<string>()
    function dfs(cur: string): boolean {
      if (cur === selectedAddress) {
        pathNodes.add(cur)
        return true
      }
      if (visiting.has(cur)) return false
      visiting.add(cur)

      let foundAny = false
      for (const { to, edgeId } of fwd.get(cur) ?? []) {
        if (dfs(to)) {
          pathNodes.add(cur)
          pathNodes.add(to)
          pathEdges.add(edgeId)
          foundAny = true
        }
      }

      visiting.delete(cur)
      return foundAny
    }

    dfs(rootAddr)
    return { pathNodes, pathEdges }
  }, [selectedAddress, apiNodes, apiEdges])

  const hasSelection = selectedAddress != null && pathInfo.pathNodes.size > 0

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(flowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(flowEdges)

  const rfInstance = useRef<ReactFlowInstance | null>(null)

  useEffect(() => {
    const highlighted = flowNodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        isSelected: n.id === selectedAddress,
        isOnPath: hasSelection && pathInfo.pathNodes.has(n.id),
        isDimmed: hasSelection && !pathInfo.pathNodes.has(n.id),
      },
    }))
    setNodes(highlighted)
  }, [flowNodes, setNodes, selectedAddress, hasSelection, pathInfo])

  useEffect(() => {
    const highlighted = flowEdges.map((e) => ({
      ...e,
      style: {
        ...e.style,
        opacity: hasSelection && !pathInfo.pathEdges.has(e.id) ? 0.15 : 1,
        strokeWidth: hasSelection && pathInfo.pathEdges.has(e.id) ? 2.5 : ((e.style as React.CSSProperties)?.strokeWidth ?? 1.5),
      },
    }))
    setEdges(highlighted)
  }, [flowEdges, setEdges, hasSelection, pathInfo])

  useEffect(() => {
    requestAnimationFrame(() => {
      rfInstance.current?.fitView({ padding: 0.3, duration: 300 })
    })
  }, [flowEdges])

  const ctxValue = useMemo(
    () => ({ onNodeSelect, onNodeExpand, onNodeDelete, expandingNode }),
    [onNodeSelect, onNodeExpand, onNodeDelete, expandingNode],
  )

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ExplorerCallbacksCtx.Provider value={ctxValue}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          onInit={(instance) => { rfInstance.current = instance }}
          onPaneClick={() => onNodeSelect?.(null)}
          minZoom={0.05}
          maxZoom={3}
          proOptions={{ hideAttribution: true }}
          colorMode={isDark ? 'dark' : 'light'}
        >
          <Background color={isDark ? '#374151' : '#d1d5db'} gap={20} />
          <Controls />
          <MiniMap
            maskColor={isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.65)'}
          />

          <Panel position="top-right">
            <div
              style={{
                fontSize: 11,
                color: 'var(--tx-body, #94a3b8)',
                background: 'var(--tx-elevated, #1e293b)',
                border: '1px solid var(--tx-divider, rgba(51,65,85,0.5))',
                borderRadius: 6,
                padding: '4px 10px',
              }}
            >
              {stats
                ? `${stats.total_nodes} nodes · ${stats.total_edges} edges`
                : `${apiNodes.length} nodes · ${apiEdges.length} edges`}
            </div>
          </Panel>
        </ReactFlow>
      </ExplorerCallbacksCtx.Provider>

      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            zIndex: 20,
          }}
        >
          <Loader2 size={36} style={{ color: '#60a5fa', animation: 'spin 1s linear infinite' }} />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>Exploring graph…</span>
        </div>
      )}
    </div>
  )
}
