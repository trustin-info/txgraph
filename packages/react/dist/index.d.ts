import * as react_jsx_runtime from 'react/jsx-runtime';

interface TxTag {
    address?: string;
    chain_name?: string;
    primary_category: string;
    secondary_category?: string;
    tertiary_category?: string;
    quaternary_category?: string;
    risk_level?: string;
    priority?: number;
    name?: string;
    primaryCategory?: string;
    secondaryCategory?: string;
}
interface TxNode {
    address: string;
    depth: number;
    is_root: boolean;
    risk_level: 'high' | 'medium' | 'low' | 'unknown';
    risk_score?: number;
    tags: TxTag[];
    total_neighbors: number;
    visible_neighbors: number;
    is_stopped: boolean;
    stop_reason?: string;
    chain?: string;
}
interface TxEdge {
    from: string;
    to: string;
    direction: 'in' | 'out' | 'all';
    amount: string;
    formatted_amount: string;
    last_timestamp: number;
    tx_count?: number;
    token?: string;
}
interface TxGraphStats {
    total_nodes: number;
    total_edges: number;
    max_depth_reached: number;
    stopped_nodes: number;
}
interface TxGraph {
    nodes: TxNode[];
    edges: TxEdge[];
    stats: TxGraphStats;
}
interface GraphExplorerProps {
    nodes: TxNode[];
    edges: TxEdge[];
    stats?: TxGraphStats | null;
    loading?: boolean;
    expandingNode?: string | null;
    selectedAddress?: string | null;
    onNodeSelect?: (node: TxNode | null) => void;
    onNodeExpand?: (address: string) => void;
    onNodeDelete?: (address: string) => void;
    className?: string;
}

declare function GraphExplorer({ nodes: apiNodes, edges: apiEdges, stats, loading, expandingNode, onNodeSelect, onNodeExpand, onNodeDelete, selectedAddress, }: GraphExplorerProps): react_jsx_runtime.JSX.Element;

declare function GraphExplorerSigma({ nodes, edges, stats, loading, selectedAddress, onNodeSelect, onNodeExpand, onNodeDelete, }: GraphExplorerProps): react_jsx_runtime.JSX.Element;

export { GraphExplorer, type GraphExplorerProps, GraphExplorerSigma, type TxEdge, type TxGraph, type TxGraphStats, type TxNode, type TxTag };
