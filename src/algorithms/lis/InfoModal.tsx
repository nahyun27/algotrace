import { TrendingUp, Users } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import { MiniCells } from '../../components/viz/MiniTable';
import type { VizState } from '../../components/viz/palette';
import { cn } from '../../components/ui';
import { toneSoft } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface LISInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

/** a = [3, 1, 4, 2, 5] → dp = [1, 1, 2, 2, 3], one LIS is 3, 4, 5 */
const A = [3, 1, 4, 2, 5];
const DP = [1, 1, 2, 2, 3];

function dpFrame(shown: number, states: Record<number, VizState>) {
  const st = (i: number): VizState => states[i] ?? (i < shown ? 'visited' : 'idle');
  return (
    <div className="flex flex-col items-center gap-2">
      <MiniCells label="a" values={A} stateOf={st} under={i => i} />
      <MiniCells label="dp" values={DP.map((v, i) => (i < shown ? v : null))} stateOf={i => (states[i] === 'current' || states[i] === 'path' ? states[i] : i < shown ? 'visited' : 'idle')} />
    </div>
  );
}

/** tails after each number: [3] → [1] → [1,4] → [1,2] → [1,2,5] */
const TAILS: { x: number; tails: number[]; changed: number; added: boolean }[] = [
  { x: 3, tails: [3], changed: 0, added: true },
  { x: 1, tails: [1], changed: 0, added: false },
  { x: 4, tails: [1, 4], changed: 1, added: true },
  { x: 2, tails: [1, 2], changed: 1, added: false },
  { x: 5, tails: [1, 2, 5], changed: 2, added: true },
];

