import { EDGES as DEFAULT_EDGES } from './types';
import type { DijkstraStep } from './types';
import Legend from '../../components/viz/Legend';
import { NODE_COLORS, EDGE_COLORS, type VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';

const DEFAULT_NODES = [
  { id: 0, x: 80,  y: 180 },
  { id: 1, x: 220, y: 70  },
  { id: 2, x: 220, y: 290 },
  { id: 3, x: 370, y: 70  },
  { id: 4, x: 370, y: 290 },
];

interface GraphCanvasProps {
  step: DijkstraStep;
  shortestEdges: [number, number][];
  // custom graph support
  customNodes?: { id: number; x: number; y: number }[];
  customEdges?: [number, number, number][];
}

export default function DijkstraGraphCanvas({ step, shortestEdges, customNodes, customEdges }: GraphCanvasProps) {
  const tr = useTr();
  const { currentNode, neighborNode, activeEdge, visited } = step;
  const NODES = customNodes ?? DEFAULT_NODES.slice(0, step.dist.length);
  const EDGES = customEdges ?? DEFAULT_EDGES;

  return (
    <div className="viz-surface w-full min-h-[380px] h-full flex flex-col relative p-4 items-center justify-center gap-3">
      <svg viewBox="0 0 480 360" className="overflow-visible w-full max-w-[480px]" style={{ height: 'auto' }}>
        <defs>
          {(['idle', 'candidate', 'visited'] as VizState[]).map(s => (
            // userSpaceOnUse keeps arrowheads the same size regardless of stroke width; tip stops at the node rim
            <marker key={s} id={`dij-arrow-${s}`} markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="10" refX="35" refY="5" orient="auto">
              <polygon points="0 0, 11 5, 0 10" style={{ fill: EDGE_COLORS[s] }} />
            </marker>
          ))}
        </defs>

        {/* Edges */}
        {EDGES.map(([u, v, w]) => {
          const isActive   = !!activeEdge && activeEdge[0] === u && activeEdge[1] === v;
          const isShortest = shortestEdges.some(([a, b]) => a === u && b === v);
          const n1 = NODES[u], n2 = NODES[v];
          const dx = n2.x - n1.x, dy = n2.y - n1.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const dr  = len * 1.3;
          const perp = 26;
          const midX = (n1.x + n2.x) / 2 + (dy / len) * perp;
          const midY = (n1.y + n2.y) / 2 - (dx / len) * perp;

          const state: VizState = isActive ? 'candidate' : isShortest ? 'visited' : 'idle';
          const emphasized = state !== 'idle';

          return (
            <g key={`${u}-${v}`}>
              <path
                d={`M ${n1.x},${n1.y} A ${dr},${dr} 0 0,1 ${n2.x},${n2.y}`}
                fill="none"
                strokeWidth={emphasized ? 3 : 1.5}
                strokeOpacity={emphasized ? 1 : 0.45}
                style={{ stroke: EDGE_COLORS[state] }}
                className="transition-all duration-300"
                markerEnd={`url(#dij-arrow-${state})`}
              />
              <text x={midX} y={midY} textAnchor="middle" dy=".35em"
                fontSize={isActive ? 13 : 12} fontWeight={emphasized ? 700 : 500}
                style={{ fill: emphasized ? EDGE_COLORS[state] : 'var(--muted-foreground)' }}
                className="font-mono transition-all duration-300"
              >
                {w}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {NODES.map(nd => {
          const isCurrent  = nd.id === currentNode;
          const isNeighbor = nd.id === neighborNode;
          const state: VizState = isCurrent ? 'current' : isNeighbor ? 'candidate' : visited[nd.id] ? 'visited' : 'idle';
          const c = NODE_COLORS[state];
          const r = isCurrent || isNeighbor ? 24 : 22;

          return (
            <g key={nd.id} transform={`translate(${nd.x},${nd.y})`} className="transition-all duration-300">
              {(isCurrent || isNeighbor) && (
                <circle r={r + 8} style={{ fill: c.fill }} fillOpacity={0.18} />
              )}
              <circle r={r} strokeWidth={2.5} style={{ fill: c.fill, stroke: c.stroke }} />
              <text textAnchor="middle" dy=".35em" fontSize={15} fontWeight={800}
                style={{ fill: c.text, pointerEvents: 'none' }}>{nd.id}</text>
            </g>
          );
        })}
      </svg>

      <Legend
        items={[
          { state: 'current',   label: tr('처리 중', 'Processing') },
          { state: 'candidate', label: tr('완화 대상', 'Relaxing') },
          { state: 'visited',   label: tr('방문 확정', 'Settled') },
          { state: 'idle',      label: tr('미방문', 'Unvisited') },
        ]}
      />
    </div>
  );
}
