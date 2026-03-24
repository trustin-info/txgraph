"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  GraphExplorer: () => GraphExplorer,
  GraphExplorerSigma: () => GraphExplorerSigma
});
module.exports = __toCommonJS(index_exports);

// src/GraphExplorer.tsx
var import_react = require("react");
var import_react2 = require("@xyflow/react");
var import_style = require("@xyflow/react/dist/style.css");
var import_lucide_react = require("lucide-react");
var import_dagre = __toESM(require("@dagrejs/dagre"));
var import_jsx_runtime = require("react/jsx-runtime");
function useDarkMode() {
  const [isDark, setIsDark] = (0, import_react.useState)(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  (0, import_react.useEffect)(() => {
    if (typeof document === "undefined") return;
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}
function riskBorderColor(risk) {
  switch (risk) {
    case "high":
      return "#ef4444";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#22c55e";
    default:
      return "#6b7280";
  }
}
function riskBgColor(risk) {
  switch (risk) {
    case "high":
      return "rgba(239,68,68,0.08)";
    case "medium":
      return "rgba(245,158,11,0.08)";
    case "low":
      return "rgba(34,197,94,0.08)";
    default:
      return "rgba(107,114,128,0.06)";
  }
}
var ExplorerCallbacksCtx = (0, import_react.createContext)({ expandingNode: null });
function ExplorerNode({ data, id }) {
  const { onNodeSelect, onNodeExpand, onNodeDelete, expandingNode } = (0, import_react.useContext)(ExplorerCallbacksCtx);
  const d = data;
  const node = d.nodeInfo;
  const isLoading = expandingNode === node.address;
  const isSelected = d.isSelected === true;
  const isDimmed = d.isDimmed === true;
  const shortAddr = node.address ? `${node.address.slice(0, 6)}\u2026${node.address.slice(-4)}` : id.slice(0, 6) + "\u2026" + id.slice(-4);
  const primaryTag = node.tags?.[0];
  const borderColor = node.is_root ? "#3b82f6" : riskBorderColor(node.risk_level);
  const bg = node.is_root ? "rgba(59,130,246,0.08)" : riskBgColor(node.risk_level);
  const borderStyle = node.is_stopped && !node.is_root ? "dashed" : "solid";
  const borderWidth = node.is_root ? 2 : 1.5;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      style: {
        position: "relative",
        border: `${borderWidth}px ${borderStyle} ${borderColor}`,
        borderRadius: 8,
        width: 180,
        minHeight: 70,
        padding: "8px 12px",
        background: bg,
        boxShadow: isSelected ? `0 0 0 3px rgba(59,130,246,0.6), 0 0 12px rgba(59,130,246,0.3)` : node.is_root ? `0 0 0 3px rgba(59,130,246,0.25)` : "0 1px 4px rgba(0,0,0,0.12)",
        cursor: "pointer",
        userSelect: "none",
        overflow: "hidden",
        opacity: isDimmed ? 0.25 : 1,
        transition: "opacity 0.2s, box-shadow 0.2s"
      },
      onClick: () => onNodeSelect?.(node),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react2.Handle, { type: "target", id: "target-left", position: import_react2.Position.Left, style: { background: "#6b7280", width: 8, height: 8, top: "40%" } }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react2.Handle, { type: "source", id: "source-left", position: import_react2.Position.Left, style: { background: "#06b6d4", width: 8, height: 8, top: "60%" } }),
        isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "div",
          {
            style: {
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 7,
              zIndex: 10
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Loader2, { size: 20, style: { color: "#60a5fa", animation: "spin 1s linear infinite" } })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 4, marginBottom: 4, flexWrap: "wrap" }, children: [
          node.is_root && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "span",
            {
              style: {
                fontSize: 9,
                padding: "1px 5px",
                borderRadius: 4,
                background: "#3b82f6",
                color: "#fff",
                fontWeight: 700,
                letterSpacing: "0.06em"
              },
              children: "ROOT"
            }
          ),
          node.is_stopped && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.AlertTriangle, { size: 11, style: { color: "#f59e0b", flexShrink: 0 } }),
          primaryTag && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "span",
            {
              style: {
                fontSize: 9,
                padding: "1px 5px",
                borderRadius: 4,
                background: "rgba(99,102,241,0.15)",
                color: "#818cf8",
                fontWeight: 600,
                maxWidth: 100,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              },
              children: primaryTag.primaryCategory || primaryTag.name
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "div",
          {
            style: {
              fontFamily: "monospace",
              fontSize: 11,
              color: "var(--tx-heading, #ffffff)",
              fontWeight: 400,
              letterSpacing: "0.02em"
            },
            children: shortAddr
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 4, marginTop: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "span",
            {
              style: {
                fontSize: 9,
                padding: "1px 5px",
                borderRadius: 4,
                background: riskBorderColor(node.risk_level) + "22",
                color: riskBorderColor(node.risk_level),
                fontWeight: 600,
                textTransform: "capitalize"
              },
              children: node.risk_level
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { fontSize: 9, color: "var(--tx-caption, #64748b)" }, children: [
            "d",
            node.depth
          ] })
        ] }),
        !node.is_root && !node.is_stopped && onNodeExpand && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            style: {
              position: "absolute",
              top: 4,
              right: 4,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#3b82f6",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              zIndex: 5
            },
            onClick: (e) => {
              e.stopPropagation();
              onNodeExpand(node.address);
            },
            title: "Expand from this node",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 11 })
          }
        ),
        !node.is_root && onNodeDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            style: {
              position: "absolute",
              top: 4,
              right: !node.is_stopped && onNodeExpand ? 26 : 4,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#6b7280",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              zIndex: 5,
              opacity: 0.7
            },
            onClick: (e) => {
              e.stopPropagation();
              onNodeDelete(node.address);
            },
            title: "Remove this node",
            onMouseEnter: (e) => {
              ;
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.background = "#ef4444";
            },
            onMouseLeave: (e) => {
              ;
              e.currentTarget.style.opacity = "0.7";
              e.currentTarget.style.background = "#6b7280";
            },
            children: "\u2715"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react2.Handle, { type: "source", id: "source-right", position: import_react2.Position.Right, style: { background: "#8b5cf6", width: 8, height: 8, top: "40%" } }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react2.Handle, { type: "target", id: "target-right", position: import_react2.Position.Right, style: { background: "#6b7280", width: 8, height: 8, top: "60%" } })
      ]
    }
  );
}
var nodeTypes = { explorerNode: ExplorerNode };
var STRAIGHT_LINE_LENGTH = 100;
var LINE_SPACE = 30;
var SAME_LEVEL_THRESHOLD = 200;
function AmountEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  label,
  source,
  target,
  data
}) {
  const nodes = (0, import_react2.useNodes)();
  const edges = (0, import_react2.useEdges)();
  const selfFromNode = nodes.find((n) => n.id === source);
  const selfToNode = nodes.find((n) => n.id === target);
  const sameLevelEdges = edges.filter((e) => {
    const fromNode = nodes.find((n) => n.id === e.source);
    const toNode = nodes.find((n) => n.id === e.target);
    if (!fromNode || !toNode || !selfFromNode || !selfToNode) return false;
    return Math.abs(fromNode.position.x - selfFromNode.position.x) < SAME_LEVEL_THRESHOLD && Math.abs(toNode.position.x - selfToNode.position.x) < SAME_LEVEL_THRESHOLD || Math.abs(fromNode.position.x - selfToNode.position.x) < SAME_LEVEL_THRESHOLD && Math.abs(toNode.position.x - selfFromNode.position.x) < SAME_LEVEL_THRESHOLD;
  });
  let labelX = (sourceX + targetX) / 2;
  let labelY = (sourceY + targetY) / 2;
  let path;
  if (sameLevelEdges.length <= 1) {
    const midX = (sourceX + targetX) / 2;
    path = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;
  } else {
    const edgeInfos = sameLevelEdges.map((e) => {
      const sn = nodes.find((n) => n.id === e.source);
      const tn = nodes.find((n) => n.id === e.target);
      const sY = sn?.position?.y ?? 0;
      const tY = tn?.position?.y ?? 0;
      return { edgeId: e.id, idealY: (sY + tY) / 2 };
    });
    edgeInfos.sort((a, b) => a.idealY - b.idealY);
    const assignedYs = [];
    for (let i = 0; i < edgeInfos.length; i++) {
      if (i === 0) {
        assignedYs.push(edgeInfos[i].idealY);
      } else {
        assignedYs.push(Math.max(edgeInfos[i].idealY, assignedYs[i - 1] + LINE_SPACE));
      }
    }
    const medianIdeal = edgeInfos[Math.floor(edgeInfos.length / 2)].idealY;
    const medianAssigned = assignedYs[Math.floor(assignedYs.length / 2)];
    const shift = medianIdeal - medianAssigned;
    for (let i = 0; i < assignedYs.length; i++) {
      assignedYs[i] += shift;
    }
    const selfIdx = edgeInfos.findIndex((ei) => ei.edgeId === id);
    const straightY = selfIdx >= 0 ? assignedYs[selfIdx] : (sourceY + targetY) / 2;
    const remainX = Math.max((Math.abs(targetX - sourceX) - STRAIGHT_LINE_LENGTH) / 2, 20);
    if (targetX > sourceX) {
      const c1EndX = sourceX + remainX;
      const c2StartX = targetX - remainX;
      path = `M ${sourceX},${sourceY} C ${sourceX + remainX * 0.5},${sourceY} ${sourceX + remainX * 0.5},${straightY} ${c1EndX},${straightY} L ${c2StartX},${straightY} C ${targetX - remainX * 0.5},${straightY} ${targetX - remainX * 0.5},${targetY} ${targetX},${targetY}`;
    } else {
      const c1EndX = sourceX - remainX;
      const c2StartX = targetX + remainX;
      path = `M ${sourceX},${sourceY} C ${sourceX - remainX * 0.5},${sourceY} ${sourceX - remainX * 0.5},${straightY} ${c1EndX},${straightY} L ${c2StartX},${straightY} C ${targetX + remainX * 0.5},${straightY} ${targetX + remainX * 0.5},${targetY} ${targetX},${targetY}`;
    }
    labelX = (sourceX + targetX) / 2;
    labelY = straightY;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react2.BaseEdge, { id, path, style, markerEnd }),
    label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react2.EdgeLabelRenderer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        style: {
          position: "absolute",
          transformOrigin: "center",
          textAlign: "center",
          transform: `translate(-50%, -100%) translate(${labelX}px,${labelY}px)`,
          pointerEvents: "none"
        },
        className: "nodrag nopan",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            style: {
              fontSize: 9,
              fontWeight: 500,
              color: "var(--tx-body, #94a3b8)",
              background: "var(--tx-elevated, #1e293b)",
              padding: "1px 5px",
              borderRadius: 3,
              whiteSpace: "nowrap",
              border: "1px solid var(--tx-divider, rgba(51,65,85,0.5))"
            },
            children: [
              data?.token && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenIcon, { token: data.token }),
              label
            ]
          }
        )
      }
    ) })
  ] });
}
function TokenIcon({ token }) {
  const t = token.toLowerCase();
  if (t === "usdt") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: "12", height: "12", viewBox: "0 0 32 32", style: { display: "inline-block", verticalAlign: "middle", marginRight: 2 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "16", cy: "16", r: "16", fill: "#26A17B" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M17.9 17.9v-.003c-.1.007-.6.04-1.8.04-1 0-1.5-.03-1.7-.04v.004c-3.4-.15-5.9-.74-5.9-1.45 0-.71 2.5-1.3 5.9-1.45v2.31c.2.015.7.05 1.7.05 1.2 0 1.6-.04 1.8-.05V15c3.4.15 5.9.74 5.9 1.45 0 .71-2.5 1.3-5.9 1.45zm0-3.13V12.8h5v-2.6H9.2v2.6h5v1.97c-3.8.17-6.7.93-6.7 1.83s2.9 1.66 6.7 1.83v6.57h3.5v-6.57c3.8-.17 6.7-.93 6.7-1.83s-2.9-1.66-6.7-1.83z", fill: "#fff" })
    ] });
  }
  if (t === "usdc") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: "12", height: "12", viewBox: "0 0 32 32", style: { display: "inline-block", verticalAlign: "middle", marginRight: 2 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "16", cy: "16", r: "16", fill: "#2775CA" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M20.4 18c0-2.1-1.3-2.8-3.8-3.1-1.8-.3-2.2-.7-2.2-1.4s.6-1.2 1.8-1.2c1 0 1.6.4 1.8 1.2.1.1.2.2.3.2h1c.2 0 .3-.2.3-.3-.2-1.2-1-2.1-2.3-2.4v-1.4c0-.2-.1-.3-.3-.3h-.8c-.2 0-.3.1-.3.3V11c-1.7.3-2.8 1.3-2.8 2.7 0 2 1.2 2.7 3.7 3 1.6.3 2.2.6 2.2 1.5s-.8 1.4-1.9 1.4c-1.5 0-2-.6-2.2-1.4 0-.2-.1-.2-.3-.2h-1c-.2 0-.3.1-.3.3.3 1.4 1.1 2.2 2.8 2.5v1.4c0 .2.1.3.3.3h.8c.2 0 .3-.1.3-.3v-1.4c1.8-.2 2.9-1.3 2.9-2.8z", fill: "#fff" })
    ] });
  }
  return null;
}
var edgeTypes = { amountEdge: AmountEdge };
function layoutGraph(apiNodes, apiEdges) {
  const g = new import_dagre.default.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 50, ranksep: 280 });
  apiNodes.forEach((n) => g.setNode(n.address, { width: 180, height: 70 }));
  apiEdges.forEach((e) => {
    try {
      g.setEdge(e.from, e.to);
    } catch {
    }
  });
  import_dagre.default.layout(g);
  const flowNodes = apiNodes.map((n) => {
    const pos = g.node(n.address);
    return {
      id: n.address,
      type: "explorerNode",
      position: { x: pos ? pos.x - 90 : 0, y: pos ? pos.y - 35 : 0 },
      data: { nodeInfo: n }
    };
  });
  const stoppedSet = new Set(apiNodes.filter((n) => n.is_stopped).map((n) => n.address));
  const posMap = /* @__PURE__ */ new Map();
  apiNodes.forEach((n) => {
    const pos = g.node(n.address);
    if (pos) posMap.set(n.address, { x: pos.x, y: pos.y });
  });
  const flowEdges = apiEdges.map((e, i) => {
    const isOutflow = e.direction === "out";
    const edgeColor = isOutflow ? "#8b5cf6" : "#06b6d4";
    const isStopped = stoppedSet.has(e.to) || stoppedSet.has(e.from);
    const srcPos = posMap.get(e.from);
    const tgtPos = posMap.get(e.to);
    const srcIsLeft = srcPos && tgtPos ? srcPos.x <= tgtPos.x : isOutflow;
    const sourceHandle = srcIsLeft ? "source-right" : "source-left";
    const targetHandle = srcIsLeft ? "target-left" : "target-right";
    const token = e.token || (e.formatted_amount.includes("USDT") ? "usdt" : e.formatted_amount.includes("USDC") ? "usdc" : "");
    return {
      id: `edge-${i}-${e.from}-${e.to}`,
      source: e.from,
      target: e.to,
      sourceHandle,
      targetHandle,
      type: "amountEdge",
      animated: false,
      data: { token },
      label: e.last_timestamp ? `${e.formatted_amount} \xB7 ${new Date(e.last_timestamp * 1e3).toISOString().replace("T", " ").slice(0, 10)}` : e.formatted_amount,
      style: {
        stroke: edgeColor,
        strokeWidth: 1.5,
        strokeDasharray: isStopped ? "4 3" : void 0
      },
      markerEnd: {
        type: "arrowclosed",
        color: edgeColor,
        width: 16,
        height: 16
      }
    };
  });
  return { flowNodes, flowEdges };
}
function GraphExplorer({
  nodes: apiNodes,
  edges: apiEdges,
  stats,
  loading = false,
  expandingNode = null,
  onNodeSelect,
  onNodeExpand,
  onNodeDelete,
  selectedAddress = null
}) {
  const isDark = useDarkMode();
  const { flowNodes, flowEdges } = (0, import_react.useMemo)(
    () => layoutGraph(apiNodes, apiEdges),
    [apiNodes, apiEdges]
  );
  const pathInfo = (0, import_react.useMemo)(() => {
    if (!selectedAddress) return { pathNodes: /* @__PURE__ */ new Set(), pathEdges: /* @__PURE__ */ new Set() };
    const rootAddr = apiNodes.find((n) => n.is_root)?.address;
    if (!rootAddr || selectedAddress === rootAddr) return { pathNodes: /* @__PURE__ */ new Set([selectedAddress]), pathEdges: /* @__PURE__ */ new Set() };
    const fwd = /* @__PURE__ */ new Map();
    for (let i = 0; i < apiEdges.length; i++) {
      const e = apiEdges[i];
      if (!fwd.has(e.from)) fwd.set(e.from, []);
      fwd.get(e.from).push({ to: e.to, edgeId: `edge-${i}-${e.from}-${e.to}` });
    }
    const pathNodes = /* @__PURE__ */ new Set();
    const pathEdges = /* @__PURE__ */ new Set();
    const visiting = /* @__PURE__ */ new Set();
    function dfs(cur) {
      if (cur === selectedAddress) {
        pathNodes.add(cur);
        return true;
      }
      if (visiting.has(cur)) return false;
      visiting.add(cur);
      let foundAny = false;
      for (const { to, edgeId } of fwd.get(cur) ?? []) {
        if (dfs(to)) {
          pathNodes.add(cur);
          pathNodes.add(to);
          pathEdges.add(edgeId);
          foundAny = true;
        }
      }
      visiting.delete(cur);
      return foundAny;
    }
    dfs(rootAddr);
    return { pathNodes, pathEdges };
  }, [selectedAddress, apiNodes, apiEdges]);
  const hasSelection = selectedAddress != null && pathInfo.pathNodes.size > 0;
  const [nodes, setNodes, onNodesChange] = (0, import_react2.useNodesState)(flowNodes);
  const [edges, setEdges, onEdgesChange] = (0, import_react2.useEdgesState)(flowEdges);
  const rfInstance = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const highlighted = flowNodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        isSelected: n.id === selectedAddress,
        isOnPath: hasSelection && pathInfo.pathNodes.has(n.id),
        isDimmed: hasSelection && !pathInfo.pathNodes.has(n.id)
      }
    }));
    setNodes(highlighted);
  }, [flowNodes, setNodes, selectedAddress, hasSelection, pathInfo]);
  (0, import_react.useEffect)(() => {
    const highlighted = flowEdges.map((e) => ({
      ...e,
      style: {
        ...e.style,
        opacity: hasSelection && !pathInfo.pathEdges.has(e.id) ? 0.15 : 1,
        strokeWidth: hasSelection && pathInfo.pathEdges.has(e.id) ? 2.5 : e.style?.strokeWidth ?? 1.5
      }
    }));
    setEdges(highlighted);
  }, [flowEdges, setEdges, hasSelection, pathInfo]);
  (0, import_react.useEffect)(() => {
    requestAnimationFrame(() => {
      rfInstance.current?.fitView({ padding: 0.3, duration: 300 });
    });
  }, [flowEdges]);
  const ctxValue = (0, import_react.useMemo)(
    () => ({ onNodeSelect, onNodeExpand, onNodeDelete, expandingNode }),
    [onNodeSelect, onNodeExpand, onNodeDelete, expandingNode]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { width: "100%", height: "100%", position: "relative" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExplorerCallbacksCtx.Provider, { value: ctxValue, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_react2.ReactFlow,
      {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        nodeTypes,
        edgeTypes,
        fitView: true,
        fitViewOptions: { padding: 0.3 },
        onInit: (instance) => {
          rfInstance.current = instance;
        },
        onPaneClick: () => onNodeSelect?.(null),
        minZoom: 0.05,
        maxZoom: 3,
        proOptions: { hideAttribution: true },
        colorMode: isDark ? "dark" : "light",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react2.Background, { color: isDark ? "#374151" : "#d1d5db", gap: 20 }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react2.Controls, {}),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_react2.MiniMap,
            {
              maskColor: isDark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.65)"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react2.Panel, { position: "top-right", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "div",
            {
              style: {
                fontSize: 11,
                color: "var(--tx-body, #94a3b8)",
                background: "var(--tx-elevated, #1e293b)",
                border: "1px solid var(--tx-divider, rgba(51,65,85,0.5))",
                borderRadius: 6,
                padding: "4px 10px"
              },
              children: stats ? `${stats.total_nodes} nodes \xB7 ${stats.total_edges} edges` : `${apiNodes.length} nodes \xB7 ${apiEdges.length} edges`
            }
          ) })
        ]
      }
    ) }),
    loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        style: {
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          zIndex: 20
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Loader2, { size: 36, style: { color: "#60a5fa", animation: "spin 1s linear infinite" } }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: "#94a3b8", fontSize: 13 }, children: "Exploring graph\u2026" })
        ]
      }
    )
  ] });
}

