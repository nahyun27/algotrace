import type { ReactNode } from 'react';
import ArrayView, { type ArrayPointer } from '../../components/viz/ArrayView';
import Legend from '../../components/viz/Legend';
import type { VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';
import type { FastStep, QuadStep } from './types';

function Row({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="border-b border-border">
      <div className="flex items-baseline gap-2 px-4 sm:px-5 pt-3">
        <span className="text-xs font-bold font-mono text-foreground">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const showDash = (v: number) => (v === -1 ? '-' : v);

/* ─────────────── O(n²) DP ─────────────── */

export function QuadraticView({ step, a }: { step: QuadStep; a: number[] }) {
  const tr = useTr();
  const { i, j, k, lis } = step;
  const looping = i >= 0;
  const finished = step.type === 'BACKTRACK' || step.type === 'DONE';
  const range: [number, number] | null = looping ? [0, i] : null;

  const inputState = (idx: number): VizState => {
    if (lis.includes(idx)) return 'path';
    if (idx === i) return 'current';
    if (idx === j) return 'candidate';
    return 'idle';
  };
  const tableState = (idx: number): VizState => {
    if (lis.includes(idx)) return 'path';
    if (idx === i) return 'current';
    if (idx === j) return 'candidate';
    if ((looping && idx < i) || finished) return 'visited';
    return 'idle';
  };

  const pointers: ArrayPointer[] = [];
  if (i >= 0) pointers.push({ index: i, label: 'i', tone: 'current' });
  if (j >= 0) pointers.push({ index: j, label: 'j', tone: 'candidate' });
  if (k >= 0) pointers.push({ index: k, label: 'k', tone: 'path' });

  return (
    <div className="flex flex-col">
      <Row label="a[i]" hint={tr('입력 수열', 'input')}>
        <ArrayView values={a} variant="cells" stateOf={inputState} pointers={pointers} range={range} />
      </Row>
      <Row label="dp[i]" hint={tr('a[i]로 끝나는 LIS 길이', 'LIS length ending at a[i]')}>
        <ArrayView values={step.dp} variant="cells" stateOf={tableState} range={range} showIndices={false} />
      </Row>
      <Row label="prev[i]" hint={tr('바로 앞 원소의 인덱스', 'index of the previous element')}>
        <ArrayView values={step.prev.map(showDash)} variant="cells" stateOf={tableState} range={range} showIndices={false} />
      </Row>
      <Legend
        className="px-3 py-3"
        items={[
          { state: 'current', label: tr('i (계산 중)', 'i (computing)'), kind: 'cell' },
          { state: 'candidate', label: tr('j (앞 원소 후보)', 'j (candidate predecessor)'), kind: 'cell' },
          { state: 'visited', label: tr('계산 완료', 'Computed'), kind: 'cell' },
          { state: 'path', label: 'LIS', kind: 'cell' },
        ]}
      />
    </div>
  );
}

/* ─────────────── O(n log n) tails + binary search ─────────────── */

export function FastView({ step, a }: { step: FastStep; a: number[] }) {
  const tr = useTr();
  const n = a.length;
  const { i, k, lis, lo, hi, mid, pos, tails } = step;
  const searching = step.type === 'SEARCH';
  const writing = step.type === 'APPEND' || step.type === 'REPLACE';
  const parentOfI = writing ? step.parent[i] : -1;

  const inputState = (idx: number): VizState => {
    if (lis.includes(idx)) return 'path';
    if (idx === i) return 'current';
    if (idx === parentOfI) return 'candidate';
    return 'idle';
  };
  const slot = (arr: number[]) => Array.from({ length: n }, (_, s) => (s < arr.length ? arr[s] : ''));
  const tailsState = (s: number): VizState => {
    if (searching && s === mid) return 'candidate';
    if (writing && s === pos) return 'current';
    if (s < tails.length) return 'visited';
    return 'idle';
  };
  const parentState = (idx: number): VizState => {
    if (lis.includes(idx)) return 'path';
    if (idx === i) return writing ? 'current' : 'idle';
    if (i >= 0 ? idx < i : step.type !== 'INIT') return 'visited';
    return 'idle';
  };

  const inputPointers: ArrayPointer[] = [];
  if (i >= 0) inputPointers.push({ index: i, label: 'i', tone: 'current' });
  if (k >= 0) inputPointers.push({ index: k, label: 'k', tone: 'path' });

  const tailPointers: ArrayPointer[] = [];
  if (searching) {
    tailPointers.push({ index: lo, label: 'lo', tone: 'current' });
    if (mid >= 0) tailPointers.push({ index: mid, label: 'mid', tone: 'candidate' });
    tailPointers.push({ index: hi, label: 'hi', tone: 'current' });
  } else if (writing) {
    tailPointers.push({ index: pos, label: 'lo', tone: 'current' });
  }

  const inputRange: [number, number] | null = i >= 0 ? [0, i] : null;
  const tailsRange: [number, number] | null = searching ? [lo, hi] : null;

  return (
    <div className="flex flex-col">
      <Row label="a[i]" hint={tr('입력 수열', 'input')}>
        <ArrayView values={a} variant="cells" stateOf={inputState} pointers={inputPointers} range={inputRange} />
      </Row>
      <Row label="tails[k]" hint={tr('길이 k+1인 증가 수열의 가장 작은 끝값 (LIS 자체가 아님)', 'smallest tail of a length-(k+1) increasing subsequence (not the LIS itself)')}>
        <ArrayView values={slot(tails)} variant="cells" stateOf={tailsState} pointers={tailPointers} range={tailsRange} />
      </Row>
      <Row label="tails_idx[k]" hint={tr('tails[k]가 입력의 몇 번째 원소인지', 'input index of tails[k]')}>
        <ArrayView values={slot(step.tailsIdx)} variant="cells" stateOf={tailsState} range={tailsRange} showIndices={false} />
      </Row>
      <Row label="parent[i]" hint={tr('복원용: 바로 앞 원소의 인덱스', 'for reconstruction: index of the previous element')}>
        <ArrayView values={step.parent.map(showDash)} variant="cells" stateOf={parentState} range={inputRange} showIndices={false} />
      </Row>
      <Legend
        className="px-3 py-3"
        items={[
          { state: 'current', label: tr('현재 원소 / 쓰는 칸', 'Current element / slot written'), kind: 'cell' },
          { state: 'candidate', label: tr('mid 비교 / parent', 'mid probe / parent'), kind: 'cell' },
          { state: 'visited', label: tr('채워진 값', 'Filled'), kind: 'cell' },
          { state: 'path', label: 'LIS', kind: 'cell' },
        ]}
      />
    </div>
  );
}
