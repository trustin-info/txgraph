# Claude Code Skill: `/trace-graph`

TxGraph ships with a built-in [Claude Code](https://claude.com/claude-code) skill that lets you trace blockchain addresses directly from your terminal through a conversational workflow.

## What It Does

The `/trace-graph` skill guides you through specifying parameters, starts the local demo, and opens the resulting transaction graph in your browser — all without leaving the CLI.

## Prerequisites

- [Claude Code](https://claude.com/claude-code) installed
- Node.js >= 18, pnpm >= 8
- A TrustIn API key (contact [info@trustin.info](mailto:info@trustin.info))

## Usage

In the txgraph project directory, run Claude Code and type:

```
/trace-graph
```

Claude will walk you through the following steps:

### 1. Specify Parameters

You'll be prompted for:

| Parameter | Required | Description | Default |
|-----------|----------|-------------|---------|
| `address` | Yes | Blockchain address to trace | — |
| `chain` | Auto | Ethereum or Tron (auto-detected from address format) | — |
| `direction` | No | `out`, `in`, or `all` | `out` |
| `from_date` | No | Start date filter (`YYYY-MM-DD`) | — |
| `to_date` | No | End date filter (`YYYY-MM-DD`) | — |

**Chain auto-detection:**
- `0x` + 40 hex chars → Ethereum
- `T` + 33 base58 chars → Tron

### 2. Environment Setup

Claude checks that everything is ready:
- Creates `examples/local-demo/.env` with your API key if missing
- Installs dependencies if needed
- Builds the core `@trustin/txgraph` package

### 3. Launch & Open

Claude starts the Vite dev server and opens a deep-link URL in your browser:

```
http://localhost:5173/?address=TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9&chain=Tron&direction=out
```

The demo app auto-explores on load — the graph appears immediately.

## Example Session

```
You: /trace-graph

Claude: What address would you like to trace?

You: TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9

Claude: Detected chain: Tron. Direction?  [Outflow / Inflow / All]

You: Outflow

Claude: Starting dev server...
        Graph opened in browser:
          Address:   TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9
          Chain:     Tron
          Direction: out
          URL:       http://localhost:5173/?address=TN3W4...&chain=Tron&direction=out
```

## URL Deep-Link Parameters

You can also open the demo directly with query parameters (no skill needed):

```
http://localhost:5173/?address=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045&chain=Ethereum&direction=out&from=2024-01-01&to=2024-12-31
```

| Param | Description |
|-------|-------------|
| `address` | Blockchain address (triggers auto-explore) |
| `chain` | `Ethereum` or `Tron` |
| `direction` | `in`, `out`, or `all` |
| `from` | Start date (`YYYY-MM-DD`) |
| `to` | End date (`YYYY-MM-DD`) |

## Skill File Location

The skill is defined at `.claude/skills/trace-graph.md` in the project root. You can customize the workflow by editing this file.
