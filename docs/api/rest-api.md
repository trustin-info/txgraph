# REST API

TxGraph components are designed to work with the **TrustIn graph_explore API**. You can also supply your own data from any source — just map to `TxNode[]` and `TxEdge[]`.

## Authentication

The TrustIn API works without an API key. You can optionally include one for higher rate limits:

```
X-Api-Key: your_api_key_here
```

Contact [info@trustin.info](mailto:info@trustin.info) to obtain an API key for production use.

## Endpoints

### `POST /api/v1/graph_explore`

Explore transaction graph starting from a given address.

**Base URL:** `https://api.trustin.info`

#### Request

```http
POST /api/v1/graph_explore
Content-Type: application/json
```

```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "chain": "Ethereum",
  "direction": "out",
  "max_depth": 3,
  "from_date": "2024-01-01",
  "to_date": "2024-12-31"
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | `string` | ✅ | Starting blockchain address |
| `chain` | `'Ethereum' \| 'Tron'` | ✅ | Blockchain network |
| `direction` | `'in' \| 'out' \| 'all'` | — | Default: `'out'` |
| `max_depth` | `number` | — | Max hops to trace. Default: `3` |
| `from_date` | `string` | — | Filter: start date `YYYY-MM-DD` |
| `to_date` | `string` | — | Filter: end date `YYYY-MM-DD` |

#### Response

```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        "depth": 0,
        "is_root": true,
        "risk_level": "low",
        "risk_score": 5,
        "tags": [
          {
            "name": "Vitalik Buterin",
            "primaryCategory": "Individual"
          }
        ],
        "is_stopped": false
      }
    ],
    "edges": [
      {
        "from": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        "to": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        "formatted_amount": "1,234.56 USDT",
        "amount": 1234.56,
        "token": "USDT",
        "last_timestamp": 1704067200,
        "direction": "out",
        "tx_count": 3
      }
    ],
    "stats": {
      "total_nodes": 42,
      "total_edges": 38,
      "stopped_nodes": 5
    }
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": 429
}
```

## Using the API Client

The `examples/local-demo/src/api.ts` provides a ready-to-use client:

```typescript
import { exploreGraph } from './api'

const graph = await exploreGraph({
  address: '0xd8dA6BF...',
  chain: 'Ethereum',
  direction: 'out',
  maxDepth: 3,
  fromDate: '2024-01-01',
})

// graph is TxGraph — ready for the components
```

## Bring Your Own Data

The components don't require the TrustIn API. Supply any `TxNode[]` and `TxEdge[]` data:

```typescript
import { GraphExplorer } from '@trustin/txgraph'
import type { TxNode, TxEdge } from '@trustin/txgraph'

// Your own on-chain data pipeline
const { nodes, edges } = await myOwnGraphProvider.query(address)

// Map to TxNode / TxEdge format
const txNodes: TxNode[] = nodes.map(n => ({
  address: n.addr,
  depth: n.hopCount,
  is_root: n.addr === rootAddress,
  risk_level: mapRisk(n.riskScore),
  tags: n.labels.map(l => ({ name: l })),
  is_stopped: n.isLeaf,
}))
```
