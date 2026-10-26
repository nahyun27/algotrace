import { GitCompareArrows, ListMusic, SpellCheck } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import { InfoCode } from '../../components/algorithm/InfoModal';
import { MiniTable } from '../../components/viz/MiniTable';
import type { StoryFrame } from '../../components/algorithm/Storyboard';
import type { VizState } from '../../components/viz/palette';
import { useTr, type Tr } from '../../i18n';
import type { LCSMode } from './types';

interface LCSInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
  mode: LCSMode;
}

/** LCS example: A = AXB (rows), B = ABC (columns). Answer "AB", length 2. */
const LCS_A = 'AXB';
const LCS_B = 'ABC';
const LCS_FULL = [
  [0, 0, 0, 0],
  [0, 1, 1, 1],
  [0, 1, 1, 1],
  [0, 1, 2, 2],
];

/** Edit example: CAT → CUTE (replace A with U, insert E). Answer 2. */
const ED_A = 'CAT';
const ED_B = 'CUTE';
const ED_FULL = [
  [0, 1, 2, 3, 4],
  [1, 0, 1, 2, 3],
  [2, 1, 1, 2, 3],
  [3, 2, 2, 1, 2],
];

/** Row 0 and column 0 are always known; other cells are filled in reading order up to (r, c). */
function upTo(full: number[][], r: number, c: number) {
  return full.map((row, i) => row.map((v, j) => (i === 0 || j === 0 || i < r || (i === r && j <= c) ? v : null)));
}

function table(a: string, b: string, values: (number | null)[][], states: Record<string, VizState>) {
  return (
    <MiniTable
      corner="A \ B"
      rowLabels={['∅', ...a.split('')]}
      colLabels={['∅', ...b.split('')]}
      values={values}
      cellState={(r, c) => states[`${r},${c}`] ?? (values[r][c] === null ? 'idle' : 'visited')}
    />
  );
}

function lcsFrames(tr: Tr): StoryFrame[] {
  const t = (r: number, c: number, s: Record<string, VizState>) => table(LCS_A, LCS_B, upTo(LCS_FULL, r, c), s);
  return [
    {
      visual: t(0, 3, {}),
      caption: tr(
        'A = AXB, B = ABC. 칸 dp[i][j] = "A의 앞 i글자, B의 앞 j글자까지 봤을 때의 답(공통으로 고를 수 있는 가장 긴 길이)"이에요. 한쪽이 빈 문자열(∅)이면 0이에요.',
        'A = AXB, B = ABC. Cell dp[i][j] = "the answer using the first i letters of A and the first j letters of B" (the longest run of letters both share, in order). If one side is empty (∅), it is 0.',
      ),
    },
    {
      visual: t(1, 1, { '1,1': 'current', '0,0': 'candidate' }),
      caption: tr(
        'A의 "A"와 B의 "A"가 같아요! 둘 다 빼고 남은 부분의 답(왼쪽 위 대각선 칸 0)에 1을 더해 0 + 1 = 1.',
        'A\'s "A" equals B\'s "A"! Take the answer without both letters (the diagonal cell up-left, 0) and add 1: 0 + 1 = 1.',
      ),
    },
    {
      visual: t(2, 2, { '2,2': 'current', '1,2': 'candidate', '2,1': 'candidate' }),
      caption: tr(
        '"X"와 "B"는 달라요. 그럼 둘 중 하나는 버려야 하니, 위 칸(X를 버림, 1)과 왼쪽 칸(B를 버림, 1) 중 큰 값 1을 적어요.',
        '"X" and "B" differ, so one of them must go. Take the bigger of the cell above (drop X, 1) and the cell to the left (drop B, 1): 1.',
      ),
    },
    {
      visual: t(3, 2, { '3,2': 'current', '2,1': 'candidate' }),
      caption: tr(
        '"B"와 "B"가 같아요. 대각선 칸 1 + 1 = 2. 이제 "AB"까지 공통이라는 뜻이에요.',
        '"B" equals "B". Diagonal cell 1 + 1 = 2. So far "AB" is shared.',
      ),
    },
    {
      visual: t(3, 3, { '3,3': 'path', '3,2': 'path', '2,1': 'path', '1,1': 'path' }),
      caption: tr(
        '오른쪽 아래 칸 2가 답이에요. 거꾸로 따라가며 대각선으로 움직인 칸(같은 글자)을 모으면 공통 부분 수열 "AB"가 나와요.',
        'The bottom-right cell, 2, is the answer. Walk back and collect the letters where you stepped diagonally (matches): "AB".',
      ),
    },
  ];
}

