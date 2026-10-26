import { useState } from 'react';
import type { JSX } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { KruskalStep } from './types';
import { findRoot } from './types';
import { Badge, Panel, SegmentedControl, cn, type Tone } from '../../components/ui';
import { toneSoft, toneText } from '../../components/ui/tone';
import Legend from '../../components/viz/Legend';
import { NODE_COLORS, EDGE_COLORS, type VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';

interface Props {
  step: KruskalStep;
  N: number;
}

type ViewTab = 'tree' | 'array';

// Build parent→children map from raw parent array (post-compression)
function buildChildren(parent: number[], N: number): Map<number, number[]> {
  const map = new Map<number, number[]>();
  for (let i = 0; i < N; i++) {
    if (parent[i] === i) map.set(i, []);
  }
  for (let i = 0; i < N; i++) {
    if (parent[i] !== i) {
      const p = parent[i];
      if (!map.has(p)) map.set(p, []);
      map.get(p)!.push(i);
    }
  }
  return map;
}

/** Roots returned by the current Find, if any */
function findRoots(step: KruskalStep): Set<number> {
  const s = new Set<number>();
  if (step.findResult && step.currentEdge) {
    s.add(findRoot(step.parent, step.currentEdge.u));
    s.add(findRoot(step.parent, step.currentEdge.v));
  }
  return s;
}

// SVG Tree view
const TREE_SVG_W = 560;
const TREE_SVG_H = 160;
const NR = 18;

function TreeView({ step, N }: { step: KruskalStep; N: number }) {
  const tr = useTr();
  const { parent, rank } = step;
  const children = buildChildren(parent, N);
  const roots = Array.from(children.keys()).sort((a, b) => a - b);
  const sectionW = TREE_SVG_W / Math.max(roots.length, 1);
  const highlighted = findRoots(step);
  const hlState: VizState = step.type === 'REJECT' ? 'danger' : 'candidate';

  // Compute node positions
  const positions = new Map<number, { x: number; y: number }>();
  roots.forEach((root, idx) => {
    const cx = idx * sectionW + sectionW / 2;
    positions.set(root, { x: cx, y: 36 });
    const ch = children.get(root) ?? [];
    ch.forEach((child, ci) => {
      const childX = ch.length === 1 ? cx : idx * sectionW + ((ci + 0.5) * sectionW / ch.length);
      positions.set(child, { x: childX, y: 120 });
    });
  });

  // Draw lines first, then nodes
  const lines: JSX.Element[] = [];
  for (let i = 0; i < N; i++) {
    if (parent[i] !== i) {
      const from = positions.get(parent[i]);
      const to   = positions.get(i);
      if (from && to) {
        lines.push(
          <line key={`line-${i}`}
            x1={from.x} y1={from.y + NR} x2={to.x} y2={to.y - NR}
            strokeWidth={2} style={{ stroke: EDGE_COLORS.visited }} strokeOpacity={0.7}
          />,
        );
      }
    }
  }

  const nodeEls = Array.from({ length: N }, (_, i) => {
    const pos = positions.get(i);
    if (!pos) return null;
    const isRoot = parent[i] === i;
    const inSet = !isRoot || (children.get(i)?.length ?? 0) > 0;
    const isHl = highlighted.has(i);
    const state: VizState = isHl ? hlState : inSet ? 'visited' : 'idle';
    const c = NODE_COLORS[state];

    return (
      <g key={i}>
        <motion.circle
          cx={pos.x} cy={pos.y} r={NR}
          strokeWidth={isRoot ? 2.5 : 1.5}
          style={{ fill: c.fill, stroke: c.stroke }}
          initial={false}
          animate={{ r: isHl ? NR + 2 : NR }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
        <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
          fontSize={13} fontWeight={800} style={{ fill: c.text }}>
          {i}
        </text>
        {isRoot && (
          <text x={pos.x} y={pos.y + NR + 13} textAnchor="middle"
            fontSize={11} fontWeight={600} style={{ fill: 'var(--muted-foreground)' }} className="font-mono">
            rank={rank[i]}
          </text>
        )}
      </g>
    );
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${TREE_SVG_W} ${TREE_SVG_H}`} className="w-full" style={{ maxHeight: 160 }}>
          {lines}
          {nodeEls}
        </svg>
      </div>
      <Legend
        items={[
          { state: hlState, label: tr('Find 결과 루트', 'Roots found by Find') },
          { state: 'visited', label: tr('합쳐진 집합', 'Merged set') },
          { state: 'idle', label: tr('단독 집합', 'Singleton set') },
        ]}
      />
    </div>
  );
}

// Array view: parent[] and rank[] table
function ArrayView({ step, N }: { step: KruskalStep; N: number }) {
  const tr = useTr();
  const { parent, rank } = step;
  // Highlight the child whose parent just changed in a union
  const changedNodes = new Set<number>();
  if (step.type === 'ACCEPT' && step.findResult) {
    const { ru, rv } = step.findResult;
    for (let i = 0; i < N; i++) {
      if (parent[i] === ru && i !== ru) changedNodes.add(i);
      if (parent[i] === rv && i !== rv) changedNodes.add(i);
    }
  }
  // Also highlight nodes involved in the current find
  const findNodes = new Set<number>();
  if (step.currentEdge) {
    findNodes.add(step.currentEdge.u);
    findNodes.add(step.currentEdge.v);
  }

  const nodes = Array.from({ length: N }, (_, i) => i);

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <td className="py-1 px-2 text-muted-foreground font-semibold text-right w-16">{tr('노드', 'Node')}</td>
              {nodes.map(i => (
                <td key={i} className={cn('py-1 px-2 text-center font-mono font-bold w-10 text-sm', findNodes.has(i) ? toneText.current : 'text-foreground')}>{i}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="py-1.5 px-2 text-muted-foreground font-semibold text-right">parent</td>
              {nodes.map(i => {
                const isRoot = parent[i] === i;
                const isChanged = changedNodes.has(i);
                return (
                  <td key={i} className="py-1.5 px-1 text-center">
                    <motion.div
                      key={`parent-${i}-${parent[i]}`}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className={cn(
                        'rounded-lg font-mono font-bold text-sm py-1',
                        isChanged ? `${toneSoft.candidate} ring-2 ring-state-candidate/50` : isRoot ? toneSoft.visited : 'bg-muted text-foreground',
                      )}
                    >
                      {parent[i]}
                    </motion.div>
                  </td>
                );
              })}
            </tr>
            <tr className="border-t border-border">
              <td className="py-1.5 px-2 text-muted-foreground font-semibold text-right">rank</td>
              {nodes.map(i => (
                <td key={i} className="py-1.5 px-1 text-center">
                  <div className={cn('rounded-lg font-mono text-sm py-1', rank[i] > 0 ? `${toneSoft.primary} font-bold` : 'text-muted-foreground')}>
                    {rank[i]}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex gap-3 text-[11px] font-medium text-muted-foreground px-1 flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[4px] bg-state-visited/30 inline-block" />{tr('루트 (자기 자신)', 'Root (points to itself)')}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[4px] bg-state-candidate/40 inline-block" />{tr('방금 변경', 'Just changed')}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[4px] bg-primary-soft border border-primary/30 inline-block" />rank &gt; 0</span>
      </div>
    </div>
  );
}

const FIND_TONE: Partial<Record<KruskalStep['type'], Tone>> = {
  REJECT: 'danger',
  ACCEPT: 'visited',
};

export default function UnionFindDisplay({ step, N }: Props) {
  const tr = useTr();
  const [view, setView] = useState<ViewTab>('tree');

  // Count disjoint sets
  const numSets = step.parent.filter((p, i) => p === i).length;
  const findTone: Tone = FIND_TONE[step.type] ?? 'current';

  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          {tr('Union-Find 상태', 'Union-Find state')}
          <Badge tone="primary">{tr(`${numSets}개 집합`, `${numSets} ${numSets === 1 ? 'set' : 'sets'}`)}</Badge>
        </span>
      }
      actions={
        <SegmentedControl
          id="kruskal-uf-view"
          value={view}
          onChange={setView}
          options={[
            { value: 'tree', label: tr('트리 뷰', 'Tree') },
            { value: 'array', label: tr('배열 뷰', 'Array') },
          ]}
        />
      }
      className="h-full flex flex-col"
      bodyClassName="flex-1 min-h-0 flex flex-col"
    >
      {/* Find result info */}
      {step.findResult && step.type !== 'DONE' && (
        <div className={cn('px-4 py-2 text-xs font-semibold border-b border-border shrink-0 font-mono', toneSoft[findTone])}>
          Find({step.currentEdge?.u}) = {step.findResult.ru} &nbsp;|&nbsp; Find({step.currentEdge?.v}) = {step.findResult.rv}
          <span className="font-sans">
            {step.findResult.ru === step.findResult.rv
              ? tr(' → 같은 집합 ❌', ' → same set ❌')
              : tr(' → 다른 집합 ✓', ' → different sets ✓')}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-auto p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {view === 'tree' ? <TreeView step={step} N={N} /> : <ArrayView step={step} N={N} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Panel>
  );
}
