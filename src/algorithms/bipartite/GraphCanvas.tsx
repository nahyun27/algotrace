import type { BipartiteStep } from './types';
import Legend from '../../components/viz/Legend';
import { NODE_COLORS, EDGE_COLORS, type VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';

interface BipartiteGraphCanvasProps {
  step: BipartiteStep;
  nodes: { id: number; x: number; y: number }[];
  edges: [number, number][];
}

const R = 22;
const PAD = 48;

const sameEdge = (a: [number, number] | null | undefined, u: number, v: number) =>
  !!a && ((a[0] === u && a[1] === v) || (a[0] === v && a[1] === u));

/** Group A = path (violet), group B = visited (green), uncolored = idle. */
const GROUP_STATE: Record<number, VizState> = { [-1]: 'idle', 0: 'path', 1: 'visited' };

export default function BipartiteGraphCanvas({ step, nodes, edges }: BipartiteGraphCanvasProps) {
  const tr = useTr();

  const xs = nodes.length ? nodes.map(n => n.x) : [0];
  const ys = nodes.length ? nodes.map(n => n.y) : [0];
  const vbX = Math.min(...xs) - PAD;
  const vbY = Math.min(...ys) - PAD;
  const vbW = Math.max(...xs) + PAD - vbX;
  const vbH = Math.max(...ys) + PAD - vbY;
  const nodeById = new Map(nodes.map(n => [n.id, n]));

  const conflictNodes: number[] = step.conflictEdge ?? [];
  const selfLoopNode = step.conflictEdge && step.conflictEdge[0] === step.conflictEdge[1] ? step.conflictEdge[0] : null;

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
          if (!a || !b || u === v) return null;
          const dx = b.x - a.x, dy = b.y - a.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const x1 = a.x + (dx / len) * R, y1 = a.y + (dy / len) * R;
          const x2 = b.x - (dx / len) * R, y2 = b.y - (dy / len) * R;

          const isConflict = sameEdge(step.conflictEdge, u, v);
          const isActive = !isConflict && sameEdge(step.activeEdge, u, v);
          const bothColored = step.color[u] !== -1 && step.color[v] !== -1;
          const state: VizState = isConflict ? 'danger' : isActive ? 'candidate' : 'idle';
          const emphasized = state !== 'idle';

          return (
            <line
              key={`edge-${idx}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              strokeWidth={emphasized ? 4 : bothColored ? 2.5 : 2}
              strokeOpacity={emphasized ? 1 : bothColored ? 0.9 : 0.5}
              strokeDasharray={isActive ? '6,5' : undefined}
              strokeLinecap="round"
              style={{ stroke: EDGE_COLORS[state] }}
              className="transition-all duration-300"
            >
              {isActive && <animate attributeName="stroke-dashoffset" values="11;0" dur="0.5s" repeatCount="indefinite" />}
            </line>
          );
        })}

        {/* Self-loop drawn as a small circle above the node */}
        {edges.filter(([u, v]) => u === v).map(([u], idx) => {
          const a = nodeById.get(u);
          if (!a) return null;
          const state: VizState = selfLoopNode === u ? 'danger' : 'idle';
          return (
            <circle
              key={`loop-${idx}`}
              cx={a.x} cy={a.y - R - 10} r={12}
              fill="none"
              strokeWidth={state === 'danger' ? 4 : 2}
              style={{ stroke: EDGE_COLORS[state] }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(n => {
          const isCurrent = step.currentNode === n.id;
          const isNeighbor = step.neighborNode === n.id && !isCurrent;
          const isConflict = conflictNodes.includes(n.id);
          const group = step.color[n.id] ?? -1;
          const state: VizState = isConflict ? 'danger' : GROUP_STATE[group];
          const c = NODE_COLORS[state];

          return (
            <g key={n.id} transform={`translate(${n.x},${n.y})`} className="transition-all duration-300">
              {isCurrent && (
                <circle r={R + 7} fill="none" strokeWidth={4} style={{ stroke: EDGE_COLORS.current }} strokeOpacity={0.85} />
              )}
              {isNeighbor && !isConflict && (
                <circle r={R + 7} strokeWidth={0} style={{ fill: EDGE_COLORS.candidate }} fillOpacity={0.2} />
              )}
              <circle r={R} strokeWidth={2.5} style={{ fill: c.fill, stroke: c.stroke }} />
              <text textAnchor="middle" dy=".35em" fontSize={16} fontWeight={800} style={{ fill: c.text, pointerEvents: 'none' }}>
                {n.id}
              </text>
              {group !== -1 && (
                <g transform={`translate(${R * 0.8},${R * 0.8})`}>
                  <circle r={9} strokeWidth={2} style={{ fill: 'var(--card)', stroke: NODE_COLORS[GROUP_STATE[group]].stroke }} />
                  <text textAnchor="middle" dy=".35em" fontSize={11} fontWeight={800} style={{ fill: 'var(--foreground)', pointerEvents: 'none' }}>
                    {group === 0 ? 'A' : 'B'}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <Legend
        items={[
          { state: 'path', label: tr('그룹 A', 'Group A') },
          { state: 'visited', label: tr('그룹 B', 'Group B') },
          { state: 'idle', label: tr('미색칠', 'Uncolored') },
          { state: 'current', label: tr('꺼낸 노드 (파란 테두리)', 'Dequeued node (blue ring)') },
          { state: 'candidate', label: tr('검사 중인 간선', 'Edge being checked'), kind: 'edge' },
          { state: 'danger', label: tr('충돌 (같은 색)', 'Conflict (same color)') },
        ]}
      />
    </div>
  );
}
