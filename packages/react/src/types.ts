// TxTag matches the Antares tag object returned by steez graph_explore API
export interface TxTag {
  address?: string
  chain_name?: string
  primary_category: string
  secondary_category?: string
  tertiary_category?: string
  quaternary_category?: string
  risk_level?: string
  priority?: number
  // Legacy/alternative field names (from older API versions)
  name?: string
  primaryCategory?: string
  secondaryCategory?: string
}

export interface TxNode {
  address: string
  depth: number
  is_root: boolean
  risk_level: 'high' | 'medium' | 'low' | 'unknown'
  risk_score?: number
  tags: TxTag[]
  total_neighbors: number
  visible_neighbors: number
  is_stopped: boolean
  stop_reason?: string
  chain?: string
}

export interface TxEdge {
  from: string
  to: string
  direction: 'in' | 'out' | 'all'
  amount: string
  formatted_amount: string
  last_timestamp: number
  tx_count?: number
  // Legacy field
  token?: string
}

export interface TxGraphStats {
  total_nodes: number
  total_edges: number
  max_depth_reached: number
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
  stats?: TxGraphStats | null
  loading?: boolean
  expandingNode?: string | null
  selectedAddress?: string | null
  onNodeSelect?: (node: TxNode | null) => void
  onNodeExpand?: (address: string) => void
  onNodeDelete?: (address: string) => void
  className?: string
}
