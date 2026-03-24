import * as react_jsx_runtime from 'react/jsx-runtime';

interface TxTag {
    name: string;
    primaryCategory?: string;
    secondaryCategory?: string;
}
interface TxNode {
    address: string;
    chain?: string;
    depth: number;
    is_root: boolean;
    risk_level: 'high' | 'medium' | 'low' | 'unknown';
    risk_score?: number;
    tags: TxTag[];
    is_stopped: boolean;
    stop_reason?: string;
}
interface TxEdge {
    from: string;
    to: string;
    formatted_amount: string;
    amount?: number;
    token?: string;
    last_timestamp: number;
    direction: 'in' | 'out' | 'all';
    tx_count?: number;
}
interface TxGraphStats {
    total_nodes: number;
    total_edges: number;
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
    stats?: TxGraphStats;
    loading?: boolean;
    expandingNode?: string | null;
    selectedAddress?: string | null;
    onNodeSelect?: (node: TxNode | null) => void;
    onNodeExpand?: (address: string) => void;
    onNodeDelete?: (address: string) => void;
}

declare function GraphExplorer({ nodes: apiNodes, edges: apiEdges, stats, loading, expandingNode, onNodeSelect, onNodeExpand, onNodeDelete, selectedAddress, }: GraphExplorerProps): react_jsx_runtime.JSX.Element;

declare function GraphExplorerSigma({ nodes, edges, stats, loading, selectedAddress, onNodeSelect, onNodeExpand, onNodeDelete, }: GraphExplorerProps): react_jsx_runtime.JSX.Element;

export { GraphExplorer, type GraphExplorerProps, GraphExplorerSigma, type TxEdge, type TxGraph, type TxGraphStats, type TxNode, type TxTag };