function TailsFrame() {
  return (
    <div className="flex flex-col gap-1">
      {TAILS.map((t, row) => (
        <div key={row} className="flex items-center gap-2">
          <span className="w-12 text-right text-xs font-mono font-bold text-muted-foreground">+{t.x}</span>
          <div className="flex gap-1">
            {t.tails.map((v, i) => (
              <span
                key={i}
                className={cn(
                  'w-8 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-sm',
                  i !== t.changed ? 'border border-border bg-card text-muted-foreground'
                    : t.added ? `${toneSoft.visited} ring-2 ring-state-visited/60`
                      : `${toneSoft.candidate} ring-2 ring-state-candidate/70`,
                )}
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LISInfoModal({ isOpen, onClose, onStartVisualization }: LISInfoModalProps) {
  const tr = useTr();
  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={TrendingUp}
      title={tr('최장 증가 부분 수열 (LIS)', 'Longest increasing subsequence (LIS)')}
      subtitle={tr('표로 푸는 O(n²) 방법과 이분 탐색으로 푸는 O(n log n) 방법', 'An O(n²) table method and an O(n log n) binary search method')}
      summary={tr(
        '숫자마다 "여기서 끝나는 가장 긴 오르막 길이"를 앞에서부터 적어 두면, 뒤의 숫자는 앞에 적힌 값에 1만 더해서 자기 답을 구할 수 있어요.',
        'For each number, write down "the longest climb that ends here", front to back. Each later number gets its answer by adding 1 to a value already written.',
      )}
      analogy={{
        icon: Users,
        title: tr('키 순서로 줄 세우기', 'Lining up by height'),
        body: tr(
          '학생들이 한 줄로 서 있어요. 자리를 바꾸지 않고 몇 명만 뽑아서, 앞에서 뒤로 갈수록 키가 커지게 만들고 싶어요. 최대 몇 명까지 뽑을 수 있을까요? 각 학생은 "내 앞에 나보다 작은 사람 중 가장 긴 줄 뒤에 서면 돼"라고 생각하면 돼요.',
          'Students stand in a row. Without changing their places, you pick some of them so heights increase from front to back. How many can you pick at most? Each student just thinks: "I join the end of the longest line among shorter people in front of me."',
        ),
      }}
      storyboard={[
        {
          visual: dpFrame(1, { 0: 'current' }),
          caption: tr(
            'a = [3, 1, 4, 2, 5]. dp[i] = "a[i]로 끝나는 가장 긴 증가 수열의 길이"예요. 3은 앞에 아무도 없으니 혼자서 길이 1.',
            'a = [3, 1, 4, 2, 5]. dp[i] = "the length of the longest increasing run that ends at a[i]". 3 has nobody in front, so it is 1 on its own.',
          ),
        },
        {
          visual: dpFrame(3, { 2: 'current', 0: 'candidate', 1: 'candidate' }),
          caption: tr(
            '4 차례. 앞에 있는 3과 1 모두 4보다 작아서 뒤에 붙을 수 있어요. 둘 다 dp가 1이니 1 + 1 = 2.',
            'Now 4. Both 3 and 1 in front are smaller, so 4 can follow either. Both have dp 1, so 1 + 1 = 2.',
          ),
        },
        {
          visual: dpFrame(4, { 3: 'current', 1: 'candidate', 0: 'danger', 2: 'danger' }),
          caption: tr(
            '2 차례. 3과 4는 2보다 커서 뒤에 붙을 수 없어요(빨강). 1 뒤에만 붙을 수 있으니 1 + 1 = 2.',
            'Now 2. 3 and 4 are bigger than 2, so it cannot follow them (red). It can only follow 1: 1 + 1 = 2.',
          ),
        },
        {
          visual: dpFrame(5, { 4: 'current', 0: 'candidate', 1: 'candidate', 2: 'candidate', 3: 'candidate' }),
          caption: tr(
            '5 차례. 앞의 네 숫자 모두 5보다 작아요. 그중 dp가 가장 큰 값은 2(4나 2)라서 2 + 1 = 3.',
            'Now 5. All four numbers in front are smaller. The biggest dp among them is 2 (at 4 or 2), so 2 + 1 = 3.',
          ),
        },
        {
          visual: dpFrame(5, { 0: 'path', 2: 'path', 4: 'path' }),
          caption: tr(
            'dp에서 가장 큰 값 3이 답이에요. 어디 뒤에 붙었는지 거꾸로 따라가면 3 → 4 → 5 같은 수열이 나와요.',
            'The biggest dp, 3, is the answer. Following "who did I follow" backwards gives a run like 3 → 4 → 5.',
          ),
        },
        {
          visual: <TailsFrame />,
          caption: tr(
            '빠른 방법: tails[k] = "길이 k+1 오르막의 가장 작은 끝값". 숫자가 오면 이분 탐색으로 자리를 찾아 바꾸거나(노랑) 끝에 붙여요(초록). tails 길이 3이 답이에요.',
            'Faster: tails[k] = "the smallest last value of a climb of length k+1". Each number finds its slot by binary search and replaces it (amber) or is appended (green). Length 3 is the answer.',
          ),
        },
      ]}
      steps={[
        tr('이 방법을 동적 계획법이라고 해요. 작은 문제(앞부분)의 답을 적어 두고 뒤에서 다시 꺼내 쓰는 거예요.', 'This is called dynamic programming: write down answers to small problems (the front part) and reuse them later.'),
        tr('O(n²) 방법: 각 숫자마다 앞의 숫자를 모두 보고, 자기보다 작은 숫자의 dp 중 최댓값 + 1을 적어요. 아무도 없으면 1이에요.', 'O(n²) method: for each number, look at every number in front and write 1 + the largest dp among the smaller ones (1 if none).'),
        tr('dp 전체에서 가장 큰 값이 답이에요. "누구 뒤에 붙었는지"를 같이 적어 두면 실제 수열도 복원할 수 있어요.', 'The largest dp is the answer. If you also note "who I followed", you can rebuild the actual run.'),
        tr('O(n log n) 방법: tails 배열을 유지하면서, 새 숫자 x보다 크거나 같은 첫 값을 이분 탐색(반씩 잘라 찾기)으로 찾아 x로 바꿔요. 없으면 끝에 붙여요.', 'O(n log n) method: keep a tails array. For each new x, use binary search (halving the range) to find the first value ≥ x and replace it with x; if none, append x.'),
      ]}
      useWhen={[
        tr('순서는 그대로 두고, 점점 커지는 것만 최대한 많이 고르고 싶을 때', 'You want to keep the order and pick as many steadily rising items as possible'),
        tr('"전깃줄 꼬이지 않게 최대한 남기기", "상자 넣기" 같은 문제가 사실 LIS일 때', 'Problems like "keep the most wires without crossings" or "nest the most boxes" turn out to be LIS'),
        tr('n이 수천이면 O(n²), 수십만 이상이면 tails 방법을 써요.', 'Use O(n²) for a few thousand numbers, the tails method for hundreds of thousands or more.'),
      ]}
      watchOut={[
        tr('tails 배열 자체는 실제 LIS가 아닐 수 있어요. 예: [3, 4, 1]이면 tails = [1, 4]인데 1 뒤에 4는 오지 않아요. 길이만 믿을 수 있어요.', 'The tails array is not always a real LIS. For [3, 4, 1], tails = [1, 4], yet 4 never comes after 1. Only its length is trustworthy.'),
        tr('"엄격히 증가"인지 "같아도 되는지"에 따라 이분 탐색 기준(≥ 또는 >)이 달라져요.', 'Strictly increasing vs. allowing equal values changes the binary search condition (≥ or >).'),
        tr('답은 dp의 마지막 칸이 아니라 dp 전체의 최댓값이에요.', 'The answer is the maximum over all of dp, not the last cell.'),
      ]}
      complexity={{
        time: 'O(n log n)',
        space: 'O(n)',
        plain: tr(
          'O(n²) 방법은 숫자가 2배면 시간이 4배라 1만 개쯤이 한계예요. tails 방법은 숫자가 2배여도 시간이 2배를 살짝 넘는 정도라 100만 개도 순식간이에요.',
          'The O(n²) method takes 4 times as long when the input doubles, so about 10,000 numbers is its limit. The tails method takes just over twice as long, so even 1 million numbers finish instantly.',
        ),
      }}
    >
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60 text-muted-foreground text-xs">
              <th className="px-4 py-2 text-left font-semibold">{tr('방법', 'Method')}</th>
              <th className="px-4 py-2 text-left font-semibold">{tr('시간', 'Time')}</th>
              <th className="px-4 py-2 text-left font-semibold">{tr('특징', 'Notes')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="px-4 py-2 font-semibold">{tr('dp 표', 'dp table')}</td>
              <td className="px-4 py-2 font-mono">O(n²)</td>
              <td className="px-4 py-2 text-muted-foreground">{tr('이해하기 쉽고, 실제 수열 복원이 간단해요.', 'Easy to understand; rebuilding the run is simple.')}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-semibold">{tr('tails + 이분 탐색', 'tails + binary search')}</td>
              <td className="px-4 py-2 font-mono">O(n log n)</td>
              <td className="px-4 py-2 text-muted-foreground">{tr('훨씬 빨라요. 수열 복원에는 parent 배열이 따로 필요해요.', 'Much faster; rebuilding the run needs an extra parent array.')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ConceptModal>
  );
}
