import { makeTr, type Lang } from '../../i18n';
import type { BSStep } from './types';

const base = { mid: null, result: null, best: null, wood: null, ok: null } as const;

/** Classic binary search for `target` in a sorted array (closed interval [lo, hi]). */
export function generateFindSteps(arr: number[], target: number, lang: Lang = 'ko'): BSStep[] {
  const tr = makeTr(lang);
  const steps: BSStep[] = [];
  let lo = 0;
  let hi = arr.length - 1;
  steps.push({
    ...base, type: 'INIT', lo, hi, codeLine: 2,
    description: tr(
      `정렬된 배열에서 ${target}을(를) 찾아요. 탐색 구간은 [${lo}, ${hi}]예요.`,
      `Look for ${target} in the sorted array. The search range is [${lo}, ${hi}].`,
    ),
  });
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const v = arr[mid];
    const rel = v === target ? '=' : v < target ? '<' : '>';
    steps.push({
      ...base, type: 'MID', lo, hi, mid, codeLine: 4,
      description: tr(
        `mid = (${lo} + ${hi}) // 2 = ${mid}. arr[${mid}] = ${v}와(과) ${target}을(를) 비교하면 ${v} ${rel} ${target}`,
        `mid = (${lo} + ${hi}) // 2 = ${mid}. Compare arr[${mid}] = ${v} with ${target}: ${v} ${rel} ${target}`,
      ),
    });
    if (v === target) {
      steps.push({
        ...base, type: 'FOUND', lo, hi, mid, result: mid, codeLine: 6,
        description: tr(`찾았어요! ${target}은(는) 인덱스 ${mid}에 있어요.`, `Found it! ${target} is at index ${mid}.`),
      });
      return steps;
    }
    if (v < target) {
      lo = mid + 1;
      steps.push({
        ...base, type: 'GO_RIGHT', lo, hi, mid, codeLine: 8,
        description: tr(
          `${v} < ${target}이므로 왼쪽 절반을 버리고 lo = ${lo}로 옮겨요.`,
          `${v} < ${target}, so drop the left half and move lo to ${lo}.`,
        ),
      });
    } else {
      hi = mid - 1;
      steps.push({
        ...base, type: 'GO_LEFT', lo, hi, mid, codeLine: 10,
        description: tr(
          `${v} > ${target}이므로 오른쪽 절반을 버리고 hi = ${hi}로 옮겨요.`,
          `${v} > ${target}, so drop the right half and move hi to ${hi}.`,
        ),
      });
    }
  }
  steps.push({
    ...base, type: 'NOT_FOUND', lo, hi, result: -1, codeLine: 11,
    description: tr(
      `lo(${lo}) > hi(${hi})라 구간이 비었어요. ${target}은(는) 배열에 없어요 (-1).`,
      `lo (${lo}) > hi (${hi}), so the range is empty. ${target} is not in the array (-1).`,
    ),
  });
  return steps;
}

/** Lower bound: first index i with arr[i] >= target (half-open interval [lo, hi)). */
export function generateLowerBoundSteps(arr: number[], target: number, lang: Lang = 'ko'): BSStep[] {
  const tr = makeTr(lang);
  const steps: BSStep[] = [];
  let lo = 0;
  let hi = arr.length;
  steps.push({
    ...base, type: 'INIT', lo, hi, codeLine: 2,
    description: tr(
      `${target} 이상인 첫 위치를 찾아요. 답 후보 구간은 [${lo}, ${hi})이고, 끝 위치 ${hi}도 후보예요.`,
      `Find the first position holding a value ≥ ${target}. The candidate range is [${lo}, ${hi}); the end position ${hi} counts too.`,
    ),
  });
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const v = arr[mid];
    steps.push({
      ...base, type: 'MID', lo, hi, mid, codeLine: 4,
      description: tr(
        `mid = (${lo} + ${hi}) // 2 = ${mid}. arr[${mid}] = ${v}이(가) ${target} 이상인지 확인해요.`,
        `mid = (${lo} + ${hi}) // 2 = ${mid}. Is arr[${mid}] = ${v} ≥ ${target}?`,
      ),
    });
    if (v >= target) {
      hi = mid;
      steps.push({
        ...base, type: 'GO_LEFT', lo, hi, mid, codeLine: 6,
        description: tr(
          `${v} ≥ ${target}: 인덱스 ${mid}는 답 후보예요. 더 왼쪽에 있을 수 있으니 hi = ${hi}.`,
          `${v} ≥ ${target}: index ${mid} is a candidate, but there may be one further left, so hi = ${hi}.`,
        ),
      });
    } else {
      lo = mid + 1;
      steps.push({
        ...base, type: 'GO_RIGHT', lo, hi, mid, codeLine: 8,
        description: tr(
          `${v} < ${target}: 인덱스 ${mid}까지는 답이 될 수 없어요. lo = ${lo}.`,
          `${v} < ${target}: nothing up to index ${mid} can be the answer, so lo = ${lo}.`,
        ),
      });
    }
  }
  steps.push({
    ...base, type: 'DONE', lo, hi, result: lo, codeLine: 9,
    description: lo < arr.length
      ? tr(
        `lo = hi = ${lo}. ${target} 이상인 첫 위치는 인덱스 ${lo} (값 ${arr[lo]})예요.`,
        `lo = hi = ${lo}. The first value ≥ ${target} is at index ${lo} (value ${arr[lo]}).`,
      )
      : tr(
        `lo = hi = ${lo}. ${target} 이상인 값이 없어서 끝 위치 ${lo}을(를) 돌려줘요.`,
        `lo = hi = ${lo}. No value is ≥ ${target}, so it returns the end position ${lo}.`,
      ),
  });
  return steps;
}

