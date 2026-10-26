import { useMemo } from 'react';
import type { AStarStep } from './types';
import { ASTAR_DEFAULT_GRAPH } from '../../types/graph';
import { Star } from 'lucide-react';
import Legend from '../../components/viz/Legend';
import { NODE_COLORS, EDGE_COLORS, type VizState } from '../../components/viz/palette';
import { cn } from '../../components/ui';
import { toneSolid } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface GraphCanvasProps {
  step: AStarStep;
  shortestEdges: [number, number][]; // final reconstructed path
  customNodes?: { id: number; x: number; y: number }[];
  customEdges?: [number, number, number][]; // [from, to, weight]
}

const SVG_WIDTH = 850;
const SVG_HEIGHT = 600;

export default function GraphCanvas({ step, shortestEdges, customNodes, customEdges }: GraphCanvasProps) {
  const tr = useTr();
  const nodes = customNodes ?? ASTAR_DEFAULT_GRAPH.nodes;
  const N = nodes.length;
  const GOAL_NODE = N - 1;
  const edgesData = useMemo<[number, number, number][]>(
    () => customEdges ?? ASTAR_DEFAULT_GRAPH.edges.map(e => [e.from, e.to, e.weight] as [number, number, number]),
    [customEdges],
  );
  const goalReached = step.type === 'DONE' && step.currentProcessingNode === GOAL_NODE;

  const edgeElements = edgesData.map(([parent, child, w], idx) => {
    const pNode = nodes.find(n => n.id === parent);
    const cNode = nodes.find(n => n.id === child);
    if (!pNode || !cNode) return null;

    const isShortestPath = shortestEdges.some(se => se[0] === parent && se[1] === child);
    const isActive = step.activeEdge?.[0] === parent && step.activeEdge?.[1] === child;
    const state: VizState = isShortestPath ? 'path' : isActive ? 'candidate' : 'idle';
    const emphasized = state !== 'idle';
    const color = EDGE_COLORS[state];

    const dx = cNode.x - pNode.x;
    const dy = cNode.y - pNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nodeRadius = 24;
    const ratio = dist === 0 ? 0 : (dist - nodeRadius - 5) / dist;
    const arrowX = pNode.x + dx * ratio;
    const arrowY = pNode.y + dy * ratio;
    const labelX = pNode.x + dx * 0.4;
    const labelY = pNode.y + dy * 0.4;

    return (
      <g key={idx}>
        <line
          x1={pNode.x} y1={pNode.y} x2={cNode.x} y2={cNode.y}
          strokeWidth={isShortestPath ? 4 : isActive ? 3 : 2}
          strokeOpacity={emphasized ? 1 : 0.6}
          strokeDasharray={isActive && !isShortestPath ? '5,5' : 'none'}
          style={{ stroke: color }}
          className="transition-all duration-300"
        >
          {isActive && !isShortestPath && (
            <animate attributeName="stroke-dashoffset" values="10;0" dur="0.5s" repeatCount="indefinite" />
          )}
        </line>

        <polygon
          points="0,0 -8,-4 -8,4"
          transform={`translate(${arrowX},${arrowY}) rotate(${Math.atan2(dy, dx) * 180 / Math.PI})`}
          style={{ fill: color }}
          className="transition-colors duration-300"
        />

        <g transform={`translate(${labelX}, ${labelY})`}>
          <text
            textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} strokeWidth={4}
            style={{ fill: 'var(--card)', stroke: 'var(--card)' }}
            className="font-mono"
          >
            {w}
          </text>
          <text
            textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800}
            style={{ fill: emphasized ? color : 'var(--muted-foreground)' }}
            className="font-mono transition-colors"
          >
            {w}
          </text>
        </g>
      </g>
    );
  });

  const nodeElements = nodes.map(n => {
    const isGoal = n.id === GOAL_NODE;
    const isStart = n.id === 0;
    const isCurrent = step.currentProcessingNode === n.id;

    let state: VizState = 'idle';
    if (isGoal && goalReached) state = 'path';
    else if (isCurrent) state = 'current';
    else if (step.closedSet.includes(n.id)) state = 'visited';
    else if (step.openSet.includes(n.id)) state = 'candidate';
    const c = NODE_COLORS[state];
    const emphasized = state === 'current' || state === 'path';

    const g = step.g[n.id];
    const h = step.h[n.id];
    const f = step.f[n.id];
    const gStr = g === Infinity ? '∞' : g;
    const hStr = h === Infinity ? '∞' : h;
    const fStr = f === Infinity ? '∞' : f.toFixed(1);

    return (
      <foreignObject key={n.id} x={n.x - 40} y={n.y - 45} width={80} height={90} className="overflow-visible">
        <div className="w-full h-full flex flex-col items-center justify-start pt-5 relative">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl z-10 border-[3px] transition-all duration-300"
            style={{
              background: c.fill,
              borderColor: c.stroke,
              color: c.text,
              boxShadow: emphasized ? `0 0 0 6px color-mix(in oklab, ${c.fill} 25%, transparent)` : undefined,
            }}
          >
            {isGoal ? <Star size={24} className={isCurrent ? 'fill-current' : ''} /> : n.id}
          </div>

          {/* f, g, h values underneath */}
          <div className="absolute top-[60px] flex flex-col items-center pointer-events-none bg-card/95 rounded-lg px-3 py-1.5 whitespace-nowrap shadow-sm border border-border z-20">
            <span className="text-base font-extrabold font-mono leading-tight mb-0.5 text-foreground">f={fStr}</span>
            <span className="text-sm font-semibold font-mono text-muted-foreground leading-tight">g={gStr} h={hStr}</span>
          </div>

          {isStart && (
            <div className={cn('absolute -top-3 text-sm font-extrabold px-2.5 py-0.5 rounded-md shadow-sm', toneSolid.visited)}>
              START
            </div>
          )}
          {isGoal && (
            <div className={cn('absolute -top-3 text-sm font-extrabold px-2.5 py-0.5 rounded-md shadow-sm', toneSolid.danger)}>
              GOAL
            </div>
          )}
        </div>
      </foreignObject>
    );
  });

  // Dashed line from the current node toward the goal (the heuristic direction)
  let heuristicLine = null;
  if (step.currentProcessingNode !== null && step.currentProcessingNode !== GOAL_NODE && step.type !== 'DONE') {
    const currNode = nodes.find(n => n.id === step.currentProcessingNode);
    const goalNode = nodes.find(n => n.id === GOAL_NODE);
    if (currNode && goalNode) {
      heuristicLine = (
        <line
          x1={currNode.x} y1={currNode.y} x2={goalNode.x} y2={goalNode.y}
          strokeWidth={1.5} strokeDasharray="4,4" strokeOpacity={0.7}
          style={{ stroke: 'var(--muted-foreground)' }}
        >
          <animate attributeName="stroke-dashoffset" values="0;8" dur="0.5s" repeatCount="indefinite" keyTimes="0;1" />
        </line>
      );
    }
  }

  return (
    <div className="viz-surface w-full h-full flex flex-col items-center justify-start gap-3 p-4 overflow-auto">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full max-w-[600px] h-auto font-sans overflow-visible"
        style={{ minHeight: '250px' }}
      >
        {heuristicLine}
        {edgeElements}
        {nodeElements}
      </svg>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        <Legend
          items={[
            { state: 'current',   label: tr('현재 노드', 'Current node') },
            { state: 'candidate', label: 'Open Set' },
            { state: 'visited',   label: 'Closed Set' },
            { state: 'path',      label: tr('최단 경로', 'Shortest path'), kind: 'edge' },
          ]}
        />
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span className="w-5 border-t-2 border-dashed border-muted-foreground" />
          {tr('h(x) 향하는 방향', 'h(x) direction')}
        </span>
      </div>
    </div>
  );
}
