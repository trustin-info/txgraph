import type { TxGraph } from '@trustin/txgraph'

export interface GraphExploreParams {
  address: string
  chain: 'Ethereum' | 'Tron'
  direction?: 'in' | 'out' | 'all'
  token?: string
  maxDepth?: number
  fromDate?: string  // YYYY-MM-DD
  toDate?: string
}

export async function exploreGraph(params: GraphExploreParams): Promise<TxGraph> {
  const apiUrl = import.meta.env.VITE_TRUSTIN_API_URL || 'https://api.trustin.info'
  const apiKey = import.meta.env.VITE_TRUSTIN_API_KEY as string

  const res = await fetch(`${apiUrl}/api/v1/graph_explore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({
      address: params.address,
      chain_name: params.chain,
      direction: params.direction || 'out',
      token: params.token || undefined,
      max_depth: params.maxDepth || 3,
      from_date: params.fromDate,
      to_date: params.toDate,
    }),
  })

  if (!res.ok) throw new Error(`API error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.data as TxGraph
}
