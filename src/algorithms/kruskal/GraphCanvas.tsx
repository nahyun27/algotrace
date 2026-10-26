import { useMemo } from 'react';
import type { KruskalStep, KruskalNode, Edge } from './types';
import { findRoot } from './types';
import Legend from '../../components/viz/Legend';
import { NODE_COLORS, EDGE_COLORS, type VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';

interface Props {
  step: KruskalStep;
  nodes: KruskalNode[];
  edges: Edge[];
}

const SVG_W = 660;
const SVG_H = 340;
const R = 26;

function edgeKey(e: Edge) { return `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`; }

export default function KruskalGraphCanvas({ step, nodes, edges }: Props) {
  const tr = useTr();
  const mstSet = useMemo(() => new Set(step.mstEdges.map(edgeKey)), [step.mstEdges]);
  const rejectedSet = useMemo(() => new Set(step.rejectedEdges.map(edgeKey)), [step.rejectedEdges]);
  const currentKey = step.currentEdge ? edgeKey(step.currentEdge) : null;

  // Size of each Union-Find set, so nodes already joined by MST edges can be shown as connected
  const setSize = useMemo(() => {
    const size = new Map<number, number>();
    nodes.forEach(n => {
      const r = findRoot(step.parent, n.id);
      size.set(r, (size.get(r) ?? 0) + 1);
    });
    return size;
  }, [step.parent, nodes]);

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

          const key = edgeKey(e);
          const state: VizState =
            mstSet.has(key) ? 'path' :
            rejectedSet.has(key) ? 'danger' :
            currentKey === key ? 'candidate' : 'idle';
          const emphasized = state !== 'idle';

          // label offset — perpendicular to edge, small nudge
          const perpX = -ny * 13;
          const perpY =  nx * 13;

          return (
            <g key={idx}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                strokeWidth={state === 'path' ? 4 : state === 'candidate' ? 3.5 : state === 'danger' ? 2 : 1.5}
                strokeDasharray={state === 'danger' ? '6,5' : undefined}
                strokeOpacity={state === 'idle' ? 0.6 : state === 'danger' ? 0.8 : 1}
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

        {nodes.map(node => {
          const root = findRoot(step.parent, node.id);
          const isEndpoint = !!step.currentEdge && (step.currentEdge.u === node.id || step.currentEdge.v === node.id);
          const joined = (setSize.get(root) ?? 1) > 1;
          const state: VizState = isEndpoint && step.type !== 'DONE' ? 'current' : joined ? 'visited' : 'idle';
          const c = NODE_COLORS[state];

          return (
            <g key={node.id} transform={`translate(${node.x},${node.y})`} className="transition-all duration-300">
              {state === 'current' && <circle r={R + 8} style={{ fill: c.fill }} fillOpacity={0.18} />}
              <circle r={R} strokeWidth={2.5} style={{ fill: c.fill, stroke: c.stroke }} className="transition-all duration-300" />
              <text textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800}
                style={{ fill: c.text, pointerEvents: 'none' }}>
                {node.id}
              </text>
              <text y={R + 15} textAnchor="middle" fontSize={11} fontWeight={600}
                style={{ fill: 'var(--muted-foreground)' }} className="font-mono">
                {tr(`루트 ${root}`, `root ${root}`)}
              </text>
            </g>
          );
        })}
      </svg>

      <Legend
        items={[
          { state: 'current',   label: tr('검토 중인 간선의 끝점', 'Endpoints of edge under review') },
          { state: 'visited',   label: tr('연결된 집합', 'Joined set') },
          { state: 'candidate', label: tr('검토 중인 간선', 'Edge under review'), kind: 'edge' },
          { state: 'path',      label: tr('MST 간선', 'MST edge'), kind: 'edge' },
          { state: 'danger',    label: tr('사이클 → 제외', 'Cycle → rejected'), kind: 'edge' },
        ]}
      />
    </div>
  );
}
