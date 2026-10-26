import type { SortStep } from './types';
import { makeTr, type Lang } from '../../i18n';

export function generateBubbleSortSteps(input: number[], lang: Lang = 'ko'): SortStep[] {
  const tr = makeTr(lang);
  const arr = [...input];
  const n = arr.length;
  const steps: SortStep[] = [];
  const sorted: number[] = [];
  let compares = 0, swaps = 0;

  const snap = (type: SortStep['type'], desc: string, codeLine: number, comparing: number[] = [], swapping: number[] = []): void => {
    steps.push({ type, array: [...arr], comparing, swapping, sorted: [...sorted], pivot: null, description: desc, codeLine, compares, swaps });
  };

  snap('INIT', tr('버블 정렬 시작', 'Starting bubble sort'), 1);

  for (let i = n - 1; i > 0; i--) {
    let swapped = false;
    for (let j = 0; j < i; j++) {
      compares++;
      snap('COMPARE', tr(`arr[${j}]=${arr[j]}와 arr[${j + 1}]=${arr[j + 1]} 비교`, `Compare arr[${j}]=${arr[j]} with arr[${j + 1}]=${arr[j + 1]}`), 5, [j, j + 1]);
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        swapped = true;
        snap('SWAP', tr(`arr[${j}]과 arr[${j + 1}] 교환`, `Swap arr[${j}] and arr[${j + 1}]`), 7, [], [j, j + 1]);
      }
    }
    sorted.push(i);
    snap('SORTED', tr(`인덱스 ${i} 정렬 확정`, `Index ${i} is now in its final place`), 3);
    if (!swapped) {
      for (let k = 0; k <= i - 1; k++) if (!sorted.includes(k)) sorted.push(k);
      snap('DONE', tr(`교환 없음 → 조기 종료! 비교 ${compares}회, 교환 ${swaps}회`, `No swaps → early exit! ${compares} comparisons, ${swaps} swaps`), 10);
      return steps;
    }
  }
  sorted.push(0);
  snap('DONE', tr(`버블 정렬 완료! 비교 ${compares}회, 교환 ${swaps}회`, `Bubble sort done! ${compares} comparisons, ${swaps} swaps`), 11);
  return steps;
}
