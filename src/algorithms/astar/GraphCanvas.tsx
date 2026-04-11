import { useMemo } from 'react';
import type { AStarStep } from './types';
import { ASTAR_DEFAULT_GRAPH } from '../../types/graph';
import { Star } from 'lucide-react';

interface GraphCanvasProps {
  step: AStarStep;
  shortestEdges: [number, number][]; // final reconstructed path
  customNodes?: { id: number; x: number; y: number }[];
  customEdges?: [number, number, number][]; // [from, to, weight]
}

export default function GraphCanvas({ step, shortestEdges, customNodes, customEdges }: GraphCanvasProps) {
  const nodes = customNodes ?? ASTAR_DEFAULT_GRAPH.nodes;
  const N = nodes.length;
  // If custom edges are provided, map them, otherwise map defaults
  const edgesData = customEdges || ASTAR_DEFAULT_GRAPH.edges.map(e => [
    ASTAR_DEFAULT_GRAPH.nodes.find(n => n.id === e.from)?.id ?? 0,
    ASTAR_DEFAULT_GRAPH.nodes.find(n => n.id === e.to)?.id ?? 0,
    e.weight
  ]);

  const SVG_WIDTH = 850;
  const SVG_HEIGHT = 600;
  const GOAL_NODE = N - 1;

  // Render edges
  const edgeElements = useMemo(() => {
    return edgesData.map((e, idx) => {
      const parent = Number(e[0]);
      const child = Number(e[1]);
      const w = e[2];

      const pNode = nodes.find(n => n.id === parent);
      const cNode = nodes.find(n => n.id === child);
      if (!pNode || !cNode) return null;

      // Color logic
      const isShortestPath = shortestEdges.some(
        se => (se[0] === parent && se[1] === child)
      );
      const isActive =
        step.activeEdge?.[0] === parent && step.activeEdge?.[1] === child;

      let edgeColor = 'text-zinc-300 dark:text-accent';
      let strokeWidth = 2;
      let isAnimated = false;

      if (isShortestPath) {
        edgeColor = 'text-emerald-500 dark:text-emerald-400';
        strokeWidth = 4;
      } else if (isActive) {
        edgeColor = 'text-orange-500 dark:text-orange-400';
        strokeWidth = 3;
        isAnimated = true;
      }

      // Arrow placement
      const dx = cNode.x - pNode.x;
      const dy = cNode.y - pNode.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nodeRadius = 24;
      
      const ratio = dist === 0 ? 0 : (dist - nodeRadius - 5) / dist; // slightly before node
      const arrowX = pNode.x + dx * ratio;
      const arrowY = pNode.y + dy * ratio;
      
      const labelX = pNode.x + dx * 0.4;
      const labelY = pNode.y + dy * 0.4;

      return (
        <g key={idx}>
          <line
            x1={pNode.x}
            y1={pNode.y}
            x2={cNode.x}
            y2={cNode.y}
            className={`transition-all duration-300 ${edgeColor}`}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={isAnimated ? '5,5' : 'none'}
          >
            {isAnimated && (
              <animate
                attributeName="stroke-dashoffset"
                values="10;0"
                dur="0.5s"
                repeatCount="indefinite"
              />
            )}
          </line>

          {/* ArrowHead */}
          <polygon
            points="0,0 -8,-4 -8,4"
            transform={`translate(${arrowX},${arrowY}) rotate(${Math.atan2(dy, dx) * 180 / Math.PI})`}
            className={`transition-colors duration-300 ${edgeColor} fill-current`}
          />

          {/* Weight label */}
          <g transform={`translate(${labelX}, ${labelY})`}>
            {/* Outline for darkmode readability */}
            <text
              textAnchor="middle"
              alignmentBaseline="central"
              className="text-base font-bold fill-white dark:fill-background stroke-white dark:stroke-background"
              strokeWidth="4"
            >
              {w}
            </text>
            <text
              textAnchor="middle"
              alignmentBaseline="central"
              className={`text-base font-extrabold transition-colors ${
                isActive ? 'fill-orange-600 dark:fill-orange-400' : 'fill-zinc-700 dark:fill-foreground'
              }`}
            >
              {w}
            </text>
          </g>
        </g>
      );
    });
  }, [edgesData, nodes, shortestEdges, step.activeEdge]);

  // Render nodes
  const nodeElements = useMemo(() => {
    return nodes.map((n) => {
      const isGoal = n.id === GOAL_NODE;
      const isStart = n.id === 0;

      let bgColor = 'bg-zinc-200 dark:bg-border text-zinc-700 dark:text-foreground';
      let ring = 'ring-zinc-300 dark:ring-accent';

      if (step.currentProcessingNode === n.id) {
        bgColor = 'bg-blue-500 text-white shadow-lg shadow-blue-500/50';
        ring = 'ring-blue-300 dark:ring-blue-500/30 ring-4';
      } else if (step.closedSet.includes(n.id)) {
        bgColor = 'bg-zinc-400 dark:bg-accent text-white';
        ring = 'ring-zinc-300 dark:ring-border';
      } else if (step.openSet.includes(n.id)) {
        bgColor = 'bg-sky-200 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200';
        ring = 'ring-sky-300 dark:ring-sky-700';
      }
      
      // Goal node special appearance
      if (isGoal && step.type === 'DONE' && step.closedSet.includes(n.id)) {
        bgColor = 'bg-purple-500 text-white shadow-lg shadow-purple-500/50';
        ring = 'ring-purple-300 dark:ring-purple-500/30 ring-4';
      } else if (isGoal) {
        ring += ' ring-purple-400/50 dark:ring-purple-500/50 ring-offset-2';
      }

      // Format f = g + h
      const g = step.g[n.id];
      const h = step.h[n.id];
      const f = step.f[n.id];
      const gStr = g === Infinity ? '∞' : g;
      const hStr = h === Infinity ? '∞' : h;
      const fStr = f === Infinity ? '∞' : typeof f === 'number' ? f.toFixed(1) : f;

      return (
        <foreignObject
          key={n.id}
          x={n.x - 40}
          y={n.y - 45} /* Slightly higher up */
          width={80}
          height={90}
          className="overflow-visible"
        >
          <div className="w-full h-full flex flex-col items-center justify-start pt-5 relative group">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center
                font-black text-2xl z-10 transition-all duration-300
                ring-2 ${ring} ${bgColor}
              `}
            >
              {isGoal ? <Star size={24} className={step.currentProcessingNode === n.id ? 'fill-current' : ''} /> : n.id}
            </div>
            
            {/* f, g, h values underneath */}
            <div className="absolute top-[60px] flex flex-col items-center pointer-events-none bg-white/95 dark:bg-card/95 rounded px-3 py-1.5 whitespace-nowrap shadow-sm border border-zinc-200 dark:border-accent z-20">
              <span className="text-base font-extrabold text-purple-600 dark:text-purple-400 leading-tight mb-0.5">f={fStr}</span>
              <span className="text-sm font-semibold text-muted-foreground leading-tight">g={gStr} h={hStr}</span>
            </div>
            
            {/* Start/Goal labels above */}
            {isStart && (
              <div className="absolute -top-3 text-sm font-extrabold px-2.5 py-0.5 bg-zinc-800 text-white rounded dark:bg-zinc-200 dark:text-zinc-900 shadow-sm">
                START
              </div>
            )}
            {isGoal && (
              <div className="absolute -top-3 text-sm font-extrabold px-2.5 py-0.5 bg-purple-600 text-white rounded shadow-sm">
                GOAL
              </div>
            )}
          </div>
        </foreignObject>
      );
    });
  }, [nodes, step, GOAL_NODE]);

  // Optional: Draw a dashed line to indicate heuristic from current node to goal
  const heuristicLine = useMemo(() => {
    if (step.currentProcessingNode === null || step.currentProcessingNode === GOAL_NODE || step.type === 'DONE') return null;
    const currNode = nodes.find(n => n.id === step.currentProcessingNode);
    const goalNode = nodes.find(n => n.id === GOAL_NODE);
    if (!currNode || !goalNode) return null;
    
    return (
      <line
        x1={currNode.x}
        y1={currNode.y}
        x2={goalNode.x}
        y2={goalNode.y}
        className="text-purple-300 dark:text-purple-800/50"
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="4,4"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;8"
          dur="0.5s"
          repeatCount="indefinite"
          keyTimes="0;1"
        />
      </line>
    );
  }, [step.currentProcessingNode, step.type, nodes, GOAL_NODE]);


  return (
    <div className="w-full h-full flex flex-col items-center justify-start overflow-auto">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full max-w-[600px] h-auto font-sans"
        style={{ minHeight: '250px' }}
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {heuristicLine}
        {edgeElements}
        {nodeElements}
      </svg>
      {/* Legend inside canvas */}
      <div className="w-full px-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs mt-1 pb-4">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-300"></div>현재 노드</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-sky-200 ring-2 ring-sky-300"></div>Open Set</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-zinc-400 ring-2 ring-zinc-300"></div>Closed Set</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-emerald-500 rounded-full"></div>최단 경로</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-1 border-t border-dashed border-purple-400"></div>h(x) 향하는 방향</div>
      </div>
    </div>
  );
}
