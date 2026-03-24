# 🌐 Use TrustIn Explorer

The fastest way to trace blockchain transactions — no setup, no API key, no code.

## What is TrustIn Explorer?

[TrustIn Explorer](https://v2.trustin.info/explore) is a full-featured AML (Anti-Money Laundering) investigation platform. It provides:

- **Visual transaction graph** — trace fund flows across Ethereum and Tron
- **Risk scoring** — AI-powered risk assessment for every address
- **Entity tagging** — identify exchanges, mixers, sanctioned addresses
- **Multi-hop tracing** — follow funds through multiple hops
- **Inflow & outflow analysis** — see where funds came from and where they went

## Getting Started

1. Visit [v2.trustin.info](https://v2.trustin.info/explore)
2. Enter a blockchain address (Ethereum or Tron)
3. Select direction: **Inflow** / **Outflow** / **Both**
4. Click **Explore** — the graph loads instantly

## Features

### Risk Levels

Each node (address) is colored by risk:

| Color | Risk Level | Meaning |
|-------|-----------|---------|
| 🔴 Red | High | Sanctioned, dark market, mixer |
| 🟡 Yellow | Medium | Suspicious patterns detected |
| 🟢 Green | Low | Verified exchange, known entity |
| ⚫ Gray | Unknown | No data available |

### Expanding the Graph

- Click any node to see its details
- Click the **+** button on a node to expand its connections
- Right-click a node to remove it from the view

### Renderer Modes

Switch between two renderers:
- **ReactFlow** — best for interactive exploration, drag nodes, zoom
- **Sigma.js** — best for large graphs (1000+ nodes), WebGL-accelerated

## When to use TrustIn Explorer

✅ Quick investigation — need an answer now  
✅ No technical setup required  
✅ Full feature set including AI risk scoring  
✅ Regular compliance checks

→ For programmatic access, see [Layer 2: AI Agent API](/guide/layer2-agent). To run locally, see [Layer 3: Local Demo](/guide/layer3-demo). To embed in your own app, see [Layer 4: Build Your Own](/guide/layer4-component).
