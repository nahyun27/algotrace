import type { SortStep } from './types';
import { makeTr, type Lang } from '../../i18n';

export function generateQuickSortSteps(input: number[], lang: Lang = 'ko'): SortStep[] {
  const tr = makeTr(lang);
  const arr = [...input];
  const n = arr.length;
  const steps: SortStep[] = [];
  const sorted: number[] = [];
  let compares = 0, swaps = 0;

  const snap = (type: SortStep['type'], desc: string, codeLine: number, comparing: number[] = [], swapping: number[] = [], pivotIdx: number | null = null, range?: [number, number]): void => {
    steps.push({ type, array: [...arr], comparing, swapping, sorted: [...sorted], pivot: pivotIdx, activeRange: range, description: desc, codeLine, compares, swaps });
  };

  snap('INIT', tr('퀵 정렬 시작', 'Starting quick sort'), 1);

  function quickSort(low: number, high: number) {
    if (low >= high) {
      if (low === high && !sorted.includes(low)) {
        sorted.push(low);
        snap('SORTED', tr(`인덱스 ${low} 확정 (단일 원소)`, `Index ${low} fixed (single element)`), 4);
      }
      return;
    }
    const pivotIdx = partition(low, high);
    sorted.push(pivotIdx);
    snap('SORTED', tr(`피벗 arr[${pivotIdx}]=${arr[pivotIdx]} 최종 위치 확정`, `Pivot arr[${pivotIdx}]=${arr[pivotIdx]} is in its final place`), 4);
    quickSort(low, pivotIdx - 1);
    quickSort(pivotIdx + 1, high);
  }

  function partition(low: number, high: number): number {
    const pivotVal = arr[high];
    snap('PIVOT', tr(`피벗 선택: arr[${high}]=${pivotVal}`, `Pick pivot: arr[${high}]=${pivotVal}`), 9, [], [], high, [low, high]);
    let i = low - 1;
    for (let j = low; j < high; j++) {
      compares++;
      snap('COMPARE', tr(`arr[${j}]=${arr[j]} <= 피벗 ${pivotVal}?`, `arr[${j}]=${arr[j]} <= pivot ${pivotVal}?`), 11, [j], [], high, [low, high]);
      if (arr[j] <= pivotVal) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swaps++;
          snap('SWAP', tr(`arr[${i}]과 arr[${j}] 교환`, `Swap arr[${i}] and arr[${j}]`), 13, [], [i, j], high, [low, high]);
        }
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    swaps++;
    snap('SWAP', tr(`피벗을 위치 ${i + 1}에 배치`, `Move the pivot to index ${i + 1}`), 14, [], [i + 1, high], i + 1, [low, high]);
    return i + 1;
  }

  quickSort(0, n - 1);
  for (let i = 0; i < n; i++) if (!sorted.includes(i)) sorted.push(i);
  snap('DONE', tr(`퀵 정렬 완료! 비교 ${compares}회, 교환 ${swaps}회`, `Quick sort done! ${compares} comparisons, ${swaps} swaps`), 6);
  return steps;
}
