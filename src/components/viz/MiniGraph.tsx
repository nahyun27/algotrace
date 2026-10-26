import { NODE_COLORS, EDGE_COLORS, type VizState } from './palette';

export interface MiniNode {
  id: string | number;
  x: number;
  y: number;
  label: string;
  /** Small text under the node, e.g. a distance "d=3" */
  note?: string;
}

/** [from, to, weight?] */
export type MiniEdge = [string | number, string | number, (number | string)?];

interface MiniGraphProps {
  nodes: MiniNode[];
  edges: MiniEdge[];
  directed?: boolean;
  nodeState?: Record<string | number, VizState>;
  /** Keyed by "from-to" */
  edgeState?: Record<string, VizState>;
  /** viewBox size; nodes are placed in these coordinates */
  width?: number;
  height?: number;
  radius?: number;
}

/**
 * Small, static graph picture for concept explanations (storyboard frames).
 * Same colors as the main canvases, so a frame looks like a tiny version of the real page.
 */
export default function MiniGraph({
  nodes, edges, directed = false, nodeState = {}, edgeState = {}, width = 360, height = 220, radius = 20,
}: MiniGraphProps) {
  const pos = new Map(nodes.map(n => [n.id, n]));
  const markerStates: VizState[] = ['idle', 'current', 'candidate', 'visited', 'path', 'danger'];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" role="img">
      {directed && (
        <defs>
          {markerStates.map(s => (
            <marker key={s} id={`mini-arrow-${s}`} markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="9" refX={radius + 10} refY="4.5" orient="auto">
              <polygon points="0 0, 10 4.5, 0 9" style={{ fill: EDGE_COLORS[s] }} />
            </marker>
          ))}
        </defs>
      )}
      {edges.map(([u, v, w]) => {
        const a = pos.get(u), b = pos.get(v);
        if (!a || !b) return null;
        const s = edgeState[`${u}-${v}`] ?? edgeState[`${v}-${u}`] ?? 'idle';
        const active = s !== 'idle';
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        return (
          <g key={`${u}-${v}`}>
            <line
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              strokeWidth={active ? 4 : 2}
              strokeOpacity={active ? 1 : 0.45}
              markerEnd={directed ? `url(#mini-arrow-${s})` : undefined}
              style={{ stroke: EDGE_COLORS[s], transition: 'all .35s' }}
            />
            {w !== undefined && (
              <text x={mx} y={my} textAnchor="middle" dy=".35em" fontSize={14} fontWeight={800} className="font-mono"
                style={{ fill: active ? EDGE_COLORS[s] : 'var(--muted-foreground)', stroke: 'var(--card)', strokeWidth: 5, paintOrder: 'stroke' }}>
                {w}
              </text>
            )}
          </g>
        );
      })}
      {nodes.map(n => {
        const s = nodeState[n.id] ?? 'idle';
        const c = NODE_COLORS[s];
        return (
          <g key={n.id} transform={`translate(${n.x},${n.y})`}>
            {(s === 'current' || s === 'candidate') && <circle r={radius + 8} style={{ fill: c.fill }} fillOpacity={0.2} />}
            <circle r={radius} strokeWidth={2.5} style={{ fill: c.fill, stroke: c.stroke, transition: 'all .35s' }} />
            <text textAnchor="middle" dy=".35em" fontSize={15} fontWeight={800} style={{ fill: c.text }}>{n.label}</text>
            {n.note && (
              <text y={radius + 17} textAnchor="middle" fontSize={13} fontWeight={700} className="font-mono"
                style={{ fill: s === 'idle' ? 'var(--muted-foreground)' : c.stroke, stroke: 'var(--card)', strokeWidth: 4, paintOrder: 'stroke' }}>
                {n.note}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
