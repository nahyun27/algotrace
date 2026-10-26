import { useMemo } from 'react';
import TreeView, { type TreeNode } from '../../components/viz/TreeView';
import ArrayView, { type ArrayPointer } from '../../components/viz/ArrayView';
import type { LegendItem } from '../../components/viz/Legend';
import type { VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';
import { segShape } from './solver';
import type { Operation, SegInput, SegShape, SegStep } from './types';

const toTree = (s: SegShape, step: SegStep): TreeNode => ({
  id: s.id,
  label: step.tree[s.id] === null ? '?' : String(step.tree[s.id]),
  sublabel: s.start === s.end ? `[${s.start}]` : `[${s.start},${s.end}]`,
  children: s.left && s.right ? [toTree(s.left, step), toTree(s.right, step)] : undefined,
});

export default function SegTreeCanvas({ step, op, input }: { step: SegStep; op: Operation; input: SegInput }) {
  const tr = useTr();
  const n = step.arr.length;
  const spans = useMemo(() => {
    const map = new Map<number, [number, number]>();
    const walk = (s: SegShape | null) => {
      if (!s) return;
      map.set(s.id, [s.start, s.end]);
      walk(s.left);
      walk(s.right);
    };
    const shape = segShape(n);
    walk(shape);
    return { shape, map };
  }, [n]);

  const building = step.type === 'BUILD';
  const done = step.type === 'DONE';

  const nodeState = (id: TreeNode['id']): VizState => {
    const k = Number(id);
    if (k === step.node) return 'current';
    if (building) return step.tree[k] === null ? 'idle' : 'visited';
    switch (step.marks[k]) {
      case 'full': return 'path';
      case 'partial': return 'candidate';
      case 'visit': return 'candidate';
      case 'updated': return done ? 'path' : 'visited';
      default: return 'idle';
    }
  };

  const fullCover = (i: number) =>
    Object.entries(step.marks).some(([id, m]) => {
      if (m !== 'full') return false;
      const [s, e] = spans.map.get(Number(id))!;
      return s <= i && i <= e;
    });
  const inCurrent = (i: number) => !!step.span && step.node !== null && step.span[0] <= i && i <= step.span[1];

  const cellState = (i: number): VizState => {
    if (building) return inCurrent(i) ? 'current' : 'idle';
    if (op === 'query') {
      if (fullCover(i)) return 'path';
      return inCurrent(i) ? 'current' : 'idle';
    }
    if (i !== input.idx) return 'idle';
    if (done) return 'path';
    return Object.values(step.marks).includes('updated') ? 'visited' : 'current';
  };

  const pointers: ArrayPointer[] = building
    ? []
    : op === 'query'
      ? input.l === input.r
        ? [{ index: input.l, label: 'l = r', tone: 'candidate' }]
        : [{ index: input.l, label: 'l', tone: 'candidate' }, { index: input.r, label: 'r', tone: 'candidate' }]
      : [{ index: input.idx, label: 'idx', tone: 'current' }];

  const legend: LegendItem[] = building
    ? [
      { state: 'current', label: tr('지금 계산하는 노드', 'Node being computed') },
      { state: 'visited', label: tr('계산 완료', 'Computed') },
      { state: 'idle', label: tr('아직 비어 있음', 'Not built yet') },
    ]
    : op === 'query'
      ? [
        { state: 'current', label: tr('지금 노드', 'Current node') },
        { state: 'path', label: tr('완전히 포함 (답에 더함)', 'Fully inside (added)') },
        { state: 'candidate', label: tr('일부만 겹침 (나눔)', 'Partial overlap (split)') },
        { state: 'idle', label: tr('범위 밖 (흐리게)', 'Outside (faded)') },
      ]
      : [
        { state: 'current', label: tr('지금 노드', 'Current node') },
        { state: 'candidate', label: tr('idx를 포함하는 경로', 'Path containing idx') },
        { state: 'visited', label: tr('다시 계산됨', 'Recomputed') },
        { state: 'idle', label: tr('바뀌지 않음 (흐리게)', 'Unchanged (faded)') },
      ];

  return (
    <div className="flex flex-col">
      <TreeView
        root={toTree(spans.shape, step)}
        stateOf={nodeState}
        fadedOf={id => !building && step.marks[Number(id)] === 'outside'}
        radius={n > 8 ? 19 : 21}
        legend={legend}
        className="min-h-[300px]"
      />
      <div className="border-t border-border">
        <ArrayView
          values={step.arr}
          variant="cells"
          compact={n > 8}
          stateOf={cellState}
          pointers={pointers}
          range={!building && op === 'query' ? [input.l, input.r] : null}
        />
      </div>
    </div>
  );
}
