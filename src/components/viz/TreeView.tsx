import { cn } from '../ui';
import { NODE_COLORS, EDGE_COLORS, type VizState } from './palette';
import Legend, { type LegendItem } from './Legend';

export interface TreeNode {
  id: string | number;
  /** Text inside the node circle (keep it short: a value or a character) */
  label: string;
  /** Small text under the node, e.g. a segment range "[0,3]" or an index */
  sublabel?: string;
  /**
   * Children in order. `null` keeps an empty slot so binary trees keep left/right positions
   * (e.g. a node with only a right child).
   */
  children?: (TreeNode | null)[];
}

interface TreeViewProps {
  /** One tree, or several roots drawn side by side (a forest) */
  root: TreeNode | TreeNode[] | null;
  stateOf?: (id: TreeNode['id']) => VizState;
  /** State of the edge from parent to child (default: idle) */
  edgeStateOf?: (parentId: TreeNode['id'], childId: TreeNode['id']) => VizState;
  /** Text on the edge from parent to child, e.g. the character on a trie edge */
  edgeLabelOf?: (parentId: TreeNode['id'], childId: TreeNode['id']) => string | undefined;
  /** Small corner tag on a node, e.g. "A", "k", "1" */
  badgeOf?: (id: TreeNode['id']) => string | undefined;
  /** Node radius in SVG units (default 20) */
  radius?: number;
  /** Vertical space between levels in SVG units, on top of the node diameter (default 40) */
  levelGap?: number;
  legend?: LegendItem[];
  className?: string;
  /** Text shown when the tree is empty */
  emptyText?: string;
}

interface Placed {
  node: TreeNode;
  x: number;
  depth: number;
  parent: Placed | null;
}

/**
 * Lays nodes out so leaves get consecutive columns and every parent sits above the middle of
 * its children. Empty (`null`) child slots still take a column, which keeps binary trees honest.
 */
function layout(roots: TreeNode[]) {
  const placed: Placed[] = [];
  let column = 0;
  let maxDepth = 0;

  const visit = (node: TreeNode, depth: number, parent: Placed | null): number => {
    maxDepth = Math.max(maxDepth, depth);
    const entry: Placed = { node, x: 0, depth, parent };
    placed.push(entry);
    const kids = node.children ?? [];
    if (kids.length === 0 || kids.every(k => k === null)) {
      entry.x = column++;
      return entry.x;
    }
    const xs = kids.map(k => (k ? visit(k, depth + 1, entry) : column++));
    entry.x = (xs[0] + xs[xs.length - 1]) / 2;
    return entry.x;
  };

  roots.forEach((r, i) => {
    if (i > 0) column += 0.5; // a little air between trees of a forest
    visit(r, 0, null);
  });
  return { placed, columns: Math.max(column, 1), depth: maxDepth };
}

/** Generic tree drawing for heaps, segment trees, tries and rooted trees. */
export default function TreeView({
  root,
  stateOf = () => 'idle',
  edgeStateOf = () => 'idle',
  edgeLabelOf,
  badgeOf,
  radius = 20,
  levelGap = 40,
  legend,
  className,
  emptyText,
}: TreeViewProps) {
  const roots = root === null ? [] : Array.isArray(root) ? root : [root];
  const { placed, columns, depth } = layout(roots);

  const colW = radius * 2 + 18;
  const rowH = radius * 2 + levelGap;
  const pad = radius + 14;
  const width = (columns - 1) * colW + pad * 2;
  const height = depth * rowH + pad * 2 + 16;
  const X = (p: Placed) => pad + p.x * colW;
  const Y = (p: Placed) => pad + p.depth * rowH;

  return (
    <div className={cn('viz-surface w-full flex flex-col items-center justify-center gap-3 p-4 overflow-x-auto', className)}>
      {roots.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-10">{emptyText}</p>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="overflow-visible" style={{ width: Math.min(width, 900), maxWidth: '100%', height: 'auto' }}>
          {placed.filter(p => p.parent).map(p => {
            const parent = p.parent!;
            const s = edgeStateOf(parent.node.id, p.node.id);
            const label = edgeLabelOf?.(parent.node.id, p.node.id);
            const x1 = X(parent), y1 = Y(parent), x2 = X(p), y2 = Y(p);
            return (
              <g key={`e-${parent.node.id}-${p.node.id}`}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  strokeWidth={s === 'idle' ? 1.75 : 3}
                  strokeOpacity={s === 'idle' ? 0.55 : 1}
                  style={{ stroke: EDGE_COLORS[s], transition: 'all .3s' }}
                />
                {label && (
                  <text
                    x={(x1 + x2) / 2 + (x2 >= x1 ? 8 : -8)} y={(y1 + y2) / 2}
                    textAnchor="middle" dy=".35em" fontSize={13} fontWeight={700}
                    className="font-mono"
                    style={{ fill: s === 'idle' ? 'var(--muted-foreground)' : EDGE_COLORS[s], stroke: 'var(--card)', strokeWidth: 4, paintOrder: 'stroke' }}
                  >
                    {label}
                  </text>
                )}
              </g>
            );
          })}
          {placed.map(p => {
            const s = stateOf(p.node.id);
            const c = NODE_COLORS[s];
            const badge = badgeOf?.(p.node.id);
            return (
              <g key={`n-${p.node.id}`} transform={`translate(${X(p)},${Y(p)})`} style={{ transition: 'transform .3s' }}>
                {(s === 'current' || s === 'candidate') && (
                  <circle r={radius + 7} style={{ fill: c.fill }} fillOpacity={0.18} />
                )}
                <circle r={radius} strokeWidth={2.5} style={{ fill: c.fill, stroke: c.stroke, transition: 'all .3s' }} />
                <text textAnchor="middle" dy=".35em" fontSize={p.node.label.length > 3 ? 11 : 14} fontWeight={800} className="font-mono" style={{ fill: c.text }}>
                  {p.node.label}
                </text>
                {p.node.sublabel && (
                  <text y={radius + 14} textAnchor="middle" fontSize={11} fontWeight={600} className="font-mono"
                    style={{ fill: 'var(--muted-foreground)', stroke: 'var(--card)', strokeWidth: 3, paintOrder: 'stroke' }}>
                    {p.node.sublabel}
                  </text>
                )}
                {badge && (
                  <g transform={`translate(${radius * 0.75},${-radius * 0.75})`}>
                    <circle r={8} strokeWidth={1.5} style={{ fill: 'var(--card)', stroke: c.stroke }} />
                    <text textAnchor="middle" dy=".35em" fontSize={10} fontWeight={800} style={{ fill: c.stroke }}>{badge}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      )}
      {legend && <Legend items={legend} />}
    </div>
  );
}
