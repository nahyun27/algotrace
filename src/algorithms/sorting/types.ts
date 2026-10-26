export type SortStepType = 'INIT' | 'COMPARE' | 'SWAP' | 'SET' | 'PIVOT' | 'SORTED' | 'DONE';

export type SortAlgorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap';

export interface SortStep {
  type: SortStepType;
  array: number[];
  comparing: number[];     // indices being compared
  swapping: number[];      // indices being swapped
  sorted: number[];        // indices confirmed sorted
  pivot: number | null;    // pivot index
  activeRange?: [number, number]; // working sub-array
  description: string;
  codeLine: number;
  compares: number;
  swaps: number;
  heapSize?: number;       // heap sort only
}

export const DEFAULT_ARRAY = [38, 27, 43, 3, 9, 82, 10, 64, 15, 52, 29, 7];

/** Display names — pick with `SORT_LABELS[algo][lang]` */
export const SORT_LABELS: Record<SortAlgorithm, { ko: string; en: string }> = {
  bubble:    { ko: '버블 정렬', en: 'Bubble Sort' },
  selection: { ko: '선택 정렬', en: 'Selection Sort' },
  insertion: { ko: '삽입 정렬', en: 'Insertion Sort' },
  merge:     { ko: '병합 정렬', en: 'Merge Sort' },
  quick:     { ko: '퀵 정렬',   en: 'Quick Sort' },
  heap:      { ko: '힙 정렬',   en: 'Heap Sort' },
};

export const SORT_CODES: Record<SortAlgorithm, string> = {
  bubble: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1, 0, -1):
        swapped = False
        for j in range(i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,

  selection: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,

  insertion: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,

  merge: `def merge_sort(arr, l=0, r=None):
    if r is None: r = len(arr) - 1
    if l >= r: return
    mid = (l + r) // 2
    merge_sort(arr, l, mid)
    merge_sort(arr, mid + 1, r)
    merge(arr, l, mid, r)

def merge(arr, l, mid, r):
    temp = arr[l:r+1]
    i, j, k = 0, mid - l + 1, l
    while i <= mid - l and j <= r - l:
        if temp[i] <= temp[j]:
            arr[k] = temp[i]; i += 1
        else:
            arr[k] = temp[j]; j += 1
        k += 1
    while i <= mid - l:
        arr[k] = temp[i]; i += 1; k += 1
    while j <= r - l:
        arr[k] = temp[j]; j += 1; k += 1`,

  quick: `def quick_sort(arr, low=0, high=None):
    if high is None: high = len(arr) - 1
    if low >= high: return
    pivot_idx = partition(arr, low, high)
    quick_sort(arr, low, pivot_idx - 1)
    quick_sort(arr, pivot_idx + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,

  heap: `def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)

def heapify(arr, n, root):
    largest = root
    left, right = 2 * root + 1, 2 * root + 2
    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right
    if largest != root:
        arr[root], arr[largest] = arr[largest], arr[root]
        heapify(arr, n, largest)`,
};
