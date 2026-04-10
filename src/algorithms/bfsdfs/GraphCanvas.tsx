import React, { useMemo } from 'react';
import type { BaseStep, BFSStep, DFSStep } from './types';
import { BFS_DFS_DEFAULT_GRAPH } from './types';

interface BFSDFSGraphCanvasProps {
  step: BaseStep;
  mode: 'BFS' | 'DFS';
}

const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;

export default function BFSDFSGraphCanvas({ step, mode }: BFSDFSGraphCanvasProps) {
  const nodes = BFS_DFS_DEFAULT_GRAPH.nodes;
  const edgesData = BFS_DFS_DEFAULT_GRAPH.edges;

  // Use queues or stacks based on mode
  const scheduledNodes = useMemo(() => {
    if (mode === 'BFS' && 'queue' in step) {
      return (step as BFSStep).queue;
    } else if (mode === 'DFS' && 'stack' in step) {
      return (step as DFSStep).stack;
    }
    return [];
  }, [step, mode]);

  // Edges
  const edgeElements = useMemo(() => {
    return edgesData.map((e, idx) => {
      const fromNode = nodes.find(n => n.id === e.from);
      const toNode = nodes.find(n => n.id === e.to);
      if (!fromNode || !toNode) return null;

      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const padding = 24; // Node radius (48/2)
      
      const ratio = (length - padding) / length;
      const startRatio = padding / length;
      
      const x1 = fromNode.x + dx * startRatio;
      const y1 = fromNode.y + dy * startRatio;
      const x2 = fromNode.x + dx * ratio;
      const y2 = fromNode.y + dy * ratio;

      // Check if edge is active for animation
      const isActive = step.activeEdge?.[0] === e.from && step.activeEdge?.[1] === e.to ||
                       step.activeEdge?.[0] === e.to && step.activeEdge?.[1] === e.from;
      
      // Check if it's a tree edge
      const isTreeEdge = step.treeEdges.some(te => (te[0] === e.from && te[1] === e.to) || (te[0] === e.to && te[1] === e.from));

      let strokeColor = 'stroke-zinc-300 dark:stroke-zinc-700';
      let strokeWidth = 2;

      if (isActive) {
        strokeColor = 'stroke-orange-500 dark:stroke-orange-400';
        strokeWidth = 4;
      } else if (isTreeEdge) {
        strokeColor = 'stroke-emerald-500 dark:stroke-emerald-400';
        strokeWidth = 4;
      }

      return (
        <g key={`edge-${idx}`}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className={`transition-all duration-300 ${strokeColor}`}
            strokeWidth={strokeWidth}
            strokeDasharray={isActive ? '5,5' : 'none'}
          >
            {isActive && (
              <animate
                attributeName="stroke-dashoffset"
                values="10;0"
                dur="0.5s"
                repeatCount="indefinite"
              />
            )}
          </line>
        </g>
      );
    });
  }, [edgesData, nodes, step.activeEdge, step.treeEdges]);

  // Nodes
  const nodeElements = useMemo(() => {
    return nodes.map((n) => {
      const isCurrent = step.currentNode === n.id;
      const isVisited = step.visitedSet.includes(n.id);
      const isScheduled = scheduledNodes.includes(n.id);

      let bgColor = 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300';
      let ring = 'ring-zinc-300 dark:ring-zinc-600';

      if (isCurrent) {
        bgColor = 'bg-blue-500 text-white shadow-lg shadow-blue-500/50';
        ring = 'ring-blue-300 dark:ring-blue-500/30 ring-4';
      } else if (isVisited) {
        bgColor = 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30';
        ring = 'ring-emerald-300 dark:ring-emerald-700 ring-2';
      } else if (isScheduled) {
        bgColor = 'bg-sky-200 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200';
        ring = 'ring-sky-300 dark:ring-sky-700 ring-2';
      }

      // Check visit order
      const visitIndex = step.visitedNodes.indexOf(n.id);
      const orderNum = visitIndex !== -1 ? visitIndex + 1 : null;

      return (
        <foreignObject
          key={n.id}
          x={n.x - 40}
          y={n.y - 45}
          width={80}
          height={90}
          className="overflow-visible"
        >
          <div className="w-full h-full flex flex-col items-center justify-start pt-5 relative group">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center
                font-black text-2xl z-10 transition-all duration-300 relative
                ring-2 ${ring} ${bgColor}
              `}
            >
              {n.id}
              {orderNum !== null && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold ring-2 ring-white dark:ring-zinc-900 shadow-sm animate-in zoom-in duration-300">
                  {orderNum}
                </div>
              )}
            </div>
          </div>
        </foreignObject>
      );
    });
  }, [nodes, step.currentNode, step.visitedSet, step.visitedNodes, scheduledNodes]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-start overflow-auto">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full max-w-[600px] h-auto font-sans"
        style={{ minHeight: '300px' }}
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {edgeElements}
        {nodeElements}
      </svg>
      {/* Legend inside canvas */}
      <div className="w-full px-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs mt-1 pb-4">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-300"></div>현재 처리 노드</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-300"></div>방문 완료</div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-sky-200 ring-2 ring-sky-300"></div>
          {mode === 'BFS' ? '큐(Queue) 대기' : '스택(Stack) 대기'}
        </div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-emerald-500 rounded-full"></div>트리 간선</div>
      </div>
    </div>
  );
}
