import CodePanel from '../../components/algorithm/CodePanel';
import { highlighter, type LineMap } from '../../components/algorithm/codeLines';

/* ─────────────── N-Queens ─────────────── */

const QUEENS_PY = `n = int(input())
board = [-1] * n      # board[row] = column of the queen
count = 0

def is_safe(row, col):
    for r in range(row):
        c = board[r]
        if c == col or abs(c - col) == row - r:
            return False  # attacked
    return True

def solve(row):
    global count
    if row == n:
        count += 1        # found a full board
        return
    for col in range(n):
        if is_safe(row, col):
            board[row] = col
            solve(row + 1)
            board[row] = -1   # backtrack

solve(0)
print(count)`;

const QUEENS_CPP = `#include <bits/stdc++.h>
using namespace std;

int n, cnt = 0;
vector<int> board;  // board[row] = column of the queen

bool isSafe(int row, int col) {
    for (int r = 0; r < row; r++) {
        int c = board[r];
        if (c == col || abs(c - col) == row - r)
            return false;  // attacked
    }
    return true;
}

void solve(int row) {
    if (row == n) {
        cnt++;  // found a full board
        return;
    }
    for (int col = 0; col < n; col++) {
        if (isSafe(row, col)) {
            board[row] = col;
            solve(row + 1);
            board[row] = -1;  // backtrack
        }
    }
}

int main() {
    cin >> n;
    board.assign(n, -1);
    solve(0);
    cout << cnt << '\\n';
}`;

const QUEENS_JAVA = `import java.util.*;

public class Main {
    static int n, count = 0;
    static int[] board;  // board[row] = column of the queen

    static boolean isSafe(int row, int col) {
        for (int r = 0; r < row; r++) {
            int c = board[r];
            if (c == col || Math.abs(c - col) == row - r)
                return false;  // attacked
        }
        return true;
    }

    static void solve(int row) {
        if (row == n) {
            count++;  // found a full board
            return;
        }
        for (int col = 0; col < n; col++) {
            if (isSafe(row, col)) {
                board[row] = col;
                solve(row + 1);
                board[row] = -1;  // backtrack
            }
        }
    }

    public static void main(String[] args) {
        n = new Scanner(System.in).nextInt();
        board = new int[n];
        Arrays.fill(board, -1);
        solve(0);
        System.out.println(count);
    }
}`;

/* ─────────────── Sudoku ─────────────── */

const SUDOKU_PY = `n, b = 9, 3          # 4×4 board: n, b = 4, 2
board = [list(map(int, input().split())) for _ in range(n)]
blanks = [(r, c) for r in range(n) for c in range(n) if board[r][c] == 0]

def ok(r, c, d):
    for i in range(n):
        if board[r][i] == d or board[i][c] == d:
            return False      # same row or column
    br, bc = r - r % b, c - c % b
    for i in range(br, br + b):
        for j in range(bc, bc + b):
            if board[i][j] == d:
                return False  # same box
    return True

def solve(k):
    if k == len(blanks):
        return True           # every blank is filled
    r, c = blanks[k]
    for d in range(1, n + 1):
        if ok(r, c, d):
            board[r][c] = d
            if solve(k + 1):
                return True
            board[r][c] = 0   # backtrack
    return False

solve(0)
for row in board:
    print(*row)`;

const SUDOKU_CPP = `#include <bits/stdc++.h>
using namespace std;

const int n = 9, b = 3;  // 4×4 board: n = 4, b = 2
int board[9][9];
vector<pair<int, int>> blanks;

bool ok(int r, int c, int d) {
    for (int i = 0; i < n; i++)
        if (board[r][i] == d || board[i][c] == d)
            return false;  // same row or column
    int br = r - r % b, bc = c - c % b;
    for (int i = br; i < br + b; i++)
        for (int j = bc; j < bc + b; j++)
            if (board[i][j] == d)
                return false;  // same box
    return true;
}

bool solve(int k) {
    if (k == (int)blanks.size())
        return true;  // every blank is filled
    auto [r, c] = blanks[k];
    for (int d = 1; d <= n; d++) {
        if (ok(r, c, d)) {
            board[r][c] = d;
            if (solve(k + 1))
                return true;
            board[r][c] = 0;  // backtrack
        }
    }
    return false;
}

int main() {
    for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++) {
            cin >> board[r][c];
            if (board[r][c] == 0) blanks.push_back({r, c});
        }
    solve(0);
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) cout << board[r][c] << ' ';
        cout << '\\n';
    }
}`;

const SUDOKU_JAVA = `import java.util.*;

public class Main {
    static int n = 9, b = 3;  // 4×4 board: n = 4, b = 2
    static int[][] board = new int[n][n];
    static List<int[]> blanks = new ArrayList<>();

    static boolean ok(int r, int c, int d) {
        for (int i = 0; i < n; i++)
            if (board[r][i] == d || board[i][c] == d)
                return false;  // same row or column
        int br = r - r % b, bc = c - c % b;
        for (int i = br; i < br + b; i++)
            for (int j = bc; j < bc + b; j++)
                if (board[i][j] == d)
                    return false;  // same box
        return true;
    }

    static boolean solve(int k) {
        if (k == blanks.size())
            return true;  // every blank is filled
        int r = blanks.get(k)[0], c = blanks.get(k)[1];
        for (int d = 1; d <= n; d++) {
            if (ok(r, c, d)) {
                board[r][c] = d;
                if (solve(k + 1))
                    return true;
                board[r][c] = 0;  // backtrack
            }
        }
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++) {
                board[r][c] = sc.nextInt();
                if (board[r][c] == 0) blanks.add(new int[]{r, c});
            }
        solve(0);
        StringBuilder sb = new StringBuilder();
        for (int[] row : board) {
            for (int v : row) sb.append(v).append(' ');
            sb.append('\\n');
        }
        System.out.print(sb);
    }
}`;

