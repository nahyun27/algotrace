export type SortStepType =
  | 'INIT' | 'COMPARE' | 'SWAP' | 'SET' | 'PIVOT' | 'SORTED' | 'DONE'
  // counting sort
  | 'COUNT' | 'PREFIX' | 'PLACE'
  // radix sort
  | 'DIGIT_PASS' | 'BUCKET' | 'COLLECT';

export type SortAlgorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap' | 'counting' | 'radix';

/** Non-comparison sorts that render an extra structure (count array / buckets) under the bars */
export const DISTRIBUTION_SORTS: SortAlgorithm[] = ['counting', 'radix'];

/** Largest value counting sort accepts (count array has COUNTING_MAX + 1 cells) */
export const COUNTING_MAX = 99;

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

  // ── counting sort ──
  counts?: number[];                 // count[0..k-1]
  countIndex?: number | null;        // count cell being updated / read
  countRange?: [number, number];     // count cells covered by this prefix step
  output?: (number | null)[];        // output array (null = still empty)
  outputIndex?: number | null;       // output slot just written

  // ── radix sort ──
  buckets?: number[][];              // ten buckets 0–9 (values in append order)
  digit?: number;                    // digit position of this pass: 0 = ones, 1 = tens, …
  digitCount?: number;               // number of passes (digits of the max)
  bucketIndex?: number | null;       // bucket receiving / being collected
  collectedUpTo?: number;            // buckets 0..collectedUpTo-1 already collected
  currentValue?: number | null;      // element being distributed
}

export const DEFAULT_ARRAY = [38, 27, 43, 3, 9, 82, 10, 64, 15, 52, 29, 7];

/** Display names — pick with `SORT_LABELS[algo][lang]` */
export const SORT_LABELS: Record<SortAlgorithm, { ko: string; en: string }> = {
  bubble:    { ko: '버블 정렬', en: 'Bubble sort' },
  selection: { ko: '선택 정렬', en: 'Selection sort' },
  insertion: { ko: '삽입 정렬', en: 'Insertion sort' },
  merge:     { ko: '병합 정렬', en: 'Merge sort' },
  quick:     { ko: '퀵 정렬',   en: 'Quick sort' },
  heap:      { ko: '힙 정렬',   en: 'Heap sort' },
  counting:  { ko: '계수 정렬', en: 'Counting sort' },
  radix:     { ko: '기수 정렬', en: 'Radix sort' },
};

/** Digit `pos` (0 = ones) of a non-negative integer */
export const digitAt = (value: number, pos: number) => Math.floor(value / 10 ** pos) % 10;

export interface SanitizedInput {
  array: number[];
  /** true when some values had to be rounded / clamped */
  adjusted: boolean;
}

/**
 * Counting sort needs integers 0–COUNTING_MAX, radix sort non-negative integers.
 * Other sorts take the array as is.
 */
export function sanitizeInput(algorithm: SortAlgorithm, input: number[]): SanitizedInput {
  if (algorithm !== 'counting' && algorithm !== 'radix') return { array: input, adjusted: false };
  const hi = algorithm === 'counting' ? COUNTING_MAX : Number.MAX_SAFE_INTEGER;
  const array = input.map(v => Math.min(hi, Math.max(0, Math.round(Number.isFinite(v) ? v : 0))));
  return { array, adjusted: array.some((v, i) => v !== input[i]) };
}

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
  counting: `def counting_sort(arr):
    k = max(arr) + 1
    count = [0] * k
    for x in arr:
        count[x] += 1
    for v in range(1, k):
        count[v] += count[v - 1]
    output = [0] * len(arr)
    for i in range(len(arr) - 1, -1, -1):
        count[arr[i]] -= 1
        output[count[arr[i]]] = arr[i]
    arr[:] = output
    return arr`,

  radix: `def radix_sort(arr):
    exp = 1
    while max(arr) // exp > 0:
        buckets = [[] for _ in range(10)]
        for x in arr:
            d = (x // exp) % 10
            buckets[d].append(x)
        arr[:] = [x for b in buckets for x in b]
        exp *= 10
    return arr`,
};
