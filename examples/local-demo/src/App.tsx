import React, { useState, useCallback, useEffect } from 'react'
import { GraphExplorer, GraphExplorerSigma } from '@trustin/txgraph'
import type { TxNode, TxGraph } from '@trustin/txgraph'
import { exploreGraph } from './api'

type Renderer = 'reactflow' | 'sigma'
type Chain = 'Ethereum' | 'Tron'

const SAMPLE_ADDRESSES = {
  Ethereum: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  Tron: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
}

function detectChain(addr: string): Chain | null {
  const trimmed = addr.trim()
  if (/^0x[0-9a-fA-F]{40}$/.test(trimmed)) return 'Ethereum'
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed)) return 'Tron'
  return null
}

function themeColors(isDark: boolean) {
  return isDark
    ? {
        bg: '#0f172a',
        text: '#e2e8f0',
        heading: '#f1f5f9',
        muted: '#94a3b8',
        dimmed: '#64748b',
        surface: '#1e293b',
        border: '#374151',
        errorBg: 'rgba(239,68,68,0.1)',
        errorBorder: 'rgba(239,68,68,0.3)',
        errorText: '#fca5a5',
        overlayBg: 'rgba(15,23,42,0.85)',
      }
    : {
        bg: '#f8fafc',
        text: '#1e293b',
        heading: '#0f172a',
        muted: '#64748b',
        dimmed: '#94a3b8',
        surface: '#ffffff',
        border: '#cbd5e1',
        errorBg: 'rgba(239,68,68,0.06)',
        errorBorder: 'rgba(239,68,68,0.2)',
        errorText: '#dc2626',
        overlayBg: 'rgba(255,255,255,0.85)',
      }
}

