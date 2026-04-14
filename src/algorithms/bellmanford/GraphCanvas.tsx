import type { BellmanFordStep } from './types';
import { INF } from './types';

interface Props {
  step: BellmanFordStep;
  nodes: { id: number; x: number; y: number }[];
  edges: [number, number, number][];
}

export default function BFGraphCanvas({ step, nodes, edges }: Props) {
  const { currentNode, neighborNode, activeEdge, dist, negativeCycleEdges } = step;
  const isNegCycle = step.type === 'NEGATIVE_CYCLE';

  return (
    <div className="w-full min-h-[380px] h-full flex flex-col relative p-4 bg-muted/10 items-center justify-center">
      <svg viewBox="0 0 480 380" className="overflow-visible w-full max-w-[480px]" style={{ height: 'auto' }}>
        <defs>
          <marker id="bf-arrow" markerWidth="10" markerHeight="7" refX="26" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-border" />
          </marker>
          <marker id="bf-arrow-active" markerWidth="10" markerHeight="7" refX="26" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#f97316" />
          </marker>
          <marker id="bf-arrow-neg" markerWidth="10" markerHeight="7" refX="26" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
          </marker>
          <marker id="bf-arrow-improved" markerWidth="10" markerHeight="7" refX="26" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map(([u, v, w]) => {
          const isActive   = activeEdge && activeEdge[0] === u && activeEdge[1] === v;
          const isNegEdge  = w < 0;
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

          let stroke = 'var(--muted-foreground)';
          let strokeW = 1.5;
          let opacity = 0.35;
          let marker = 'url(#bf-arrow)';
          let strokeDash = 'none';

          if (isNegCycleEdge) {
            stroke = '#ef4444'; strokeW = 3; opacity = 1;
            marker = 'url(#bf-arrow-neg)'; strokeDash = '6,4';
          } else if (isImproved) {
            stroke = '#22c55e'; strokeW = 2.5; opacity = 1;
            marker = 'url(#bf-arrow-improved)';
          } else if (isActive) {
            stroke = '#f97316'; strokeW = 2.5; opacity = 1;
            marker = 'url(#bf-arrow-active)';
          } else if (isNegEdge) {
            stroke = '#ef4444'; strokeW = 1.5; opacity = 0.6;
            marker = 'url(#bf-arrow-neg)';
          }

          return (
            <g key={`${u}-${v}`}>
              <path
                d={`M ${n1.x},${n1.y} A ${dr},${dr} 0 0,1 ${n2.x},${n2.y}`}
                fill="none" stroke={stroke} strokeWidth={strokeW} strokeOpacity={opacity}
                strokeDasharray={strokeDash}
                className="transition-all duration-300" markerEnd={marker}
              />
              <text x={midX} y={midY} textAnchor="middle" dy=".35em"
                fontSize={isActive ? 13 : 11} fontWeight={isActive ? 700 : 500}
                className={`font-mono transition-all duration-300 ${
                  isNegCycleEdge ? 'fill-red-500 dark:fill-red-400' :
                  isImproved ? 'fill-green-600 dark:fill-green-400' :
                  isActive ? 'fill-orange-500 dark:fill-orange-400' :
                  isNegEdge ? 'fill-red-500 dark:fill-red-400 opacity-80' :
                  'fill-zinc-600 dark:fill-foreground'
                }`}
              >{w}</text>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(nd => {
          const isCurrent  = nd.id === currentNode;
          const isNeighbor = nd.id === neighborNode;
          const r = isCurrent || isNeighbor ? 24 : 22;

          let fill = '#e4e4e7', stroke = '#a1a1aa', textFill = '#3f3f46';
          if (document.documentElement.classList.contains('dark')) {
            fill = '#2a2d3e'; // --border
            stroke = '#383b52'; // --accent
            textFill = '#e2e4ed'; // --foreground
          }
          
          if (isCurrent)       { fill = '#3b82f6'; stroke = '#1d4ed8'; textFill = '#fff'; }
          else if (isNeighbor) { fill = '#fb923c'; stroke = '#c2410c'; textFill = '#fff'; }
          else if (step.type === 'DONE' && dist[nd.id] < INF) {
            fill = '#bbf7d0'; stroke = '#16a34a'; textFill = '#14532d';
          }

          const dVal = dist[nd.id];
          const dLabel = dVal >= INF ? '∞' : String(dVal);

          return (
            <g key={nd.id} transform={`translate(${nd.x},${nd.y})`} className="transition-all duration-300">
              {(isCurrent || isNeighbor) && (
                <circle r={r + 7} fill={isCurrent ? '#3b82f6' : '#fb923c'} fillOpacity={0.15} />
              )}
              <circle r={r} fill={fill} stroke={stroke} strokeWidth={2}
                style={{ filter: (isCurrent || isNeighbor) ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' : 'none' }} />
              <text textAnchor="middle" dy=".35em" fontSize={14} fontWeight={700}
                fill={textFill} style={{ pointerEvents: 'none' }}>{nd.id}</text>
              {/* dist label below node */}
              <text textAnchor="middle" dy={r + 16} fontSize={11} fontWeight={600}
                className={`font-mono ${isCurrent ? 'fill-blue-600 dark:fill-blue-300' : isNeighbor ? 'fill-orange-600 dark:fill-orange-300' : 'fill-zinc-500 dark:fill-zinc-400'}`}>
                {dLabel}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-2 border text-[11px] font-medium text-muted-foreground bg-card p-3 rounded-lg shadow-sm grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 w-fit mx-auto">
        {[
          { color: 'bg-blue-500 border-blue-700',    label: '처리 중 (u)' },
          { color: 'bg-orange-400 border-orange-600', label: '완화 대상 (v)' },
          { color: 'bg-green-200 border-green-600',  label: '완료 (DONE)' },
          { color: 'bg-zinc-200 border-zinc-400',    label: '미처리' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full border shadow-sm ${color}`} />
            <span>{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-red-500" style={{ borderTop: '2px dashed #ef4444' }} />
          <span>음수 사이클</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-500 font-bold text-xs">w&lt;0</span>
          <span>음수 간선</span>
        </div>
      </div>
    </div>
  );
}
