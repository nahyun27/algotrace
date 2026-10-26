import { W as DEFAULT_W } from './shared';
import Legend from '../../components/viz/Legend';
import { NODE_COLORS, EDGE_COLORS, type VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';

interface GraphCanvasProps {
  currentMask: number;
  currentCity: number;
  nextCity: number | null;
  activeEdge: [number, number] | null;
  /** Final step: the active edge closes the optimal tour */
  isFinal?: boolean;
  // custom graph support
  customNodes?: { id: number; x: number; y: number }[];
  customW?: number[][];
}

const DEFAULT_NODES = [
  { id: 0, x: 240, y: 60  },
  { id: 1, x: 400, y: 190 },
  { id: 2, x: 240, y: 320 },
  { id: 3, x: 80,  y: 190 },
];

const MARKER_STATES: VizState[] = ['idle', 'candidate', 'path'];

export default function GraphCanvas({ currentMask, currentCity, nextCity, activeEdge, isFinal, customNodes, customW }: GraphCanvasProps) {
  const tr = useTr();
  const W = customW ?? DEFAULT_W;
  const N = W.length;
  const nodes = customNodes ?? DEFAULT_NODES.slice(0, N);

  return (
    <div className="viz-surface w-full min-h-[280px] sm:min-h-[400px] h-full flex flex-col relative p-3 sm:p-4 items-center justify-center gap-3">
      <svg
        viewBox="0 0 480 380"
        className="overflow-visible w-full max-w-[480px]"
        style={{ height: 'auto' }}
      >
        <defs>
          {MARKER_STATES.map(s => (
            <marker key={s} id={`tsp-arrow-${s}`} markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="10" refX="35" refY="5" orient="auto">
              <polygon points="0 0, 11 5, 0 10" style={{ fill: EDGE_COLORS[s] }} />
            </marker>
          ))}
        </defs>

        {/* Edges */}
        {W.map((row, u) =>
          row.map((weight, v) => {
            if (weight === 0) return null;

            const isActive = !!activeEdge && activeEdge[0] === u && activeEdge[1] === v;
            const n1 = nodes[u];
            const n2 = nodes[v];

            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            // Curve: slightly larger sweep for clarity
            const dr = len * 1.4;

            // Label sits offset perpendicular to the midpoint, 28px away
            const perp = 28;
            const midX = (n1.x + n2.x) / 2 + (dy / len) * perp;
            const midY = (n1.y + n2.y) / 2 - (dx / len) * perp;

            const state: VizState = isActive ? (isFinal ? 'path' : 'candidate') : 'idle';

            return (
              <g key={`${u}-${v}`}>
                <path
                  d={`M ${n1.x},${n1.y} A ${dr},${dr} 0 0,1 ${n2.x},${n2.y}`}
                  fill="none"
                  strokeWidth={isActive ? 3 : 1.5}
                  strokeOpacity={isActive ? 1 : 0.45}
                  style={{ stroke: EDGE_COLORS[state] }}
                  className="transition-all duration-300"
                  markerEnd={`url(#tsp-arrow-${state})`}
                />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dy=".35em"
                  fontSize={isActive ? 13 : 12}
                  fontWeight={isActive ? 700 : 500}
                  style={{ fill: isActive ? EDGE_COLORS[state] : 'var(--muted-foreground)' }}
                  className="font-mono transition-all duration-300"
                >
                  {weight}
                </text>
              </g>
            );
          })
        )}

        {/* Nodes */}
        {nodes.map(n => {
          const isCurrent = n.id === currentCity;
          const isNext    = n.id === nextCity;
          const isVisited = (currentMask & (1 << n.id)) !== 0 && !isCurrent;
          const state: VizState = isCurrent ? 'current' : isNext ? 'candidate' : isVisited ? 'visited' : 'idle';
          const c = NODE_COLORS[state];
          const r = isCurrent || isNext ? 24 : 22;

          return (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`} className="transition-all duration-300">
              {(isCurrent || isNext) && (
                <circle r={r + 8} style={{ fill: c.fill }} fillOpacity={0.18} />
              )}
              <circle r={r} strokeWidth={2.5} style={{ fill: c.fill, stroke: c.stroke }} />
              <text textAnchor="middle" dy=".35em" fontSize={15} fontWeight={800} style={{ fill: c.text, pointerEvents: 'none' }}>
                {n.id}
              </text>
            </g>
          );
        })}
      </svg>

      <Legend
        items={[
          { state: 'current',   label: tr('현재 위치 (curr)', 'Current city (curr)') },
          { state: 'candidate', label: tr('이동 대상 (nxt)', 'Next city (nxt)') },
          { state: 'visited',   label: tr('방문 완료 (mask)', 'Visited (mask)') },
          { state: 'idle',      label: tr('미방문', 'Unvisited') },
        ]}
      />
    </div>
  );
}
