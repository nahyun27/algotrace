import { useMemo } from 'react';
import type { PrimStep } from './types';
import { INF } from './types';
import type { KruskalNode, Edge } from '../kruskal/types';
import Legend from '../../components/viz/Legend';
import { NODE_COLORS, EDGE_COLORS, type VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';

interface Props {
  step: PrimStep;
  nodes: KruskalNode[];
  edges: Edge[];
}

const SVG_W = 660;
const SVG_H = 350;
const R = 26;

function edgeKey(u: number, v: number) {
  return `${Math.min(u, v)}-${Math.max(u, v)}`;
}

export default function PrimGraphCanvas({ step, nodes, edges }: Props) {
  const tr = useTr();
  const mstSet = useMemo(() => new Set(step.mstEdges.map(e => edgeKey(e.u, e.v))), [step.mstEdges]);
  const pqSet = useMemo(() => new Set(step.pq.map(item => item.node)), [step.pq]);
  const currentEdgeKey =
    step.currentNode !== null && step.currentNeighbor !== null
      ? edgeKey(step.currentNode, step.currentNeighbor)
      : null;

  return (
    <div className="viz-surface w-full h-full flex flex-col items-center justify-center gap-3 p-4">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full max-w-[660px]" style={{ height: 'auto' }}>
        {edges.map((e, idx) => {
          const from = nodes[e.u];
          const to   = nodes[e.v];
          if (!from || !to) return null;

          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const nx = dx / len, ny = dy / len;
          const x1 = from.x + nx * R, y1 = from.y + ny * R;
          const x2 = to.x   - nx * R, y2 = to.y   - ny * R;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;

          const key = edgeKey(e.u, e.v);
          const state: VizState = mstSet.has(key) ? 'path' : currentEdgeKey === key ? 'candidate' : 'idle';
          const emphasized = state !== 'idle';
          const perpX = -ny * 13;
          const perpY =  nx * 13;

          return (
            <g key={idx}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                strokeWidth={state === 'path' ? 4 : state === 'candidate' ? 3.5 : 1.5}
                strokeOpacity={emphasized ? 1 : 0.6}
                strokeLinecap="round"
                style={{ stroke: EDGE_COLORS[state] }}
                className="transition-all duration-300"
              />
              <text
                x={mx + perpX} y={my + perpY}
                textAnchor="middle" dominantBaseline="central"
                fontSize={13} fontWeight={emphasized ? 800 : 600}
                style={{ fill: emphasized ? EDGE_COLORS[state] : 'var(--muted-foreground)' }}
                className="font-mono transition-all duration-300"
              >
                {e.weight}
              </text>
            </g>
          );
        })}

        {nodes.map(({ id, x, y }) => {
          const isVisited  = step.visited[id];
          const isCurrent  = step.currentNode === id;
          const isNeighbor = step.currentNeighbor === id;
          const isInPQ     = pqSet.has(id);
          const keyVal     = step.key[id];

          const state: VizState = isCurrent ? 'current' : isNeighbor ? 'candidate' : isVisited ? 'visited' : 'idle';
          const c = NODE_COLORS[state];
          const queued = state === 'idle' && isInPQ;
          const keyColor =
            state === 'idle' ? (queued ? EDGE_COLORS.candidate : 'var(--muted-foreground)') : EDGE_COLORS[state];

          return (
            <g key={id} transform={`translate(${x},${y})`} className="transition-all duration-300">
              {(isCurrent || isNeighbor) && <circle r={R + 8} style={{ fill: c.fill }} fillOpacity={0.18} />}
              <circle
                r={R}
                strokeWidth={2.5}
                strokeDasharray={queued ? '5,4' : undefined}
                style={{ fill: c.fill, stroke: queued ? EDGE_COLORS.candidate : c.stroke }}
                className="transition-all duration-300"
              />
              <text textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800}
                style={{ fill: c.text, pointerEvents: 'none' }}>
                {id}
              </text>
              <text y={R + 15} textAnchor="middle" fontSize={12} fontWeight={700}
                style={{ fill: keyColor }} className="font-mono">
                {keyVal >= INF ? '∞' : keyVal}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex flex-col items-center gap-1.5">
        <Legend
          items={[
            { state: 'current',   label: tr('현재 처리 중', 'Processing') },
            { state: 'candidate', label: tr('key 갱신 대상', 'Key being updated') },
            { state: 'visited',   label: tr('MST에 포함', 'In MST') },
            { state: 'idle',      label: tr('미방문', 'Unvisited') },
            { state: 'path',      label: tr('MST 간선', 'MST edge'), kind: 'edge' },
          ]}
        />
        <p className="text-[11px] text-muted-foreground">
          {tr('노드 아래 숫자: key값 · 점선 테두리: 큐에서 대기 중', 'Number under a node: its key · dashed outline: waiting in the queue')}
        </p>
      </div>
    </div>
  );
}
