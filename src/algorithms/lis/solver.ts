import { makeTr, type Lang } from '../../i18n';
import type { FastStep, QuadStep } from './types';

const fmt = (xs: number[]) => `[${xs.join(', ')}]`;

/* ─────────────── O(n²) DP ─────────────── */

/**
 * Classic O(n²) LIS: dp[i] = length of the longest increasing subsequence ending at a[i].
 * prev[] records the predecessor so the subsequence can be rebuilt at the end.
 */
export function generateQuadraticSteps(a: number[], lang: Lang = 'ko'): QuadStep[] {
  const tr = makeTr(lang);
  const n = a.length;
  const dp = Array<number>(n).fill(1);
  const prev = Array<number>(n).fill(-1);
  const steps: QuadStep[] = [];
  let best = 0;

  type Base = Omit<QuadStep, 'dp' | 'prev' | 'best' | 'isImprovement' | 'k' | 'lis'> & Partial<QuadStep>;
  const push = (s: Base) =>
    steps.push({ isImprovement: false, k: -1, lis: [], ...s, dp: [...dp], prev: [...prev], best });

  push({
    type: 'INIT', i: -1, j: -1, codeLine: 2,
    description: tr(
      `n = ${n}. 모든 원소는 혼자서 길이 1인 증가 수열이므로 dp를 1로, prev를 -1로 초기화해요.`,
      `n = ${n}. Every element alone is an increasing subsequence of length 1, so dp starts at 1 and prev at -1.`,
    ),
  });

  for (let i = 0; i < n; i++) {
    best = Math.max(best, 1);
    push({
      type: 'NEXT_I', i, j: -1, codeLine: 5,
      description: i === 0
        ? tr(`i = 0: a[0] = ${a[0]} 앞에는 원소가 없으니 dp[0] = 1이에요.`, `i = 0: nothing precedes a[0] = ${a[0]}, so dp[0] = 1.`)
        : tr(
          `i = ${i}: a[${i}] = ${a[i]}로 끝나는 가장 긴 증가 수열을 찾기 위해 앞의 원소 j = 0..${i - 1}을 살펴봐요.`,
          `i = ${i}: to find the longest increasing subsequence ending at a[${i}] = ${a[i]}, check every j = 0..${i - 1}.`,
        ),
    });
    for (let j = 0; j < i; j++) {
      const smaller = a[j] < a[i];
      const improves = smaller && dp[j] + 1 > dp[i];
      push({
        type: 'COMPARE', i, j, codeLine: 7, isImprovement: improves,
        description: !smaller
          ? tr(
            `a[${j}] = ${a[j]} ≥ a[${i}] = ${a[i]}: 증가하지 않으므로 이어 붙일 수 없어요.`,
            `a[${j}] = ${a[j]} ≥ a[${i}] = ${a[i]}: not increasing, so a[${i}] can't extend it.`,
          )
          : improves
            ? tr(
              `a[${j}] = ${a[j]} < a[${i}] = ${a[i]}이고 dp[${j}] + 1 = ${dp[j] + 1} > dp[${i}] = ${dp[i]}. 더 긴 수열이 돼요!`,
              `a[${j}] = ${a[j]} < a[${i}] = ${a[i]} and dp[${j}] + 1 = ${dp[j] + 1} > dp[${i}] = ${dp[i]}. That gives a longer subsequence!`,
            )
            : tr(
              `a[${j}] = ${a[j]} < a[${i}] = ${a[i]}이지만 dp[${j}] + 1 = ${dp[j] + 1} ≤ dp[${i}] = ${dp[i]}. 더 길어지지 않아요.`,
              `a[${j}] = ${a[j]} < a[${i}] = ${a[i]}, but dp[${j}] + 1 = ${dp[j] + 1} ≤ dp[${i}] = ${dp[i]}, so there is no gain.`,
            ),
      });
      if (improves) {
        dp[i] = dp[j] + 1;
        prev[i] = j;
        best = Math.max(best, dp[i]);
        push({
          type: 'UPDATE', i, j, codeLine: 8, isImprovement: true,
          description: tr(
            `dp[${i}] = ${dp[i]}, prev[${i}] = ${j}로 갱신해요. (a[${j}] = ${a[j]} 뒤에 ${a[i]}를 붙임)`,
            `Update dp[${i}] = ${dp[i]}, prev[${i}] = ${j} (append ${a[i]} after a[${j}] = ${a[j]}).`,
          ),
        });
      }
    }
  }

  // Backtrack from the first index holding the maximum dp value
  let end = 0;
  for (let x = 1; x < n; x++) if (dp[x] > dp[end]) end = x;
  const lis: number[] = [];
  let k = n > 0 ? end : -1;
  while (k !== -1) {
    lis.unshift(k);
    const first = lis.length === 1;
    push({
      type: 'BACKTRACK', i: -1, j: -1, k, lis: [...lis], codeLine: first ? 11 : 14,
      description: first
        ? tr(
          `dp의 최댓값은 dp[${k}] = ${dp[k]}이에요. a[${k}] = ${a[k]}에서 prev를 따라 거꾸로 올라가요.`,
          `The largest dp value is dp[${k}] = ${dp[k]}. Start at a[${k}] = ${a[k]} and follow prev backwards.`,
        )
        : tr(
          `prev를 따라 a[${k}] = ${a[k]}로 이동해 수열 앞에 붙여요.`,
          `Follow prev to a[${k}] = ${a[k]} and put it in front.`,
        ),
    });
    k = prev[k];
  }

  const seq = lis.map(x => a[x]);
  push({
    type: 'DONE', i: -1, j: -1, lis, codeLine: 16,
    description: tr(
      `완료! LIS의 길이는 ${seq.length}이고, 그중 하나는 ${fmt(seq)}이에요.`,
      `Done! The LIS has length ${seq.length}; one of them is ${fmt(seq)}.`,
    ),
  });
  return steps;
}

