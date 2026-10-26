import { makeTr, type Lang } from '../../i18n';
import type { HeapOp, HeapOpKind, HeapStep } from './types';

/**
 * Binary heap step generators. The heap lives in an array: the children of index i are 2i+1 and 2i+2,
 * its parent is (i-1)//2. `isMax` flips every comparison (min-heap by default).
 *
 * codeLine keys (see CodeViewer): 1 build INIT, 2 insert INIT, 3 extract INIT,
 * 10 sift-down COMPARE, 14 first COMPARE of a build iteration, 11 sift-down SWAP, 12 sift-down SETTLE,
 * 20 sift-up COMPARE, 21 sift-up SWAP, 22 sift-up SETTLE (parent is fine), 23 sift-up SETTLE (reached the root),
 * 30 APPEND, 40 REMOVE_ROOT, 41 MOVE_LAST, 50/51/52 DONE (build/insert/extract), 53 DONE (extract on an empty heap).
 */

type Tr = ReturnType<typeof makeTr>;

interface Ctx {
  op: HeapOpKind;
  heap: number[];
  isMax: boolean;
  tr: Tr;
  steps: HeapStep[];
  compares: number;
  swaps: number;
  extracted: number | null;
}

const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from) }, (_, k) => from + k);

function push(ctx: Ctx, s: Partial<HeapStep> & Pick<HeapStep, 'type' | 'description' | 'codeLine'>) {
  ctx.steps.push({
    op: ctx.op,
    heap: [...ctx.heap],
    current: null,
    compare: [],
    swapped: null,
    settled: [],
    removed: null,
    extracted: ctx.extracted,
    compares: ctx.compares,
    swaps: ctx.swaps,
    ...s,
  });
}

/** true when a should sit above b */
const above = (isMax: boolean, a: number, b: number) => (isMax ? a > b : a < b);

function words(ctx: Ctx) {
  const { tr, isMax } = ctx;
  return {
    best: isMax ? tr('가장 큰', 'largest') : tr('가장 작은', 'smallest'),
    root: isMax ? tr('최댓값', 'the maximum') : tr('최솟값', 'the minimum'),
  };
}

/**
 * Sift heap[i] down. `settledOf()` gives the indices to paint as settled while this runs
 * (build: every subtree already fixed). `firstLine` lets build highlight its loop on the first compare.
 */
function siftDown(ctx: Ctx, start: number, settledOf: () => number[], firstLine = 10) {
  const { heap, tr, isMax } = ctx;
  const n = heap.length;
  let i = start;
  let first = true;
  for (;;) {
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    if (l >= n) {
      push(ctx, {
        type: 'SETTLE', current: i, settled: settledOf(), codeLine: 12,
        description: tr(
          `인덱스 ${i}(값 ${heap[i]})는 자식이 없는 리프예요. 여기서 내려가기를 멈춰요.`,
          `Index ${i} (value ${heap[i]}) is a leaf with no children, so sifting down stops here.`,
        ),
      });
      return;
    }
    let best = i;
    if (above(isMax, heap[l], heap[best])) best = l;
    if (r < n && above(isMax, heap[r], heap[best])) best = r;
    ctx.compares += r < n ? 2 : 1;
    const kids = r < n ? [l, r] : [l];
    const kidText = kids.map(k => `${heap[k]}`).join(', ');
    const bestWord = words(ctx).best;
    push(ctx, {
      type: 'COMPARE', current: i, compare: kids, settled: settledOf(), codeLine: first ? firstLine : 10,
      description: tr(
        `인덱스 ${i}의 값 ${heap[i]}와(과) 자식 ${kidText}을(를) 비교해요. ${bestWord} 값은 ${heap[best]}(인덱스 ${best})예요.`,
        `Compare ${heap[i]} at index ${i} with its children ${kidText}. The ${bestWord} value is ${heap[best]} (index ${best}).`,
      ),
    });
    first = false;
    if (best === i) {
      push(ctx, {
        type: 'SETTLE', current: i, settled: settledOf(), codeLine: 12,
        description: tr(
          `${heap[i]}이(가) 자식보다 ${isMax ? '크거나 같아서' : '작거나 같아서'} 힙 조건을 만족해요. 인덱스 ${i}에 자리 잡아요.`,
          `${heap[i]} is already ${isMax ? 'at least as large as' : 'no larger than'} its children, so the heap property holds. It stays at index ${i}.`,
        ),
      });
      return;
    }
    const a = heap[i];
    const b = heap[best];
    heap[i] = b;
    heap[best] = a;
    ctx.swaps++;
    push(ctx, {
      type: 'SWAP', current: best, swapped: [i, best], settled: settledOf(), codeLine: 11,
      description: tr(
        `${a}와(과) 자식 ${b}의 자리를 바꿔요. ${a}은(는) 인덱스 ${best}로 내려가요.`,
        `Swap ${a} with its child ${b}. ${a} moves down to index ${best}.`,
      ),
    });
    i = best;
  }
}

