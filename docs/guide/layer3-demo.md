# 💻 Run Demo Locally

Run TxGraph as a local Vite app connected to the TrustIn API. Ideal for evaluation, internal tooling, or as a starting point for your own integration.

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 8 (`npm i -g pnpm`)
- A **TrustIn API key** (contact [info@trustin.info](mailto:info@trustin.info))

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/Blackman99/txgraph.git
cd txgraph

# 2. Install dependencies
pnpm install

# 3. Configure your API key
cp examples/local-demo/.env.example examples/local-demo/.env
# Edit .env and set VITE_TRUSTIN_API_KEY=your_key_here

# 4. Start the demo
pnpm dev:demo
```

Open [http://localhost:5173](http://localhost:5173)

## Configuration

Edit `examples/local-demo/.env`:

```env
VITE_TRUSTIN_API_URL=https://api.trustin.info
VITE_TRUSTIN_API_KEY=your_api_key_here
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_TRUSTIN_API_URL` | `https://api.trustin.info` | API base URL |
| `VITE_TRUSTIN_API_KEY` | — | Your API key (required) |

## Using the Demo

1. **Enter an address** — Ethereum (0x…) or Tron (T…)
2. **Select chain** — Ethereum or Tron
3. **Choose direction** — Outflow / Inflow / Both
4. **Set date range** (optional) — filter by transaction date
5. **Click Explore** — graph renders immediately
6. **Toggle renderer** — switch between ReactFlow and Sigma.js

### Node Interactions

| Action | Result |
|--------|--------|
| Click node | Select (highlights path from root) |
| Click **+** button | Expand node (load neighbors) |
| Click **✕** button | Remove node from graph |
| Click background | Deselect |

## URL Deep-Link

You can open the demo with query parameters to pre-fill and auto-explore:

```
http://localhost:5173/?address=0xd8dA...6045&chain=Ethereum&direction=out&from=2024-01-01&to=2024-12-31
```

| Param | Description |
|-------|-------------|
| `address` | Blockchain address (triggers auto-explore on load) |
| `chain` | `Ethereum` or `Tron` (auto-detected if omitted) |
| `direction` | `in`, `out`, or `all` |
| `from` | Start date filter (`YYYY-MM-DD`) |
| `to` | End date filter (`YYYY-MM-DD`) |

::: tip Claude Code Skill
If you use [Claude Code](https://claude.com/claude-code), the `/trace-graph` skill automates the full workflow — see [Claude Code Skill](/guide/claude-code-skill).
:::

## Demo Architecture

```
examples/local-demo/
├── src/
│   ├── App.tsx          # Main UI with controls
│   ├── api.ts           # TrustIn API client
│   └── main.tsx         # React entry point
├── .env.example         # Environment template
├── index.html
└── vite.config.ts
```

The demo uses `@trustin/txgraph` via `workspace:*` — it reads from the local package build in `packages/react/dist/`.

## Building for Production

```bash
cd examples/local-demo
pnpm build
pnpm preview  # preview the build
```

The built files are in `examples/local-demo/dist/` — deploy to any static host (Vercel, Netlify, S3, etc.).

## Customizing

The demo is intentionally simple. Common customizations:

- **Custom styling** — edit the inline styles in `App.tsx`
- **Add authentication** — wrap with your own auth layer
- **Multiple addresses** — extend the UI for batch exploration
- **Export** — add JSON/CSV export of graph data

For deeper integration, see [Layer 3: Build Your Own](/guide/layer3-component).