function editFrames(tr: Tr): StoryFrame[] {
  const t = (r: number, c: number, s: Record<string, VizState>) => table(ED_A, ED_B, upTo(ED_FULL, r, c), s);
  return [
    {
      visual: t(0, 4, {}),
      caption: tr(
        'CAT을 CUTE로 바꿔요. 칸 dp[i][j] = "A의 앞 i글자를 B의 앞 j글자로 바꾸는 최소 횟수"예요. 빈 문자열에서 j글자를 만들려면 j번 삽입하니 첫 줄은 0, 1, 2, 3, 4예요.',
        'Turn CAT into CUTE. Cell dp[i][j] = "the fewest edits to turn the first i letters of A into the first j letters of B". Building j letters from nothing takes j inserts, so the first row is 0, 1, 2, 3, 4.',
      ),
    },
    {
      visual: t(1, 1, { '1,1': 'current', '0,0': 'candidate' }),
      caption: tr(
        '"C"와 "C"가 같으니 고칠 필요가 없어요. 대각선 칸 0을 그대로 가져와 0.',
        '"C" equals "C", so nothing to fix. Copy the diagonal cell: 0.',
      ),
    },
    {
      visual: t(2, 2, { '2,2': 'current', '1,1': 'candidate', '1,2': 'candidate', '2,1': 'candidate' }),
      caption: tr(
        '"A"와 "U"는 달라요. 1 + 가장 작은 이웃: ↖교체(0), ↑삭제(1), ←삽입(1). 1 + 0 = 1, A를 U로 바꾸는 게 제일 싸요.',
        '"A" and "U" differ. 1 + the smallest neighbor: ↖ replace (0), ↑ delete (1), ← insert (1). 1 + 0 = 1, so replacing A with U is cheapest.',
      ),
    },
    {
      visual: t(3, 3, { '3,3': 'current', '2,2': 'candidate' }),
      caption: tr(
        '"T"와 "T"는 같아요. 대각선 칸 1을 그대로 가져와요. 지금까지 CAT → CUT에 1번.',
        '"T" equals "T". Copy the diagonal cell, 1. So far CAT → CUT takes 1 edit.',
      ),
    },
    {
      visual: t(3, 4, { '3,4': 'current', '2,3': 'candidate', '2,4': 'candidate', '3,3': 'candidate' }),
      caption: tr(
        '"T"와 "E"는 달라요. 1 + min(↖2, ↑3, ←1) = 1 + 1 = 2. 왼쪽 칸에서 왔으니 E를 삽입한 거예요.',
        '"T" and "E" differ. 1 + min(↖ 2, ↑ 3, ← 1) = 1 + 1 = 2. It came from the left, which means inserting E.',
      ),
    },
    {
      visual: t(3, 4, { '3,4': 'path', '3,3': 'path', '2,2': 'path', '1,1': 'path', '0,0': 'path' }),
      caption: tr(
        '답은 2번이에요. 거꾸로 따라가면 C 그대로, A → U 교체, T 그대로, E 삽입. CAT → CUT → CUTE.',
        'The answer is 2 edits. Walking back: keep C, replace A → U, keep T, insert E. CAT → CUT → CUTE.',
      ),
    },
  ];
}

