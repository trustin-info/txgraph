export interface TxTag {
  name: string
  primaryCategory?: string
  secondaryCategory?: string
}

export interface TxNode {
  address: string
  chain?: string
  depth: number
  is_root: boolean
  risk_level: 'high' | 'medium' | 'low' | 'unknown'
  risk_score?: number
  tags: TxTag[]
  is_stopped: boolean
  stop_reason?: string
}

export interface TxEdge {
  from: string
  to: string
  formatted_amount: string
  amount?: number
  token?: string
  last_timestamp: number
  direction: 'in' | 'out' | 'all'
  tx_count?: number
}

export interface TxGraphStats {
  total_nodes: number
  total_edges: number
  stopped_nodes: number
}

export interface TxGraph {
  nodes: TxNode[]
  edges: TxEdge[]
  stats: TxGraphStats
}

export interface GraphExplorerProps {
  nodes: TxNode[]
  edges: TxEdge[]
  stats?: TxGraphStats
  loading?: boolean
  expandingNode?: string | null
  selectedAddress?: string | null
  onNodeSelect?: (node: TxNode | null) => void
  onNodeExpand?: (address: string) => void
  onNodeDelete?: (address: string) => void
}
