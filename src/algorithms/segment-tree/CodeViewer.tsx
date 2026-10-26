import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';
import type { Structure } from './types';

/* ─────────────── segment tree ─────────────── */

const SEG_PY = `def build(node, start, end):
    if start == end:
        tree[node] = arr[start]
        return
    mid = (start + end) // 2
    build(node * 2, start, mid)
    build(node * 2 + 1, mid + 1, end)
    tree[node] = tree[node * 2] + tree[node * 2 + 1]

def query(node, start, end, l, r):
    if r < start or end < l:
        return 0
    if l <= start and end <= r:
        return tree[node]
    mid = (start + end) // 2
    return (query(node * 2, start, mid, l, r)
            + query(node * 2 + 1, mid + 1, end, l, r))

def update(node, start, end, idx, val):
    if idx < start or idx > end:
        return
    if start == end:
        tree[node] = val
        return
    mid = (start + end) // 2
    update(node * 2, start, mid, idx, val)
    update(node * 2 + 1, mid + 1, end, idx, val)
    tree[node] = tree[node * 2] + tree[node * 2 + 1]`;

// Keys are the solver's codeLine values: 1 BUILD start, 3 BUILD leaf, 8 BUILD internal, 10 query VISIT, 12 OUTSIDE,
// 14 FULL, 17 PARTIAL, 16 query DONE, 19 update VISIT, 21 update OUTSIDE, 23 UPDATE leaf, 28 UPDATE internal, 29 update DONE
const SEG_PY_LINES: LineMap = {
  1: [[1, 1]], 3: [[2, 4]], 8: [[8, 8]], 10: [[10, 10]], 12: [[11, 12]], 14: [[13, 14]], 17: [[15, 17]], 16: [[16, 17]],
  19: [[19, 19], [25, 27]], 21: [[20, 21]], 23: [[22, 24]], 28: [[28, 28]], 29: [[28, 28]],
};

const SEG_CPP = `#include <bits/stdc++.h>
using namespace std;

int n;
vector<long long> arr, tree;  // tree has 4n cells

void build(int node, int start, int end) {
    if (start == end) {
        tree[node] = arr[start];
        return;
    }
    int mid = (start + end) / 2;
    build(node * 2, start, mid);
    build(node * 2 + 1, mid + 1, end);
    tree[node] = tree[node * 2] + tree[node * 2 + 1];
}

long long query(int node, int start, int end, int l, int r) {
    if (r < start || end < l)
        return 0;
    if (l <= start && end <= r)
        return tree[node];
    int mid = (start + end) / 2;
    return query(node * 2, start, mid, l, r)
         + query(node * 2 + 1, mid + 1, end, l, r);
}

void update(int node, int start, int end, int idx, long long val) {
    if (idx < start || idx > end)
        return;
    if (start == end) {
        tree[node] = val;
        return;
    }
    int mid = (start + end) / 2;
    update(node * 2, start, mid, idx, val);
    update(node * 2 + 1, mid + 1, end, idx, val);
    tree[node] = tree[node * 2] + tree[node * 2 + 1];
}`;

const SEG_CPP_LINES: LineMap = {
  1: [[7, 7]], 3: [[8, 10]], 8: [[15, 15]], 10: [[18, 18]], 12: [[19, 20]], 14: [[21, 22]], 17: [[23, 25]], 16: [[24, 25]],
  19: [[28, 28], [35, 37]], 21: [[29, 30]], 23: [[31, 33]], 28: [[38, 38]], 29: [[38, 38]],
};

const SEG_JAVA = `class SegmentTree {
    static long[] arr, tree;  // tree has 4n cells

    static void build(int node, int start, int end) {
        if (start == end) {
            tree[node] = arr[start];
            return;
        }
        int mid = (start + end) / 2;
        build(node * 2, start, mid);
        build(node * 2 + 1, mid + 1, end);
        tree[node] = tree[node * 2] + tree[node * 2 + 1];
    }

    static long query(int node, int start, int end, int l, int r) {
        if (r < start || end < l)
            return 0;
        if (l <= start && end <= r)
            return tree[node];
        int mid = (start + end) / 2;
        return query(node * 2, start, mid, l, r)
             + query(node * 2 + 1, mid + 1, end, l, r);
    }

    static void update(int node, int start, int end, int idx, long val) {
        if (idx < start || idx > end)
            return;
        if (start == end) {
            tree[node] = val;
            return;
        }
        int mid = (start + end) / 2;
        update(node * 2, start, mid, idx, val);
        update(node * 2 + 1, mid + 1, end, idx, val);
        tree[node] = tree[node * 2] + tree[node * 2 + 1];
    }
}`;

