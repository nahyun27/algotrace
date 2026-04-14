import { W as DEFAULT_W } from './shared';

interface GraphCanvasProps {
  currentMask: number;
  currentCity: number;
  nextCity: number | null;
  activeEdge: [number, number] | null;
  // custom graph support
  customNodes?: { id: number; x: number; y: number }[];
  customW?: number[][];
}

export default function GraphCanvas({ currentMask, currentCity, nextCity, activeEdge, customNodes, customW }: GraphCanvasProps) {
  const W = customW ?? DEFAULT_W;
  const N = W.length;
  const defaultNodes = [
    { id: 0, x: 240, y: 60  },
    { id: 1, x: 400, y: 190 },
    { id: 2, x: 240, y: 320 },
    { id: 3, x: 80,  y: 190 },
  ];
  const nodes = customNodes ?? defaultNodes.slice(0, N);

  return (
    <div className="w-full min-h-[280px] sm:min-h-[400px] h-full flex flex-col relative p-2 sm:p-4 bg-muted/10 items-center justify-center">
      <svg
        viewBox="0 0 480 380"
        className="overflow-visible w-full max-w-[480px]"
        style={{ height: 'auto' }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="26" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-zinc-400 dark:text-accent" />
          </marker>
          <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="26" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#f97316" />
          </marker>
        </defs>

        {/* Edges */}
        {W.map((row, u) =>
          row.map((weight, v) => {
            if (weight === 0) return null;

            const isActive = activeEdge && activeEdge[0] === u && activeEdge[1] === v;
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

            return (
              <g key={`${u}-${v}`}>
                <path
                  d={`M ${n1.x},${n1.y} A ${dr},${dr} 0 0,1 ${n2.x},${n2.y}`}
                  fill="none"
                  stroke={isActive ? '#f97316' : 'var(--muted-foreground)'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  strokeOpacity={isActive ? 1 : 0.4}
                  className="transition-all duration-300"
                  markerEnd={isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                />
                {/* Weight label */}
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dy=".35em"
                  fontSize={isActive ? 12 : 11}
                  fontWeight={isActive ? 700 : 500}
                  className={`font-mono transition-all duration-300 ${
                    isActive
                      ? 'fill-orange-500 dark:fill-orange-400'
                      : 'fill-zinc-600 dark:fill-foreground'
                  }`}
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

          let fill   = '#e4e4e7', stroke = '#a1a1aa', textFill = '#3f3f46';
          if (document.documentElement.classList.contains('dark')) {
            fill = '#2a2d3e'; // --border
            stroke = '#383b52'; // --accent
            textFill = '#e2e4ed'; // --foreground
          }
          
          let r = 22;

          if (isCurrent) {
            fill = '#3b82f6'; stroke = '#1d4ed8'; textFill = '#fff'; r = 24;
          } else if (isNext) {
            fill = '#fb923c'; stroke = '#c2410c'; textFill = '#fff'; r = 24;
          } else if (isVisited) {
            fill = '#ccfbf1'; stroke = '#14b8a6'; textFill = '#0f766e';
          }

          return (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`} className="transition-all duration-300">
              {/* Glow ring for active nodes */}
              {(isCurrent || isNext) && (
                <circle r={r + 6} fill={isCurrent ? '#3b82f6' : '#fb923c'} fillOpacity={0.18} />
              )}
              <circle r={r} fill={fill} stroke={stroke} strokeWidth={2} style={{ filter: (isCurrent || isNext) ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' : 'none' }} />
              <text textAnchor="middle" dy=".35em" fontSize={14} fontWeight={700} fill={textFill} style={{ pointerEvents: 'none' }}>
                {n.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-3 xl:mt-3 border text-[11px] font-medium text-muted-foreground bg-card p-2 sm:p-3 rounded-lg shadow-sm grid grid-cols-2 gap-x-3 sm:gap-x-6 gap-y-1.5 sm:gap-y-2 max-w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-blue-700 shadow-sm" />
          <span>현재 위치 (curr)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-orange-400 border border-orange-600 shadow-sm" />
          <span>이동 대상 (nxt)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-teal-100 border border-teal-500 shadow-sm" />
          <span>방문 완료 (mask)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-zinc-200 border border-zinc-400 shadow-sm" />
          <span>미방문</span>
        </div>
      </div>
    </div>
  );
}
