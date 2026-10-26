import type { KahnStep, DFSTopoStep, TopoNode } from './types';
import Legend from '../../components/viz/Legend';
import { NODE_COLORS, EDGE_COLORS, type VizState } from '../../components/viz/palette';
import { toneVar } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface Props {
  step: KahnStep | DFSTopoStep;
  mode: 'Kahn' | 'DFS';
  nodes: TopoNode[];
  edges: [number, number][];
}

const SVG_W = 660;
const SVG_H = 380;
const R = 28;

function kahnNodeState(id: number, step: KahnStep): VizState {
  if (step.result.includes(id)) return step.type === 'DONE' ? 'path' : 'visited';
  if (id === step.currentNode) return 'current';
  if (step.queue.includes(id)) return 'candidate';
  if (step.hasCycle) return 'danger';
  return 'idle';
}

function dfsNodeState(id: number, step: DFSTopoStep): VizState {
  if (step.result.includes(id)) return 'path';
  if (step.finished[id]) return 'visited';
  if (step.hasCycle && step.inStack[id]) return 'danger';
  if (id === step.currentNode && step.inStack[id]) return 'current';
  if (step.inStack[id] || step.visited[id]) return 'candidate';
  if (step.hasCycle) return 'danger';
  return 'idle';
}

const MARKER_STATES: VizState[] = ['idle', 'candidate', 'danger'];

export default function TopoGraphCanvas({ step, mode, nodes, edges }: Props) {
  const tr = useTr();

  return (
    <div className="viz-surface w-full min-h-[320px] h-full flex flex-col items-center justify-center gap-3 p-4">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full max-w-[660px] overflow-visible" style={{ height: 'auto' }}>
        <defs>
          {MARKER_STATES.map(s => (
            <marker key={s} id={`topo-arrow-${s}`} markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="10" refX="9" refY="5" orient="auto">
              <path d="M0,0 L0,10 L11,5 z" style={{ fill: EDGE_COLORS[s] }} />
            </marker>
          ))}
        </defs>

        {/* Edges */}
        {edges.map(([fromId, toId], idx) => {
          const from = nodes[fromId];
          const to = nodes[toId];
          if (!from || !to) return null;

          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len === 0) return null;
          const nx = dx / len;
          const ny = dy / len;

          const x1 = from.x + nx * R;
          const y1 = from.y + ny * R;
          const x2 = to.x - nx * (R + 6); // 6 = arrowhead offset
          const y2 = to.y - ny * (R + 6);

          const isActive = step.activeEdge?.[0] === fromId && step.activeEdge?.[1] === toId;
          const isCycleEdge = step.hasCycle && isActive;
          const state: VizState = isCycleEdge ? 'danger' : isActive ? 'candidate' : 'idle';
          const emphasized = state !== 'idle';

          // Slight curve for back-edges found by DFS
          const isBack = mode === 'DFS' && isCycleEdge;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;

          const common = {
            fill: 'none',
            strokeWidth: emphasized ? 3 : 1.5,
            strokeOpacity: emphasized ? 1 : 0.6,
            markerEnd: `url(#topo-arrow-${state})`,
            style: { stroke: EDGE_COLORS[state] },
            className: 'transition-all duration-300',
          };

          return isBack ? (
            <path key={idx} d={`M${x1},${y1} Q${mx - ny * 40},${my + nx * 40} ${x2},${y2}`} {...common} />
          ) : (
            <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} {...common} />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const state = mode === 'Kahn'
            ? kahnNodeState(node.id, step as KahnStep)
            : dfsNodeState(node.id, step as DFSTopoStep);
          const c = NODE_COLORS[state];

          const kahnStep = step as KahnStep;
          const showInDeg = mode === 'Kahn' && kahnStep.inDegree !== undefined;
          const inDeg = showInDeg ? kahnStep.inDegree[node.id] : null;
          const isDecreased = mode === 'Kahn' && kahnStep.decreasedNode === node.id;

          const dfsStep = step as DFSTopoStep;
          const stackPos = mode === 'DFS' ? dfsStep.stack.indexOf(node.id) : -1;

          const bx = node.x + R * 0.7;
          const by = node.y - R * 0.7;
          const badgeFill = isDecreased ? toneVar.candidate : inDeg === 0 ? toneVar.visited : toneVar.neutral;

          return (
            <g key={node.id} className="transition-all duration-300">
              {state === 'current' && (
                <circle cx={node.x} cy={node.y} r={R + 8} style={{ fill: c.fill }} fillOpacity={0.18} />
              )}
              <circle
                cx={node.x} cy={node.y} r={R}
                strokeWidth={2.5}
                style={{ fill: c.fill, stroke: c.stroke }}
                className="transition-all duration-300"
              />
              <text
                x={node.x} y={node.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={11} fontWeight={700}
                style={{ fill: c.text, pointerEvents: 'none' }}
              >
                {node.label}
              </text>

              {/* In-degree badge (Kahn only) */}
              {showInDeg && inDeg !== null && (
                <>
                  <circle cx={bx} cy={by} r={10} strokeWidth={2} style={{ fill: badgeFill, stroke: 'var(--card)' }} className="transition-all duration-300" />
                  <text x={bx} y={by} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold"
                    style={{ fill: isDecreased ? NODE_COLORS.candidate.text : NODE_COLORS.current.text }}>
                    {inDeg}
                  </text>
                </>
              )}

              {/* DFS stack position badge */}
              {stackPos >= 0 && (
                <>
                  <circle cx={bx} cy={by} r={10} strokeWidth={2} style={{ fill: toneVar.visited, stroke: 'var(--card)' }} />
                  <text x={bx} y={by} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold"
                    style={{ fill: NODE_COLORS.current.text }}>
                    {dfsStep.stack.length - stackPos}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      <Legend
        items={mode === 'Kahn' ? [
          { state: 'current', label: tr('처리 중', 'Processing') },
          { state: 'candidate', label: tr('큐 대기 (진입차수 0)', 'In queue (in-degree 0)') },
          { state: 'visited', label: tr('처리 완료', 'Processed') },
          { state: 'path', label: tr('최종 순서', 'Final order') },
          { state: 'danger', label: tr('사이클', 'Cycle') },
        ] : [
          { state: 'current', label: tr('방문 중', 'Visiting') },
          { state: 'candidate', label: tr('재귀 스택 안', 'On recursion stack') },
          { state: 'visited', label: tr('완료 (스택 push)', 'Finished (pushed)') },
          { state: 'path', label: tr('최종 순서', 'Final order') },
          { state: 'danger', label: tr('사이클', 'Cycle') },
        ]}
      />
    </div>
  );
}
