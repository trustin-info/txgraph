# 🌐 Try the Live Demo

The fastest way to trace blockchain transactions — no setup, no API key, no code.

## Open the Demo

Go to the [Live Demo](/txgraph/demo/) page to start tracing immediately. The demo supports two data source modes:

- **TrustIn** — uses the TrustIn API with risk scoring and entity tagging
- **On-Chain** — fetches raw data directly from Etherscan (Ethereum) or Tronscan (Tron)

## Getting Started

1. Open the [Live Demo](/txgraph/demo/)
2. Enter a blockchain address (Ethereum or Tron)
3. Select data source: **TrustIn** or **On-Chain**
4. Select direction: **Inflow** / **Outflow** / **All**
5. Click **Explore** — the graph loads instantly

## Features

### Risk Levels

Each node (address) is colored by risk:

| Color | Risk Level | Meaning |
|-------|-----------|---------|
| 🔴 Red | High | Sanctioned, dark market, mixer |
| 🟡 Yellow | Medium | Suspicious patterns detected |
| 🟢 Green | Low | Verified exchange, known entity |
| ⚫ Gray | Unknown | No data available |

::: tip
Risk scoring and entity tags are only available when using the **TrustIn** data source. On-Chain mode shows all nodes as "unknown" risk.
:::

### Expanding the Graph

- Click any node to see its details
- Click the **+** button on a node to expand its connections
- Right-click a node to remove it from the view

### Renderer Modes

Switch between two renderers:
- **ReactFlow** — best for interactive exploration, drag nodes, zoom
- **Sigma.js** — best for large graphs (1000+ nodes), WebGL-accelerated

## When to use the Demo

✅ Quick investigation — need an answer now
✅ No technical setup required
✅ Compare TrustIn vs on-chain data
✅ Regular compliance checks

→ For programmatic access, see [Layer 2: AI Agent API](/guide/layer2-agent). To run locally, see [Layer 3: Local Demo](/guide/layer3-demo). To embed in your own app, see [Layer 4: Build Your Own](/guide/layer4-component).
