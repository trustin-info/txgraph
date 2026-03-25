import type { TxGraph } from '../types'

export interface RawTransaction {
  hash: string
  from: string
  to: string
  value: string // smallest unit (wei/sun)
  tokenSymbol?: string
  tokenDecimal?: number
  timestamp: number // Unix seconds
}

export interface AdapterCapabilities {
  hasRiskScoring: boolean
  hasAddressTags: boolean
  returnsPrebuiltGraph: boolean
  supportedChains: string[]
  rateLimit: number // requests per second
}

export interface FetchTxOptions {
  address: string
  chain: string
  direction?: 'in' | 'out' | 'all'
  token?: string
  page?: number
  pageSize?: number
}

export interface ExploreParams {
  address: string
  chain: string
  direction?: 'in' | 'out' | 'all'
  token?: string
  maxDepth?: number
  fromDate?: string
  toDate?: string
}

export interface DataSource {
  name: string
  capabilities: AdapterCapabilities

  fetchTransactions(
    opts: FetchTxOptions
  ): Promise<{ transactions: RawTransaction[]; hasMore: boolean }>

  exploreGraph?(params: ExploreParams): Promise<TxGraph>
}
