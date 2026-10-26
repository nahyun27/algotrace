import { makeTr, type Lang } from '../../i18n';
import type { SumStep, WindowStep } from './types';

/** BOJ 2003: count subarrays of positive integers whose sum is exactly `m`. */
export function generateSubarraySumSteps(arr: number[], m: number, lang: Lang = 'ko'): SumStep[] {
  const tr = makeTr(lang);
  const steps: SumStep[] = [];
  const n = arr.length;
  let l = 0;
  let r = -1;
  let total = 0;
  let count = 0;
  const matches: [number, number][] = [];
  const snap = () => ({ l, r, total, count, matches: matches.map(x => [...x] as [number, number]) });

  steps.push({
    ...snap(), type: 'INIT', changed: null, codeLine: 3,
    description: tr(
      `합이 정확히 ${m}인 연속 구간의 개수를 세요. 빈 구간에서 시작해요 (l = 0, 합 0).`,
      `Count contiguous subarrays whose sum is exactly ${m}. Start with an empty window (l = 0, sum 0).`,
    ),
  });

  for (;;) {
    if (total >= m) {
      const out = l;
      total -= arr[l];
      l += 1;
      steps.push({
        ...snap(), type: 'SHRINK', changed: out, codeLine: 7,
        description: tr(
          `합이 ${m} 이상이라 왼쪽 arr[${out}] = ${arr[out]}을(를) 빼고 l을 ${l}로 옮겨요. 합 = ${total}`,
          `The sum is at least ${m}, so drop arr[${out}] = ${arr[out]} on the left and move l to ${l}. Sum = ${total}`,
        ),
      });
    } else if (r + 1 === n) {
      break;
    } else {
      r += 1;
      total += arr[r];
      steps.push({
        ...snap(), type: 'EXPAND', changed: r, codeLine: 12,
        description: tr(
          `합이 ${m}보다 작아서 r을 ${r}로 늘리고 arr[${r}] = ${arr[r]}을(를) 더해요. 합 = ${total}`,
          `The sum is below ${m}, so extend r to ${r} and add arr[${r}] = ${arr[r]}. Sum = ${total}`,
        ),
      });
    }
    if (total === m) {
      count += 1;
      matches.push([l, r]);
      steps.push({
        ...snap(), type: 'MATCH', changed: null, codeLine: 14,
        description: tr(
          `구간 [${l}, ${r}]의 합이 ${m}이에요! 지금까지 ${count}개 찾았어요.`,
          `The window [${l}, ${r}] sums to ${m}! ${count} found so far.`,
        ),
      });
    }
  }

  steps.push({
    ...snap(), type: 'DONE', changed: null, codeLine: 15,
    description: tr(
      `r이 배열 끝에 닿았고 더 줄일 필요도 없어요. 합이 ${m}인 구간은 모두 ${count}개예요.`,
      `r reached the end and the window cannot shrink further. There are ${count} subarrays summing to ${m}.`,
    ),
  });
  return steps;
}

/** BOJ 2559: maximum sum of `k` consecutive elements, with a sliding window. */
export function generateSlidingWindowSteps(arr: number[], k: number, lang: Lang = 'ko'): WindowStep[] {
  const tr = makeTr(lang);
  const steps: WindowStep[] = [];
  let total = arr.slice(0, k).reduce((s, v) => s + v, 0);
  let best = total;
  let bestRange: [number, number] = [0, k - 1];
  const sums = [total];

  steps.push({
    type: 'INIT', l: 0, r: k - 1, total, best, bestRange: [...bestRange], sums: [...sums], entered: null, left: null, codeLine: 3,
    description: tr(
      `처음 ${k}개 arr[0..${k - 1}]의 합 ${total}을(를) 구하고, 이것을 최댓값으로 둬요.`,
      `Sum the first ${k} elements arr[0..${k - 1}] = ${total} and take it as the best so far.`,
    ),
  });

  for (let r = k; r < arr.length; r++) {
    const out = r - k;
    total += arr[r] - arr[out];
    sums.push(total);
    const l = r - k + 1;
    steps.push({
      type: 'SLIDE', l, r, total, best, bestRange: [...bestRange], sums: [...sums], entered: r, left: out, codeLine: 5,
      description: tr(
        `창을 한 칸 밀어요. arr[${r}] = ${arr[r]}이(가) 들어오고 arr[${out}] = ${arr[out]}이(가) 나가서 합 = ${total}`,
        `Slide the window by one: arr[${r}] = ${arr[r]} comes in, arr[${out}] = ${arr[out]} goes out. Sum = ${total}`,
      ),
    });
    if (total > best) {
      best = total;
      bestRange = [l, r];
      steps.push({
        type: 'BEST', l, r, total, best, bestRange: [...bestRange], sums: [...sums], entered: null, left: null, codeLine: 7,
        description: tr(
          `${total}이(가) 지금까지의 최댓값보다 커서 best = ${best}로 갱신해요.`,
          `${total} beats the best so far, so best = ${best}.`,
        ),
      });
    }
  }

  steps.push({
    type: 'DONE', l: bestRange[0], r: bestRange[1], total: best, best, bestRange: [...bestRange], sums: [...sums], entered: null, left: null, codeLine: 8,
    description: tr(
      `끝까지 밀었어요. 연속 ${k}개의 최대 합은 구간 [${bestRange[0]}, ${bestRange[1]}]의 ${best}예요.`,
      `Reached the end. The maximum sum of ${k} consecutive elements is ${best}, at [${bestRange[0]}, ${bestRange[1]}].`,
    ),
  });
  return steps;
}
