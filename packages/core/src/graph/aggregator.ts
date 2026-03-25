import type { TxEdge } from '../types'
import type { RawTransaction } from '../adapter/types'
import { formatAmount } from '../utils/format'

interface AggregationGroup {
  from: string
  to: string
  totalValue: bigint
  txCount: number
  lastTimestamp: number
  tokenSymbol?: string
  tokenDecimal?: number
}

/**
 * Aggregate raw transactions into TxEdge[] by grouping on (from, to).
 */
export function aggregateTransactions(
  transactions: RawTransaction[],
  direction?: 'in' | 'out' | 'all'
): TxEdge[] {
  const groups = new Map<string, AggregationGroup>()

  for (const tx of transactions) {
    const key = `${tx.from}->${tx.to}`
    const existing = groups.get(key)

    let value: bigint
    try {
      value = BigInt(tx.value)
    } catch {
      value = 0n
    }

    if (existing) {
      existing.totalValue += value
      existing.txCount++
      existing.lastTimestamp = Math.max(existing.lastTimestamp, tx.timestamp)
      if (tx.tokenSymbol) existing.tokenSymbol = tx.tokenSymbol
      if (tx.tokenDecimal != null) existing.tokenDecimal = tx.tokenDecimal
    } else {
      groups.set(key, {
        from: tx.from,
        to: tx.to,
        totalValue: value,
        txCount: 1,
        lastTimestamp: tx.timestamp,
        tokenSymbol: tx.tokenSymbol,
        tokenDecimal: tx.tokenDecimal,
      })
    }
  }

  return Array.from(groups.values()).map((group) => {
    const decimals = group.tokenDecimal ?? 18
    const symbol = group.tokenSymbol ?? 'ETH'

    return {
      from: group.from,
      to: group.to,
      direction: direction ?? 'all',
      amount: group.totalValue.toString(),
      formatted_amount: formatAmount(group.totalValue.toString(), decimals, symbol),
      last_timestamp: group.lastTimestamp,
      tx_count: group.txCount,
      token: group.tokenSymbol,
    }
  })
}
