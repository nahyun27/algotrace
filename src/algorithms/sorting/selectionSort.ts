import type { SortStep } from './types';
import { makeTr, type Lang } from '../../i18n';

export function generateSelectionSortSteps(input: number[], lang: Lang = 'ko'): SortStep[] {
  const tr = makeTr(lang);
  const arr = [...input];
  const n = arr.length;
  const steps: SortStep[] = [];
  const sorted: number[] = [];
  let compares = 0, swaps = 0;

  const snap = (type: SortStep['type'], desc: string, codeLine: number, comparing: number[] = [], swapping: number[] = []): void => {
    steps.push({ type, array: [...arr], comparing, swapping, sorted: [...sorted], pivot: null, description: desc, codeLine, compares, swaps });
  };

  snap('INIT', tr('선택 정렬 시작', 'Starting selection sort'), 1);

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    snap('COMPARE', tr(`i=${i}: 최솟값 탐색 시작 (현재 최소: arr[${minIdx}]=${arr[minIdx]})`, `i=${i}: search for the minimum (current min: arr[${minIdx}]=${arr[minIdx]})`), 4, [i]);
    for (let j = i + 1; j < n; j++) {
      compares++;
      snap('COMPARE', tr(`arr[${j}]=${arr[j]}와 현재 최소 arr[${minIdx}]=${arr[minIdx]} 비교`, `Compare arr[${j}]=${arr[j]} with current min arr[${minIdx}]=${arr[minIdx]}`), 6, [minIdx, j]);
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      swaps++;
      snap('SWAP', tr(`arr[${i}]과 arr[${minIdx}] 교환`, `Swap arr[${i}] and arr[${minIdx}]`), 8, [], [i, minIdx]);
    }
    sorted.push(i);
    snap('SORTED', tr(`인덱스 ${i}에 최솟값 ${arr[i]} 확정`, `Index ${i} holds the minimum ${arr[i]} — now in its final place`), 8);
  }
  sorted.push(n - 1);
  snap('DONE', tr(`선택 정렬 완료! 비교 ${compares}회, 교환 ${swaps}회`, `Selection sort done! ${compares} comparison${compares === 1 ? '' : 's'}, ${swaps} swap${swaps === 1 ? '' : 's'}`), 9);
  return steps;
}
