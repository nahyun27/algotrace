import type { SortStep } from './types';
import { makeTr, type Lang } from '../../i18n';

export function generateHeapSortSteps(input: number[], lang: Lang = 'ko'): SortStep[] {
  const tr = makeTr(lang);
  const arr = [...input];
  const n = arr.length;
  const steps: SortStep[] = [];
  const sorted: number[] = [];
  let compares = 0, swaps = 0;

  const snap = (type: SortStep['type'], desc: string, codeLine: number, comparing: number[] = [], swapping: number[] = [], hs?: number): void => {
    steps.push({ type, array: [...arr], comparing, swapping, sorted: [...sorted], pivot: null, description: desc, codeLine, compares, swaps, heapSize: hs ?? n });
  };

  snap('INIT', tr('힙 정렬 시작: 먼저 최대 힙 구축', 'Starting heap sort: build a max-heap first'), 1, [], [], n);

  function heapify(size: number, root: number) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;

    if (left < size) {
      compares++;
      snap('COMPARE', tr(`arr[${left}]=${arr[left]}와 arr[${largest}]=${arr[largest]} 비교`, `Compare arr[${left}]=${arr[left]} with arr[${largest}]=${arr[largest]}`), 10, [left, largest], [], size);
      if (arr[left] > arr[largest]) largest = left;
    }
    if (right < size) {
      compares++;
      snap('COMPARE', tr(`arr[${right}]=${arr[right]}와 arr[${largest}]=${arr[largest]} 비교`, `Compare arr[${right}]=${arr[right]} with arr[${largest}]=${arr[largest]}`), 12, [right, largest], [], size);
      if (arr[right] > arr[largest]) largest = right;
    }
    if (largest !== root) {
      [arr[root], arr[largest]] = [arr[largest], arr[root]];
      swaps++;
      snap('SWAP', tr(`arr[${root}]과 arr[${largest}] 교환 (heapify)`, `Swap arr[${root}] and arr[${largest}] (heapify)`), 15, [], [root, largest], size);
      heapify(size, largest);
    }
  }

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }
  snap('COMPARE', tr('최대 힙 구축 완료', 'Max-heap built'), 3, [], [], n);

  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    swaps++;
    sorted.push(i);
    snap('SWAP', tr(`최댓값 arr[0]=${arr[i]}를 끝으로 이동 → 인덱스 ${i} 확정`, `Swap the max arr[0]=${arr[i]} to the end → index ${i} is in its final place`), 5, [], [0, i], i);
    heapify(i, 0);
  }
  sorted.push(0);
  snap('DONE', tr(`힙 정렬 완료! 비교 ${compares}회, 교환 ${swaps}회`, `Heap sort done! ${compares} comparison${compares === 1 ? '' : 's'}, ${swaps} swap${swaps === 1 ? '' : 's'}`), 6, [], [], 0);
  return steps;
}
