import { W } from './solver';

interface GraphCanvasProps {
  currentCity: number;
  nextCity: number | null;
  activeEdge: [number, number] | null;
}

export default function GraphCanvas({ currentCity, nextCity, activeEdge }: GraphCanvasProps) {
  // Hardcode 4 node positions
  const nodes = [
    { id: 0, x: 200, y: 60 },
    { id: 1, x: 300, y: 160 },
    { id: 2, x: 200, y: 260 },
    { id: 3, x: 100, y: 160 },
  ];

  return (
    <div className="w-full h-[360px] flex items-center justify-center relative bg-muted/10">
      <svg width="400" height="320" viewBox="0 0 400 320" className="overflow-visible">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-border dark:text-muted-foreground/30" />
          </marker>
          <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-primary" />
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
                  stroke={isActive ? 'var(--color-primary, #6366f1)' : 'currentColor'}
                  strokeWidth={isActive ? 3 : 1.5}
                  className={`transition-colors duration-300 ${isActive ? 'text-primary' : 'text-border dark:text-muted-foreground/30'}`}
                  markerEnd={isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dy=".3em"
                  className={`text-[10px] font-mono transition-opacity duration-300 font-medium ${isActive ? 'fill-primary font-bold opacity-100' : 'fill-muted-foreground opacity-60'}`}
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
          
          return (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`} className="transition-transform duration-300">
              <circle
                r="20"
                className={`transition-colors duration-300 ${
                  isCurrent ? 'fill-primary stroke-primary-foreground stroke-2 drop-shadow-md'
                  : isNext ? 'fill-yellow-400 dark:fill-yellow-500 stroke-card stroke-2'
                  : 'fill-card stroke-border dark:stroke-muted-foreground/50 stroke-2'
                }`}
              />
              <text
                textAnchor="middle"
                dy=".35em"
                className={`text-sm font-bold font-sans pointer-events-none ${
                  isCurrent || isNext ? 'fill-primary-foreground dark:fill-card' : 'fill-foreground'
                }`}
              >
                {n.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