const SEG_JAVA_LINES: LineMap = {
  1: [[4, 4]], 3: [[5, 7]], 8: [[12, 12]], 10: [[15, 15]], 12: [[16, 17]], 14: [[18, 19]], 17: [[20, 22]], 16: [[21, 22]],
  19: [[25, 25], [32, 34]], 21: [[26, 27]], 23: [[28, 30]], 28: [[35, 35]], 29: [[35, 35]],
};

/* ─────────────── Fenwick tree ─────────────── */

const FEN_PY = `def build(a):
    for i in range(1, n + 1):
        tree[i] += a[i - 1]
        j = i + (i & -i)
        if j <= n:
            tree[j] += tree[i]

def prefix_sum(i):  # a[0..i-1]
    s = 0
    while i > 0:
        s += tree[i]
        i -= i & -i
    return s

def range_sum(l, r):
    return prefix_sum(r + 1) - prefix_sum(l)

def update(i, delta):
    while i <= n:
        tree[i] += delta
        i += i & -i

def set_value(idx, val):
    update(idx + 1, val - a[idx])
    a[idx] = val`;

// Keys: 3 BUILD, 16 QUERY / query DONE, 9 PREFIX, 11 COLLECT, 13 PREFIX_DONE, 24 SET, 20 UPDATE, 25 update DONE
const FEN_PY_LINES: LineMap = {
  3: [[2, 6]], 16: [[15, 16]], 9: [[8, 9]], 11: [[10, 12]], 13: [[13, 13]], 24: [[23, 24]], 20: [[19, 21]], 25: [[25, 25]],
};

const FEN_CPP = `#include <bits/stdc++.h>
using namespace std;

int n;
vector<long long> a, tree;  // tree has n + 1 cells

void build() {
    for (int i = 1; i <= n; i++) {
        tree[i] += a[i - 1];
        int j = i + (i & -i);
        if (j <= n)
            tree[j] += tree[i];
    }
}

long long prefix_sum(int i) {  // a[0..i-1]
    long long s = 0;
    while (i > 0) {
        s += tree[i];
        i -= i & -i;
    }
    return s;
}

long long range_sum(int l, int r) {
    return prefix_sum(r + 1) - prefix_sum(l);
}

void update(int i, long long delta) {
    while (i <= n) {
        tree[i] += delta;
        i += i & -i;
    }
}

void set_value(int idx, long long val) {
    update(idx + 1, val - a[idx]);
    a[idx] = val;
}`;

const FEN_CPP_LINES: LineMap = {
  3: [[8, 12]], 16: [[25, 26]], 9: [[16, 17]], 11: [[18, 20]], 13: [[22, 22]], 24: [[36, 37]], 20: [[30, 32]], 25: [[38, 38]],
};

const FEN_JAVA = `class Fenwick {
    static int n;
    static long[] a, tree;  // tree has n + 1 cells

    static void build() {
        for (int i = 1; i <= n; i++) {
            tree[i] += a[i - 1];
            int j = i + (i & -i);
            if (j <= n)
                tree[j] += tree[i];
        }
    }

    static long prefixSum(int i) {  // a[0..i-1]
        long s = 0;
        while (i > 0) {
            s += tree[i];
            i -= i & -i;
        }
        return s;
    }

    static long rangeSum(int l, int r) {
        return prefixSum(r + 1) - prefixSum(l);
    }

    static void update(int i, long delta) {
        while (i <= n) {
            tree[i] += delta;
            i += i & -i;
        }
    }

    static void setValue(int idx, long val) {
        update(idx + 1, val - a[idx]);
        a[idx] = val;
    }
}`;

const FEN_JAVA_LINES: LineMap = {
  3: [[6, 10]], 16: [[23, 24]], 9: [[14, 15]], 11: [[16, 18]], 13: [[20, 20]], 24: [[34, 35]], 20: [[28, 30]], 25: [[36, 36]],
};

export default function SegmentTreeCodeViewer({ codeLine, structure }: { codeLine: number; structure: Structure }) {
  const seg = structure === 'segment';
  return (
    <CodePanel
      title={seg ? 'segment_tree.py' : 'fenwick_tree.py'}
      code={seg ? SEG_PY : FEN_PY}
      isLineHighlighted={highlighter(seg ? SEG_PY_LINES : FEN_PY_LINES, codeLine)}
      sources={{
        cpp: { code: seg ? SEG_CPP : FEN_CPP, isLineHighlighted: highlighter(seg ? SEG_CPP_LINES : FEN_CPP_LINES, codeLine) },
        java: { code: seg ? SEG_JAVA : FEN_JAVA, isLineHighlighted: highlighter(seg ? SEG_JAVA_LINES : FEN_JAVA_LINES, codeLine) },
      }}
    />
  );
}
