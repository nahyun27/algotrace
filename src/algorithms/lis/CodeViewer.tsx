import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';
import type { LISVariant } from './types';

const QUADRATIC_CODE = `def lis(a):
    n = len(a)
    dp = [1] * n  # LIS ending at a[i]
    prev = [-1] * n  # for rebuilding
    for i in range(n):
        for j in range(i):
            if a[j] < a[i] and dp[j] + 1 > dp[i]:
                dp[i] = dp[j] + 1
                prev[i] = j

    end = max(range(n), key=lambda x: dp[x])
    seq = []
    while end != -1:
        seq.append(a[end])
        end = prev[end]
    return seq[::-1]`;

// Keys are the solver's codeLine values: 2 INIT, 5 NEXT_I, 7 COMPARE, 8 UPDATE,
// 11 BACKTRACK (start), 14 BACKTRACK, 16 DONE
const QUADRATIC_PY_LINES: LineMap = { 2: [[2, 4]], 5: [[5, 5]], 7: [[6, 7]], 8: [[8, 9]], 11: [[11, 14]], 14: [[14, 15]], 16: [[16, 16]] };

const QUADRATIC_CPP = `#include <bits/stdc++.h>
using namespace std;

vector<int> lis(vector<int>& a) {
    int n = a.size();
    vector<int> dp(n, 1);  // LIS ending at a[i]
    vector<int> prev(n, -1);  // for rebuilding
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (a[j] < a[i] && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
                prev[i] = j;
            }
        }
    }

    int end = max_element(dp.begin(), dp.end()) - dp.begin();
    vector<int> seq;
    while (end != -1) {
        seq.push_back(a[end]);
        end = prev[end];
    }
    reverse(seq.begin(), seq.end());
    return seq;
}`;

const QUADRATIC_CPP_LINES: LineMap = { 2: [[5, 7]], 5: [[8, 8]], 7: [[9, 10]], 8: [[11, 12]], 11: [[17, 20]], 14: [[20, 21]], 16: [[23, 24]] };

const QUADRATIC_JAVA = `import java.util.*;

class LIS {
    static List<Integer> lis(int[] a) {
        int n = a.length;
        int[] dp = new int[n];  // LIS ending at a[i]
        Arrays.fill(dp, 1);
        int[] prev = new int[n];  // for rebuilding
        Arrays.fill(prev, -1);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (a[j] < a[i] && dp[j] + 1 > dp[i]) {
                    dp[i] = dp[j] + 1;
                    prev[i] = j;
                }
            }
        }

        int end = 0;
        for (int i = 1; i < n; i++) if (dp[i] > dp[end]) end = i;
        List<Integer> seq = new ArrayList<>();
        while (end != -1) {
            seq.add(a[end]);
            end = prev[end];
        }
        Collections.reverse(seq);
        return seq;
    }
}`;

const QUADRATIC_JAVA_LINES: LineMap = { 2: [[5, 9]], 5: [[10, 10]], 7: [[11, 12]], 8: [[13, 14]], 11: [[19, 23]], 14: [[23, 24]], 16: [[26, 27]] };

const FAST_CODE = `def lis(a):
    tails, tails_idx = [], []
    parent = [-1] * len(a)
    for i, x in enumerate(a):
        lo, hi = 0, len(tails)
        while lo < hi:
            mid = (lo + hi) // 2
            if tails[mid] < x: lo = mid + 1
            else: hi = mid
        parent[i] = tails_idx[lo - 1] if lo > 0 else -1
        if lo == len(tails):
            tails.append(x); tails_idx.append(i)
        else:
            tails[lo] = x; tails_idx[lo] = i
    seq, k = [], tails_idx[-1]
    while k != -1:
        seq.append(a[k])
        k = parent[k]
    return seq[::-1]`;

// Keys are the solver's codeLine values: 2 INIT, 5 SEARCH (start), 7 SEARCH (probe), 12 APPEND,
// 14 REPLACE, 15 BACKTRACK (start), 17 BACKTRACK, 19 DONE
const FAST_PY_LINES: LineMap = {
  2: [[2, 3]], 5: [[4, 5]], 7: [[6, 9]], 12: [[10, 12]], 14: [[10, 10], [13, 14]], 15: [[15, 17]], 17: [[17, 18]], 19: [[19, 19]],
};

const FAST_CPP = `#include <bits/stdc++.h>
using namespace std;

vector<int> lis(vector<int>& a) {
    vector<int> tails, tailsIdx;
    vector<int> parent(a.size(), -1);
    for (int i = 0; i < (int)a.size(); i++) {
        int x = a[i];
        int lo = 0, hi = tails.size();
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (tails[mid] < x) lo = mid + 1;
            else hi = mid;
        }
        parent[i] = lo > 0 ? tailsIdx[lo - 1] : -1;
        if (lo == (int)tails.size()) {
            tails.push_back(x); tailsIdx.push_back(i);
        } else {
            tails[lo] = x; tailsIdx[lo] = i;
        }
    }
    vector<int> seq;
    int k = tailsIdx.back();
    while (k != -1) {
        seq.push_back(a[k]);
        k = parent[k];
    }
    reverse(seq.begin(), seq.end());
    return seq;
}`;

const FAST_CPP_LINES: LineMap = {
  2: [[5, 6]], 5: [[7, 9]], 7: [[10, 13]], 12: [[15, 17]], 14: [[15, 15], [18, 19]], 15: [[22, 25]], 17: [[25, 26]], 19: [[28, 29]],
};

const FAST_JAVA = `import java.util.*;

class LIS {
    static List<Integer> lis(int[] a) {
        List<Integer> tails = new ArrayList<>(), tailsIdx = new ArrayList<>();
        int[] parent = new int[a.length];
        for (int i = 0; i < a.length; i++) {
            int x = a[i];
            int lo = 0, hi = tails.size();
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (tails.get(mid) < x) lo = mid + 1;
                else hi = mid;
            }
            parent[i] = lo > 0 ? tailsIdx.get(lo - 1) : -1;
            if (lo == tails.size()) {
                tails.add(x); tailsIdx.add(i);
            } else {
                tails.set(lo, x); tailsIdx.set(lo, i);
            }
        }
        List<Integer> seq = new ArrayList<>();
        int k = tailsIdx.get(tailsIdx.size() - 1);
        while (k != -1) {
            seq.add(a[k]);
            k = parent[k];
        }
        Collections.reverse(seq);
        return seq;
    }
}`;

const FAST_JAVA_LINES: LineMap = {
  2: [[5, 6]], 5: [[7, 9]], 7: [[10, 13]], 12: [[15, 17]], 14: [[15, 15], [18, 19]], 15: [[22, 25]], 17: [[25, 26]], 19: [[28, 29]],
};

export default function LISCodeViewer({ codeLine, variant }: { codeLine: number; variant: LISVariant }) {
  const quad = variant === 'quadratic';
  return (
    <CodePanel
      title={quad ? 'lis_dp.py' : 'lis_binary_search.py'}
      code={quad ? QUADRATIC_CODE : FAST_CODE}
      isLineHighlighted={highlighter(quad ? QUADRATIC_PY_LINES : FAST_PY_LINES, codeLine)}
      sources={{
        cpp: { code: quad ? QUADRATIC_CPP : FAST_CPP, isLineHighlighted: highlighter(quad ? QUADRATIC_CPP_LINES : FAST_CPP_LINES, codeLine) },
        java: { code: quad ? QUADRATIC_JAVA : FAST_JAVA, isLineHighlighted: highlighter(quad ? QUADRATIC_JAVA_LINES : FAST_JAVA_LINES, codeLine) },
      }}
    />
  );
}
