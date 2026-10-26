import { makeTr, type Lang } from '../../i18n';
import { lowbit, type FenStep, type Operation, type SegInput, type SegMark, type SegShape, type SegStep } from './types';

/* ─────────────── segment tree ─────────────── */

/** Recursive layout of a segment tree over [0, n - 1] with heap indices (root = 1). */
export function segShape(n: number, id = 1, start = 0, end = n - 1): SegShape {
  if (start === end) return { id, start, end, left: null, right: null };
  const mid = (start + end) >> 1;
  return { id, start, end, left: segShape(n, id * 2, start, mid), right: segShape(n, id * 2 + 1, mid + 1, end) };
}

const rangeText = (s: number, e: number) => (s === e ? `[${s}]` : `[${s}, ${e}]`);

/**
 * Segment tree (range sum): the build, then one range query [l, r] or one point update
 * (arr[idx] = val), as steps. codeLine values are line numbers of the Python code.
 */
export function generateSegmentSteps(input: SegInput, op: Operation, lang: Lang = 'ko'): SegStep[] {
  const tr = makeTr(lang);
  const arr = [...input.arr];
  const n = arr.length;
  const tree: (number | null)[] = Array(4 * n).fill(null);
  const steps: SegStep[] = [];
  let marks: Record<number, SegMark> = {};
  let acc: number | null = null;

  const push = (s: Omit<SegStep, 'tree' | 'arr' | 'marks' | 'acc' | 'result'> & { result?: number | null }) =>
    steps.push({ result: null, ...s, tree: [...tree], arr: [...arr], marks: { ...marks }, acc });

  /* build */
  push({
    type: 'BUILD', node: null, span: null, codeLine: 1,
    description: tr(
      `배열 ${n}칸으로 세그먼트 트리를 만들어요. 노드마다 자기 구간의 합을 저장하고, 자식 두 개의 합으로 부모를 채워요.`,
      `Build a segment tree over ${n} elements. Each node stores the sum of its range, computed from its two children.`,
    ),
  });
  const build = (node: number, s: number, e: number) => {
    if (s === e) {
      tree[node] = arr[s];
      push({
        type: 'BUILD', node, span: [s, e], codeLine: 3,
        description: tr(`리프 ${rangeText(s, e)}: tree[${node}] = arr[${s}] = ${arr[s]}`, `Leaf ${rangeText(s, e)}: tree[${node}] = arr[${s}] = ${arr[s]}`),
      });
      return;
    }
    const mid = (s + e) >> 1;
    build(node * 2, s, mid);
    build(node * 2 + 1, mid + 1, e);
    tree[node] = tree[node * 2]! + tree[node * 2 + 1]!;
    push({
      type: 'BUILD', node, span: [s, e], codeLine: 8,
      description: tr(
        `${rangeText(s, e)}: tree[${node}] = ${tree[node * 2]} + ${tree[node * 2 + 1]} = ${tree[node]}`,
        `${rangeText(s, e)}: tree[${node}] = ${tree[node * 2]} + ${tree[node * 2 + 1]} = ${tree[node]}`,
      ),
    });
  };
  build(1, 0, n - 1);

  if (op === 'query') {
    const { l, r } = input;
    acc = 0;
    marks = {};
    push({
      type: 'VISIT', node: 1, span: [0, n - 1], codeLine: 10,
      description: tr(
        `구간 [${l}, ${r}]의 합을 구해요. 루트 query(1, 0, ${n - 1})부터 내려가요.`,
        `Find the sum of [${l}, ${r}]. Start at the root: query(1, 0, ${n - 1}).`,
      ),
    });
    const query = (node: number, s: number, e: number): number => {
      if (r < s || e < l) {
        marks[node] = 'outside';
        push({
          type: 'OUTSIDE', node, span: [s, e], codeLine: 12,
          description: tr(
            `${rangeText(s, e)}는 [${l}, ${r}]와 겹치지 않아요. 0을 돌려주고 건너뛰어요.`,
            `${rangeText(s, e)} does not overlap [${l}, ${r}]. Return 0 and skip it.`,
          ),
        });
        return 0;
      }
      if (l <= s && e <= r) {
        marks[node] = 'full';
        acc = acc! + tree[node]!;
        push({
          type: 'FULL', node, span: [s, e], codeLine: 14,
          description: tr(
            `${rangeText(s, e)}는 [${l}, ${r}] 안에 완전히 들어가요. 더 내려가지 않고 tree[${node}] = ${tree[node]}을(를) 그대로 써요. 지금까지 합 ${acc}`,
            `${rangeText(s, e)} lies fully inside [${l}, ${r}]. Use tree[${node}] = ${tree[node]} without going deeper. Sum so far: ${acc}`,
          ),
        });
        return tree[node]!;
      }
      const mid = (s + e) >> 1;
      marks[node] = 'partial';
      push({
        type: 'PARTIAL', node, span: [s, e], codeLine: 17,
        description: tr(
          `${rangeText(s, e)}는 [${l}, ${r}]와 일부만 겹쳐요. ${rangeText(s, mid)}와 ${rangeText(mid + 1, e)}로 나눠서 물어봐요.`,
          `${rangeText(s, e)} only partly overlaps [${l}, ${r}]. Split it and ask ${rangeText(s, mid)} and ${rangeText(mid + 1, e)}.`,
        ),
      });
      return query(node * 2, s, mid) + query(node * 2 + 1, mid + 1, e);
    };
    const result = query(1, 0, n - 1);
    const used = Object.entries(marks).filter(([, m]) => m === 'full').map(([id]) => `tree[${id}]`);
    push({
      type: 'DONE', node: null, span: [l, r], codeLine: 16, result,
      description: tr(
        `완료! 노드 ${used.length}개(${used.join(', ')})를 더해 [${l}, ${r}]의 합 = ${result}`,
        `Done! Adding ${used.length} nodes (${used.join(', ')}) gives the sum of [${l}, ${r}] = ${result}`,
      ),
    });
    return steps;
  }

  /* point update */
  const { idx, val } = input;
  marks = {};
  const update = (node: number, s: number, e: number) => {
    if (idx < s || idx > e) {
      marks[node] = 'outside';
      push({
        type: 'OUTSIDE', node, span: [s, e], codeLine: 21,
        description: tr(
          `${rangeText(s, e)}에는 인덱스 ${idx}가 없어요. 바뀌지 않으니 건너뛰어요.`,
          `${rangeText(s, e)} does not contain index ${idx}. Nothing changes there, so skip it.`,
        ),
      });
      return;
    }
    if (s === e) {
      const old = arr[idx];
      arr[idx] = val;
      tree[node] = val;
      marks[node] = 'updated';
      push({
        type: 'UPDATE', node, span: [s, e], codeLine: 23,
        description: tr(`리프 [${idx}]: tree[${node}] = ${old} → ${val}`, `Leaf [${idx}]: tree[${node}] = ${old} → ${val}`),
      });
      return;
    }
    marks[node] = 'visit';
    const mid = (s + e) >> 1;
    push({
      type: 'VISIT', node, span: [s, e], codeLine: 19,
      description: node === 1
        ? tr(
          `arr[${idx}]를 ${val}(으)로 바꿔요. 인덱스 ${idx}를 포함하는 노드만 다시 계산하면 돼요. 루트 ${rangeText(s, e)}부터 내려가요.`,
          `Set arr[${idx}] to ${val}. Only the nodes whose range contains ${idx} need recomputing. Start at the root ${rangeText(s, e)}.`,
        )
        : tr(
          `${rangeText(s, e)}는 인덱스 ${idx}를 포함해요. ${rangeText(s, mid)}와 ${rangeText(mid + 1, e)}로 내려가요.`,
          `${rangeText(s, e)} contains index ${idx}. Go down into ${rangeText(s, mid)} and ${rangeText(mid + 1, e)}.`,
        ),
    });
    update(node * 2, s, mid);
    update(node * 2 + 1, mid + 1, e);
    const old = tree[node];
    tree[node] = tree[node * 2]! + tree[node * 2 + 1]!;
    marks[node] = 'updated';
    push({
      type: 'UPDATE', node, span: [s, e], codeLine: 28,
      description: tr(
        `${rangeText(s, e)} 다시 계산: tree[${node}] = ${tree[node * 2]} + ${tree[node * 2 + 1]} = ${tree[node]} (전: ${old})`,
        `Recompute ${rangeText(s, e)}: tree[${node}] = ${tree[node * 2]} + ${tree[node * 2 + 1]} = ${tree[node]} (was ${old})`,
      ),
    });
  };
  update(1, 0, n - 1);
  const changed = Object.values(marks).filter(m => m === 'updated').length;
  push({
    type: 'DONE', node: null, span: [idx, idx], codeLine: 29, result: tree[1],
    description: tr(
      `완료! 루트에서 리프까지 노드 ${changed}개만 고쳤어요 (O(log n)). 전체 합은 이제 ${tree[1]}`,
      `Done! Only ${changed} nodes on the root-to-leaf path changed (O(log n)). The total is now ${tree[1]}`,
    ),
  });
  return steps;
}

