import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';

/*
 * One template per language. {STAY} is the sift-up "parent is fine" test, {ABOVE} the sift-down child test
 * and {BEST} the name of the chosen child, so the max-heap version keeps the same line numbers.
 */
const PY = `def sift_up(heap, i):
    while i > 0:
        parent = (i - 1) // 2
        if heap[i] {STAY} heap[parent]:
            break
        heap[i], heap[parent] = heap[parent], heap[i]
        i = parent

def sift_down(heap, i):
    n = len(heap)
    while True:
        {BEST} = i
        l, r = 2 * i + 1, 2 * i + 2
        if l < n and heap[l] {ABOVE} heap[{BEST}]:
            {BEST} = l
        if r < n and heap[r] {ABOVE} heap[{BEST}]:
            {BEST} = r
        if {BEST} == i:
            break
        heap[i], heap[{BEST}] = heap[{BEST}], heap[i]
        i = {BEST}

def push(heap, x):
    heap.append(x)
    sift_up(heap, len(heap) - 1)

def pop(heap):
    if not heap:
        return None
    top = heap[0]
    heap[0] = heap[-1]
    heap.pop()
    if heap:
        sift_down(heap, 0)
    return top

def build_heap(arr):
    heap = list(arr)
    for i in range(len(heap) // 2 - 1, -1, -1):
        sift_down(heap, i)
    return heap`;

// Keys are the solver's codeLine values (see solver.ts)
const PY_LINES: LineMap = {
  1: [[37, 38]], 2: [[23, 23]], 3: [[27, 28]],
  10: [[12, 17]], 14: [[39, 40], [12, 17]], 11: [[20, 21]], 12: [[18, 19]],
  20: [[2, 4]], 21: [[6, 7]], 22: [[4, 5]], 23: [[2, 2]],
  30: [[24, 24]], 40: [[30, 30]], 41: [[31, 34]],
  50: [[41, 41]], 51: [[25, 25]], 52: [[35, 35]], 53: [[28, 29]],
};

const CPP = `#include <bits/stdc++.h>
using namespace std;

void siftUp(vector<int>& heap, int i) {
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap[i] {STAY} heap[parent])
            break;
        swap(heap[i], heap[parent]);
        i = parent;
    }
}

void siftDown(vector<int>& heap, int i) {
    int n = heap.size();
    while (true) {
        int {BEST} = i;
        int l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && heap[l] {ABOVE} heap[{BEST}])
            {BEST} = l;
        if (r < n && heap[r] {ABOVE} heap[{BEST}])
            {BEST} = r;
        if ({BEST} == i)
            break;
        swap(heap[i], heap[{BEST}]);
        i = {BEST};
    }
}

void push(vector<int>& heap, int x) {
    heap.push_back(x);
    siftUp(heap, heap.size() - 1);
}

optional<int> pop(vector<int>& heap) {
    if (heap.empty())
        return nullopt;
    int top = heap[0];
    heap[0] = heap.back();
    heap.pop_back();
    if (!heap.empty())
        siftDown(heap, 0);
    return top;
}

vector<int> buildHeap(vector<int> arr) {
    vector<int> heap = arr;
    for (int i = (int)heap.size() / 2 - 1; i >= 0; i--)
        siftDown(heap, i);
    return heap;
}`;

const JAVA = `import java.util.*;

class Heap {
    static void siftUp(List<Integer> heap, int i) {
        while (i > 0) {
            int parent = (i - 1) / 2;
            if (heap.get(i) {STAY} heap.get(parent))
                break;
            Collections.swap(heap, i, parent);
            i = parent;
        }
    }

    static void siftDown(List<Integer> heap, int i) {
        int n = heap.size();
        while (true) {
            int {BEST} = i;
            int l = 2 * i + 1, r = 2 * i + 2;
            if (l < n && heap.get(l) {ABOVE} heap.get({BEST}))
                {BEST} = l;
            if (r < n && heap.get(r) {ABOVE} heap.get({BEST}))
                {BEST} = r;
            if ({BEST} == i)
                break;
            Collections.swap(heap, i, {BEST});
            i = {BEST};
        }
    }

    static void push(List<Integer> heap, int x) {
        heap.add(x);
        siftUp(heap, heap.size() - 1);
    }

    static Integer pop(List<Integer> heap) {
        if (heap.isEmpty())
            return null;
        int top = heap.get(0);
        heap.set(0, heap.get(heap.size() - 1));
        heap.remove(heap.size() - 1);
        if (!heap.isEmpty())
            siftDown(heap, 0);
        return top;
    }

    static List<Integer> buildHeap(List<Integer> arr) {
        List<Integer> heap = new ArrayList<>(arr);
        for (int i = heap.size() / 2 - 1; i >= 0; i--)
            siftDown(heap, i);
        return heap;
    }
}`;

// C++ and Java share the same line layout
const CPP_LINES: LineMap = {
  1: [[46, 47]], 2: [[30, 30]], 3: [[35, 36]],
  10: [[17, 22]], 14: [[48, 49], [17, 22]], 11: [[25, 26]], 12: [[23, 24]],
  20: [[5, 7]], 21: [[9, 10]], 22: [[7, 8]], 23: [[5, 5]],
  30: [[31, 31]], 40: [[38, 38]], 41: [[39, 42]],
  50: [[50, 50]], 51: [[32, 32]], 52: [[43, 43]], 53: [[36, 37]],
};
const JAVA_LINES = CPP_LINES;

const fill = (code: string, isMax: boolean) =>
  code
    .replaceAll('{STAY}', isMax ? '<=' : '>=')
    .replaceAll('{ABOVE}', isMax ? '>' : '<')
    .replaceAll('{BEST}', isMax ? 'largest' : 'smallest');

export default function HeapCodeViewer({ codeLine, isMax }: { codeLine: number; isMax: boolean }) {
  return (
    <CodePanel
      title={isMax ? 'max_heap.py' : 'min_heap.py'}
      code={fill(PY, isMax)}
      isLineHighlighted={highlighter(PY_LINES, codeLine)}
      sources={{
        cpp: { code: fill(CPP, isMax), isLineHighlighted: highlighter(CPP_LINES, codeLine) },
        java: { code: fill(JAVA, isMax), isLineHighlighted: highlighter(JAVA_LINES, codeLine) },
      }}
    />
  );
}
