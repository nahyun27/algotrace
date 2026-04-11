import { useState } from 'react';
import type { JSX } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { KruskalStep } from './types';
import { findRoot } from './types';

interface Props {
  step: KruskalStep;
  N: number;
}

type ViewTab = 'tree' | 'array';

// 6 component colors
const COMP_FILL   = ['#dbeafe','#dcfce7','#fef3c7','#ede9fe','#fee2e2','#fce7f3'];
const COMP_STROKE = ['#3b82f6','#22c55e','#f59e0b','#8b5cf6','#ef4444','#ec4899'];
const COMP_TEXT   = ['#1e40af','#166534','#92400e','#4c1d95','#7f1d1d','#831843'];

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

// SVG Tree view
const TREE_SVG_W = 560;
const TREE_SVG_H = 150;
const NR = 18;

function TreeView({ step, N }: { step: KruskalStep; N: number }) {
  const { parent, rank } = step;
  const children = buildChildren(parent, N);
  const roots = Array.from(children.keys()).sort((a, b) => a - b);
  const numRoots = roots.length;
  const sectionW = TREE_SVG_W / Math.max(numRoots, 1);

  // Compute node positions
  const positions = new Map<number, { x: number; y: number }>();
  roots.forEach((root, idx) => {
    const cx = idx * sectionW + sectionW / 2;
    positions.set(root, { x: cx, y: 36 });
    const ch = children.get(root) ?? [];
    ch.forEach((child, ci) => {
      const childX = ch.length === 1
        ? cx
        : idx * sectionW + ((ci + 0.5) * sectionW / ch.length);
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
            stroke="#d1d5db" strokeWidth={1.5}
          />
        );
      }
    }
  }

  const nodeEls = Array.from({ length: N }, (_, i) => {
    const pos = positions.get(i);
    if (!pos) return null;
    const root = findRoot(parent, i);
    const ci = root % COMP_FILL.length;
    const isRoot = parent[i] === i;
    const isInFindResult = step.findResult &&
      (findRoot(parent, step.currentEdge?.u ?? -1) === i ||
       findRoot(parent, step.currentEdge?.v ?? -1) === i);

    return (
      <g key={i}>
        <motion.circle
          cx={pos.x} cy={pos.y} r={NR}
          fill={COMP_FILL[ci]}
          stroke={isInFindResult ? '#f97316' : COMP_STROKE[ci]}
          strokeWidth={isRoot ? 2.5 : 1.5}
          animate={{ r: isInFindResult ? NR + 2 : NR }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
        <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
          fontSize={11} fontWeight="700" fill={COMP_TEXT[ci]}>
          {i}
        </text>
        {isRoot && (
          <text x={pos.x} y={pos.y + NR + 10} textAnchor="middle"
            fontSize={8} fill="#6b7280" fontWeight="600">
            rank={rank[i]}
          </text>
        )}
      </g>
    );
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${TREE_SVG_W} ${TREE_SVG_H}`} className="w-full" style={{ maxHeight: 150 }}>
        {lines}
        {nodeEls}
      </svg>
    </div>
  );
}

// Array view: parent[] and rank[] table
function ArrayView({ step, N }: { step: KruskalStep; N: number }) {
  const { parent, rank } = step;
  // Determine which cells changed by comparing with implied "previous" — highlight cells
  // where parent[i] !== i (not root) to show unions
  const changedNodes = new Set<number>();
  if (step.type === 'ACCEPT' && step.findResult) {
    const { ru, rv } = step.findResult;
    // The child in the union (the one whose parent changed)
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
    <div className="overflow-x-auto w-full">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <td className="py-1 px-2 text-muted-foreground font-semibold text-right w-16">노드</td>
            {nodes.map(i => (
              <td key={i} className={`py-1 px-2 text-center font-mono font-bold w-10 ${
                findNodes.has(i) ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'
              }`}>{i}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="py-1.5 px-2 text-muted-foreground font-semibold text-right">parent</td>
            {nodes.map(i => {
              const isRoot = parent[i] === i;
              const isChanged = changedNodes.has(i);
              return (
                <td key={i} className="py-1.5 px-2 text-center">
                  <motion.div
                    key={`parent-${i}-${parent[i]}`}
                    initial={{ scale: 1.3, backgroundColor: isChanged ? '#fef9c3' : 'transparent' }}
                    animate={{ scale: 1, backgroundColor: 'transparent' }}
                    transition={{ duration: 0.4 }}
                    className={`rounded font-mono font-bold text-xs py-1 ${
                      isRoot
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : isChanged
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          : 'bg-muted/60 text-foreground'
                    }`}
                  >
                    {parent[i]}
                  </motion.div>
                </td>
              );
            })}
          </tr>
          <tr className="border-t">
            <td className="py-1.5 px-2 text-muted-foreground font-semibold text-right">rank</td>
            {nodes.map(i => (
              <td key={i} className="py-1.5 px-2 text-center">
                <div className={`rounded font-mono text-xs py-1 ${
                  rank[i] > 0
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-bold'
                    : 'text-muted-foreground'
                }`}>
                  {rank[i]}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground px-1 flex-wrap">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-800 inline-block" />루트 (자기 자신)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-200 dark:bg-amber-800 inline-block" />방금 변경</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-violet-200 dark:bg-violet-800 inline-block" />rank &gt; 0</span>
      </div>
    </div>
  );
}

export default function UnionFindDisplay({ step, N }: Props) {
  const [view, setView] = useState<ViewTab>('tree');

  // Count disjoint sets
  const numSets = step.parent.filter((p, i) => p === i).length;

  return (
    <div className="bg-card rounded-xl border shadow-sm flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="p-3 border-b bg-muted/30 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Union-Find 상태</h3>
          <span className="text-[10px] bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full font-semibold">
            {numSets}개 집합
          </span>
        </div>
        <div className="flex gap-1 bg-muted/40 rounded-lg p-0.5">
          {(['tree', 'array'] as ViewTab[]).map(t => (
            <button
              key={t}
              onClick={() => setView(t)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                view === t
                  ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'tree' ? '트리 뷰' : '배열 뷰'}
            </button>
          ))}
        </div>
      </div>

      {/* Find result info */}
      {step.findResult && step.type !== 'DONE' && (
        <div className={`px-3 py-2 text-xs font-semibold border-b shrink-0 ${
          step.type === 'REJECT'
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            : step.type === 'ACCEPT'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
        }`}>
          Find({step.currentEdge?.u}) = {step.findResult.ru} &nbsp;|&nbsp;
          Find({step.currentEdge?.v}) = {step.findResult.rv}
          {step.findResult.ru === step.findResult.rv
            ? ' → 같은 집합 ❌'
            : ' → 다른 집합 ✓'}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {view === 'tree'
              ? <TreeView step={step} N={N} />
              : <ArrayView step={step} N={N} />
            }
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
