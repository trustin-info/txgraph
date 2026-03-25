import type {
  DataSource,
  AdapterCapabilities,
  FetchTxOptions,
  RawTransaction,
} from '../../adapter/types'
import { RateLimiter } from '../../utils/rate-limiter'

export interface TronscanAdapterConfig {
  apiKey?: string
  baseUrl?: string
}

const DEFAULT_BASE_URL = 'https://apilist.tronscanapi.com'

export class TronscanAdapter implements DataSource {
  readonly name = 'Tronscan'
  readonly capabilities: AdapterCapabilities = {
    hasRiskScoring: false,
    hasAddressTags: false,
    returnsPrebuiltGraph: false,
    supportedChains: ['Tron'],
    rateLimit: 1,
  }

  private apiKey: string
  private baseUrl: string
  private limiter: RateLimiter

  constructor(config: TronscanAdapterConfig = {}) {
    this.apiKey = config.apiKey || ''
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL
    // Tronscan free tier is very restrictive from browser cross-origin
    this.limiter = new RateLimiter(config.apiKey ? 3 : 1)
  }

  async fetchTransactions(
    opts: FetchTxOptions
  ): Promise<{ transactions: RawTransaction[]; hasMore: boolean }> {
    const pageSize = opts.pageSize ?? 50
    const start = ((opts.page ?? 1) - 1) * pageSize

    // Sequential to respect rate limits
    await this.limiter.acquire()
    const trxTxs = await this.fetchTrxTransfers(opts.address, start, pageSize)

    await this.limiter.acquire()
    const trc20Txs = await this.fetchTrc20Transfers(opts.address, start, pageSize)

    let allTxs = [...trxTxs, ...trc20Txs]

    // Filter by direction
    if (opts.direction === 'in') {
      allTxs = allTxs.filter((tx) => tx.to === opts.address)
    } else if (opts.direction === 'out') {
      allTxs = allTxs.filter((tx) => tx.from === opts.address)
    }

    allTxs.sort((a, b) => b.timestamp - a.timestamp)

    const hasMore = trxTxs.length === pageSize || trc20Txs.length === pageSize

    return { transactions: allTxs, hasMore }
  }

  private async fetchTrxTransfers(
    address: string,
    start: number,
    limit: number
  ): Promise<RawTransaction[]> {
    const params = new URLSearchParams({
      sort: '-timestamp',
      count: 'true',
      limit: String(limit),
      start: String(start),
      address,
    })

    const headers: Record<string, string> = {}
    if (this.apiKey) headers['TRON-PRO-API-KEY'] = this.apiKey

    const res = await fetch(`${this.baseUrl}/api/transaction?${params}`, { headers })
    if (!res.ok) throw new Error(`Tronscan API error: ${res.status}`)
    const data = await res.json()

    if (!Array.isArray(data.data)) return []

    return data.data
      .filter((tx: any) => tx.toAddress)
      .map((tx: any) => ({
        hash: tx.hash,
        from: tx.ownerAddress,
        to: tx.toAddress,
        value: String(tx.amount || '0'),
        tokenSymbol: 'TRX',
        tokenDecimal: 6,
        timestamp: Math.floor((tx.timestamp || 0) / 1000),
      }))
  }

  private async fetchTrc20Transfers(
    address: string,
    start: number,
    limit: number
  ): Promise<RawTransaction[]> {
    const params = new URLSearchParams({
      sort: '-timestamp',
      count: 'true',
      limit: String(limit),
      start: String(start),
      relatedAddress: address,
    })

    const headers: Record<string, string> = {}
    if (this.apiKey) headers['TRON-PRO-API-KEY'] = this.apiKey

    const res = await fetch(
      `${this.baseUrl}/api/token_trc20/transfers?${params}`,
      { headers }
    )
    if (!res.ok) throw new Error(`Tronscan API error: ${res.status}`)
    const data = await res.json()

    if (!Array.isArray(data.token_transfers)) return []

    return data.token_transfers.map((tx: any) => ({
      hash: tx.transaction_id,
      from: tx.from_address,
      to: tx.to_address,
      value: tx.quant || '0',
      tokenSymbol: tx.tokenInfo?.tokenAbbr || 'TRC20',
      tokenDecimal: tx.tokenInfo?.tokenDecimal ?? 6,
      timestamp: Math.floor((tx.block_ts || 0) / 1000),
    }))
  }
}
