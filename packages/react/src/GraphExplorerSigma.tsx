import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react'
import Graph from 'graphology'
import { Sigma } from 'sigma'
import type { EdgeDisplayData, NodeDisplayData } from 'sigma/types'
import { EdgeCurvedArrowProgram } from '@sigma/edge-curve'
import { Loader2 } from 'lucide-react'
import type { GraphExplorerProps, TxNode } from './types'

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

// ─── Risk color helper ────────────────────────────────────────────────────────

function riskColor(risk: string): string {
  switch (risk) {
    case 'high':   return '#ef4444'
    case 'medium': return '#f59e0b'
    case 'low':    return '#22c55e'
    default:       return '#6b7280'
  }
}

// ─── Layout constants ─────────────────────────────────────────────────────────

const ROOT_NODE_SIZE = 0.4
const REGULAR_NODE_SIZE = 0.3
const NODE_SPACING = 1.0
const LEVEL_SPACING = 3.5
const BASE_FONT_SIZE = 11

// ─── Static styles ────────────────────────────────────────────────────────────

const controlBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 4,
  border: '1px solid var(--tx-divider, rgba(51,65,85,0.5))',
  background: 'var(--tx-elevated, #1e293b)',
  color: 'var(--tx-body, #94a3b8)',
  cursor: 'pointer',
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

// ─── GraphExplorerSigma ───────────────────────────────────────────────────────

