import { W } from './solver';

interface GraphCanvasProps {
  currentMask: number;
  currentCity: number;
  nextCity: number | null;
  activeEdge: [number, number] | null;
}

export default function GraphCanvas({ currentMask, currentCity, nextCity, activeEdge }: GraphCanvasProps) {
  // Hardcode 4 node positions
  const nodes = [
    { id: 0, x: 200, y: 50 },
    { id: 1, x: 340, y: 150 },
    { id: 2, x: 200, y: 250 },
    { id: 3, x: 60, y: 150 },
  ];

  return (
    <div className="w-full min-h-[380px] h-full flex flex-col relative p-4 bg-muted/10 items-center justify-center">
      <svg width="400" height="300" viewBox="0 0 400 300" className="overflow-visible w-full min-w-[300px] max-w-[400px]">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-border dark:text-muted-foreground/30" />
          </marker>
          <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-orange-500" />
          </marker>
        </defs>

        {/* Edges */}
        {W.map((row, u) => 
          row.map((weight, v) => {
            if (weight === 0) return null;
            
            const isActive = activeEdge && activeEdge[0] === u && activeEdge[1] === v;
            const n1 = nodes[u];
            const n2 = nodes[v];
            
            // Curve radius
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; 
            
            // Text placement approximation
            const midX = (n1.x + n2.x) / 2 + (dy * 20 / dr);
            const midY = (n1.y + n2.y) / 2 - (dx * 20 / dr);

            return (
              <g key={`${u}-${v}`}>
                <path
                  d={`M ${n1.x},${n1.y} A ${dr},${dr} 0 0,1 ${n2.x},${n2.y}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={isActive ? 3 : 1.5}
                  className={`transition-colors duration-300 ${isActive ? 'text-orange-500' : 'text-border dark:text-muted-foreground/30'}`}
                  markerEnd={isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dy=".3em"
                  className={`text-[10px] font-mono transition-opacity duration-300 font-medium ${isActive ? 'fill-orange-600 dark:fill-orange-400 font-bold opacity-100' : 'fill-muted-foreground opacity-60'}`}
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
          const isNext = n.id === nextCity;
          const isVisited = (currentMask & (1 << n.id)) !== 0 && !isCurrent;
          
          let circleClass = 'fill-muted dark:fill-muted/20 stroke-border dark:stroke-muted-foreground/30 stroke-2';
          let textClass = 'fill-foreground/80';
          
          if (isCurrent) {
            circleClass = 'fill-blue-500 dark:fill-blue-600 stroke-blue-700 dark:stroke-blue-400 stroke-2 drop-shadow-md';
            textClass = 'fill-white dark:fill-white';
          } else if (isNext) {
            circleClass = 'fill-orange-400 dark:fill-orange-500 stroke-orange-600 dark:stroke-orange-400 stroke-2 drop-shadow-sm';
            textClass = 'fill-white dark:fill-white';
          } else if (isVisited) {
            circleClass = 'fill-teal-50 dark:fill-teal-900/40 stroke-teal-500 dark:stroke-teal-400 stroke-2';
            textClass = 'fill-teal-900 dark:fill-teal-100';
          }

          return (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`} className="transition-transform duration-300">
              <circle r="20" className={`transition-colors duration-300 ${circleClass}`} />
              <text textAnchor="middle" dy=".35em" className={`text-sm font-bold font-sans pointer-events-none ${textClass}`}>
                {n.id}
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="mt-8 xl:mt-auto border text-[11px] font-medium text-muted-foreground bg-card p-3 rounded-lg shadow-sm grid grid-cols-2 gap-3 w-fit mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-blue-700 dark:border-blue-400 shadow-sm"></div>
          <span>현재 위치 (curr)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-orange-400 border border-orange-600 dark:border-orange-400 shadow-sm"></div>
          <span>이동 대상 (nxt)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-teal-50 dark:bg-teal-900/40 border border-teal-500 shadow-sm"></div>
          <span>방문 완료 (mask)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-muted border border-border shadow-sm"></div>
          <span>미방문</span>
        </div>
      </div>
    </div>
  );
}