/* ─────────────── Fenwick tree ─────────────── */

const bin = (i: number, width: number) => i.toString(2).padStart(width, '0');

/**
 * Fenwick tree (binary indexed tree): O(n) build, then range_sum(l, r) = prefix_sum(r + 1) − prefix_sum(l)
 * or a point update (arr[idx] = val). codeLine values are line numbers of the Python code.
 */
export function generateFenwickSteps(input: SegInput, op: Operation, lang: Lang = 'ko'): FenStep[] {
  const tr = makeTr(lang);
  const arr = [...input.arr];
  const n = arr.length;
  const width = n.toString(2).length;
  const tree: number[] = Array(n + 1).fill(0);
  const steps: FenStep[] = [];
  let built = 0;
  const plus: number[] = [];
  const minus: number[] = [];
  const updated: number[] = [];
  let s: number | null = null;
  let prefR: number | null = null;
  let prefL: number | null = null;

  const push = (st: Pick<FenStep, 'type' | 'i' | 'description' | 'codeLine'> & { result?: number | null }) =>
    steps.push({
      result: null, ...st, tree: [...tree], arr: [...arr], built,
      plus: [...plus], minus: [...minus], updated: [...updated], s, prefR, prefL,
    });

  /* build */
  for (let i = 1; i <= n; i++) {
    tree[i] += arr[i - 1];
    built = i;
    const lb = lowbit(i);
    const j = i + lb;
    if (j <= n) tree[j] += tree[i];
    const from = i - lb, to = i - 1;
    const cover = from === to ? `a[${from}]` : `a[${from}..${to}]`;
    push({
      type: 'BUILD', i, codeLine: 3,
      description: j <= n
        ? tr(
          `i = ${i} (${bin(i, width)}₂), i & -i = ${lb}: tree[${i}]는 ${cover}의 합 = ${tree[i]}. 이 값을 다음 칸 tree[${j}]에 미리 더해 둬요.`,
          `i = ${i} (${bin(i, width)}₂), i & -i = ${lb}: tree[${i}] holds the sum of ${cover} = ${tree[i]}. Pass it on to tree[${j}].`,
        )
        : tr(
          `i = ${i} (${bin(i, width)}₂), i & -i = ${lb}: tree[${i}]는 ${cover}의 합 = ${tree[i]}. 다음 칸 ${j}는 n을 넘어서 끝이에요.`,
          `i = ${i} (${bin(i, width)}₂), i & -i = ${lb}: tree[${i}] holds the sum of ${cover} = ${tree[i]}. The next cell ${j} is past n.`,
        ),
    });
  }

  if (op === 'query') {
    const { l, r } = input;
    push({
      type: 'QUERY', i: null, codeLine: 16,
      description: tr(
        `구간 [${l}, ${r}]의 합 = prefix_sum(${r + 1}) − prefix_sum(${l}). 앞부분 합 두 개의 차로 구해요.`,
        `The sum of [${l}, ${r}] = prefix_sum(${r + 1}) − prefix_sum(${l}): the difference of two prefix sums.`,
      ),
    });
    const prefix = (start: number, sign: 'plus' | 'minus'): number => {
      s = 0;
      push({
        type: 'PREFIX', i: start > 0 ? start : null, codeLine: 9,
        description: start === 0
          ? tr(`prefix_sum(0): 더할 칸이 없어서 0이에요.`, `prefix_sum(0): there is nothing to add, so it is 0.`)
          : tr(
            `prefix_sum(${start}): a[0..${start - 1}]의 합을 구해요. i = ${start}에서 시작해 i -= i & -i로 왼쪽으로 뛰어요.`,
            `prefix_sum(${start}): the sum of a[0..${start - 1}]. Start at i = ${start} and jump left with i -= i & -i.`,
          ),
      });
      let i = start;
      while (i > 0) {
        const lb = lowbit(i);
        s += tree[i];
        (sign === 'plus' ? plus : minus).push(i);
        const next = i - lb;
        push({
          type: 'COLLECT', i, codeLine: 11,
          description: tr(
            `i = ${i} (${bin(i, width)}₂): s += tree[${i}] = ${tree[i]} → s = ${s}. 가장 낮은 1비트 ${lb}를 빼서 i = ${next}`,
            `i = ${i} (${bin(i, width)}₂): s += tree[${i}] = ${tree[i]} → s = ${s}. Remove the lowest set bit ${lb}: i = ${next}`,
          ),
        });
        i = next;
      }
      if (sign === 'plus') prefR = s; else prefL = s;
      if (start > 0) {
        push({
          type: 'PREFIX_DONE', i: null, codeLine: 13,
          description: tr(
            `i = 0이 되어 멈춰요. prefix_sum(${start}) = ${s} (칸 ${(sign === 'plus' ? plus : minus).length}개만 더했어요)`,
            `i reached 0. prefix_sum(${start}) = ${s} (only ${(sign === 'plus' ? plus : minus).length} cells added)`,
          ),
        });
      }
      return s;
    };
    const a = prefix(r + 1, 'plus');
    const b = prefix(l, 'minus');
    s = null;
    const result = a - b;
    push({
      type: 'DONE', i: null, codeLine: 16, result,
      description: tr(`완료! [${l}, ${r}]의 합 = ${a} − ${b} = ${result}`, `Done! The sum of [${l}, ${r}] = ${a} − ${b} = ${result}`),
    });
    return steps;
  }

  /* point update */
  const { idx, val } = input;
  const delta = val - arr[idx];
  push({
    type: 'SET', i: null, codeLine: 24,
    description: tr(
      `arr[${idx}]를 ${arr[idx]} → ${val}(으)로 바꿔요. 차이 delta = ${val} − ${arr[idx]} = ${delta}를 i = ${idx + 1}부터 더해요.`,
      `Change arr[${idx}] from ${arr[idx]} to ${val}. Add delta = ${val} − ${arr[idx]} = ${delta} starting at i = ${idx + 1}.`,
    ),
  });
  let i = idx + 1;
  while (i <= n) {
    const lb = lowbit(i);
    const old = tree[i];
    tree[i] += delta;
    updated.push(i);
    const next = i + lb;
    push({
      type: 'UPDATE', i, codeLine: 20,
      description: next <= n
        ? tr(
          `i = ${i} (${bin(i, width)}₂): tree[${i}] = ${old} + ${delta} = ${tree[i]}. 가장 낮은 1비트 ${lb}를 더해서 i = ${next}`,
          `i = ${i} (${bin(i, width)}₂): tree[${i}] = ${old} + ${delta} = ${tree[i]}. Add the lowest set bit ${lb}: i = ${next}`,
        )
        : tr(
          `i = ${i} (${bin(i, width)}₂): tree[${i}] = ${old} + ${delta} = ${tree[i]}. 다음 i = ${next}는 n을 넘어서 끝이에요.`,
          `i = ${i} (${bin(i, width)}₂): tree[${i}] = ${old} + ${delta} = ${tree[i]}. The next i = ${next} is past n, so stop.`,
        ),
    });
    i = next;
  }
  arr[idx] = val;
  push({
    type: 'DONE', i: null, codeLine: 25, result: val,
    description: tr(
      `완료! arr[${idx}] = ${val}. ${idx}를 포함하는 칸 ${updated.length}개만 고쳤어요 (O(log n)).`,
      `Done! arr[${idx}] = ${val}. Only the ${updated.length} cells covering index ${idx} changed (O(log n)).`,
    ),
  });
  return steps;
}
