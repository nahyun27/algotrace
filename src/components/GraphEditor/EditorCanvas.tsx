import { useRef, useState, useCallback } from 'react';
import type { GraphNode, GraphEdge } from '../../types/graph';
import type { EditorMode } from './Toolbar';
import WeightPopup from './WeightPopup';
import { NODE_COLORS, EDGE_COLORS } from '../viz/palette';
import { useTr } from '../../i18n';

const VIEWBOX_W = 560;
const VIEWBOX_H = 420;
const NODE_R = 22;

interface EditorCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  mode: EditorMode;
  selectedNodeId: number | null;
  selectedEdgeId: string | null;
  pendingEdgeFrom: number | null;
  onAddNode: (x: number, y: number) => void;
  onMoveNode: (id: number, x: number, y: number) => void;
  onSelectNode: (id: number | null) => void;
  onSelectEdge: (id: string | null) => void;
  onStartEdge: (nodeId: number) => void;
  onFinishEdge: (nodeId: number) => void;
  onAddEdgeWithWeight: (weight: number) => void;
  onCancelEdge: () => void;
  onEditEdgeWeight: (edgeId: string, newWeight: number) => void;
}

interface PopupState {
  x: number;
  y: number;
  defaultValue: number;
  mode: 'create' | 'edit';
  edgeId?: string;
}

