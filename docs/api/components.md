# Components

## `GraphExplorer`

ReactFlow-based interactive graph renderer. Best for small-to-medium graphs (up to ~500 nodes).

```tsx
import { GraphExplorer } from '@trustin/txgraph'
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `TxNode[]` | required | Array of graph nodes |
| `edges` | `TxEdge[]` | required | Array of graph edges |
| `stats` | `TxGraphStats` | — | Optional stats (shown in panel) |
| `loading` | `boolean` | `false` | Show full-screen loading overlay |
| `expandingNode` | `string \| null` | `null` | Address of node currently being expanded (shows spinner) |
| `selectedAddress` | `string \| null` | `null` | Highlight the path from root to this address |
| `onNodeSelect` | `(node: TxNode \| null) => void` | — | Called when user clicks a node (or background) |
| `onNodeExpand` | `(address: string) => void` | — | Called when user clicks the **+** expand button |
| `onNodeDelete` | `(address: string) => void` | — | Called when user clicks the **✕** delete button |

### Layout

The graph uses **Dagre** for automatic left-to-right hierarchical layout. Nodes are arranged by transaction depth. Layout is recomputed whenever `nodes` or `edges` change.

### Selection & Path Highlighting

When `selectedAddress` is set, the component:
1. Finds all paths from the root node to the selected address (DFS with backtracking)
2. Highlights nodes and edges on any path
3. Dims all other nodes and edges (opacity 0.25)

### Node Appearance

| State | Visual |
|-------|--------|
| Root node | Blue border + glow |
| High risk | Red border + red background |
| Medium risk | Yellow border + yellow background |
| Low risk | Green border + green background |
| Unknown risk | Gray border |
| Stopped node | Dashed border + warning icon |
| Selected | Blue glow ring |
| Dimmed (not on path) | 25% opacity |
| Expanding | Spinner overlay |

---

## `GraphExplorerSigma`

Sigma.js + WebGL-based renderer. Best for large graphs (500+ nodes). Uses canvas for labels, WebGL for nodes/edges.

```tsx
import { GraphExplorerSigma } from '@trustin/txgraph'
```

### Props

Same props as `GraphExplorer` — both components implement `GraphExplorerProps`.

### Interactions

| Action | Result |
|--------|--------|
| Click node | `onNodeSelect(node)` |
| Click background | `onNodeSelect(null)` |
| Double-click node | `onNodeExpand(address)` |
| Right-click node | `onNodeDelete(address)` |
| Scroll | Zoom in/out |
| Drag | Pan |

### Built-in Controls

The Sigma renderer includes floating controls:
- **+** / **−** — Zoom in/out
- **⊡** — Fit all nodes in view

### Layout

Uses a custom depth-based left-to-right layout:
- X position = `depth × 3.5` (graph coordinates)
- Y position = evenly spaced within each depth level
- No overlap guaranteed

### Camera

On mount, the camera auto-fits to show all nodes at a comfortable ~38px radius. The camera ratio adapts to graph size.