export default function App() {
  const [isDark, setIsDark] = useState(true)
  const [address, setAddress] = useState('')
  const [chain, setChain] = useState<Chain>('Ethereum')
  const [direction, setDirection] = useState<'in' | 'out' | 'all'>('out')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [renderer, setRenderer] = useState<Renderer>('reactflow')
  const [graph, setGraph] = useState<TxGraph | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandingNode, setExpandingNode] = useState<string | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const c = themeColors(isDark)

  const handleExplore = useCallback(async () => {
    const addr = address.trim()
    if (!addr) return
    setLoading(true)
    setError(null)
    setGraph(null)
    setSelectedAddress(null)
    try {
      const data = await exploreGraph({
        address: addr,
        chain,
        direction,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      })
      setGraph(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [address, chain, direction, fromDate, toDate])

  const handleNodeExpand = useCallback(async (addr: string) => {
    if (!graph) return
    setExpandingNode(addr)
    try {
      const data = await exploreGraph({
        address: addr,
        chain,
        direction,
        maxDepth: 1,
      })
      const existingAddrs = new Set(graph.nodes.map((n) => n.address))
      const newNodes = data.nodes.filter((n) => !existingAddrs.has(n.address))
      const existingEdgeKeys = new Set(graph.edges.map((e) => `${e.from}->${e.to}`))
      const newEdges = data.edges.filter((e) => !existingEdgeKeys.has(`${e.from}->${e.to}`))
      setGraph({
        nodes: [...graph.nodes, ...newNodes],
        edges: [...graph.edges, ...newEdges],
        stats: {
          total_nodes: graph.nodes.length + newNodes.length,
          total_edges: graph.edges.length + newEdges.length,
          stopped_nodes: graph.stats?.stopped_nodes ?? 0,
        },
      })
    } catch (e) {
      console.error('Expand failed:', e)
    } finally {
      setExpandingNode(null)
    }
  }, [graph, chain, direction])

  const handleNodeDelete = useCallback((addr: string) => {
    if (!graph) return
    setGraph({
      nodes: graph.nodes.filter((n) => n.address !== addr),
      edges: graph.edges.filter((e) => e.from !== addr && e.to !== addr),
      stats: graph.stats,
    })
    if (selectedAddress === addr) setSelectedAddress(null)
  }, [graph, selectedAddress])

  const handleNodeSelect = useCallback((node: TxNode | null) => {
    setSelectedAddress(node?.address ?? null)
  }, [])

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 6,
    border: `1px solid ${c.border}`,
    background: c.surface,
    color: c.text,
    fontSize: 13,
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 6,
    border: active ? '1px solid #3b82f6' : `1px solid ${c.border}`,
    background: active ? '#3b82f6' : c.surface,
    color: active ? '#fff' : c.muted,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: c.bg, color: c.text }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: c.heading, marginRight: 8 }}>TxGraph Demo</span>

        {/* Address input */}
        <input
          type="text"
          placeholder="Enter blockchain address…"
          value={address}
          onChange={(e) => {
            const val = e.target.value
            setAddress(val)
            const detected = detectChain(val)
            if (detected) setChain(detected)
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleExplore()}
          style={{
            ...inputStyle,
            flex: 1,
            minWidth: 260,
            fontFamily: 'monospace',
          }}
        />

        {/* Chain selector */}
        <select
          value={chain}
          onChange={(e) => {
            setChain(e.target.value as Chain)
            setAddress('')
          }}
          style={inputStyle}
        >
          <option>Ethereum</option>
          <option>Tron</option>
        </select>

        {/* Direction */}
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as 'in' | 'out' | 'all')}
          style={inputStyle}
        >
          <option value="out">Outflow</option>
          <option value="in">Inflow</option>
          <option value="all">All</option>
        </select>

        {/* Date range */}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={{ ...inputStyle, fontSize: 12 }}
        />
        <span style={{ color: c.dimmed, fontSize: 12 }}>to</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={{ ...inputStyle, fontSize: 12 }}
        />

        {/* Sample button */}
        <button
          onClick={() => setAddress(SAMPLE_ADDRESSES[chain])}
          style={{ ...inputStyle, cursor: 'pointer', fontSize: 12, color: c.muted }}
        >
          Sample
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          style={{
            ...inputStyle,
            cursor: 'pointer',
            fontSize: 14,
            padding: '4px 10px',
            color: c.muted,
          }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '\u2600' : '\u263E'}
        </button>

        {/* Explore button */}
        <button
          onClick={handleExplore}
          disabled={loading || !address.trim()}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: 'none',
            background: loading || !address.trim() ? (isDark ? '#374151' : '#cbd5e1') : '#3b82f6',
            color: '#fff',
            cursor: loading || !address.trim() ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 600,
            marginLeft: 'auto',
          }}
        >
          {loading ? 'Exploring\u2026' : 'Explore'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '10px 16px', background: c.errorBg, borderBottom: `1px solid ${c.errorBorder}`, color: c.errorText, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Graph area */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {!graph && !loading && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: c.dimmed }}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <div style={{ fontSize: 15 }}>Enter an address and click <strong>Explore</strong></div>
            <div style={{ fontSize: 12, color: c.dimmed }}>Requires a TrustIn API key in <code>.env</code></div>
          </div>
        )}
        {(graph || loading) && (
          <div style={{ height: '100%' }}>
            {renderer === 'reactflow' ? (
              <GraphExplorer
                nodes={graph?.nodes ?? []}
                edges={graph?.edges ?? []}
                stats={graph?.stats}
                loading={loading}
                expandingNode={expandingNode}
                selectedAddress={selectedAddress}
                onNodeSelect={handleNodeSelect}
                onNodeExpand={handleNodeExpand}
                onNodeDelete={handleNodeDelete}
              />
            ) : (
              <GraphExplorerSigma
                nodes={graph?.nodes ?? []}
                edges={graph?.edges ?? []}
                stats={graph?.stats}
                loading={loading}
                expandingNode={expandingNode}
                selectedAddress={selectedAddress}
                onNodeSelect={handleNodeSelect}
                onNodeExpand={handleNodeExpand}
                onNodeDelete={handleNodeDelete}
              />
            )}
          </div>
        )}

        {/* Renderer toggle overlay */}
        {(graph || loading) && (
          <div style={{
            position: 'absolute',
            top: 10,
            left: 10,
            display: 'flex',
            gap: 2,
            background: c.overlayBg,
            borderRadius: 6,
            border: `1px solid ${c.border}`,
            padding: 2,
            zIndex: 10,
          }}>
            <button onClick={() => setRenderer('reactflow')} style={btnStyle(renderer === 'reactflow')}>ReactFlow</button>
            <button onClick={() => setRenderer('sigma')} style={btnStyle(renderer === 'sigma')}>Sigma</button>
          </div>
        )}
      </div>

      {/* Selected node info panel */}
      {selectedAddress && graph && (
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${c.border}`, background: c.bg, fontSize: 12 }}>
          {(() => {
            const node = graph.nodes.find((n) => n.address === selectedAddress)
            if (!node) return null
            return (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', color: c.muted }}>{node.address}</span>
                <span style={{ color: c.dimmed }}>Depth: {node.depth}</span>
                <span style={{ color: node.risk_level === 'high' ? '#ef4444' : node.risk_level === 'medium' ? '#f59e0b' : node.risk_level === 'low' ? '#22c55e' : '#6b7280' }}>
                  Risk: {node.risk_level}
                </span>
                {node.tags.length > 0 && (
                  <span style={{ color: '#818cf8' }}>{node.tags.map((t) => t.name || t.primaryCategory).join(', ')}</span>
                )}
                {node.is_stopped && <span style={{ color: '#f59e0b' }}>{node.stop_reason || 'Stopped'}</span>}
                <button
                  onClick={() => setSelectedAddress(null)}
                  style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 4, border: `1px solid ${c.border}`, background: 'transparent', color: c.dimmed, cursor: 'pointer', fontSize: 11 }}
                >
                  Close
                </button>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