/** Wood collected when every tree taller than `h` is cut down to `h`. */
export const woodAt = (trees: number[], h: number) => trees.reduce((s, t) => s + Math.max(0, t - h), 0);

/** Parametric search (BOJ 2805): the highest cutter height that still collects at least `m` wood. */
export function generateParametricSteps(trees: number[], m: number, lang: Lang = 'ko'): BSStep[] {
  const tr = makeTr(lang);
  const steps: BSStep[] = [];
  let lo = 0;
  let hi = Math.max(0, ...trees);
  let best = 0;
  steps.push({
    ...base, type: 'INIT', lo, hi, best, codeLine: 2,
    description: tr(
      `절단기 높이 H의 후보는 0 ~ ${hi}예요. "높이 H로 자르면 나무를 ${m} 이상 얻는가?"를 이분 탐색해요.`,
      `The cutter height H can be 0 to ${hi}. Binary-search the question "cutting at H, do we get at least ${m} wood?"`,
    ),
  });
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const wood = woodAt(trees, mid);
    const ok = wood >= m;
    steps.push({
      ...base, type: 'CHECK', lo, hi, mid, best, wood, ok, codeLine: 6,
      description: ok
        ? tr(`H = ${mid}로 자르면 ${wood}만큼 얻어요. ${wood} ≥ ${m}이라 조건을 만족해요.`, `Cutting at H = ${mid} collects ${wood}. ${wood} ≥ ${m}, so the check passes.`)
        : tr(`H = ${mid}로 자르면 ${wood}만큼 얻어요. ${wood} < ${m}이라 조건을 만족하지 못해요.`, `Cutting at H = ${mid} collects ${wood}. ${wood} < ${m}, so the check fails.`),
    });
    if (ok) {
      best = mid;
      lo = mid + 1;
      steps.push({
        ...base, type: 'GO_RIGHT', lo, hi, mid, best, wood, ok, codeLine: 9,
        description: tr(
          `충분해요. 답 후보를 ${mid}로 저장하고, 더 높일 수 있는지 lo = ${lo}로 옮겨요.`,
          `Enough. Save ${mid} as the best so far and try higher: lo = ${lo}.`,
        ),
      });
    } else {
      hi = mid - 1;
      steps.push({
        ...base, type: 'GO_LEFT', lo, hi, mid, best, wood, ok, codeLine: 11,
        description: tr(
          `부족해요. 더 낮게 잘라야 하니 hi = ${hi}로 옮겨요.`,
          `Not enough. We must cut lower: hi = ${hi}.`,
        ),
      });
    }
  }
  steps.push({
    ...base, type: 'DONE', lo, hi, best, result: best, codeLine: 12,
    description: tr(
      `lo(${lo}) > hi(${hi})라 끝났어요. 나무를 ${m} 이상 얻는 가장 높은 높이는 ${best}예요.`,
      `lo (${lo}) > hi (${hi}), done. The highest cutter height that still yields ${m} wood is ${best}.`,
    ),
  });
  return steps;
}
