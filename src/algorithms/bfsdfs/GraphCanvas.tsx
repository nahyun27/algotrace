import type { BaseStep, BFSStep, DFSStep, DataItem } from './types';
import { BFS_DFS_DEFAULT_GRAPH } from './types';
import Legend from '../../components/viz/Legend';
import { NODE_COLORS, EDGE_COLORS, type VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';

interface BFSDFSGraphCanvasProps {
  step: BaseStep;
  mode: 'BFS' | 'DFS';
  /** Custom graph (from the editor); node ids must be 0..N-1 */
  customNodes?: { id: number; x: number; y: number }[];
  customEdges?: [number, number, number][];
}

const R = 22;
const PAD = 48;

const DEFAULT_NODES = BFS_DFS_DEFAULT_GRAPH.nodes.map(n => ({ id: n.id, x: n.x, y: n.y }));
const DEFAULT_EDGES: [number, number][] = BFS_DFS_DEFAULT_GRAPH.edges.map(e => [e.from, e.to]);

const sameEdge = (a: [number, number] | null | undefined, u: number, v: number) =>
  !!a && ((a[0] === u && a[1] === v) || (a[0] === v && a[1] === u));

export default function BFSDFSGraphCanvas({ step, mode, customNodes, customEdges }: BFSDFSGraphCanvasProps) {
  const tr = useTr();
  const nodes = customNodes ?? DEFAULT_NODES;
  const edges: [number, number][] = customEdges ? customEdges.map(([u, v]) => [u, v]) : DEFAULT_EDGES;

  const scheduled: DataItem[] =
    mode === 'BFS' && 'queue' in step ? (step as BFSStep).queue
    : mode === 'DFS' && 'stack' in step ? (step as DFSStep).stack
    : [];

  // Fit the viewBox to the nodes so default and custom layouts both fill the canvas
  const xs = nodes.length ? nodes.map(n => n.x) : [0];
  const ys = nodes.length ? nodes.map(n => n.y) : [0];
  const vbX = Math.min(...xs) - PAD;
  const vbY = Math.min(...ys) - PAD;
  const vbW = Math.max(...xs) + PAD - vbX;
  const vbH = Math.max(...ys) + PAD - vbY;

  const nodeById = new Map(nodes.map(n => [n.id, n]));

  return (
    <div className="viz-surface w-full min-h-[320px] h-full flex flex-col items-center justify-center gap-3 p-4">
      <svg
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        className="w-full max-w-[560px] overflow-visible"
        style={{ height: 'auto', maxHeight: 380 }}
      >
        {/* Edges */}
        {edges.map(([u, v], idx) => {
          const a = nodeById.get(u), b = nodeById.get(v);
          if (!a || !b) return null;
          const dx = b.x - a.x, dy = b.y - a.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const x1 = a.x + (dx / len) * R, y1 = a.y + (dy / len) * R;
          const x2 = b.x - (dx / len) * R, y2 = b.y - (dy / len) * R;

          const isActive = sameEdge(step.activeEdge, u, v);
          const isTree = step.treeEdges.some(te => sameEdge(te, u, v));
          const state: VizState = isActive ? 'candidate' : isTree ? 'visited' : 'idle';
          const emphasized = state !== 'idle';

          return (
            <line
              key={`edge-${idx}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              strokeWidth={emphasized ? 3.5 : 2}
              strokeOpacity={emphasized ? 1 : 0.6}
              strokeDasharray={isActive ? '6,5' : undefined}
              strokeLinecap="round"
              style={{ stroke: EDGE_COLORS[state] }}
              className="transition-all duration-300"
            >
              {isActive && (
                <animate attributeName="stroke-dashoffset" values="11;0" dur="0.5s" repeatCount="indefinite" />
              )}
            </line>
          );
        })}

        {/* Nodes */}
        {nodes.map(n => {
          const isCurrent = step.currentNode === n.id;
          const isNeighbor = step.neighborNode === n.id;
          const isFinal = step.visitedNodes.includes(n.id);
          const isScheduled = scheduled.some(item => item.value === n.id);
          const isSeen = step.visitedSet.includes(n.id);

          const state: VizState = isCurrent ? 'current'
            : isFinal ? 'visited'
            : isScheduled ? 'candidate'
            : isSeen ? 'visited'
            : 'idle';
          const c = NODE_COLORS[state];

          const visitIndex = step.visitedNodes.indexOf(n.id);
          const orderNum = visitIndex !== -1 ? visitIndex + 1 : null;
          const r = isCurrent ? R + 2 : R;

          return (
            <g key={n.id} transform={`translate(${n.x},${n.y})`} className="transition-all duration-300">
              {(isCurrent || isNeighbor) && (
                <circle r={r + 8} style={{ fill: isCurrent ? c.fill : EDGE_COLORS.candidate }} fillOpacity={0.18} />
              )}
              <circle r={r} strokeWidth={2.5} style={{ fill: c.fill, stroke: c.stroke }} />
              <text textAnchor="middle" dy=".35em" fontSize={16} fontWeight={800} style={{ fill: c.text, pointerEvents: 'none' }}>
                {n.id}
              </text>
              {orderNum !== null && (
                <g transform={`translate(${R * 0.78},${-R * 0.78})`}>
                  <circle r={10} strokeWidth={2} style={{ fill: NODE_COLORS.path.fill, stroke: 'var(--card)' }} />
                  <text textAnchor="middle" dy=".35em" fontSize={11} fontWeight={800} style={{ fill: NODE_COLORS.path.text, pointerEvents: 'none' }}>
                    {orderNum}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <Legend
        items={[
          { state: 'current', label: tr('현재 처리 노드', 'Processing') },
          { state: 'candidate', label: mode === 'BFS' ? tr('큐에서 대기', 'Waiting in queue') : tr('스택에서 대기', 'Waiting on stack') },
          { state: 'visited', label: tr('방문 완료', 'Visited') },
          { state: 'idle', label: tr('미방문', 'Unvisited') },
          { state: 'visited', label: tr('트리 간선', 'Tree edge'), kind: 'edge' },
          { state: 'path', label: tr('방문 순서', 'Visit order') },
        ]}
      />
    </div>
  );
}
