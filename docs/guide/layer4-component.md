# 🛠 Build Your Own

Install `@trustin/txgraph` and embed the graph components in your own React application.

## Installation

```bash
# npm
npm install @trustin/txgraph

# pnpm
pnpm add @trustin/txgraph

# yarn
yarn add @trustin/txgraph
```

## Peer Dependencies

```bash
npm install react react-dom
```

## Quick Example

```tsx
import { GraphExplorer } from '@trustin/txgraph'
import type { TxNode, TxEdge } from '@trustin/txgraph'

const nodes: TxNode[] = [
  {
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    depth: 0,
    is_root: true,
    risk_level: 'low',
    tags: [{ name: 'Vitalik Buterin' }],
    is_stopped: false,
  },
  {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    depth: 1,
    is_root: false,
    risk_level: 'high',
    tags: [{ name: 'Mixer', primaryCategory: 'Money Laundering' }],
    is_stopped: true,
    stop_reason: 'Flagged mixer',
  },
]

const edges: TxEdge[] = [
  {
    from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    formatted_amount: '1.5 ETH',
    last_timestamp: 1704067200,
    direction: 'out',
  },
]

export function MyGraph() {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <GraphExplorer
        nodes={nodes}
        edges={edges}
        onNodeSelect={(node) => console.log('Selected:', node?.address)}
        onNodeExpand={(address) => console.log('Expand:', address)}
        onNodeDelete={(address) => console.log('Delete:', address)}
      />
    </div>
  )
}
```

## Using with TrustIn API

```tsx
import { useState, useEffect } from 'react'
import { GraphExplorer } from '@trustin/txgraph'
import type { TxGraph } from '@trustin/txgraph'

async function fetchGraph(address: string): Promise<TxGraph> {
  const res = await fetch('https://api.trustin.info/api/v1/graph_explore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.TRUSTIN_API_KEY!,
    },
    body: JSON.stringify({ address, chain: 'Ethereum', direction: 'out', max_depth: 3 }),
  })
  const data = await res.json()
  return data.data
}

export function GraphPage({ address }: { address: string }) {
  const [graph, setGraph] = useState<TxGraph | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchGraph(address)
      .then(setGraph)
      .finally(() => setLoading(false))
  }, [address])

  return (
    <div style={{ height: '600px' }}>
      <GraphExplorer
        nodes={graph?.nodes ?? []}
        edges={graph?.edges ?? []}
        stats={graph?.stats}
        loading={loading}
      />
    </div>
  )
}
```

## Using the Sigma Renderer

For large graphs (500+ nodes), use `GraphExplorerSigma` for WebGL-accelerated rendering:

```tsx
import { GraphExplorerSigma } from '@trustin/txgraph'

// Same props as GraphExplorer
<GraphExplorerSigma
  nodes={nodes}
  edges={edges}
  loading={loading}
  onNodeSelect={handleSelect}
  onNodeExpand={handleExpand}
/>
```

## Dark Mode

Both components auto-detect dark mode via `document.documentElement.classList.contains('dark')`.

They observe class changes in real time, so toggling `dark` on `<html>` updates colors instantly — compatible with Tailwind, next-themes, and any other dark mode system.

For custom colors, use CSS variables with the `--tx-` prefix:

```css
:root {
  --tx-body: #94a3b8;
  --tx-heading: #ffffff;
  --tx-elevated: #1e293b;
  --tx-divider: rgba(51, 65, 85, 0.5);
  --tx-caption: #64748b;
}
```

## Container Sizing

The components fill their container (`width: 100%`, `height: 100%`). Always give the parent a fixed height:

```tsx
// ✅ Works
<div style={{ height: '600px' }}>
  <GraphExplorer nodes={nodes} edges={edges} />
</div>

// ✅ Works (flex)
<div style={{ display: 'flex', flex: 1 }}>
  <GraphExplorer nodes={nodes} edges={edges} />
</div>

// ❌ Will render 0px tall
<div>
  <GraphExplorer nodes={nodes} edges={edges} />
</div>
```

## Next.js Notes

For Next.js App Router, wrap in a client component:

```tsx
'use client'
import { GraphExplorer } from '@trustin/txgraph'
// ... rest of your component
```

Add to `next.config.js` if you encounter transpilation issues:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@trustin/txgraph'],
}
module.exports = nextConfig
```

## TypeScript

Full TypeScript support is included. See [Types Reference](/api/types) for all exported interfaces.