/* ─────────────── line maps ─────────────── */

/** 1-based line range from the first line containing `from` to the next line (at or after it) containing `to`. */
function span(code: string, from: string, to: string = from): [number, number] {
  const lines = code.split('\n');
  const a = lines.findIndex(l => l.includes(from));
  const b = lines.findIndex((l, i) => i >= a && l.includes(to));
  if (a < 0 || b < 0) throw new Error(`code line not found: ${from} / ${to}`);
  return [a + 1, b + 1];
}

/** Queens keys: 1 INIT, 2 PLACE, 3 CONFLICT, 4 BACKTRACK, 5 SOLUTION, 6 DONE */
const queensMap = (code: string, k: { init: [string, string]; place: [string, string]; conflict: [string, string]; back: string; sol: [string, string]; done: [string, string] }): LineMap => ({
  1: [span(code, ...k.init)],
  2: [span(code, ...k.place)],
  3: [span(code, ...k.conflict)],
  4: [span(code, k.back)],
  5: [span(code, ...k.sol)],
  6: [span(code, ...k.done)],
});

const QUEENS_LINES = {
  py: queensMap(QUEENS_PY, {
    init: ['n = int(input())', 'count = 0'], place: ['if is_safe(row, col)', 'solve(row + 1)'],
    conflict: ['if c == col', 'return False'], back: 'board[row] = -1', sol: ['if row == n', 'count += 1'], done: ['solve(0)', 'print(count)'],
  }),
  cpp: queensMap(QUEENS_CPP, {
    init: ['cin >> n', 'board.assign'], place: ['if (isSafe(row, col))', 'solve(row + 1)'],
    conflict: ['if (c == col', 'return false'], back: 'board[row] = -1', sol: ['if (row == n)', 'cnt++'], done: ['solve(0);', 'cout << cnt'],
  }),
  java: queensMap(QUEENS_JAVA, {
    init: ['n = new Scanner', 'Arrays.fill'], place: ['if (isSafe(row, col))', 'solve(row + 1)'],
    conflict: ['if (c == col', 'return false'], back: 'board[row] = -1', sol: ['if (row == n)', 'count++'], done: ['solve(0);', 'System.out.println'],
  }),
};

/** Sudoku keys: 1 INIT, 2 TRY, 3 INVALID (row/col), 4 INVALID (box), 5 FILL_OK, 6 BACKTRACK, 7 SOLVED, 8 DONE */
const sudokuMap = (code: string, k: { init: [string, string]; tryD: [string, string]; rc: [string, string]; box: [string, string]; done: [string, string]; solved: [string, string]; solveCall: string }): LineMap => ({
  1: [span(code, ...k.init)],
  2: [span(code, ...k.tryD)],
  3: [span(code, ...k.rc)],
  4: [span(code, ...k.box)],
  5: [span(code, 'board[r][c] = d', k.solveCall)],
  6: [span(code, 'board[r][c] = 0')],
  7: [span(code, ...k.solved)],
  8: [span(code, ...k.done)],
});

const SUDOKU_LINES = {
  py: sudokuMap(SUDOKU_PY, {
    init: ['n, b = 9, 3', 'blanks = '], tryD: ['for d in range', 'if ok(r, c, d)'], rc: ['for i in range(n)', 'same row or column'],
    box: ['br, bc = ', 'same box'], solved: ['if k == len(blanks)', 'every blank'], done: ['solve(0)', 'print(*row)'], solveCall: 'if solve(k + 1)',
  }),
  cpp: sudokuMap(SUDOKU_CPP, {
    init: ['for (int r = 0; r < n; r++)', 'blanks.push_back'], tryD: ['for (int d = 1', 'if (ok(r, c, d))'], rc: ['for (int i = 0; i < n; i++)', 'same row or column'],
    box: ['int br = ', 'same box'], solved: ['if (k == (int)blanks.size())', 'every blank'], done: ['solve(0);', "cout << '\\n'"], solveCall: 'if (solve(k + 1))',
  }),
  java: sudokuMap(SUDOKU_JAVA, {
    init: ['Scanner sc', 'blanks.add'], tryD: ['for (int d = 1', 'if (ok(r, c, d))'], rc: ['for (int i = 0; i < n; i++)', 'same row or column'],
    box: ['int br = ', 'same box'], solved: ['if (k == blanks.size())', 'every blank'], done: ['solve(0);', 'System.out.print(sb)'], solveCall: 'if (solve(k + 1))',
  }),
};

export default function BacktrackingCodeViewer({ variant, codeLine }: { variant: 'queens' | 'sudoku'; codeLine: number }) {
  if (variant === 'queens') {
    return (
      <CodePanel
        title="n_queens.py"
        code={QUEENS_PY}
        isLineHighlighted={highlighter(QUEENS_LINES.py, codeLine)}
        sources={{
          cpp: { code: QUEENS_CPP, isLineHighlighted: highlighter(QUEENS_LINES.cpp, codeLine) },
          java: { code: QUEENS_JAVA, isLineHighlighted: highlighter(QUEENS_LINES.java, codeLine) },
        }}
      />
    );
  }
  return (
    <CodePanel
      title="sudoku.py"
      code={SUDOKU_PY}
      isLineHighlighted={highlighter(SUDOKU_LINES.py, codeLine)}
      sources={{
        cpp: { code: SUDOKU_CPP, isLineHighlighted: highlighter(SUDOKU_LINES.cpp, codeLine) },
        java: { code: SUDOKU_JAVA, isLineHighlighted: highlighter(SUDOKU_LINES.java, codeLine) },
      }}
    />
  );
}
