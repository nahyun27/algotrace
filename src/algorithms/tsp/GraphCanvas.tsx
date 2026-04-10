import { W } from './shared';

interface GraphCanvasProps {
  currentMask: number;
  currentCity: number;
  nextCity: number | null;
  activeEdge: [number, number] | null;
}

export default function GraphCanvas({ currentMask, currentCity, nextCity, activeEdge }: GraphCanvasProps) {
  // Spacious diamond layout — wider viewBox to avoid label overlap
  const nodes = [
    { id: 0, x: 240, y: 60  },
    { id: 1, x: 400, y: 190 },
    { id: 2, x: 240, y: 320 },
    { id: 3, x: 80,  y: 190 },
  ];

  return (
    <div className="w-full min-h-[400px] h-full flex flex-col relative p-4 bg-muted/10 items-center justify-center">
      <svg
        viewBox="0 0 480 380"
        className="overflow-visible w-full max-w-[480px]"
        style={{ height: 'auto' }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="26" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-border dark:text-muted-foreground/30" />
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
                  stroke={isActive ? '#f97316' : 'currentColor'}
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
                      : 'fill-zinc-600 dark:fill-white'
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

          let fill   = '#e4e4e7'; // muted (unvisited)
          let stroke = '#a1a1aa';
          let textFill = '#3f3f46';
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
      <div className="mt-4 xl:mt-3 border text-[11px] font-medium text-muted-foreground bg-card p-3 rounded-lg shadow-sm grid grid-cols-2 gap-x-6 gap-y-2 w-fit mx-auto">
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