export default function EditorCanvas({
  nodes, edges, directed, mode,
  selectedNodeId, selectedEdgeId, pendingEdgeFrom,
  onAddNode, onMoveNode, onSelectNode, onSelectEdge,
  onStartEdge, onFinishEdge, onAddEdgeWithWeight, onCancelEdge, onEditEdgeWeight,
}: EditorCanvasProps) {
  const svgRef       = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef  = useRef<{ nodeId: number } | null>(null);
  const pendingEdgeToRef = useRef<number | null>(null);

  const tr = useTr();
  const [popup, setPopup] = useState<PopupState | null>(null);

  // ── coord helpers ────────────────────────────────────────────────────────
  const svgToContainer = useCallback((svgX: number, svgY: number) => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return { x: svgX, y: svgY };
    const ctm   = svg.getScreenCTM();
    const cRect = container.getBoundingClientRect();
    if (!ctm) return { x: svgX, y: svgY };
    const pt = svg.createSVGPoint();
    pt.x = svgX; pt.y = svgY;
    const screen = pt.matrixTransform(ctm);
    return { x: screen.x - cRect.left, y: screen.y - cRect.top };
  }, []);

  const clientToSVG = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }, []);

  // ── drag (inline handlers – no circular useCallback deps) ────────────────
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: number) => {
    if (mode !== 'SELECT') return;
    e.stopPropagation();
    e.preventDefault();
    draggingRef.current = { nodeId };

    const moveHandler = (ev: MouseEvent) => {
      if (!draggingRef.current) return;
      const { x, y } = clientToSVG(ev.clientX, ev.clientY);
      onMoveNode(
        draggingRef.current.nodeId,
        Math.max(NODE_R + 4, Math.min(VIEWBOX_W - NODE_R - 4, x)),
        Math.max(NODE_R + 4, Math.min(VIEWBOX_H - NODE_R - 4, y)),
      );
    };
    const upHandler = () => {
      draggingRef.current = null;
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
    };
    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
  }, [mode, clientToSVG, onMoveNode]);

  // ── canvas click (ADD_NODE) ──────────────────────────────────────────────
  const handleSVGClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (popup) return;
    if (mode !== 'ADD_NODE') return;
    const target = e.target as Element;
    if (target.closest('[data-node]') || target.closest('[data-edge]')) return;
    const { x, y } = clientToSVG(e.clientX, e.clientY);
    onAddNode(
      Math.max(NODE_R + 4, Math.min(VIEWBOX_W - NODE_R - 4, x)),
      Math.max(NODE_R + 4, Math.min(VIEWBOX_H - NODE_R - 4, y)),
    );
  }, [mode, popup, clientToSVG, onAddNode]);

  // ── node click ───────────────────────────────────────────────────────────
  const handleNodeClick = useCallback((e: React.MouseEvent, nodeId: number) => {
    e.stopPropagation();
    if (popup) return;
    if (mode === 'SELECT') {
      onSelectNode(nodeId);
      onSelectEdge(null);
    } else if (mode === 'ADD_EDGE') {
      if (pendingEdgeFrom === null) {
        onStartEdge(nodeId);
      } else if (pendingEdgeFrom !== nodeId) {
        const fromNode = nodes.find(n => n.id === pendingEdgeFrom);
        const toNode   = nodes.find(n => n.id === nodeId);
        if (fromNode && toNode) {
          pendingEdgeToRef.current = nodeId;
          onFinishEdge(nodeId);
          const midSVGX = (fromNode.x + toNode.x) / 2;
          const midSVGY = (fromNode.y + toNode.y) / 2;
          const { x, y } = svgToContainer(midSVGX, midSVGY);
          setPopup({ x, y, defaultValue: 1, mode: 'create' });
        }
      }
    }
  }, [mode, popup, pendingEdgeFrom, nodes, svgToContainer, onSelectNode, onSelectEdge, onStartEdge, onFinishEdge]);

  // ── edge interactions ─────────────────────────────────────────────────────
  const handleEdgeClick = useCallback((e: React.MouseEvent, edgeId: string) => {
    e.stopPropagation();
    if (popup || mode !== 'SELECT') return;
    onSelectEdge(edgeId);
    onSelectNode(null);
  }, [mode, popup, onSelectEdge, onSelectNode]);

  const handleEdgeDblClick = useCallback((e: React.MouseEvent, edge: GraphEdge) => {
    e.stopPropagation();
    if (mode !== 'SELECT') return;
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode   = nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return;
    const { x, y } = svgToContainer((fromNode.x + toNode.x) / 2, (fromNode.y + toNode.y) / 2);
    setPopup({ x, y, defaultValue: edge.weight, mode: 'edit', edgeId: edge.id });
  }, [mode, nodes, svgToContainer]);

  // ── popup callbacks ───────────────────────────────────────────────────────
  const handlePopupConfirm = useCallback((weight: number) => {
    if (!popup) return;
    if (popup.mode === 'create') onAddEdgeWithWeight(weight);
    else if (popup.mode === 'edit' && popup.edgeId) onEditEdgeWeight(popup.edgeId, weight);
    setPopup(null);
  }, [popup, onAddEdgeWithWeight, onEditEdgeWeight]);

  const handlePopupCancel = useCallback(() => {
    if (popup?.mode === 'create') onCancelEdge();
    setPopup(null);
  }, [popup, onCancelEdge]);

  // ── background click ──────────────────────────────────────────────────────
  const handleBgClick = useCallback(() => {
    if (mode === 'ADD_EDGE' && pendingEdgeFrom !== null && !popup) onCancelEdge();
    if (mode === 'SELECT') { onSelectNode(null); onSelectEdge(null); }
  }, [mode, pendingEdgeFrom, popup, onCancelEdge, onSelectNode, onSelectEdge]);

  // ── edge path ─────────────────────────────────────────────────────────────
  const getEdgePath = useCallback((edge: GraphEdge) => {
    const n1 = nodes.find(n => n.id === edge.from);
    const n2 = nodes.find(n => n.id === edge.to);
    if (!n1 || !n2) return { d: '', midX: 0, midY: 0 };
    if (n1.id === n2.id) {
      const lx = n1.x - NODE_R, ty = n1.y - NODE_R;
      return { d: `M ${lx},${n1.y} C ${lx-40},${ty-30} ${n1.x+40},${ty-30} ${n1.x + NODE_R},${n1.y}`, midX: n1.x, midY: n1.y - NODE_R - 20 };
    }
    const dx = n2.x - n1.x, dy = n2.y - n1.y;
    const len = Math.sqrt(dx*dx + dy*dy);
    const hasReverse = edges.some(e2 => e2.from === edge.to && e2.to === edge.from);
    const perp = hasReverse ? 24 : 0;
    const midX = (n1.x + n2.x) / 2 + (dy / len) * perp;
    const midY = (n1.y + n2.y) / 2 - (dx / len) * perp;
    const dr = len * (hasReverse ? 1.3 : 3);
    const d = hasReverse
      ? `M ${n1.x},${n1.y} A ${dr},${dr} 0 0,1 ${n2.x},${n2.y}`
      : `M ${n1.x},${n1.y} L ${n2.x},${n2.y}`;
    return { d, midX, midY };
  }, [nodes, edges]);

  const cursor = mode === 'ADD_NODE' ? 'crosshair' : mode === 'ADD_EDGE' ? 'cell' : 'default';

  return (
    <div ref={containerRef} className="viz-surface relative flex-1 w-full h-full overflow-hidden select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        className="w-full h-full"
        style={{ cursor }}
        onClick={handleSVGClick}
        onMouseDown={(e) => { if (e.target === svgRef.current) handleBgClick(); }}
      >
        <defs>
          <marker id="ge-arrow" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="10" refX="35" refY="5" orient="auto">
            <polygon points="0 0, 11 5, 0 10" style={{ fill: EDGE_COLORS.idle }} />
          </marker>
          <marker id="ge-arrow-sel" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="10" refX="35" refY="5" orient="auto">
            <polygon points="0 0, 11 5, 0 10" style={{ fill: EDGE_COLORS.current }} />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map(edge => {
          const isSelected = edge.id === selectedEdgeId;
          const { d, midX, midY } = getEdgePath(edge);
          const marker = directed ? (isSelected ? 'url(#ge-arrow-sel)' : 'url(#ge-arrow)') : undefined;
          return (
            <g key={edge.id} data-edge="1"
              onClick={(e) => handleEdgeClick(e, edge.id)}
              onDoubleClick={(e) => handleEdgeDblClick(e, edge)}
              style={{ cursor: mode === 'SELECT' ? 'pointer' : 'default' }}
            >
              <path d={d} fill="none" stroke="transparent" strokeWidth={14} />
              <path d={d} fill="none"
                strokeWidth={isSelected ? 3 : 1.75}
                strokeOpacity={isSelected ? 1 : 0.6}
                markerEnd={marker}
                style={{ stroke: isSelected ? EDGE_COLORS.current : EDGE_COLORS.idle }}
                className="transition-all duration-150"
              />
              <text x={midX} y={midY} textAnchor="middle" dy=".35em"
                fontSize={12} fontWeight={isSelected ? 800 : 600}
                className="font-mono pointer-events-none select-none"
                style={{ fill: isSelected ? EDGE_COLORS.current : 'var(--foreground)' }}
              >
                {edge.weight}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const isSelected = node.id === selectedNodeId;
          const isPending  = node.id === pendingEdgeFrom;
          const c = NODE_COLORS[isPending ? 'candidate' : isSelected ? 'current' : 'idle'];
          return (
            <g key={node.id} data-node="1"
              transform={`translate(${node.x},${node.y})`}
              style={{ cursor: mode === 'SELECT' ? 'grab' : mode === 'ADD_EDGE' ? 'pointer' : 'default' }}
              onClick={(e) => handleNodeClick(e, node.id)}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            >
              {(isSelected || isPending) && (
                <circle r={NODE_R + 8} style={{ fill: c.fill }} fillOpacity={0.18} />
              )}
              <circle r={NODE_R} strokeWidth={2.5} style={{ fill: c.fill, stroke: c.stroke }} />
              <text textAnchor="middle" dy=".35em" fontSize={14} fontWeight={800}
                style={{ fill: c.text, pointerEvents: 'none', userSelect: 'none' }}>
                {node.label}
              </text>
            </g>
          );
        })}

        {/* Empty state hint */}
        {nodes.length === 0 && (
          <text x={VIEWBOX_W / 2} y={VIEWBOX_H / 2} textAnchor="middle"
            fontSize={14} fontWeight={600} className="select-none pointer-events-none" style={{ fill: 'var(--hint)' }}>
            {mode === 'ADD_NODE'
              ? tr('캔버스를 클릭해 노드를 추가하세요', 'Click the canvas to add a node')
              : tr('먼저 \'노드 추가\' 모드에서 노드를 추가하세요', "Switch to 'Add node' mode to place nodes")}
          </text>
        )}

        {/* ADD_EDGE mode hint */}
        {mode === 'ADD_EDGE' && nodes.length > 0 && (
          <text x={VIEWBOX_W / 2} y={20} textAnchor="middle"
            fontSize={12} className="select-none pointer-events-none font-bold" style={{ fill: 'var(--primary)' }}>
            {pendingEdgeFrom === null
              ? tr('출발 노드를 클릭하세요', 'Click the start node')
              : tr('도착 노드를 클릭하세요 (다른 노드 선택)', 'Now click the target node')}
          </text>
        )}
      </svg>

      {/* Weight popup */}
      {popup && (
        <WeightPopup
          x={popup.x} y={popup.y}
          defaultValue={popup.defaultValue}
          onConfirm={handlePopupConfirm}
          onCancel={handlePopupCancel}
        />
      )}
    </div>
  );
}
