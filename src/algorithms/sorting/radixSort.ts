import { digitAt, sanitizeInput, type SortStep } from './types';
import { makeTr, type Lang } from '../../i18n';

/** Number of decimal passes radix sort makes for this maximum (0 when max is 0). */
export const radixPasses = (max: number) => {
  let d = 0;
  while (Math.floor(max / 10 ** d) > 0) d++;
  return d;
};

/**
 * LSD radix sort, base 10: distribute by one digit into ten buckets, collect them
 * in order, repeat from the ones digit up. Each pass is stable, so the result is sorted.
 * Input values are clamped to non-negative integers (see sanitizeInput).
 */
export function generateRadixSortSteps(input: number[], lang: Lang = 'ko'): SortStep[] {
  const tr = makeTr(lang);
  let arr = sanitizeInput('radix', input).array;
  const n = arr.length;
  const steps: SortStep[] = [];
  const max = n ? Math.max(...arr) : 0;
  const passes = radixPasses(max);
  let buckets: number[][] = Array.from({ length: 10 }, () => []);
  let moves = 0;

  const placeName = (p: number) =>
    p === 0 ? tr('1의 자리', 'ones') : p === 1 ? tr('10의 자리', 'tens') : p === 2 ? tr('100의 자리', 'hundreds') : tr(`10^${p}의 자리`, `10^${p}s`);

  interface Extra {
    array?: number[];
    comparing?: number[];
    sorted?: number[];
    current?: number | null;
    range?: [number, number];
    digit?: number;
    bucketIndex?: number | null;
    collectedUpTo?: number;
    currentValue?: number | null;
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
      compares: 0, // radix sort never compares two elements
      swaps: moves,
      buckets: buckets.map(b => [...b]),
      digit: x.digit,
      digitCount: passes,
      bucketIndex: x.bucketIndex ?? null,
      collectedUpTo: x.collectedUpTo ?? 0,
      currentValue: x.currentValue ?? null,
    });
  };

  snap(
    'INIT',
    passes === 0
      ? tr('최댓값이 0이라 자릿수 패스가 필요 없어요', 'The maximum is 0, so no digit passes are needed')
      : tr(
          `최댓값 ${max}은(는) ${passes}자리 → 1의 자리부터 ${passes}번 버킷에 나눠 담아요`,
          `The maximum ${max} has ${passes} digit${passes === 1 ? '' : 's'} → ${passes} bucket pass${passes === 1 ? '' : 'es'}, starting from the ones digit`,
        ),
    2,
  );

  for (let p = 0; p < passes; p++) {
    buckets = Array.from({ length: 10 }, () => []);
    snap(
      'DIGIT_PASS',
      tr(
        `패스 ${p + 1}/${passes}: ${placeName(p)} 숫자(exp = ${10 ** p})로 버킷 0~9에 나눠요`,
        `Pass ${p + 1}/${passes}: distribute by the ${placeName(p)} digit (exp = ${10 ** p}) into buckets 0 to 9`,
      ),
      3,
      { digit: p },
    );

    for (let i = 0; i < n; i++) {
      const x = arr[i];
      const d = digitAt(x, p);
      buckets[d].push(x);
      moves++;
      snap(
        'BUCKET',
        tr(`arr[${i}] = ${x}: ${placeName(p)} 숫자가 ${d}이므로 버킷 ${d}에 넣어요`, `arr[${i}] = ${x} has ${placeName(p)} digit ${d} → bucket ${d}`),
        7,
        { current: i, range: [i, n - 1], digit: p, bucketIndex: d, currentValue: x },
      );
    }

    const next: number[] = [];
    for (let b = 0; b < 10; b++) {
      if (buckets[b].length === 0) continue;
      const start = next.length;
      next.push(...buckets[b]);
      moves += buckets[b].length;
      const shown = [...next, ...arr.slice(next.length)];
      const written = Array.from({ length: buckets[b].length }, (_, j) => start + j);
      snap(
        'COLLECT',
        tr(
          `버킷 ${b}의 [${buckets[b].join(', ')}]을(를) 순서대로 arr[${start}..${next.length - 1}]에 꺼내요`,
          `Collect bucket ${b} [${buckets[b].join(', ')}] in order into arr[${start}..${next.length - 1}]`,
        ),
        8,
        { array: shown, comparing: written, range: [0, next.length - 1], digit: p, bucketIndex: b, collectedUpTo: b + 1 },
      );
    }
    arr = next;
  }

  snap(
    'DONE',
    tr(
      `기수 정렬 완료! 비교 0회, ${passes}번의 패스 (이동 ${moves}회)`,
      `Radix sort done! 0 comparisons in ${passes} pass${passes === 1 ? '' : 'es'} (${moves} move${moves === 1 ? '' : 's'})`,
    ),
    10,
    { sorted: arr.map((_, i) => i), collectedUpTo: 10, digit: passes > 0 ? passes - 1 : undefined },
  );
  return steps;
}
