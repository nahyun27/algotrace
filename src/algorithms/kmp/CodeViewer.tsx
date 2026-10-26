import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';

const KMP_PY = `def build_pi(p):
    m = len(p)
    pi = [0] * m
    j = 0
    for i in range(1, m):
        while j > 0 and p[i] != p[j]:
            j = pi[j - 1]
        if p[i] == p[j]:
            j += 1
        pi[i] = j
    return pi

def kmp(t, p):
    pi = build_pi(p)
    found = []
    j = 0
    for i in range(len(t)):
        while j > 0 and t[i] != p[j]:
            j = pi[j - 1]
        if t[i] == p[j]:
            j += 1
            if j == len(p):
                found.append(i - len(p) + 1)
                j = pi[j - 1]
    return found`;

// Keys are the solver's codeLine values: 1 INIT (pi), 2 PI_FALLBACK, 3 PI_MATCH, 4 PI_SET, 5 INIT (search),
// 6 SEARCH_MISMATCH (j > 0), 11 SEARCH_MISMATCH (j = 0), 7 SEARCH_FALLBACK, 8 SEARCH_MATCH, 9 FOUND, 10 DONE
const PY_LINES: LineMap = {
  1: [[2, 4]], 2: [[6, 7]], 3: [[8, 9]], 4: [[10, 10]],
  5: [[14, 16]], 6: [[18, 18]], 11: [[20, 20]], 7: [[19, 19]], 8: [[20, 21]], 9: [[22, 24]], 10: [[25, 25]],
};

const KMP_CPP = `#include <bits/stdc++.h>
using namespace std;

vector<int> buildPi(const string& p) {
    int m = p.size();
    vector<int> pi(m, 0);
    int j = 0;
    for (int i = 1; i < m; i++) {
        while (j > 0 && p[i] != p[j])
            j = pi[j - 1];
        if (p[i] == p[j])
            j++;
        pi[i] = j;
    }
    return pi;
}

vector<int> kmp(const string& t, const string& p) {
    vector<int> pi = buildPi(p);
    vector<int> found;
    int j = 0;
    for (int i = 0; i < (int)t.size(); i++) {
        while (j > 0 && t[i] != p[j])
            j = pi[j - 1];
        if (t[i] == p[j]) {
            j++;
            if (j == (int)p.size()) {
                found.push_back(i - (int)p.size() + 1);
                j = pi[j - 1];
            }
        }
    }
    return found;
}`;

const KMP_JAVA = `import java.util.*;

class KMP {
    static int[] buildPi(String p) {
        int m = p.length();
        int[] pi = new int[m];
        int j = 0;
        for (int i = 1; i < m; i++) {
            while (j > 0 && p.charAt(i) != p.charAt(j))
                j = pi[j - 1];
            if (p.charAt(i) == p.charAt(j))
                j++;
            pi[i] = j;
        }
        return pi;
    }

    static List<Integer> kmp(String t, String p) {
        int[] pi = buildPi(p);
        List<Integer> found = new ArrayList<>();
        int j = 0;
        for (int i = 0; i < t.length(); i++) {
            while (j > 0 && t.charAt(i) != p.charAt(j))
                j = pi[j - 1];
            if (t.charAt(i) == p.charAt(j)) {
                j++;
                if (j == p.length()) {
                    found.add(i - p.length() + 1);
                    j = pi[j - 1];
                }
            }
        }
        return found;
    }
}`;

// C++ and Java share line numbers
const C_LINES: LineMap = {
  1: [[5, 7]], 2: [[9, 10]], 3: [[11, 12]], 4: [[13, 13]],
  5: [[19, 21]], 6: [[23, 23]], 11: [[25, 25]], 7: [[24, 24]], 8: [[25, 26]], 9: [[27, 29]], 10: [[33, 33]],
};

export default function KMPCodeViewer({ codeLine }: { codeLine: number }) {
  return (
    <CodePanel
      title="kmp.py"
      code={KMP_PY}
      isLineHighlighted={highlighter(PY_LINES, codeLine)}
      sources={{
        cpp: { code: KMP_CPP, isLineHighlighted: highlighter(C_LINES, codeLine) },
        java: { code: KMP_JAVA, isLineHighlighted: highlighter(C_LINES, codeLine) },
      }}
    />
  );
}
