# 🤖 AI Agent Access

Use TrustIn's transaction tracing API directly from your AI agent — no account or manual API key setup required.

## How It Works

1. **Register** — call `POST /api/v1/agent/register` with no credentials
2. **Receive** — get an API key instantly
3. **Query** — use the key to call `graph_explore` and trace any address

Your agent key is active immediately with a **200 requests/day** quota.

## Register Your Agent

```bash
curl -X POST https://api.trustin.info/api/v1/agent/register \
  -H "Content-Type: application/json" \
  -d '{ "name": "my-aml-agent" }'
```

Response:

```json
{
  "code": 200,
  "data": {
    "agent_id": "...",
    "api_key": "your-api-key-here",
    "name": "my-aml-agent",
    "daily_quota": 200,
    "note": "Save this api_key — it will not be shown again"
  }
}
```

> **Important**: Save the `api_key` — it won't be shown again.

## Trace a Transaction

```bash
curl -X POST https://api.trustin.info/api/v1/graph_explore \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: your-api-key-here" \
  -d '{
    "address": "0xYourAddress",
    "chain": "Ethereum",
    "direction": "out",
    "max_depth": 3
  }'
```

## MCP Tool Definition

For Claude, GPT, or any MCP-compatible agent:

```json
{
  "name": "trace_transactions",
  "description": "Trace blockchain transaction flows from an address. Returns connected addresses with amounts, timestamps, and risk levels.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "address": {
        "type": "string",
        "description": "Blockchain address to trace"
      },
      "chain": {
        "type": "string",
        "enum": ["Ethereum", "Tron"]
      },
      "direction": {
        "type": "string",
        "enum": ["in", "out", "all"],
        "default": "out"
      },
      "max_depth": {
        "type": "integer",
        "default": 3,
        "maximum": 5
      },
      "from_date": {
        "type": "string",
        "format": "date"
      },
      "to_date": {
        "type": "string",
        "format": "date"
      }
    },
    "required": ["address", "chain"]
  }
}
```

## Python Example

```python
import requests

# Register once, store the key
def register_agent(name="my-agent"):
    res = requests.post(
        "https://api.trustin.info/api/v1/agent/register",
        json={"name": name}
    )
    return res.json()["data"]["api_key"]

# Trace transactions
def trace(api_key, address, chain="Ethereum"):
    res = requests.post(
        "https://api.trustin.info/api/v1/graph_explore",
        headers={"X-Api-Key": api_key},
        json={"address": address, "chain": chain, "direction": "out", "max_depth": 3}
    )
    return res.json()["data"]

# Usage
api_key = register_agent("my-aml-agent")
graph = trace(api_key, "0xYourAddress")
print(f"Found {graph['stats']['total_nodes']} nodes")
```
