---
description: Trace a blockchain address and open the transaction graph locally in the browser.
user_invocable: true
---

# trace-graph

Trace a blockchain transaction graph from a given address and open the result in the local demo app.

## Workflow

1. **Collect parameters** — Ask the user for missing parameters using AskUserQuestion:
   - `address` (required): The blockchain address to trace
   - `chain`: Ethereum or Tron (auto-detect from address format: `0x...` = Ethereum, `T...` = Tron)
   - `direction`: `out` (default), `in`, or `all`
   - `max_depth`: 1–5, default 3
   - `from_date` / `to_date`: optional date range filter (YYYY-MM-DD)

2. **Ensure the demo is ready** — Check that the local demo can run:
   - Verify `examples/local-demo/.env` exists with `VITE_TRUSTIN_API_KEY` set (not the placeholder). If missing, ask the user for their API key and create the `.env` file.
   - Run `pnpm install` if `node_modules` is missing.
   - Build the core package: `pnpm --filter @trustin/txgraph build`

3. **Start the dev server** — Run `pnpm dev:demo` in the background if not already running. Wait for the Vite server to be ready (look for "Local:" in the output).

4. **Open the graph in the browser** — Construct a deep-link URL with query parameters and open it. The demo app supports these query params and will auto-explore on load:
   ```bash
   open "http://localhost:5173/?address={address}&chain={chain}&direction={direction}&from={from_date}&to={to_date}"
   ```
   Only include non-empty parameters. The `address` param triggers auto-explore on page load.

5. **Summarize** — Print a brief summary:
   ```
   Graph opened in browser:
     Address:    {address}
     Chain:      {chain}
     Direction:  {direction}
     Depth:      {max_depth}
     Date range: {from_date} to {to_date}
     URL:        http://localhost:5173/?address=...
   ```

## API Reference (for context)

- **Endpoint**: `POST https://api.trustin.info/api/v1/graph_explore`
- **Auth header**: `X-Api-Key: <key>`
- **Request body**:
  ```json
  {
    "address": "0x...",
    "chain_name": "Ethereum",
    "direction": "out",
    "max_depth": 3,
    "from_date": "2024-01-01",
    "to_date": "2024-12-31"
  }
  ```
- **Response**: `{ "success": true, "data": { "nodes": TxNode[], "edges": TxEdge[], "stats": TxGraphStats } }`

## Address Format Detection

- Ethereum: `/^0x[0-9a-fA-F]{40}$/`
- Tron: `/^T[1-9A-HJ-NP-Za-km-z]{33}$/`

## File Paths

- Demo app: `examples/local-demo/`
- API client: `examples/local-demo/src/api.ts`
- Env config: `examples/local-demo/.env`
- Core package: `packages/react/`
