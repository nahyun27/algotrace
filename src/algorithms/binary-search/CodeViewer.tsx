import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';
import type { BSVariant } from './types';

interface VariantCode {
  file: string;
  py: string;
  pyLines: LineMap;
  cpp: string;
  cppLines: LineMap;
  java: string;
  javaLines: LineMap;
}

// find: keys are the solver's codeLine values: 2 INIT, 4 MID, 6 FOUND, 8 GO_RIGHT, 10 GO_LEFT, 11 NOT_FOUND
const FIND_PY = `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`;

const FIND_PY_LINES: LineMap = { 2: [[2, 2]], 4: [[3, 4]], 6: [[5, 6]], 8: [[7, 8]], 10: [[9, 10]], 11: [[11, 11]] };

const FIND_CPP = `#include <bits/stdc++.h>
using namespace std;

int binarySearch(const vector<int>& arr, int target) {
    int lo = 0, hi = (int)arr.size() - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return -1;
}`;

const FIND_JAVA = `import java.util.*;

class BinarySearch {
    static int binarySearch(int[] arr, int target) {
        int lo = 0, hi = arr.length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return -1;
    }
}`;

// C++ and Java share the same line layout here
const FIND_CPP_LINES: LineMap = { 2: [[5, 5]], 4: [[6, 7]], 6: [[8, 9]], 8: [[10, 11]], 10: [[12, 13]], 11: [[16, 16]] };
const FIND_JAVA_LINES: LineMap = FIND_CPP_LINES;

// lower: 2 INIT, 4 MID, 6 GO_LEFT, 8 GO_RIGHT, 9 DONE
const LOWER_PY = `def lower_bound(arr, target):
    lo, hi = 0, len(arr)  # [lo, hi)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] >= target:
            hi = mid
        else:
            lo = mid + 1
    return lo  # first index with arr[i] >= target`;

const LOWER_PY_LINES: LineMap = { 2: [[2, 2]], 4: [[3, 4]], 6: [[5, 6]], 8: [[7, 8]], 9: [[9, 9]] };

const LOWER_CPP = `#include <bits/stdc++.h>
using namespace std;

int lowerBound(const vector<int>& arr, int target) {
    int lo = 0, hi = arr.size();  // [lo, hi)
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (arr[mid] >= target) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }
    return lo;  // first index with arr[i] >= target
}`;

const LOWER_JAVA = `import java.util.*;

class LowerBound {
    static int lowerBound(int[] arr, int target) {
        int lo = 0, hi = arr.length;  // [lo, hi)
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (arr[mid] >= target) {
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }
        return lo;  // first index with arr[i] >= target
    }
}`;

const LOWER_CPP_LINES: LineMap = { 2: [[5, 5]], 4: [[6, 7]], 6: [[8, 9]], 8: [[10, 11]], 9: [[14, 14]] };
const LOWER_JAVA_LINES: LineMap = LOWER_CPP_LINES;

// param: 2 INIT, 6 CHECK, 9 GO_RIGHT, 11 GO_LEFT, 12 DONE
const PARAM_PY = `def max_height(trees, m):
    lo, hi = 0, max(trees)
    answer = 0
    while lo <= hi:
        mid = (lo + hi) // 2
        wood = sum(t - mid for t in trees if t > mid)
        if wood >= m:
            answer = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return answer`;

const PARAM_PY_LINES: LineMap = { 2: [[2, 3]], 6: [[4, 6]], 9: [[7, 9]], 11: [[10, 11]], 12: [[12, 12]] };

const PARAM_CPP = `#include <bits/stdc++.h>
using namespace std;

long long maxHeight(const vector<long long>& trees, long long m) {
    long long lo = 0, hi = *max_element(trees.begin(), trees.end());
    long long answer = 0;
    while (lo <= hi) {
        long long mid = (lo + hi) / 2;
        long long wood = 0;
        for (long long t : trees) if (t > mid) wood += t - mid;
        if (wood >= m) {
            answer = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return answer;
}`;

const PARAM_JAVA = `import java.util.*;

class ParametricSearch {
    static long maxHeight(long[] trees, long m) {
        long lo = 0, hi = Arrays.stream(trees).max().getAsLong();
        long answer = 0;
        while (lo <= hi) {
            long mid = (lo + hi) / 2;
            long wood = 0;
            for (long t : trees) if (t > mid) wood += t - mid;
            if (wood >= m) {
                answer = mid;
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return answer;
    }
}`;

const PARAM_CPP_LINES: LineMap = { 2: [[5, 6]], 6: [[7, 10]], 9: [[11, 13]], 11: [[14, 15]], 12: [[18, 18]] };
const PARAM_JAVA_LINES: LineMap = PARAM_CPP_LINES;

const CODES: Record<BSVariant, VariantCode> = {
  find: { file: 'binary_search.py', py: FIND_PY, pyLines: FIND_PY_LINES, cpp: FIND_CPP, cppLines: FIND_CPP_LINES, java: FIND_JAVA, javaLines: FIND_JAVA_LINES },
  lower: { file: 'lower_bound.py', py: LOWER_PY, pyLines: LOWER_PY_LINES, cpp: LOWER_CPP, cppLines: LOWER_CPP_LINES, java: LOWER_JAVA, javaLines: LOWER_JAVA_LINES },
  param: { file: 'parametric_search.py', py: PARAM_PY, pyLines: PARAM_PY_LINES, cpp: PARAM_CPP, cppLines: PARAM_CPP_LINES, java: PARAM_JAVA, javaLines: PARAM_JAVA_LINES },
};

export default function BinarySearchCodeViewer({ codeLine, variant }: { codeLine: number; variant: BSVariant }) {
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