/* ─────────────── O(n log n) tails + binary search ─────────────── */

/**
 * O(n log n) LIS: tails[k] is the smallest possible last value of an increasing subsequence
 * of length k+1. Each element finds its slot with a lower-bound binary search.
 * tails itself is generally NOT an LIS; parent[] rebuilds a real one.
 */
export function generateFastSteps(a: number[], lang: Lang = 'ko'): FastStep[] {
  const tr = makeTr(lang);
  const n = a.length;
  const tails: number[] = [];
  const tailsIdx: number[] = [];
  const parent = Array<number>(n).fill(-1);
  const steps: FastStep[] = [];

  type Base = Omit<FastStep, 'tails' | 'tailsIdx' | 'parent' | 'lo' | 'hi' | 'mid' | 'pos' | 'k' | 'lis'> & Partial<FastStep>;
  const push = (s: Base) =>
    steps.push({ lo: -1, hi: -1, mid: -1, pos: -1, k: -1, lis: [], ...s, tails: [...tails], tailsIdx: [...tailsIdx], parent: [...parent] });

  push({
    type: 'INIT', i: -1, codeLine: 2,
    description: tr(
      'tails[k]는 "길이 k+1인 증가 수열이 끝날 수 있는 가장 작은 값"이에요. 빈 배열로 시작해요.',
      'tails[k] = the smallest value an increasing subsequence of length k+1 can end with. Start empty.',
    ),
  });

  for (let i = 0; i < n; i++) {
    const x = a[i];
    let lo = 0, hi = tails.length;
    push({
      type: 'SEARCH', i, lo, hi, codeLine: 5,
      description: tr(
        `x = a[${i}] = ${x}. tails에서 x 이상인 첫 위치를 이분 탐색해요. 범위 [${lo}, ${hi}).`,
        `x = a[${i}] = ${x}. Binary-search tails for the first value ≥ x. Range [${lo}, ${hi}).`,
      ),
    });
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      const goRight = tails[mid] < x;
      push({
        type: 'SEARCH', i, lo, hi, mid, codeLine: 7,
        description: goRight
          ? tr(
            `mid = ${mid}: tails[${mid}] = ${tails[mid]} < ${x} → 오른쪽 절반으로 (lo = ${mid + 1}).`,
            `mid = ${mid}: tails[${mid}] = ${tails[mid]} < ${x} → go right (lo = ${mid + 1}).`,
          )
          : tr(
            `mid = ${mid}: tails[${mid}] = ${tails[mid]} ≥ ${x} → 왼쪽 절반으로 (hi = ${mid}).`,
            `mid = ${mid}: tails[${mid}] = ${tails[mid]} ≥ ${x} → go left (hi = ${mid}).`,
          ),
      });
      if (goRight) lo = mid + 1;
      else hi = mid;
    }
    parent[i] = lo > 0 ? tailsIdx[lo - 1] : -1;
    const parentText = lo > 0
      ? tr(`parent[${i}] = ${parent[i]} (a[${parent[i]}] = ${a[parent[i]]} 뒤에 이어짐).`, `parent[${i}] = ${parent[i]} (follows a[${parent[i]}] = ${a[parent[i]]}).`)
      : tr(`parent[${i}] = -1 (수열의 첫 원소).`, `parent[${i}] = -1 (first element of its subsequence).`);
    if (lo === tails.length) {
      tails.push(x);
      tailsIdx.push(i);
      push({
        type: 'APPEND', i, pos: lo, codeLine: 12,
        description: tr(
          `${x}는 모든 tails 값보다 커요 → 끝에 추가하면 길이 ${tails.length}인 증가 수열이 생겨요. ${parentText}`,
          `${x} is larger than every tails value → append; an increasing subsequence of length ${tails.length} now exists. ${parentText}`,
        ),
      });
    } else {
      const old = tails[lo];
      tails[lo] = x;
      tailsIdx[lo] = i;
      push({
        type: 'REPLACE', i, pos: lo, codeLine: 14,
        description: tr(
          `tails[${lo}] = ${old}을 ${x}로 교체해요. 길이 ${lo + 1}인 수열을 더 작은 값으로 끝낼 수 있어요. ${parentText}`,
          `Replace tails[${lo}] = ${old} with ${x}: a length-${lo + 1} subsequence can now end with a smaller value. ${parentText}`,
        ),
      });
    }
  }

  const lis: number[] = [];
  let k = tailsIdx.length ? tailsIdx[tailsIdx.length - 1] : -1;
  while (k !== -1) {
    lis.unshift(k);
    const first = lis.length === 1;
    push({
      type: 'BACKTRACK', i: -1, k, lis: [...lis], codeLine: first ? 15 : 17,
      description: first
        ? tr(
          `LIS 길이 = len(tails) = ${tails.length}. 마지막 칸의 원소 a[${k}] = ${a[k]}에서 parent를 따라 거꾸로 복원해요. (tails ${fmt(tails)} 자체는 LIS가 아닐 수 있어요)`,
          `LIS length = len(tails) = ${tails.length}. Rebuild it from the last slot's element a[${k}] = ${a[k]} by following parent. (tails ${fmt(tails)} itself may not be an LIS)`,
        )
        : tr(`parent를 따라 a[${k}] = ${a[k]}로 이동해 앞에 붙여요.`, `Follow parent to a[${k}] = ${a[k]} and put it in front.`),
    });
    k = parent[k];
  }

  const seq = lis.map(x => a[x]);
  push({
    type: 'DONE', i: -1, lis, codeLine: 19,
    description: tr(
      `완료! LIS의 길이는 ${seq.length}이고, 그중 하나는 ${fmt(seq)}이에요.`,
      `Done! The LIS has length ${seq.length}; one of them is ${fmt(seq)}.`,
    ),
  });
  return steps;
}

/** Parses "10, 20 30" into integers; returns null when the input is invalid. */
export function parseArray(text: string, maxLen: number, maxAbs: number): number[] | null {
  const parts = text.split(/[,\s]+/).filter(Boolean);
  if (parts.length < 1 || parts.length > maxLen) return null;
  const nums = parts.map(Number);
  if (nums.some(v => !Number.isInteger(v) || Math.abs(v) > maxAbs)) return null;
  return nums;
}