function siftUp(ctx: Ctx, start: number) {
  const { heap, tr, isMax } = ctx;
  let i = start;
  for (;;) {
    if (i === 0) {
      push(ctx, {
        type: 'SETTLE', current: 0, settled: [0], codeLine: 23,
        description: tr(
          `${heap[0]}이(가) 루트에 자리 잡았어요. 이제 ${words(ctx).root}이에요.`,
          `${heap[0]} sits at the root. It is now ${words(ctx).root}.`,
        ),
      });
      return;
    }
    const p = (i - 1) >> 1;
    ctx.compares++;
    const goesUp = above(isMax, heap[i], heap[p]);
    push(ctx, {
      type: 'COMPARE', current: i, compare: [p], codeLine: 20,
      description: tr(
        `인덱스 ${i}의 값 ${heap[i]}와(과) 부모(인덱스 ${p}) ${heap[p]}을(를) 비교해요.`,
        `Compare ${heap[i]} at index ${i} with its parent ${heap[p]} at index ${p}.`,
      ),
    });
    if (!goesUp) {
      push(ctx, {
        type: 'SETTLE', current: i, settled: [i], codeLine: 22,
        description: tr(
          `부모 ${heap[p]}이(가) ${heap[i]}보다 ${isMax ? '작지 않아서' : '크지 않아서'} 힙 조건을 만족해요. 인덱스 ${i}에 자리 잡아요.`,
          `The parent ${heap[p]} is not ${isMax ? 'smaller' : 'larger'} than ${heap[i]}, so the heap property holds. It stays at index ${i}.`,
        ),
      });
      return;
    }
    const a = heap[i];
    const b = heap[p];
    heap[i] = b;
    heap[p] = a;
    ctx.swaps++;
    push(ctx, {
      type: 'SWAP', current: p, swapped: [p, i], codeLine: 21,
      description: tr(
        `${a}이(가) 부모 ${b}보다 ${isMax ? '커서' : '작아서'} 자리를 바꿔요. ${a}은(는) 인덱스 ${p}로 올라가요.`,
        `${a} is ${isMax ? 'larger' : 'smaller'} than its parent ${b}, so they swap. ${a} moves up to index ${p}.`,
      ),
    });
    i = p;
  }
}

const newCtx = (op: HeapOpKind, heap: number[], isMax: boolean, lang: Lang): Ctx => ({
  op, heap: [...heap], isMax, tr: makeTr(lang), steps: [], compares: 0, swaps: 0, extracted: null,
});

const kindName = (tr: Tr, isMax: boolean) => (isMax ? tr('최대 힙', 'max-heap') : tr('최소 힙', 'min-heap'));

/** Build a heap bottom-up: sift down every internal node from n/2-1 to 0. O(n). */
export function generateBuildSteps(values: number[], isMax = false, lang: Lang = 'ko'): HeapStep[] {
  const ctx = newCtx('build', values, isMax, lang);
  const { tr, heap } = ctx;
  const n = heap.length;
  const lastInternal = Math.floor(n / 2) - 1;
  push(ctx, {
    type: 'INIT', settled: range(lastInternal + 1, n), codeLine: 1,
    description: n === 0
      ? tr('빈 배열이라 만들 힙이 없어요.', 'The array is empty, so there is nothing to heapify.')
      : lastInternal < 0
        ? tr(`원소가 하나뿐이라 이미 ${kindName(tr, isMax)}이에요.`, `With a single element the array is already a ${kindName(tr, isMax)}.`)
        : tr(
          `값 ${n}개로 ${kindName(tr, isMax)}을 만들어요. 리프(인덱스 ${lastInternal + 1}~${n - 1})는 이미 힙이니, 인덱스 ${lastInternal}부터 0까지 거꾸로 내려보내요.`,
          `Turn ${n} values into a ${kindName(tr, isMax)}. Leaves (indices ${lastInternal + 1}..${n - 1}) are already heaps, so sift down from index ${lastInternal} back to 0.`,
        ),
  });
  for (let i = lastInternal; i >= 0; i--) {
    const boundary = i;
    siftDown(ctx, i, () => range(boundary + 1, n), 14);
  }
  push(ctx, {
    type: 'DONE', settled: range(0, n), codeLine: 50,
    description: n === 0
      ? tr('힙 만들기를 마쳤어요.', 'Heapify finished.')
      : tr(
        `힙 만들기 완료! 비교 ${ctx.compares}번, 교환 ${ctx.swaps}번. 루트 ${heap[0]}이(가) ${words(ctx).root}이에요.`,
        `Heap built with ${ctx.compares} comparisons and ${ctx.swaps} swaps. The root ${heap[0]} is ${words(ctx).root}.`,
      ),
  });
  return ctx.steps;
}

