# Types

All types are exported from `@trustin/txgraph`:

```ts
import type { TxNode, TxEdge, TxGraph, TxGraphStats, TxTag, GraphExplorerProps } from '@trustin/txgraph'
```

---

## `TxNode`

Represents a blockchain address (wallet or contract) in the transaction graph.

```typescript
interface TxNode {
  address: string               // Full blockchain address
  chain?: string                // 'Ethereum' | 'Tron' | ...
  depth: number                 // Distance from root (0 = root)
  is_root: boolean              // Whether this is the starting address
  risk_level: 'high' | 'medium' | 'low' | 'unknown'
  risk_score?: number           // 0–100 numeric score
  tags: TxTag[]                 // Entity labels
  is_stopped: boolean           // Graph traversal stopped at this node
  stop_reason?: string          // Why traversal stopped
}
```

### Risk Levels

| Value | Color | Meaning |
|-------|-------|---------|
| `'high'` | 🔴 Red | Sanctioned / dark market / mixer |
| `'medium'` | 🟡 Yellow | Suspicious patterns |
| `'low'` | 🟢 Green | Known safe entity |
| `'unknown'` | ⚫ Gray | No data |

### Stopped Nodes

When `is_stopped: true`, the graph renderer shows a dashed border and warning icon. Traversal was halted (e.g., node is a well-known exchange, or reached max depth).

---

## `TxTag`

Entity label attached to a node.

```typescript
interface TxTag {
  name: string                  // Entity name (e.g., "Binance Hot Wallet")
  primaryCategory?: string      // e.g., "Exchange"
  secondaryCategory?: string    // e.g., "Centralized Exchange"
}
```

---

## `TxEdge`

Represents a group of transactions between two addresses.

```typescript
interface TxEdge {
  from: string                  // Source address
  to: string                    // Destination address
  formatted_amount: string      // Human-readable amount (e.g., "1,234.56 USDT")
  amount?: number               // Raw numeric amount
  token?: string                // Token symbol (e.g., "USDT", "ETH")
  last_timestamp: number        // Unix timestamp (seconds) of most recent tx
  direction: 'in' | 'out' | 'all'
  tx_count?: number             // Number of transactions aggregated
}
```

---

## `TxGraphStats`

Summary statistics returned alongside the graph.

```typescript
interface TxGraphStats {
  total_nodes: number
  total_edges: number
  stopped_nodes: number
}
```

---

## `TxGraph`

The complete graph data structure.

```typescript
interface TxGraph {
  nodes: TxNode[]
  edges: TxEdge[]
  stats: TxGraphStats
}
```

---

## `GraphExplorerProps`

Props shared by both `GraphExplorer` and `GraphExplorerSigma`.

```typescript
interface GraphExplorerProps {
  nodes: TxNode[]
  edges: TxEdge[]
  stats?: TxGraphStats
  loading?: boolean
  expandingNode?: string | null
  selectedAddress?: string | null
  onNodeSelect?: (node: TxNode | null) => void
  onNodeExpand?: (address: string) => void
  onNodeDelete?: (address: string) => void
}
```
