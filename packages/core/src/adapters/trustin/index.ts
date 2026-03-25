import type { TxGraph } from '../../types'
import type {
  DataSource,
  AdapterCapabilities,
  FetchTxOptions,
  RawTransaction,
  ExploreParams,
} from '../../adapter/types'

export interface TrustInAdapterConfig {
  apiUrl?: string
  apiKey?: string
}

export class TrustInAdapter implements DataSource {
  readonly name = 'TrustIn'
  readonly capabilities: AdapterCapabilities = {
    hasRiskScoring: true,
    hasAddressTags: true,
    returnsPrebuiltGraph: true,
    supportedChains: ['Ethereum', 'Tron'],
    rateLimit: 10,
  }

  private apiUrl: string
  private apiKey?: string

  constructor(config: TrustInAdapterConfig = {}) {
    this.apiUrl = config.apiUrl || 'https://api.trustin.info'
    this.apiKey = config.apiKey
  }

  async fetchTransactions(
    _opts: FetchTxOptions
  ): Promise<{ transactions: RawTransaction[]; hasMore: boolean }> {
    throw new Error(
      'TrustIn adapter does not support fetchTransactions. Use exploreGraph() instead.'
    )
  }

  async exploreGraph(params: ExploreParams): Promise<TxGraph> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (this.apiKey) headers['X-Api-Key'] = this.apiKey

    const res = await fetch(`${this.apiUrl}/api/v1/graph_explore`, {
      method: 'POST',
      headers,
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

    if (!res.ok) {
      throw new Error(`TrustIn API error: ${res.status} ${await res.text()}`)
    }

    const data = await res.json()
    return data.data as TxGraph
  }
}