/** Insert: append at the end, then sift up. O(log n). */
export function generateInsertSteps(heap: number[], value: number, isMax = false, lang: Lang = 'ko'): HeapStep[] {
  const ctx = newCtx('insert', heap, isMax, lang);
  const { tr } = ctx;
  push(ctx, {
    type: 'INIT', codeLine: 2,
    description: tr(`${value}을(를) 힙에 넣어요.`, `Insert ${value} into the heap.`),
  });
  ctx.heap.push(value);
  const last = ctx.heap.length - 1;
  push(ctx, {
    type: 'APPEND', current: last, codeLine: 30,
    description: tr(
      `${value}을(를) 배열 맨 끝(인덱스 ${last})에 붙여요. 이제 부모와 비교하며 위로 올려요.`,
      `Append ${value} at the end of the array (index ${last}). Now sift it up by comparing with its parent.`,
    ),
  });
  siftUp(ctx, last);
  push(ctx, {
    type: 'DONE', settled: range(0, ctx.heap.length), codeLine: 51,
    description: tr(
      `삽입 완료! 비교 ${ctx.compares}번, 교환 ${ctx.swaps}번. 루트는 ${ctx.heap[0]}이에요.`,
      `Inserted with ${ctx.compares} comparisons and ${ctx.swaps} swaps. The root is ${ctx.heap[0]}.`,
    ),
  });
  return ctx.steps;
}

/** Extract the root: move the last element to the root, then sift down. O(log n). */
export function generateExtractSteps(heap: number[], isMax = false, lang: Lang = 'ko'): HeapStep[] {
  const ctx = newCtx('extract', heap, isMax, lang);
  const { tr } = ctx;
  const { root } = words(ctx);
  push(ctx, {
    type: 'INIT', codeLine: 3,
    description: tr(`루트에 있는 ${root}을(를) 꺼내요.`, `Take ${root} out of the root.`),
  });
  if (ctx.heap.length === 0) {
    push(ctx, {
      type: 'DONE', codeLine: 53,
      description: tr(
        '힙이 비어 있어서 꺼낼 값이 없어요. (BOJ 1927에서는 0을 출력해요.)',
        'The heap is empty, so there is nothing to take out. (BOJ 1927 prints 0 here.)',
      ),
    });
    return ctx.steps;
  }
  const top = ctx.heap[0];
  ctx.extracted = top;
  push(ctx, {
    type: 'REMOVE_ROOT', removed: 0, codeLine: 40,
    description: tr(`루트의 ${top}이(가) ${root}이에요. 이 값을 꺼내 둬요.`, `The root ${top} is ${root}. Keep it as the answer.`),
  });
  const last = ctx.heap.length - 1;
  const moved = ctx.heap[last];
  ctx.heap[0] = moved;
  ctx.heap.pop();
  if (ctx.heap.length === 0) {
    push(ctx, {
      type: 'MOVE_LAST', codeLine: 41,
      description: tr(`${top}이(가) 유일한 원소였어요. 이제 힙이 비었어요.`, `${top} was the only element. The heap is now empty.`),
    });
  } else {
    push(ctx, {
      type: 'MOVE_LAST', current: 0, codeLine: 41,
      description: tr(
        `마지막 원소 ${moved}(인덱스 ${last})을(를) 루트로 옮기고 배열 길이를 하나 줄여요. 이제 아래로 내려보내요.`,
        `Move the last element ${moved} (index ${last}) to the root and shrink the array by one. Now sift it down.`,
      ),
    });
    siftDown(ctx, 0, () => []);
  }
  push(ctx, {
    type: 'DONE', settled: range(0, ctx.heap.length), codeLine: 52,
    description: tr(
      `꺼낸 값은 ${top}이에요. 비교 ${ctx.compares}번, 교환 ${ctx.swaps}번으로 힙을 다시 맞췄어요.`,
      `Extracted ${top}. The heap was restored with ${ctx.compares} comparisons and ${ctx.swaps} swaps.`,
    ),
  });
  return ctx.steps;
}

/** Steps of one operation applied to `heap` (a build ignores `heap` and starts from its own values). */
export function generateOpSteps(heap: number[], op: HeapOp, isMax = false, lang: Lang = 'ko'): HeapStep[] {
  if (op.kind === 'build') return generateBuildSteps(op.values, isMax, lang);
  if (op.kind === 'insert') return generateInsertSteps(heap, op.value, isMax, lang);
  return generateExtractSteps(heap, isMax, lang);
}

/** Final heap and extracted value of one operation, without keeping the steps. */
export function applyOp(heap: number[], op: HeapOp, isMax = false): { heap: number[]; extracted: number | null } {
  const last = generateOpSteps(heap, op, isMax, 'en').at(-1)!;
  return { heap: last.heap, extracted: last.extracted };
}
