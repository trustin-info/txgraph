import type { DataSource } from './types'
import { TrustInAdapter, type TrustInAdapterConfig } from '../adapters/trustin'
import { EtherscanAdapter, type EtherscanAdapterConfig } from '../adapters/etherscan'
import { TronscanAdapter, type TronscanAdapterConfig } from '../adapters/tronscan'

export type AdapterType = 'trustin' | 'etherscan' | 'tronscan'

export interface AdapterConfig {
  trustin?: TrustInAdapterConfig
  etherscan?: EtherscanAdapterConfig
  tronscan?: TronscanAdapterConfig
}

/**
 * Create an adapter by name.
 */
export function createAdapter(type: AdapterType, config?: AdapterConfig): DataSource {
  switch (type) {
    case 'trustin':
      return new TrustInAdapter(config?.trustin)
    case 'etherscan':
      return new EtherscanAdapter(config?.etherscan)
    case 'tronscan':
      return new TronscanAdapter(config?.tronscan)
    default:
      throw new Error(`Unknown adapter type: ${type}`)
  }
}

/**
 * Auto-select an on-chain adapter based on chain name.
 */
export function createChainAdapter(chain: string, config?: AdapterConfig): DataSource {
  switch (chain.toLowerCase()) {
    case 'ethereum':
      return new EtherscanAdapter(config?.etherscan)
    case 'tron':
      return new TronscanAdapter(config?.tronscan)
    default:
      throw new Error(`No adapter available for chain: ${chain}`)
  }
}
