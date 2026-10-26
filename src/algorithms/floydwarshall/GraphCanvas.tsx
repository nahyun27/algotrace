import type { FloydWarshallStep } from './types';
import { INF, FW_NODES, FW_EDGES } from './types';
import Legend from '../../components/viz/Legend';
import { NODE_COLORS, EDGE_COLORS, type VizState } from '../../components/viz/palette';
import { toneVar } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface Props {
  step: FloydWarshallStep;
  pathNodes?: number[];  // for path reconstruction highlight
}

const MARKER_STATES: VizState[] = ['idle', 'candidate', 'visited', 'path'];

export default function FWGraphCanvas({ step, pathNodes = [] }: Props) {
  const tr = useTr();
  const { currentK, currentI, currentJ, isUpdate, type } = step;
  const nodes = FW_NODES;
  const edges = FW_EDGES;
  const isDone = type === 'DONE';
  const isNegCycle = type === 'NEGATIVE_CYCLE';
  // i→k and k→j legs: being considered (candidate), or accepted when the update succeeds
  const legState: VizState = isUpdate ? 'visited' : 'candidate';

  // Check if an edge (u→v) is on the pathNodes path
  const isOnPath = (u: number, v: number): boolean => {
    if (pathNodes.length < 2) return false;
    for (let idx = 0; idx < pathNodes.length - 1; idx++) {
      if (pathNodes[idx] === u && pathNodes[idx + 1] === v) return true;
    }
    return false;
  };

  // Determine edge role in current step
  const getEdgeRole = (u: number, v: number) => {
    if (pathNodes.length >= 2 && isOnPath(u, v)) return 'path';
    if (currentI !== null && currentK !== null && u === currentI && v === currentK) return 'ik';
    if (currentK !== null && currentJ !== null && u === currentK && v === currentJ) return 'kj';
    if (currentI !== null && currentJ !== null && u === currentI && v === currentJ) return 'ij';
    return 'normal';
  };

  // Determine node state
  const getNodeState = (id: number): VizState => {
    if (pathNodes.length >= 2 && pathNodes.includes(id)) return 'path';
    if (isDone) return 'visited';
    if (isNegCycle) return 'danger';
    if (id === currentK) return 'current';
    if (id === currentI || id === currentJ) return legState;
    return 'idle';
  };

  // Dashed virtual arc for i→k / k→j when there is no direct edge
  const virtualArc = (from: number | null, to: number | null, key: string) => {
    if (from === null || to === null || from === to) return null;
    if (edges.some(([u, v]) => u === from && v === to)) return null;
    const n1 = nodes[from], n2 = nodes[to];
    const dx = n2.x - n1.x, dy = n2.y - n1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const dr = len * 1.2;
    return (
      <path
        key={key}
        d={`M ${n1.x},${n1.y} A ${dr},${dr} 0 0,0 ${n2.x},${n2.y}`}
        fill="none"
        strokeWidth={2} strokeOpacity={0.6}
        strokeDasharray="6,4"
        style={{ stroke: EDGE_COLORS[legState] }}
        markerEnd={`url(#fw-arrow-${legState})`}
        className="transition-all duration-300"
      />
    );
  };

  return (
    <div className="viz-surface w-full min-h-[340px] h-full flex flex-col relative p-4 items-center justify-center gap-3">
      <svg viewBox="0 0 480 380" className="overflow-visible w-full max-w-[480px]" style={{ height: 'auto' }}>
        <defs>
          {MARKER_STATES.map(s => (
            <marker key={s} id={`fw-arrow-${s}`} markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="10" refX="35" refY="5" orient="auto">
              <polygon points="0 0, 11 5, 0 10" style={{ fill: EDGE_COLORS[s] }} />
            </marker>
          ))}
        </defs>

        {/* Edges */}
        {edges.map(([u, v, w]) => {
          const role = getEdgeRole(u, v);
          const n1 = nodes[u], n2 = nodes[v];
          if (!n1 || !n2) return null;
          const dx = n2.x - n1.x, dy = n2.y - n1.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const dr = len * 1.3;
          const perp = 26;
          const midX = (n1.x + n2.x) / 2 + (dy / len) * perp;
          const midY = (n1.y + n2.y) / 2 - (dx / len) * perp;

          let state: VizState = 'idle';
          let strokeW = 1.5;
          let opacity = 0.45;
          let strokeDash = 'none';

          if (role === 'path') {
            state = 'path'; strokeW = 3.5; opacity = 1;
          } else if (role === 'ij') {
            opacity = 0.8; strokeDash = '6,4';
          } else if (role === 'ik' || role === 'kj') {
            state = legState; strokeW = 3; opacity = 1;
          }
          const emphasized = state !== 'idle';

          return (
            <g key={`${u}-${v}`}>
              <path
                d={`M ${n1.x},${n1.y} A ${dr},${dr} 0 0,1 ${n2.x},${n2.y}`}
                fill="none" strokeWidth={strokeW} strokeOpacity={opacity}
                strokeDasharray={strokeDash}
                style={{ stroke: EDGE_COLORS[state] }}
                className="transition-all duration-300" markerEnd={`url(#fw-arrow-${state})`}
              />
              <text x={midX} y={midY} textAnchor="middle" dy=".35em"
                fontSize={role !== 'normal' ? 13 : 12}
                fontWeight={role !== 'normal' ? 700 : 500}
                style={{ fill: emphasized ? EDGE_COLORS[state] : 'var(--muted-foreground)' }}
                className="font-mono transition-all duration-300"
              >{w}</text>
            </g>
          );
        })}

        {virtualArc(currentI, currentK, 'v-ik')}
        {virtualArc(currentK, currentJ, 'v-kj')}

        {/* Nodes */}
        {nodes.map(nd => {
          const state = getNodeState(nd.id);
          const c = NODE_COLORS[state];
          const highlight = state !== 'idle' && state !== 'visited';
          const r = state !== 'idle' ? 24 : 22;
          const distVals = step.distMatrix;
          const roleLabel = nd.id === currentK ? 'k' : nd.id === currentI ? 'i' : nd.id === currentJ ? 'j' : null;
          const roleColor = nd.id === currentK ? toneVar.current : EDGE_COLORS[legState];

          return (
            <g key={nd.id} transform={`translate(${nd.x},${nd.y})`} className="transition-all duration-300">
              {highlight && (
                <circle r={r + 8} style={{ fill: c.fill }} fillOpacity={0.18} />
              )}
              <circle r={r} strokeWidth={2.5} style={{ fill: c.fill, stroke: c.stroke }} />
              <text textAnchor="middle" dy=".35em" fontSize={15} fontWeight={800}
                style={{ fill: c.text, pointerEvents: 'none' }}>{nd.id}</text>
              {/* Label: role indicator */}
              {roleLabel && (
                <text textAnchor="middle" dy={-(r + 10)} fontSize={12} fontWeight={800}
                  style={{ fill: roleColor }} className="font-mono">{roleLabel}</text>
              )}
              {/* dist[i][i] value on diagonal below node once done */}
              {isDone && (
                <text textAnchor="middle" dy={r + 16} fontSize={11} fontWeight={600}
                  style={{ fill: toneVar.visited }} className="font-mono">
                  {distVals[nd.id]?.[nd.id] >= INF ? '∞' : distVals[nd.id]?.[nd.id]}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <Legend
        items={[
          { state: 'current',   label: tr('경유 노드 (k)', 'Intermediate (k)') },
          { state: 'candidate', label: tr('비교 중인 쌍 (i, j)', 'Pair being compared (i, j)') },
          { state: 'visited',   label: tr('경로 갱신됨', 'Path improved') },
          { state: 'path',      label: tr('복원한 최단 경로', 'Reconstructed path') },
        ]}
      />
    </div>
  );
}
