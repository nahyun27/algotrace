import type { BellmanFordStep } from './types';
import { INF } from './types';
import Legend from '../../components/viz/Legend';
import { NODE_COLORS, EDGE_COLORS, type VizState } from '../../components/viz/palette';
import { toneVar } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface Props {
  step: BellmanFordStep;
  nodes: { id: number; x: number; y: number }[];
  edges: [number, number, number][];
}

const MARKER_STATES: VizState[] = ['idle', 'candidate', 'visited', 'danger'];

export default function BFGraphCanvas({ step, nodes, edges }: Props) {
  const tr = useTr();
  const { currentNode, neighborNode, activeEdge, dist, negativeCycleEdges } = step;
  const isNegCycle = step.type === 'NEGATIVE_CYCLE';
  const isDone = step.type === 'DONE';
  const cycleNodes = new Set(isNegCycle ? negativeCycleEdges.flat() : []);

  return (
    <div className="viz-surface w-full min-h-[380px] h-full flex flex-col relative p-4 items-center justify-center gap-3">
      <svg viewBox="0 0 480 380" className="overflow-visible w-full max-w-[480px]" style={{ height: 'auto' }}>
        <defs>
          {MARKER_STATES.map(s => (
            <marker key={s} id={`bf-arrow-${s}`} markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="10" refX="35" refY="5" orient="auto">
              <polygon points="0 0, 11 5, 0 10" style={{ fill: EDGE_COLORS[s] }} />
            </marker>
          ))}
        </defs>

        {/* Edges */}
        {edges.map(([u, v, w]) => {
          const isActive = !!activeEdge && activeEdge[0] === u && activeEdge[1] === v;
          const isNegEdge = w < 0;
          const isImproved = isActive && step.isImprovement;
          const isNegCycleEdge = isNegCycle && negativeCycleEdges.some(([a, b]) => a === u && b === v);
          const n1 = nodes[u], n2 = nodes[v];
          if (!n1 || !n2) return null;
          const dx = n2.x - n1.x, dy = n2.y - n1.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const dr = len * 1.3;
          const perp = 28;
          const midX = (n1.x + n2.x) / 2 + (dy / len) * perp;
          const midY = (n1.y + n2.y) / 2 - (dx / len) * perp;

          let state: VizState = 'idle';
          let strokeW = 1.5;
          let opacity = 0.45;
          let strokeDash = 'none';

          if (isNegCycleEdge) {
            state = 'danger'; strokeW = 3; opacity = 1; strokeDash = '6,4';
          } else if (isImproved) {
            state = 'visited'; strokeW = 3; opacity = 1;
          } else if (isActive) {
            state = 'candidate'; strokeW = 3; opacity = 1;
          } else if (isNegEdge) {
            state = 'danger'; opacity = 0.55;
          }
          const emphasized = isNegCycleEdge || isActive;

          return (
            <g key={`${u}-${v}`}>
              <path
                d={`M ${n1.x},${n1.y} A ${dr},${dr} 0 0,1 ${n2.x},${n2.y}`}
                fill="none" strokeWidth={strokeW} strokeOpacity={opacity}
                strokeDasharray={strokeDash}
                style={{ stroke: EDGE_COLORS[state] }}
                className="transition-all duration-300" markerEnd={`url(#bf-arrow-${state})`}
              />
              <text x={midX} y={midY} textAnchor="middle" dy=".35em"
                fontSize={isActive ? 13 : 12} fontWeight={emphasized || isNegEdge ? 700 : 500}
                style={{ fill: state === 'idle' ? 'var(--muted-foreground)' : EDGE_COLORS[state] }}
                className="font-mono transition-all duration-300"
              >{w}</text>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(nd => {
          const isCurrent = nd.id === currentNode;
          const isNeighbor = nd.id === neighborNode;
          const state: VizState = isCurrent ? 'current'
            : isNeighbor ? 'candidate'
            : cycleNodes.has(nd.id) ? 'danger'
            : isDone && dist[nd.id] < INF ? 'visited'
            : 'idle';
          const c = NODE_COLORS[state];
          const r = isCurrent || isNeighbor ? 24 : 22;
          const dVal = dist[nd.id];
          const dLabel = dVal >= INF ? '∞' : String(dVal);
          const labelColor = isCurrent ? toneVar.current : isNeighbor ? toneVar.candidate : 'var(--muted-foreground)';

          return (
            <g key={nd.id} transform={`translate(${nd.x},${nd.y})`} className="transition-all duration-300">
              {(isCurrent || isNeighbor) && (
                <circle r={r + 8} style={{ fill: c.fill }} fillOpacity={0.18} />
              )}
              <circle r={r} strokeWidth={2.5} style={{ fill: c.fill, stroke: c.stroke }} />
              <text textAnchor="middle" dy=".35em" fontSize={15} fontWeight={800}
                style={{ fill: c.text, pointerEvents: 'none' }}>{nd.id}</text>
              {/* dist label below node */}
              <text textAnchor="middle" dy={r + 16} fontSize={12} fontWeight={700}
                style={{ fill: labelColor }} className="font-mono">
                {dLabel}
              </text>
            </g>
          );
        })}
      </svg>

      <Legend
        items={[
          { state: 'current',   label: tr('처리 중 (u)', 'Processing (u)') },
          { state: 'candidate', label: tr('완화 대상 (v)', 'Relaxing (v)') },
          { state: 'visited',   label: tr('최단 거리 확정', 'Final distance') },
          { state: 'idle',      label: tr('미처리', 'Untouched') },
          { state: 'visited',   label: tr('완화 성공', 'Improved'), kind: 'edge' },
          { state: 'danger',    label: tr('음수 간선 / 음수 사이클', 'Negative edge / cycle'), kind: 'edge' },
        ]}
      />
    </div>
  );
}
