import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';
import type { TPVariant } from './types';

interface VariantCode {
  file: string;
  py: string;
  pyLines: LineMap;
  cpp: string;
  cppLines: LineMap;
  java: string;
  javaLines: LineMap;
}

// sum: keys are the solver's codeLine values: 3 INIT, 7 SHRINK, 12 EXPAND, 14 MATCH, 15 DONE
const SUM_PY = `def count_subarrays(arr, m):
    count, total = 0, 0
    l, r = 0, -1  # window = arr[l..r]
    while True:
        if total >= m:
            total -= arr[l]
            l += 1
        elif r + 1 == len(arr):
            break
        else:
            r += 1
            total += arr[r]
        if total == m:
            count += 1
    return count`;

const SUM_PY_LINES: LineMap = { 3: [[2, 3]], 7: [[5, 7]], 12: [[10, 12]], 14: [[13, 14]], 15: [[8, 9], [15, 15]] };

const SUM_CPP = `#include <bits/stdc++.h>
using namespace std;

int countSubarrays(const vector<int>& arr, int m) {
    int count = 0, total = 0;
    int l = 0, r = -1;  // window = arr[l..r]
    while (true) {
        if (total >= m) {
            total -= arr[l];
            l++;
        } else if (r + 1 == (int)arr.size()) {
            break;
        } else {
            r++;
            total += arr[r];
        }
        if (total == m) {
            count++;
        }
    }
    return count;
}`;

const SUM_JAVA = `import java.util.*;

class TwoPointers {
    static int countSubarrays(int[] arr, int m) {
        int count = 0, total = 0;
        int l = 0, r = -1;  // window = arr[l..r]
        while (true) {
            if (total >= m) {
                total -= arr[l];
                l++;
            } else if (r + 1 == arr.length) {
                break;
            } else {
                r++;
                total += arr[r];
            }
            if (total == m) {
                count++;
            }
        }
        return count;
    }
}`;

// C++ and Java share the same line layout here
const SUM_CPP_LINES: LineMap = { 3: [[5, 6]], 7: [[8, 10]], 12: [[13, 15]], 14: [[17, 18]], 15: [[11, 12], [21, 21]] };
const SUM_JAVA_LINES: LineMap = SUM_CPP_LINES;

// window: 3 INIT, 5 SLIDE, 7 BEST, 8 DONE
const WINDOW_PY = `def max_window_sum(arr, k):
    total = sum(arr[:k])
    best = total
    for r in range(k, len(arr)):
        total += arr[r] - arr[r - k]
        if total > best:
            best = total
    return best`;

const WINDOW_PY_LINES: LineMap = { 3: [[2, 3]], 5: [[4, 5]], 7: [[6, 7]], 8: [[8, 8]] };

const WINDOW_CPP = `#include <bits/stdc++.h>
using namespace std;

int maxWindowSum(const vector<int>& arr, int k) {
    int total = accumulate(arr.begin(), arr.begin() + k, 0);
    int best = total;
    for (int r = k; r < (int)arr.size(); r++) {
        total += arr[r] - arr[r - k];
        if (total > best) {
            best = total;
        }
    }
    return best;
}`;

const WINDOW_JAVA = `import java.util.*;

class SlidingWindow {
    static int maxWindowSum(int[] arr, int k) {
        int total = Arrays.stream(arr, 0, k).sum();
        int best = total;
        for (int r = k; r < arr.length; r++) {
            total += arr[r] - arr[r - k];
            if (total > best) {
                best = total;
            }
        }
        return best;
    }
}`;

const WINDOW_CPP_LINES: LineMap = { 3: [[5, 6]], 5: [[7, 8]], 7: [[9, 10]], 8: [[13, 13]] };
const WINDOW_JAVA_LINES: LineMap = WINDOW_CPP_LINES;

const CODES: Record<TPVariant, VariantCode> = {
  sum: { file: 'two_pointers.py', py: SUM_PY, pyLines: SUM_PY_LINES, cpp: SUM_CPP, cppLines: SUM_CPP_LINES, java: SUM_JAVA, javaLines: SUM_JAVA_LINES },
  window: { file: 'sliding_window.py', py: WINDOW_PY, pyLines: WINDOW_PY_LINES, cpp: WINDOW_CPP, cppLines: WINDOW_CPP_LINES, java: WINDOW_JAVA, javaLines: WINDOW_JAVA_LINES },
};

export default function TwoPointersCodeViewer({ codeLine, variant }: { codeLine: number; variant: TPVariant }) {
  const c = CODES[variant];
  return (
    <CodePanel
      title={c.file}
      code={c.py}
      isLineHighlighted={highlighter(c.pyLines, codeLine)}
      sources={{
        cpp: { code: c.cpp, isLineHighlighted: highlighter(c.cppLines, codeLine) },
        java: { code: c.java, isLineHighlighted: highlighter(c.javaLines, codeLine) },
      }}
    />
  );
}