export default function LCSInfoModal({ isOpen, onClose, onStartVisualization, mode }: LCSInfoModalProps) {
  const tr = useTr();
  const isLcs = mode === 'lcs';
  const dpLine = tr(
    '이 방법을 동적 계획법이라고 해요. 작은 문제(짧은 앞부분끼리)의 답을 표에 적어 두고, 더 긴 부분을 풀 때 다시 꺼내 쓰는 거예요.',
    'This is called dynamic programming: write down answers to small problems (short beginnings) in a table and reuse them for longer ones.',
  );

  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={GitCompareArrows}
      title={isLcs ? tr('최장 공통 부분 수열 (LCS)', 'Longest common subsequence (LCS)') : tr('편집 거리 (레벤슈타인)', 'Edit distance (Levenshtein)')}
      subtitle={tr('두 문자열을 비교하는 2차원 표', 'A two-dimensional table over a pair of strings')}
      summary={isLcs
        ? tr(
          '두 문자열의 앞부분끼리 "같이 고를 수 있는 가장 긴 길이"를 표에 하나씩 적어 가면, 마지막 칸이 두 문자열 전체의 답이 돼요.',
          'Fill a table with "the longest run both beginnings share", one pair of beginnings at a time, and the last cell is the answer for the whole strings.',
        )
        : tr(
          '두 문자열의 앞부분끼리 "몇 번 고치면 같아지나"를 표에 하나씩 적어 가면, 마지막 칸이 최소 수정 횟수가 돼요.',
          'Fill a table with "how many edits make these beginnings equal", one pair at a time, and the last cell is the fewest edits overall.',
        )}
      analogy={isLcs
        ? {
          icon: ListMusic,
          title: tr('두 사람의 플레이리스트', 'Two playlists'),
          body: tr(
            '나와 친구의 플레이리스트에서, 순서를 바꾸지 않고 둘 다 들어 있는 곡만 골라 가장 긴 공통 목록을 만들어요. 중간 곡은 건너뛰어도 되지만 순서는 지켜야 해요. 두 목록의 앞부분부터 조금씩 비교해 나가요.',
            'From your playlist and a friend\'s, pick songs that appear in both, without changing their order, to make the longest shared list. You may skip songs in between, but the order must hold. Compare the beginnings of both lists, a little more each time.',
          ),
        }
        : {
          icon: SpellCheck,
          title: tr('오타 고치기', 'Fixing a typo'),
          body: tr(
            '검색창에 "CAT"을 쳤는데 원래 "CUTE"를 찾고 싶었다면, 글자를 몇 번 고쳐야 할까요? 한 번에 한 글자씩 넣거나, 지우거나, 바꿀 수 있어요. 맞춤법 검사기는 이 횟수가 가장 적은 단어를 추천해 줘요.',
            'You typed "CAT" but meant "CUTE". How many fixes does it take? Each fix inserts, deletes or replaces one letter. Spell checkers suggest the words with the fewest fixes.',
          ),
        }}
      storyboard={isLcs ? lcsFrames(tr) : editFrames(tr)}
      steps={isLcs
        ? [
          dpLine,
          tr('표의 첫 줄과 첫 칸(빈 문자열)은 0으로 채워요.', 'Fill the first row and column (empty string) with 0.'),
          tr('왼쪽 위부터 한 칸씩: 두 글자가 같으면 대각선 칸 + 1, 다르면 위 칸과 왼쪽 칸 중 큰 값.', 'Go cell by cell from the top-left: if the two letters match, diagonal + 1; otherwise the bigger of up and left.'),
          tr('오른쪽 아래 칸이 답이에요. 거꾸로 따라가며 대각선으로 움직인 글자를 모으면 실제 공통 부분 수열이 나와요.', 'The bottom-right cell is the answer. Walk back and collect the letters where you moved diagonally to get the actual subsequence.'),
        ]
        : [
          dpLine,
          tr('첫 줄은 0, 1, 2, …(삽입 횟수), 첫 칸은 0, 1, 2, …(삭제 횟수)로 채워요.', 'The first row is 0, 1, 2, … (inserts) and the first column is 0, 1, 2, … (deletes).'),
          tr('두 글자가 같으면 대각선 칸을 그대로 가져와요.', 'If the two letters match, copy the diagonal cell.'),
          tr('다르면 1 + 세 이웃 중 최솟값: ↖ 교체, ↑ 삭제, ← 삽입.', 'Otherwise 1 + the smallest of three neighbors: ↖ replace, ↑ delete, ← insert.'),
          tr('오른쪽 아래 칸이 답이에요. 거꾸로 따라가면 실제로 어떻게 고쳤는지 알 수 있어요.', 'The bottom-right cell is the answer. Walk back to see the actual edits.'),
        ]}
      useWhen={isLcs
        ? [
          tr('두 글(코드)에서 바뀌지 않은 부분을 찾을 때. git diff가 비슷한 원리예요.', 'Finding what stayed the same between two texts or files. git diff works on a similar idea.'),
          tr('DNA처럼 긴 서열 두 개가 얼마나 닮았는지 볼 때', 'Measuring how alike two long sequences are, like DNA'),
        ]
        : [
          tr('맞춤법 검사, 검색어 추천처럼 "비슷한 단어"를 찾을 때', 'Finding "similar words" for spell check or search suggestions'),
          tr('두 문자열이 얼마나 다른지 숫자 하나로 재고 싶을 때', 'Measuring how different two strings are with a single number'),
        ]}
      watchOut={isLcs
        ? [
          tr('부분 수열은 붙어 있지 않아도 돼요. 붙어 있어야 하는 "공통 부분 문자열"은 다른 문제예요.', 'A subsequence need not be contiguous. "Longest common substring" (contiguous) is a different problem.'),
          tr('표의 0번 줄과 0번 칸은 빈 문자열이에요. 인덱스를 1씩 밀려 쓰는 실수를 조심하세요.', 'Row 0 and column 0 stand for the empty string. Watch for off-by-one mistakes.'),
          tr('답이 여러 개일 수 있어요. 역추적은 그중 하나를 보여 줘요.', 'There can be several answers. Backtracking shows one of them.'),
        ]
        : [
          tr('글자가 같을 때는 +1 하지 않고 대각선 값을 그대로 가져와요.', 'When the letters match, copy the diagonal value without adding 1.'),
          tr('첫 줄과 첫 칸을 0이 아니라 0, 1, 2, …로 채워야 해요.', 'The first row and column are 0, 1, 2, …, not all zeros.'),
          tr('↑와 ←가 삭제인지 삽입인지는 A를 행에 두느냐 열에 두느냐에 따라 바뀌어요.', 'Whether ↑ or ← means delete or insert depends on which string is on the rows.'),
        ]}
      complexity={{
        time: 'O(nm)',
        space: 'O(nm)',
        plain: tr(
          '칸 하나에 비교 몇 번이라, 칸 수(n × m)만큼 걸려요. 두 문자열이 각각 1000글자면 칸이 100만 개로 눈 깜짝할 사이에 끝나요. 두 문자열이 모두 2배가 되면 시간은 4배예요.',
          'Each cell takes a few comparisons, so the work equals the number of cells (n × m). Two strings of 1,000 letters make 1 million cells: done in a blink. Double both strings and it takes 4 times as long.',
        ),
      }}
    >
      <InfoCode caption={tr('한 줄로 쓰면 (점화식)', 'In one line (the recurrence)')}>
        {isLcs
          ? tr(
            'dp[i][j] = dp[i-1][j-1] + 1                # 글자가 같을 때\n         = max(dp[i-1][j], dp[i][j-1])     # 다를 때',
            'dp[i][j] = dp[i-1][j-1] + 1                # letters match\n         = max(dp[i-1][j], dp[i][j-1])     # otherwise',
          )
          : tr(
            'dp[i][j] = dp[i-1][j-1]                    # 글자가 같을 때\n         = 1 + min(dp[i-1][j-1],           # 교체\n                   dp[i-1][j],             # 삭제\n                   dp[i][j-1])             # 삽입',
            'dp[i][j] = dp[i-1][j-1]                    # letters match\n         = 1 + min(dp[i-1][j-1],           # replace\n                   dp[i-1][j],             # delete\n                   dp[i][j-1])             # insert',
          )}
      </InfoCode>
    </ConceptModal>
  );
}