// src/GraphExplorerSigma.tsx
var import_react3 = require("react");
var import_graphology = __toESM(require("graphology"));
var import_sigma = require("sigma");
var import_edge_curve = require("@sigma/edge-curve");
var import_lucide_react2 = require("lucide-react");
var import_jsx_runtime2 = require("react/jsx-runtime");
function useDarkMode2() {
  const [isDark, setIsDark] = (0, import_react3.useState)(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  (0, import_react3.useEffect)(() => {
    if (typeof document === "undefined") return;
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}
function riskColor(risk) {
  switch (risk) {
    case "high":
      return "#ef4444";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#22c55e";
    default:
      return "#6b7280";
  }
}
var ROOT_NODE_SIZE = 0.4;
var REGULAR_NODE_SIZE = 0.3;
var NODE_SPACING = 1;
var LEVEL_SPACING = 3.5;
var BASE_FONT_SIZE = 11;
var controlBtnStyle = {
  width: 28,
  height: 28,
  borderRadius: 4,
  border: "1px solid var(--tx-divider, rgba(51,65,85,0.5))",
  background: "var(--tx-elevated, #1e293b)",
  color: "var(--tx-body, #94a3b8)",
  cursor: "pointer",
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};
function GraphExplorerSigma({
  nodes,
  edges,
  stats,
  loading = false,
  selectedAddress,
  onNodeSelect,
  onNodeExpand,
  onNodeDelete
}) {
  const containerRef = (0, import_react3.useRef)(null);
  const sigmaRef = (0, import_react3.useRef)(null);
  const graphRef = (0, import_react3.useRef)(null);
  const isDark = useDarkMode2();
  const colors = (0, import_react3.useMemo)(
    () => ({
      bg: isDark ? "#0f172a" : "#f8fafc",
      label: isDark ? "#e2e8f0" : "#1e293b",
      labelBg: isDark ? "#1e293b" : "#ffffff",
      edge: isDark ? "#6b7280" : "#9ca3af",
      nodeBorder: isDark ? "#374151" : "#d1d5db",
      dimNode: isDark ? "#374151" : "#e2e8f0",
      dimEdge: isDark ? "#1f2937" : "#f1f5f9",
      isDark
    }),
    [isDark]
  );
  const colorsRef = (0, import_react3.useRef)(colors);
  (0, import_react3.useEffect)(() => {
    colorsRef.current = colors;
  }, [colors]);
  const isDarkRef = (0, import_react3.useRef)(isDark);
  (0, import_react3.useEffect)(() => {
    isDarkRef.current = isDark;
  }, [isDark]);
  const customDrawNodeLabel = (0, import_react3.useCallback)(
    (context, data, _settings) => {
      if (!data.label) return;
      const currentIsDark = colorsRef.current.isDark;
      const nodeColor = data.color || "";
      const isDimmedNode = nodeColor === colorsRef.current.dimNode || nodeColor === (currentIsDark ? "#4b5563" : "#9ca3af");
      const textColor = isDimmedNode ? currentIsDark ? "#6b7280" : "#9ca3af" : currentIsDark ? "#f1f5f9" : "#0f172a";
      const tagColor = isDimmedNode ? currentIsDark ? "#4b5563" : "#c4c9d0" : currentIsDark ? "#94a3b8" : "#64748b";
      const nodeRadius = data.size;
      const cameraRatio = sigmaRef.current?.getCamera().ratio ?? 1;
      const fontSize = Math.max(6, Math.min(BASE_FONT_SIZE / cameraRatio, nodeRadius * 0.35));
      context.font = `600 ${fontSize}px monospace`;
      context.fillStyle = textColor;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(data.label, data.x, data.y - (nodeRadius > 14 ? 4 : 1));
      const nodeInfo = data.nodeData;
      if (nodeInfo && !isDimmedNode && nodeRadius >= 14) {
        const tag = nodeInfo.tags?.[0]?.secondaryCategory || nodeInfo.tags?.[0]?.primaryCategory || nodeInfo.tags?.[0]?.name || "";
        const riskStr = nodeInfo.risk_level !== "unknown" ? nodeInfo.risk_level : "";
        const subLabel = tag || riskStr;
        if (subLabel) {
          const subFontSize = Math.max(5, BASE_FONT_SIZE * 0.65 / cameraRatio);
          context.font = `${subFontSize}px sans-serif`;
          context.fillStyle = tagColor;
          context.fillText(subLabel.slice(0, 14), data.x, data.y + nodeRadius * 0.55);
        }
      }
    },
    []
  );
  const customDrawEdgeLabel = (0, import_react3.useCallback)(
    (context, data, sourceData, targetData, _settings) => {
      if (!data.label) return;
      const cameraRatio = sigmaRef.current?.getCamera().ratio ?? 1;
      const fontSize = Math.max(5, BASE_FONT_SIZE * 0.85 / cameraRatio);
      const x = (sourceData.x + targetData.x) / 2;
      const y = (sourceData.y + targetData.y) / 2;
      context.save();
      context.font = `${fontSize}px sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      const metrics = context.measureText(data.label);
      const padding = Math.max(2, fontSize * 0.3);
      const w = metrics.width + padding * 2;
      const h = fontSize + padding * 2;
      context.fillStyle = "rgba(0,0,0,0.55)";
      context.beginPath();
      context.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
      context.fill();
      context.fillStyle = "#ffffffcc";
      context.fillText(data.label, x, y);
      context.restore();
    },
    []
  );
  const graph = (0, import_react3.useMemo)(() => {
    const g = new import_graphology.default({ multi: false, type: "directed" });
    const byDepth = /* @__PURE__ */ new Map();
    nodes.forEach((n) => {
      if (!byDepth.has(n.depth)) byDepth.set(n.depth, []);
      byDepth.get(n.depth).push(n);
    });
    const posMap = /* @__PURE__ */ new Map();
    byDepth.forEach((nodesAtDepth, depth) => {
      const count = nodesAtDepth.length;
      nodesAtDepth.forEach((n, idx) => {
        const x = depth * LEVEL_SPACING;
        const y = (idx - (count - 1) / 2) * NODE_SPACING;
        posMap.set(n.address, { x, y });
      });
    });
    nodes.forEach((n) => {
      const pos = posMap.get(n.address) ?? { x: 0, y: 0 };
      const label = n.address ? n.address.slice(0, 6) + "\u2026" + n.address.slice(-4) : n.address;
      g.addNode(n.address, {
        label,
        size: n.is_root ? ROOT_NODE_SIZE : REGULAR_NODE_SIZE,
        color: n.is_root ? "#3b82f6" : riskColor(n.risk_level),
        x: pos.x,
        y: pos.y,
        nodeData: n
      });
    });
    edges.forEach((e) => {
      try {
        const edgeLabel = e.last_timestamp ? `${e.formatted_amount} \xB7 ${new Date(e.last_timestamp * 1e3).toISOString().replace("T", " ").slice(0, 10)}` : e.formatted_amount;
        g.addEdge(e.from, e.to, {
          type: "curved",
          label: edgeLabel,
          size: 0.015,
          color: e.direction === "out" ? "#8b5cf6" : "#06b6d4",
          edgeData: e
        });
      } catch {
      }
    });
    return g;
  }, [nodes, edges]);
  const pathInfo = (0, import_react3.useMemo)(() => {
    if (!selectedAddress) return { pathNodes: /* @__PURE__ */ new Set(), pathEdges: /* @__PURE__ */ new Set() };
    const rootAddr = nodes.find((n) => n.is_root)?.address;
    if (!rootAddr || selectedAddress === rootAddr) {
      return { pathNodes: /* @__PURE__ */ new Set([selectedAddress]), pathEdges: /* @__PURE__ */ new Set() };
    }
    const fwd = /* @__PURE__ */ new Map();
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      if (!fwd.has(e.from)) fwd.set(e.from, []);
      fwd.get(e.from).push({ to: e.to, edgeId: `${e.from}->${e.to}` });
    }
    const pathNodes = /* @__PURE__ */ new Set();
    const pathEdges = /* @__PURE__ */ new Set();
    const visiting = /* @__PURE__ */ new Set();
    function dfs(cur) {
      if (cur === selectedAddress) {
        pathNodes.add(cur);
        return true;
      }
      if (visiting.has(cur)) return false;
      visiting.add(cur);
      let foundAny = false;
      for (const { to, edgeId } of fwd.get(cur) ?? []) {
        if (dfs(to)) {
          pathNodes.add(cur);
          pathNodes.add(to);
          pathEdges.add(edgeId);
          foundAny = true;
        }
      }
      visiting.delete(cur);
      return foundAny;
    }
    dfs(rootAddr);
    return { pathNodes, pathEdges };
  }, [selectedAddress, nodes, edges]);
  (0, import_react3.useEffect)(() => {
    if (!containerRef.current || graph.order === 0) return;
    if (sigmaRef.current) {
      sigmaRef.current.kill();
      sigmaRef.current = null;
    }
    graphRef.current = graph;
    const drawNodeLabel = customDrawNodeLabel;
    const renderer = new import_sigma.Sigma(graph, containerRef.current, {
      itemSizesReference: "positions",
      renderLabels: true,
      renderEdgeLabels: true,
      labelSize: 11,
      labelColor: { color: colorsRef.current.label },
      edgeLabelSize: 10,
      edgeLabelColor: { color: colorsRef.current.label },
      defaultEdgeType: "curved",
      defaultEdgeColor: colorsRef.current.edge,
      edgeProgramClasses: { curved: import_edge_curve.EdgeCurvedArrowProgram },
      defaultDrawNodeLabel: drawNodeLabel,
      defaultDrawEdgeLabel: customDrawEdgeLabel,
      defaultDrawNodeHover: ((context, data, settings) => {
        context.beginPath();
        context.arc(data.x, data.y, data.size + 3, 0, Math.PI * 2);
        context.fillStyle = "rgba(59, 130, 246, 0.15)";
        context.fill();
        context.strokeStyle = "rgba(59, 130, 246, 0.6)";
        context.lineWidth = 2;
        context.stroke();
        context.beginPath();
        context.arc(data.x, data.y, data.size, 0, Math.PI * 2);
        context.fillStyle = data.color;
        context.fill();
        drawNodeLabel(context, data, settings);
      }),
      labelRenderedSizeThreshold: 0,
      labelDensity: 1
    });
    renderer.on("clickNode", ({ node }) => {
      const nodeData = graph.getNodeAttribute(node, "nodeData");
      onNodeSelect?.(nodeData);
    });
    renderer.on("clickStage", () => {
      onNodeSelect?.(null);
    });
    renderer.on("doubleClickNode", ({ node }) => {
      onNodeExpand?.(node);
    });
    renderer.on("rightClickNode", ({ node }) => {
      onNodeDelete?.(node);
    });
    sigmaRef.current = renderer;
    requestAnimationFrame(() => {
      const coords = [];
      graph.forEachNode((_, a) => coords.push({ x: a.x, y: a.y }));
      if (coords.length === 0) return;
      const xs = coords.map((c) => c.x);
      const ys = coords.map((c) => c.y);
      const gW = Math.max(...xs) - Math.min(...xs) + REGULAR_NODE_SIZE * 4;
      const gH = Math.max(...ys) - Math.min(...ys) + REGULAR_NODE_SIZE * 4;
      const normFactor = Math.max(gW, gH);
      const viewportH = containerRef.current?.clientHeight ?? 600;
      const TARGET_PX = 38;
      const ratio = REGULAR_NODE_SIZE * viewportH * 0.5 / (TARGET_PX * normFactor);
      renderer.getCamera().animate(
        { x: 0.5, y: 0.5, ratio: Math.min(1.5, Math.max(0.02, ratio)) },
        { duration: 300 }
      );
    });
    return () => {
      renderer.kill();
      sigmaRef.current = null;
    };
  }, [graph, customDrawNodeLabel, customDrawEdgeLabel]);
  (0, import_react3.useEffect)(() => {
    const renderer = sigmaRef.current;
    const g = graphRef.current;
    if (!renderer || !g) return;
    const { pathNodes, pathEdges } = pathInfo;
    const hasSelection = selectedAddress != null && pathNodes.size > 0;
    renderer.setSetting("nodeReducer", (node, data) => {
      const nodeData = g.getNodeAttribute(node, "nodeData");
      if (nodeData?.is_stopped) {
        const baseColor = isDarkRef.current ? "#4b5563" : "#9ca3af";
        const stoppedData = { ...data, color: baseColor };
        if (hasSelection && pathNodes.has(node)) return { ...stoppedData, highlighted: true };
        if (hasSelection && !pathNodes.has(node)) {
          return { ...stoppedData, color: colorsRef.current.dimNode, size: Math.max(0.1, data.size * 0.7) };
        }
        return stoppedData;
      }
      if (!hasSelection) return data;
      if (pathNodes.has(node)) return { ...data, highlighted: true };
      return { ...data, color: colorsRef.current.dimNode, size: Math.max(0.1, data.size * 0.7) };
    });
    renderer.setSetting("edgeReducer", (edge, data) => {
      try {
        const target = g.target(edge);
        const targetData = g.getNodeAttribute(target, "nodeData");
        if (targetData?.is_stopped) {
          const stoppedColor = isDarkRef.current ? "#4b5563" : "#9ca3af";
          if (hasSelection) {
            const source2 = g.source(edge);
            if (pathEdges.has(`${source2}->${target}`)) return { ...data, size: 0.03 };
            return { ...data, color: colorsRef.current.dimEdge, size: 5e-3 };
          }
          return { ...data, color: stoppedColor, size: 0.01 };
        }
        if (!hasSelection) return data;
        const source = g.source(edge);
        if (pathEdges.has(`${source}->${target}`)) return { ...data, size: 0.03 };
      } catch {
      }
      if (!hasSelection) return data;
      return { ...data, color: colorsRef.current.dimEdge, size: 5e-3 };
    });
    renderer.refresh();
  }, [selectedAddress, pathInfo]);
  (0, import_react3.useEffect)(() => {
    const renderer = sigmaRef.current;
    if (!renderer) return;
    renderer.setSetting("labelColor", { color: colors.label });
    renderer.setSetting("edgeLabelColor", { color: colors.label });
    renderer.setSetting("defaultEdgeColor", colors.edge);
    renderer.refresh();
  }, [colors]);
  const zoomIn = (0, import_react3.useCallback)(() => {
    const cam = sigmaRef.current?.getCamera();
    if (cam) cam.animate({ ratio: (cam.ratio || 1) * 0.7 }, { duration: 200 });
  }, []);
  const zoomOut = (0, import_react3.useCallback)(() => {
    const cam = sigmaRef.current?.getCamera();
    if (cam) cam.animate({ ratio: (cam.ratio || 1) * 1.4 }, { duration: 200 });
  }, []);
  const handleFitView = (0, import_react3.useCallback)(() => {
    const renderer = sigmaRef.current;
    const g = graphRef.current;
    if (!renderer || !g) return;
    const coords = [];
    g.forEachNode((_, a) => coords.push({ x: a.x, y: a.y }));
    if (coords.length === 0) return;
    const xs = coords.map((c) => c.x);
    const ys = coords.map((c) => c.y);
    const gW = Math.max(...xs) - Math.min(...xs) + REGULAR_NODE_SIZE * 4;
    const gH = Math.max(...ys) - Math.min(...ys) + REGULAR_NODE_SIZE * 4;
    const normFactor = Math.max(gW, gH);
    const viewportH = containerRef.current?.clientHeight ?? 600;
    const TARGET_PX = 38;
    const ratio = REGULAR_NODE_SIZE * viewportH * 0.5 / (TARGET_PX * normFactor);
    renderer.getCamera().animate(
      { x: 0.5, y: 0.5, ratio: Math.min(1.5, Math.max(0.02, ratio)) },
      { duration: 300 }
    );
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { position: "relative", width: "100%", height: "100%" }, children: [
    loading && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "div",
      {
        style: {
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          zIndex: 20
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.Loader2, { size: 36, style: { color: "#60a5fa", animation: "spin 1s linear infinite" } }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { color: "#94a3b8", fontSize: 13 }, children: "Exploring graph\u2026" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ref: containerRef, style: { width: "100%", height: "100%", background: colors.bg } }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "div",
      {
        style: {
          position: "absolute",
          bottom: 40,
          left: 10,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          zIndex: 10
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { title: "Zoom In", onClick: zoomIn, style: controlBtnStyle, children: "+" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { title: "Zoom Out", onClick: zoomOut, style: controlBtnStyle, children: "\u2212" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { title: "Fit View", onClick: handleFitView, style: controlBtnStyle, children: "\u22A1" })
        ]
      }
    ),
    (stats || nodes.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "div",
      {
        style: {
          position: "absolute",
          top: 10,
          right: 10,
          fontSize: 11,
          color: "var(--tx-body, #94a3b8)",
          background: "var(--tx-elevated, #1e293b)",
          border: "1px solid var(--tx-divider, rgba(51,65,85,0.5))",
          borderRadius: 6,
          padding: "4px 10px",
          zIndex: 10
        },
        children: stats ? `${stats.total_nodes} nodes \xB7 ${stats.total_edges} edges` : `${nodes.length} nodes \xB7 ${edges.length} edges`
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "div",
      {
        style: {
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 10,
          color: "var(--tx-caption, #64748b)",
          background: "var(--tx-elevated, #1e293b)",
          border: "1px solid var(--tx-divider, rgba(51,65,85,0.5))",
          borderRadius: 6,
          padding: "3px 10px",
          zIndex: 10,
          opacity: 0.7
        },
        children: "Click: select \xB7 Double-click: expand \xB7 Right-click: delete \xB7 Scroll: zoom"
      }
    )
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GraphExplorer,
  GraphExplorerSigma
});
//# sourceMappingURL=index.js.map