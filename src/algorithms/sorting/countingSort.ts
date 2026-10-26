import { sanitizeInput, type SortStep } from './types';
import { makeTr, type Lang } from '../../i18n';

/**
 * Stable counting sort: count occurrences, turn counts into prefix sums,
 * then place elements right-to-left into the output array.
 * Input values are clamped to integers 0..COUNTING_MAX (see sanitizeInput).
 */
export function generateCountingSortSteps(input: number[], lang: Lang = 'ko'): SortStep[] {
  const tr = makeTr(lang);
  const arr = sanitizeInput('counting', input).array;
  const n = arr.length;
  const steps: SortStep[] = [];
  const k = (n ? Math.max(...arr) : 0) + 1;
  const counts = new Array<number>(k).fill(0);
  const output: (number | null)[] = new Array(n).fill(null);
  let writes = 0;

  interface Extra {
    comparing?: number[];
    sorted?: number[];
    current?: number | null;
    countIndex?: number | null;
    countRange?: [number, number];
    outputIndex?: number | null;
    range?: [number, number];
    array?: number[];
  }
  const snap = (type: SortStep['type'], description: string, codeLine: number, x: Extra = {}): void => {
    steps.push({
      type,
      array: [...(x.array ?? arr)],
      comparing: x.comparing ?? [],
      swapping: [],
      sorted: x.sorted ?? [],
      pivot: x.current ?? null,
      activeRange: x.range,
      description,
      codeLine,
      compares: 0, // counting sort never compares two elements
      swaps: writes,
      counts: [...counts],
      countIndex: x.countIndex ?? null,
      countRange: x.countRange,
      output: [...output],
      outputIndex: x.outputIndex ?? null,
    });
  };

  snap(
    'INIT',
    tr(
      `최댓값이 ${k - 1}이므로 count[0..${k - 1}] (${k}칸)을 0으로 만들어요`,
      `The maximum is ${k - 1}, so create count[0..${k - 1}] (${k} cells) filled with 0`,
    ),
    3,
  );

  // 1) count occurrences
  for (let i = 0; i < n; i++) {
    const x = arr[i];
    counts[x]++;
    snap(
      'COUNT',
      tr(`arr[${i}] = ${x} → count[${x}]을 ${counts[x]}(으)로 늘려요`, `arr[${i}] = ${x} → count[${x}] becomes ${counts[x]}`),
      5,
      { current: i, countIndex: x },
    );
  }

  // 2) prefix sums: one step per value that occurs; empty cells in between just carry the sum forward
  let from = 1;
  for (let v = 1; v < k; v++) {
    const had = counts[v];
    counts[v] += counts[v - 1];
    if (had > 0 || v === k - 1) {
      const carried = v > from;
      snap(
        'PREFIX',
        carried
          ? tr(
              `count[${from}..${v}] 누적: count[${v}] = ${counts[v]} (${counts[v]}개의 값이 ${v} 이하)`,
              `Prefix sums over count[${from}..${v}]: count[${v}] = ${counts[v]} (${counts[v]} value${counts[v] === 1 ? ' is' : 's are'} ≤ ${v})`,
            )
          : tr(
              `count[${v}] += count[${v - 1}] → ${counts[v]} (${counts[v]}개의 값이 ${v} 이하)`,
              `count[${v}] += count[${v - 1}] → ${counts[v]} (${counts[v]} value${counts[v] === 1 ? ' is' : 's are'} ≤ ${v})`,
            ),
        7,
        { countIndex: v, countRange: [from, v] },
      );
      from = v + 1;
    }
  }
  if (k === 1) {
    snap('PREFIX', tr('값이 모두 0이라 누적할 칸이 없어요', 'Every value is 0, so there is nothing to accumulate'), 7, { countIndex: 0, countRange: [0, 0] });
  }

  // 3) place right-to-left (keeps equal values in their original order)
  for (let i = n - 1; i >= 0; i--) {
    const x = arr[i];
    counts[x]--;
    const pos = counts[x];
    output[pos] = x;
    writes++;
    snap(
      'PLACE',
      tr(
        `arr[${i}] = ${x}: count[${x}]을 ${pos}(으)로 줄이고 output[${pos}]에 써요`,
        `arr[${i}] = ${x}: decrement count[${x}] to ${pos} and write output[${pos}]`,
      ),
      11,
      { current: i, countIndex: x, outputIndex: pos, range: [0, i] },
    );
  }

  const result = output.map(v => v ?? 0);
  snap(
    'DONE',
    tr(
      `계수 정렬 완료! 비교 0회, output을 arr로 복사 (쓰기 ${writes}회)`,
      `Counting sort done! 0 comparisons. Copy output back to arr (${writes} write${writes === 1 ? '' : 's'})`,
    ),
    12,
    { array: result, sorted: result.map((_, i) => i) },
  );
  return steps;
}
