import { EDGES as DEFAULT_EDGES } from './types';
import type { DijkstraStep } from './types';

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
  const { currentNode, neighborNode, activeEdge, visited } = step;
  const NODES = customNodes ?? DEFAULT_NODES.slice(0, step.dist.length);
  const EDGES = customEdges ?? DEFAULT_EDGES;

  return (
    <div className="w-full min-h-[380px] h-full flex flex-col relative p-4 bg-muted/10 items-center justify-center">
      <svg viewBox="0 0 480 360" className="overflow-visible w-full max-w-[480px]" style={{ height: 'auto' }}>
        <defs>
          <marker id="dij-arrow" markerWidth="10" markerHeight="7" refX="26" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-border" />
          </marker>
          <marker id="dij-arrow-active" markerWidth="10" markerHeight="7" refX="26" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#f97316" />
          </marker>
          <marker id="dij-arrow-short" markerWidth="10" markerHeight="7" refX="26" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
          </marker>
        </defs>

        {/* Edges */}
        {EDGES.map(([u, v, w]) => {
          const isActive  = activeEdge && activeEdge[0] === u && activeEdge[1] === v;
          const isShortest = shortestEdges.some(([a, b]) => a === u && b === v);
          const n1 = NODES[u], n2 = NODES[v];
          const dx = n2.x - n1.x, dy = n2.y - n1.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const dr  = len * 1.3;
          const perp = 26;
          const midX = (n1.x + n2.x) / 2 + (dy / len) * perp;
          const midY = (n1.y + n2.y) / 2 - (dx / len) * perp;

          const stroke = isActive ? '#f97316' : isShortest ? '#22c55e' : 'var(--graph-edge)';
          const strokeW = isActive || isShortest ? 2.5 : 1.5;
          const opacity = isActive || isShortest ? 1 : 0.35;
          const marker  = isActive ? 'url(#dij-arrow-active)' : isShortest ? 'url(#dij-arrow-short)' : 'url(#dij-arrow)';

          return (
            <g key={`${u}-${v}`}>
              <path
                d={`M ${n1.x},${n1.y} A ${dr},${dr} 0 0,1 ${n2.x},${n2.y}`}
                fill="none" stroke={stroke} strokeWidth={strokeW} strokeOpacity={opacity}
                className="transition-all duration-300" markerEnd={marker}
              />
              {/* Weight label */}
              <text x={midX} y={midY} textAnchor="middle" dy=".35em"
                fontSize={isActive ? 12 : 11} fontWeight={isActive || isShortest ? 700 : 500}
                fill={stroke}
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
          const isVisited  = visited[nd.id] && !isCurrent;
          const r = isCurrent || isNeighbor ? 24 : 22;

          let fill = '#e4e4e7', stroke = '#a1a1aa', textFill = '#3f3f46';
          if (document.documentElement.classList.contains('dark')) {
            fill = '#2a2d3e'; // --border
            stroke = '#383b52'; // --accent
            textFill = '#e2e4ed'; // --foreground
          }
          
          if (isCurrent)  { fill = '#3b82f6'; stroke = '#1d4ed8'; textFill = '#fff'; }
          else if (isNeighbor) { fill = '#fb923c'; stroke = '#c2410c'; textFill = '#fff'; }
          else if (isVisited)  { fill = '#bbf7d0'; stroke = '#16a34a'; textFill = '#14532d'; }

          return (
            <g key={nd.id} transform={`translate(${nd.x},${nd.y})`} className="transition-all duration-300">
              {(isCurrent || isNeighbor) && (
                <circle r={r + 7} fill={isCurrent ? '#3b82f6' : '#fb923c'} fillOpacity={0.15} />
              )}
              <circle r={r} fill={fill} stroke={stroke} strokeWidth={2}
                style={{ filter: (isCurrent || isNeighbor) ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' : 'none' }} />
              <text textAnchor="middle" dy=".35em" fontSize={14} fontWeight={700}
                fill={textFill} style={{ pointerEvents: 'none' }}>{nd.id}</text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-3 border text-[11px] font-medium text-muted-foreground bg-card p-3 rounded-lg shadow-sm grid grid-cols-2 gap-x-6 gap-y-2 w-fit mx-auto">
        {[
          { color: 'bg-blue-500 border-blue-700',   label: '처리 중 (current)' },
          { color: 'bg-orange-400 border-orange-600', label: '완화 대상 (neighbor)' },
          { color: 'bg-green-200 border-green-600',  label: '방문 확정 (visited)' },
          { color: 'bg-zinc-200 border-zinc-400',    label: '미방문' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full border shadow-sm ${color}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
