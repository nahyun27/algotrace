import type { SortStep } from './types';
import { makeTr, type Lang } from '../../i18n';

export function generateMergeSortSteps(input: number[], lang: Lang = 'ko'): SortStep[] {
  const tr = makeTr(lang);
  const arr = [...input];
  const steps: SortStep[] = [];
  const sorted: number[] = [];
  let compares = 0, swaps = 0;

  const snap = (type: SortStep['type'], desc: string, codeLine: number, comparing: number[] = [], swapping: number[] = [], range?: [number, number]): void => {
    steps.push({ type, array: [...arr], comparing, swapping, sorted: [...sorted], pivot: null, activeRange: range, description: desc, codeLine, compares, swaps });
  };

  snap('INIT', tr('병합 정렬 시작', 'Starting merge sort'), 1);

  function mergeSort(l: number, r: number) {
    if (l >= r) return;
    const mid = Math.floor((l + r) / 2);
    snap('COMPARE', tr(`분할: [${l}..${r}] → [${l}..${mid}] + [${mid + 1}..${r}]`, `Split: [${l}..${r}] → [${l}..${mid}] + [${mid + 1}..${r}]`), 4, [], [], [l, r]);
    mergeSort(l, mid);
    mergeSort(mid + 1, r);
    merge(l, mid, r);
  }

  function merge(l: number, mid: number, r: number) {
    const temp = arr.slice(l, r + 1);
    let i = 0, j = mid - l + 1, k = l;
    snap('COMPARE', tr(`병합 시작: [${l}..${mid}] + [${mid + 1}..${r}]`, `Merging [${l}..${mid}] + [${mid + 1}..${r}]`), 9, [], [], [l, r]);

    while (i <= mid - l && j <= r - l) {
      compares++;
      const li = l + i, rj = l + j;
      snap('COMPARE', tr(`temp[${i}]=${temp[i]}와 temp[${j}]=${temp[j]} 비교`, `Compare temp[${i}]=${temp[i]} with temp[${j}]=${temp[j]}`), 12, [li, rj], [], [l, r]);
      if (temp[i] <= temp[j]) {
        arr[k] = temp[i]; i++;
      } else {
        arr[k] = temp[j]; j++;
      }
      swaps++;
      snap('SET', `arr[${k}] = ${arr[k]}`, 13, [k], [], [l, r]);
      k++;
    }
    while (i <= mid - l) {
      arr[k] = temp[i]; i++; k++; swaps++;
    }
    while (j <= r - l) {
      arr[k] = temp[j]; j++; k++; swaps++;
    }
    snap('SET', tr(`병합 완료: [${l}..${r}] = [${arr.slice(l, r + 1).join(', ')}]`, `Merged: [${l}..${r}] = [${arr.slice(l, r + 1).join(', ')}]`), 18, [], [], [l, r]);

    if (l === 0 && r === arr.length - 1) {
      for (let x = l; x <= r; x++) sorted.push(x);
    }
  }

  mergeSort(0, arr.length - 1);
  for (let i = 0; i < arr.length; i++) if (!sorted.includes(i)) sorted.push(i);
  snap('DONE', tr(`병합 정렬 완료! 비교 ${compares}회, 대입 ${swaps}회`, `Merge sort done! ${compares} comparisons, ${swaps} writes`), 7);
  return steps;
}
