import type { TxGraph } from '@trustin/txgraph'
import {
  GraphBuilder,
  TrustInAdapter,
  createChainAdapter,
  type DataSource,
  type BuilderOptions,
} from '@trustin/txgraph-core'

export type DataSourceType = 'trustin' | 'onchain'

export interface GraphExploreParams {
  address: string
  chain: 'Ethereum' | 'Tron'
  direction?: 'in' | 'out' | 'all'
  token?: string
  maxDepth?: number
  fromDate?: string
  toDate?: string
  dataSource?: DataSourceType
}

function getAdapter(dataSource: DataSourceType, chain: string): DataSource {
  if (dataSource === 'trustin') {
    return new TrustInAdapter({
      apiUrl: import.meta.env.VITE_TRUSTIN_API_URL || 'https://api.trustin.info',
      apiKey: import.meta.env.VITE_TRUSTIN_API_KEY as string | undefined,
    })
  }

  return createChainAdapter(chain, {
    etherscan: {
      apiKey: import.meta.env.VITE_ETHERSCAN_API_KEY as string | undefined,
    },
    tronscan: {
      apiKey: import.meta.env.VITE_TRONSCAN_API_KEY as string | undefined,
    },
  })
}

export async function exploreGraph(params: GraphExploreParams): Promise<TxGraph> {
  const dataSource = params.dataSource || 'trustin'
  const adapter = getAdapter(dataSource, params.chain)

  const options: BuilderOptions = {
    direction: params.direction || 'out',
    token: params.token || undefined,
    maxDepth: params.maxDepth || 3,
    fromDate: params.fromDate,
    toDate: params.toDate,
  }

  const builder = new GraphBuilder(adapter, options)
  return builder.explore(params.address, params.chain)
}

export async function expandNode(
  params: GraphExploreParams,
  existingGraph: TxGraph
): Promise<TxGraph> {
  const dataSource = params.dataSource || 'trustin'
  const adapter = getAdapter(dataSource, params.chain)

  const options: BuilderOptions = {
    direction: params.direction || 'out',
    token: params.token || undefined,
  }

  const builder = new GraphBuilder(adapter, options)
  return builder.expandNode(params.address, params.chain, existingGraph)
}
