import { useMemo } from 'react';
import TreeView, { type TreeNode } from '../../components/viz/TreeView';
import DPGrid from '../../components/viz/DPGrid';
import type { VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';
import { buildAdjacency } from './solver';
import type { LCAStep, TreeInput } from './types';

const QUERY_TYPES = new Set(['QUERY', 'LIFT', 'JUMP_BOTH', 'SKIP_JUMP', 'FOUND', 'DONE']);
const isQueryStep = (s: LCAStep) => QUERY_TYPES.has(s.type);

/** Parent of every node when the tree is rooted at 1 (parent[1] = 1). */
function parentsOf(tree: TreeInput): number[] {
  const graph = buildAdjacency(tree);
  const parent = Array(tree.n + 1).fill(0);
  parent[1] = 1;
  const queue = [1];
  while (queue.length) {
    const x = queue.shift()!;
    for (const y of graph[x]) if (parent[y] === 0) { parent[y] = x; queue.push(y); }
  }
  return parent;
}

/** Rooted TreeNode for TreeView, children in ascending order, depth as the sublabel once known. */
function toTreeNode(tree: TreeInput, depth: (number | null)[]): TreeNode {
  const graph = buildAdjacency(tree);
  const build = (x: number, p: number): TreeNode => ({
    id: x,
    label: String(x),
    sublabel: depth[x] === null ? undefined : `d=${depth[x]}`,
    children: graph[x].filter(y => y !== p).sort((a, b) => a - b).map(y => build(y, x)),
  });
  return build(1, 0);
}

const edgeKey = (p: number, c: number) => `${p}-${c}`;

/** Tree edges walked from `from` up to its ancestor `to`. */
function climb(parent: number[], from: number, to: number): string[] {
  const out: string[] = [];
  for (let x = from; x !== to && parent[x] !== x; x = parent[x]) out.push(edgeKey(parent[x], x));
  return out;
}

/** Edges climbed by u and v in one step (LIFT, JUMP_BOTH), from the table cells the step read. */
function stepClimb(step: LCAStep, parent: number[]): string[] {
  if (step.type === 'LIFT') return climb(parent, step.deps[0][1], step.u!);
  if (step.type === 'JUMP_BOTH') return [...climb(parent, step.deps[0][1], step.u!), ...climb(parent, step.deps[1][1], step.v!)];
  return [];
}

interface Props {
  tree: TreeInput;
  steps: LCAStep[];
  index: number;
  query: { u: number; v: number };
}

export function LCATree({ tree, steps, index, query }: Props) {
  const tr = useTr();
  const step = steps[index];
  const parent = useMemo(() => parentsOf(tree), [tree]);
  const root = useMemo(() => toTreeNode(tree, step.depth), [tree, step.depth]);
  const inQuery = isQueryStep(step);
  const done = step.type === 'FOUND' || step.type === 'DONE';

  const { walked, now, answer } = useMemo(() => {
    const walkedSet = new Set<string>();
    for (let i = 0; i < index; i++) for (const e of stepClimb(steps[i], parent)) walkedSet.add(e);
    const answerSet = new Set<string>();
    if (step.lca !== null) for (const e of [...climb(parent, query.u, step.lca), ...climb(parent, query.v, step.lca)]) answerSet.add(e);
    return { walked: walkedSet, now: new Set(stepClimb(steps[index], parent)), answer: answerSet };
  }, [steps, index, parent, query, step.lca]);

  const stateOf = (raw: TreeNode['id']): VizState => {
    const id = Number(raw);
    if (done && id === step.lca) return 'path';
    if (inQuery) {
      if (id === step.u || id === step.v) return 'current';
      if (step.candidates.includes(id)) return 'candidate';
      if (done && (id === query.u || id === query.v)) return 'visited';
      return step.trail.includes(id) ? 'visited' : 'idle';
    }
    if (id === step.dfsNode) return 'current';
    if (step.candidates.includes(id)) return 'candidate';
    return step.type === 'DFS_VISIT' && step.depth[id] !== null ? 'visited' : 'idle';
  };

  const edgeStateOf = (p: TreeNode['id'], c: TreeNode['id']): VizState => {
    const k = edgeKey(Number(p), Number(c));
    if (done) return answer.has(k) ? 'path' : 'idle';
    if (now.has(k)) return 'current';
    if (walked.has(k)) return 'visited';
    if (step.type === 'DFS_VISIT' && Number(c) === step.dfsNode) return 'current';
    if (step.type === 'DFS_VISIT' && step.depth[Number(c)] !== null) return 'visited';
    return 'idle';
  };

  const badgeOf = (raw: TreeNode['id']) => {
    if (!inQuery) return undefined;
    const id = Number(raw);
    if (id === step.u && id === step.v) return 'uv';
    if (id === step.u) return 'u';
    if (id === step.v) return 'v';
    return undefined;
  };

  return (
    <TreeView
      root={root}
      stateOf={stateOf}
      edgeStateOf={edgeStateOf}
      badgeOf={badgeOf}
      radius={18}
      legend={inQuery ? [
        { state: 'current', label: tr('지금 u, v 위치', 'Where u and v are') },
        { state: 'candidate', label: tr('검토 중인 2^k번째 조상', '2^k-th ancestor being checked') },
        { state: 'visited', label: tr('지나온 노드', 'Climbed past') },
        { state: 'path', label: 'LCA' },
      ] : step.type === 'TABLE_FILL' ? [
        { state: 'current', label: 'v' },
        { state: 'candidate', label: tr('2^(k-1)칸, 2^k칸 위 조상', 'Ancestors 2^(k-1) and 2^k above') },
      ] : [
        { state: 'current', label: tr('방문 중인 노드', 'Node being visited') },
        { state: 'candidate', label: tr('부모', 'Parent') },
        { state: 'visited', label: tr('방문함', 'Visited') },
      ]}
    />
  );
}

export function UpTable({ step }: { step: LCAStep }) {
  const tr = useTr();
  const n = step.depth.length - 1;
  const inQuery = isQueryStep(step);
  const looked = (k: number, c: number) => step.deps.some(([dk, dv]) => dk === k && dv === c + 1);

  const cellState = (k: number, c: number): VizState => {
    if (inQuery) {
      if (looked(k, c)) return step.type === 'FOUND' ? 'path' : step.type === 'SKIP_JUMP' ? 'candidate' : 'current';
      return 'idle';
    }
    if (step.fillCell && step.fillCell[0] === k && step.fillCell[1] === c + 1) return 'current';
    return step.up[k][c + 1] !== null ? 'visited' : 'idle';
  };

  return (
    <DPGrid
      title={tr('조상 표 up[k][v]: v의 2^k번째 조상', 'Ancestor table up[k][v]: the 2^k-th ancestor of v')}
      corner="k \ v"
      rowLabels={step.up.map((_, k) => (
        <span className="whitespace-nowrap">{k} <span className="text-hint">({1 << k})</span></span>
      ))}
      colLabels={Array.from({ length: n }, (_, i) => i + 1)}
      values={step.up.map(row => row.slice(1))}
      cellState={cellState}
      deps={step.type === 'TABLE_FILL' ? step.deps.map(([k, v]) => [k, v - 1] as [number, number]) : []}
      rowState={k => (step.k === k || step.fillCell?.[0] === k ? 'current' : undefined)}
    />
  );
}