export default function GraphExplorerSigma({
  nodes,
  edges,
  stats,
  loading = false,
  selectedAddress,
  onNodeSelect,
  onNodeExpand,
  onNodeDelete,
}: GraphExplorerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sigmaRef = useRef<Sigma | null>(null)
  const graphRef = useRef<Graph | null>(null)

  const isDark = useDarkMode()

  const colors = useMemo(
    () => ({
      bg: isDark ? '#0f172a' : '#f8fafc',
      label: isDark ? '#e2e8f0' : '#1e293b',
      labelBg: isDark ? '#1e293b' : '#ffffff',
      edge: isDark ? '#6b7280' : '#9ca3af',
      nodeBorder: isDark ? '#374151' : '#d1d5db',
      dimNode: isDark ? '#374151' : '#e2e8f0',
      dimEdge: isDark ? '#1f2937' : '#f1f5f9',
      isDark,
    }),
    [isDark],
  )

  const colorsRef = useRef(colors)
  useEffect(() => {
    colorsRef.current = colors
  }, [colors])

  const isDarkRef = useRef(isDark)
  useEffect(() => {
    isDarkRef.current = isDark
  }, [isDark])

  // ─── Custom node label renderer ──────────────────────────────────────────────
  const customDrawNodeLabel = useCallback(
    (
      context: CanvasRenderingContext2D,
      data: { x: number; y: number; size: number; label: string; color: string; [key: string]: unknown },
      _settings: unknown,
    ) => {
      if (!data.label) return

      const currentIsDark = colorsRef.current.isDark
      const nodeColor = (data.color as string) || ''
      const isDimmedNode =
        nodeColor === colorsRef.current.dimNode ||
        nodeColor === (currentIsDark ? '#4b5563' : '#9ca3af')
      const textColor = isDimmedNode
        ? (currentIsDark ? '#6b7280' : '#9ca3af')
        : (currentIsDark ? '#f1f5f9' : '#0f172a')
      const tagColor = isDimmedNode
        ? (currentIsDark ? '#4b5563' : '#c4c9d0')
        : (currentIsDark ? '#94a3b8' : '#64748b')

      const nodeRadius = data.size as number
      const cameraRatio = sigmaRef.current?.getCamera().ratio ?? 1
      const fontSize = Math.max(6, Math.min(BASE_FONT_SIZE / cameraRatio, nodeRadius * 0.35))
      context.font = `600 ${fontSize}px monospace`
      context.fillStyle = textColor
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(data.label as string, data.x, data.y - (nodeRadius > 14 ? 4 : 1))

      const nodeInfo = (data as Record<string, unknown>).nodeData as TxNode | undefined
      if (nodeInfo && !isDimmedNode && nodeRadius >= 14) {
        const tag =
          nodeInfo.tags?.[0]?.secondaryCategory ||
          nodeInfo.tags?.[0]?.primaryCategory ||
          nodeInfo.tags?.[0]?.name ||
          ''
        const riskStr = nodeInfo.risk_level !== 'unknown' ? nodeInfo.risk_level : ''
        const subLabel = tag || riskStr
        if (subLabel) {
          const subFontSize = Math.max(5, (BASE_FONT_SIZE * 0.65) / cameraRatio)
          context.font = `${subFontSize}px sans-serif`
          context.fillStyle = tagColor
          context.fillText(subLabel.slice(0, 14), data.x, data.y + nodeRadius * 0.55)
        }
      }
    },
    [],
  )

  // ─── Custom edge label renderer ──────────────────────────────────────────────
  const customDrawEdgeLabel = useCallback(
    (
      context: CanvasRenderingContext2D,
      data: EdgeDisplayData & { label?: string },
      sourceData: NodeDisplayData,
      targetData: NodeDisplayData,
      _settings: unknown,
    ) => {
      if (!data.label) return

      const cameraRatio = sigmaRef.current?.getCamera().ratio ?? 1
      const fontSize = Math.max(5, (BASE_FONT_SIZE * 0.85) / cameraRatio)

      const x = (sourceData.x + targetData.x) / 2
      const y = (sourceData.y + targetData.y) / 2

      context.save()
      context.font = `${fontSize}px sans-serif`
      context.textAlign = 'center'
      context.textBaseline = 'middle'

      const metrics = context.measureText(data.label)
      const padding = Math.max(2, fontSize * 0.3)
      const w = metrics.width + padding * 2
      const h = fontSize + padding * 2
      context.fillStyle = 'rgba(0,0,0,0.55)'
      context.beginPath()
      context.roundRect(x - w / 2, y - h / 2, w, h, h / 2)
      context.fill()

      context.fillStyle = '#ffffffcc'
      context.fillText(data.label, x, y)
      context.restore()
    },
    [],
  )

  // ─── Build graphology graph ──────────────────────────────────────────────────
  const graph = useMemo(() => {
    const g = new Graph({ multi: false, type: 'directed' })

    const byDepth = new Map<number, TxNode[]>()
    nodes.forEach((n) => {
      if (!byDepth.has(n.depth)) byDepth.set(n.depth, [])
      byDepth.get(n.depth)!.push(n)
    })

    const posMap = new Map<string, { x: number; y: number }>()
    byDepth.forEach((nodesAtDepth, depth) => {
      const count = nodesAtDepth.length
      nodesAtDepth.forEach((n, idx) => {
        const x = depth * LEVEL_SPACING
        const y = (idx - (count - 1) / 2) * NODE_SPACING
        posMap.set(n.address, { x, y })
      })
    })

    nodes.forEach((n) => {
      const pos = posMap.get(n.address) ?? { x: 0, y: 0 }
      const label = n.address ? n.address.slice(0, 6) + '…' + n.address.slice(-4) : n.address
      g.addNode(n.address, {
        label,
        size: n.is_root ? ROOT_NODE_SIZE : REGULAR_NODE_SIZE,
        color: n.is_root ? '#3b82f6' : riskColor(n.risk_level),
        x: pos.x,
        y: pos.y,
        nodeData: n,
      })
    })

    edges.forEach((e) => {
      try {
        const edgeLabel = e.last_timestamp
          ? `${e.formatted_amount} · ${new Date(e.last_timestamp * 1000).toISOString().replace('T', ' ').slice(0, 10)}`
          : e.formatted_amount

        g.addEdge(e.from, e.to, {
          type: 'curved',
          label: edgeLabel,
          size: 0.015,
          color: e.direction === 'out' ? '#8b5cf6' : '#06b6d4',
          edgeData: e,
        })
      } catch {
        // ignore duplicate edges
      }
    })

    return g
  }, [nodes, edges])

  // ─── Path highlight ──────────────────────────────────────────────────────────
  const pathInfo = useMemo(() => {
    if (!selectedAddress) return { pathNodes: new Set<string>(), pathEdges: new Set<string>() }

    const rootAddr = nodes.find((n) => n.is_root)?.address
    if (!rootAddr || selectedAddress === rootAddr) {
      return { pathNodes: new Set<string>([selectedAddress]), pathEdges: new Set<string>() }
    }

    const fwd = new Map<string, Array<{ to: string; edgeId: string }>>()
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i]
      if (!fwd.has(e.from)) fwd.set(e.from, [])
      fwd.get(e.from)!.push({ to: e.to, edgeId: `${e.from}->${e.to}` })
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
  }, [selectedAddress, nodes, edges])

  // ─── Init Sigma ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || graph.order === 0) return

    if (sigmaRef.current) {
      sigmaRef.current.kill()
      sigmaRef.current = null
    }

    graphRef.current = graph

    const drawNodeLabel = customDrawNodeLabel

    const renderer = new Sigma(graph, containerRef.current, {
      itemSizesReference: 'positions',
      renderLabels: true,
      renderEdgeLabels: true,
      labelSize: 11,
      labelColor: { color: colorsRef.current.label },
      edgeLabelSize: 10,
      edgeLabelColor: { color: colorsRef.current.label },
      defaultEdgeType: 'curved',
      defaultEdgeColor: colorsRef.current.edge,
      edgeProgramClasses: { curved: EdgeCurvedArrowProgram },
      defaultDrawNodeLabel: drawNodeLabel as never,
      defaultDrawEdgeLabel: customDrawEdgeLabel as never,
      defaultDrawNodeHover: ((
        context: CanvasRenderingContext2D,
        data: { x: number; y: number; size: number; label: string; color: string; [key: string]: unknown },
        settings: unknown,
      ) => {
        context.beginPath()
        context.arc(data.x, data.y, (data.size as number) + 3, 0, Math.PI * 2)
        context.fillStyle = 'rgba(59, 130, 246, 0.15)'
        context.fill()
        context.strokeStyle = 'rgba(59, 130, 246, 0.6)'
        context.lineWidth = 2
        context.stroke()
        context.beginPath()
        context.arc(data.x, data.y, data.size as number, 0, Math.PI * 2)
        context.fillStyle = data.color as string
        context.fill()
        drawNodeLabel(context, data, settings)
      }) as never,
      labelRenderedSizeThreshold: 0,
      labelDensity: 1,
    } as Record<string, unknown>)

    renderer.on('clickNode', ({ node }: { node: string }) => {
      const nodeData = graph.getNodeAttribute(node, 'nodeData')
      onNodeSelect?.(nodeData as TxNode)
    })

    renderer.on('clickStage', () => {
      onNodeSelect?.(null)
    })

    renderer.on('doubleClickNode', ({ node }: { node: string }) => {
      onNodeExpand?.(node)
    })

    renderer.on('rightClickNode', ({ node }: { node: string }) => {
      onNodeDelete?.(node)
    })

    sigmaRef.current = renderer

    requestAnimationFrame(() => {
      const coords: { x: number; y: number }[] = []
      graph.forEachNode((_, a) => coords.push({ x: a.x as number, y: a.y as number }))
      if (coords.length === 0) return
      const xs = coords.map((c) => c.x)
      const ys = coords.map((c) => c.y)
      const gW = Math.max(...xs) - Math.min(...xs) + REGULAR_NODE_SIZE * 4
      const gH = Math.max(...ys) - Math.min(...ys) + REGULAR_NODE_SIZE * 4
      const normFactor = Math.max(gW, gH)
      const viewportH = containerRef.current?.clientHeight ?? 600
      const TARGET_PX = 38
      const ratio = (REGULAR_NODE_SIZE * viewportH * 0.5) / (TARGET_PX * normFactor)
      renderer.getCamera().animate(
        { x: 0.5, y: 0.5, ratio: Math.min(1.5, Math.max(0.02, ratio)) },
        { duration: 300 },
      )
    })

    return () => {
      renderer.kill()
      sigmaRef.current = null
    }
  }, [graph, customDrawNodeLabel, customDrawEdgeLabel]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Highlight on selection change ──────────────────────────────────────────
  useEffect(() => {
    const renderer = sigmaRef.current
    const g = graphRef.current
    if (!renderer || !g) return

    const { pathNodes, pathEdges } = pathInfo
    const hasSelection = selectedAddress != null && pathNodes.size > 0

    renderer.setSetting('nodeReducer', (node: string, data: Record<string, unknown>) => {
      const nodeData = g.getNodeAttribute(node, 'nodeData') as TxNode

      if (nodeData?.is_stopped) {
        const baseColor = isDarkRef.current ? '#4b5563' : '#9ca3af'
        const stoppedData = { ...data, color: baseColor }
        if (hasSelection && pathNodes.has(node)) return { ...stoppedData, highlighted: true }
        if (hasSelection && !pathNodes.has(node)) {
          return { ...stoppedData, color: colorsRef.current.dimNode, size: Math.max(0.1, (data.size as number) * 0.7) }
        }
        return stoppedData
      }

      if (!hasSelection) return data
      if (pathNodes.has(node)) return { ...data, highlighted: true }
      return { ...data, color: colorsRef.current.dimNode, size: Math.max(0.1, (data.size as number) * 0.7) }
    })

    renderer.setSetting('edgeReducer', (edge: string, data: Record<string, unknown>) => {
      try {
        const target = g.target(edge)
        const targetData = g.getNodeAttribute(target, 'nodeData') as TxNode

        if (targetData?.is_stopped) {
          const stoppedColor = isDarkRef.current ? '#4b5563' : '#9ca3af'
          if (hasSelection) {
            const source = g.source(edge)
            if (pathEdges.has(`${source}->${target}`)) return { ...data, size: 0.03 }
            return { ...data, color: colorsRef.current.dimEdge, size: 0.005 }
          }
          return { ...data, color: stoppedColor, size: 0.01 }
        }

        if (!hasSelection) return data
        const source = g.source(edge)
        if (pathEdges.has(`${source}->${target}`)) return { ...data, size: 0.03 }
      } catch {
        // ignore
      }
      if (!hasSelection) return data
      return { ...data, color: colorsRef.current.dimEdge, size: 0.005 }
    })

    renderer.refresh()
  }, [selectedAddress, pathInfo])

  // ─── Theme sync ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const renderer = sigmaRef.current
    if (!renderer) return
    renderer.setSetting('labelColor', { color: colors.label })
    renderer.setSetting('edgeLabelColor', { color: colors.label })
    renderer.setSetting('defaultEdgeColor', colors.edge)
    renderer.refresh()
  }, [colors])

  // ─── Camera controls ─────────────────────────────────────────────────────────
  const zoomIn = useCallback(() => {
    const cam = sigmaRef.current?.getCamera()
    if (cam) cam.animate({ ratio: (cam.ratio || 1) * 0.7 }, { duration: 200 })
  }, [])

  const zoomOut = useCallback(() => {
    const cam = sigmaRef.current?.getCamera()
    if (cam) cam.animate({ ratio: (cam.ratio || 1) * 1.4 }, { duration: 200 })
  }, [])

  const handleFitView = useCallback(() => {
    const renderer = sigmaRef.current
    const g = graphRef.current
    if (!renderer || !g) return
    const coords: { x: number; y: number }[] = []
    g.forEachNode((_, a) => coords.push({ x: a.x as number, y: a.y as number }))
    if (coords.length === 0) return
    const xs = coords.map((c) => c.x)
    const ys = coords.map((c) => c.y)
    const gW = Math.max(...xs) - Math.min(...xs) + REGULAR_NODE_SIZE * 4
    const gH = Math.max(...ys) - Math.min(...ys) + REGULAR_NODE_SIZE * 4
    const normFactor = Math.max(gW, gH)
    const viewportH = containerRef.current?.clientHeight ?? 600
    const TARGET_PX = 38
    const ratio = (REGULAR_NODE_SIZE * viewportH * 0.5) / (TARGET_PX * normFactor)
    renderer.getCamera().animate(
      { x: 0.5, y: 0.5, ratio: Math.min(1.5, Math.max(0.02, ratio)) },
      { duration: 300 },
    )
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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

      <div ref={containerRef} style={{ width: '100%', height: '100%', background: colors.bg }} />

      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          zIndex: 10,
        }}
      >
        <button title="Zoom In" onClick={zoomIn} style={controlBtnStyle}>+</button>
        <button title="Zoom Out" onClick={zoomOut} style={controlBtnStyle}>−</button>
        <button title="Fit View" onClick={handleFitView} style={controlBtnStyle}>⊡</button>
      </div>

      {(stats || nodes.length > 0) && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            fontSize: 11,
            color: 'var(--tx-body, #94a3b8)',
            background: 'var(--tx-elevated, #1e293b)',
            border: '1px solid var(--tx-divider, rgba(51,65,85,0.5))',
            borderRadius: 6,
            padding: '4px 10px',
            zIndex: 10,
          }}
        >
          {stats
            ? `${stats.total_nodes} nodes · ${stats.total_edges} edges`
            : `${nodes.length} nodes · ${edges.length} edges`}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 10,
          color: 'var(--tx-caption, #64748b)',
          background: 'var(--tx-elevated, #1e293b)',
          border: '1px solid var(--tx-divider, rgba(51,65,85,0.5))',
          borderRadius: 6,
          padding: '3px 10px',
          zIndex: 10,
          opacity: 0.7,
        }}
      >
        Click: select · Double-click: expand · Right-click: delete · Scroll: zoom
      </div>
    </div>
  )
}
