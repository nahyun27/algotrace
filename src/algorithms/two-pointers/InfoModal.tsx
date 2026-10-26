import type { ReactNode } from 'react';
import { MoveHorizontal, Worm, PanelLeftRightDashed } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import ArrayView from '../../components/viz/ArrayView';
import type { VizState } from '../../components/viz/palette';
import { cn } from '../../components/ui';
import { toneSoft } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

const ARR = [1, 2, 3, 2, 5];
const M = 5;

/**
 * One frame of the "sum = 5" example: [l, r] is the window, cells left of l are done (faded).
 * `added` marks the value that just came in, `found` paints the window violet.
 */
function frame(label: ReactNode, l: number, r: number, opts: { added?: number; found?: boolean } = {}) {
  const stateOf = (i: number): VizState => {
    if (i < l || i > r) return 'idle';
    if (opts.found) return 'path';
    if (i === opts.added) return 'current';
    return 'candidate';
  };
  return (
    <div className="w-full h-full flex flex-col items-center gap-2">
      <span className={cn('rounded-full px-3 py-1 text-sm font-bold font-mono', opts.found ? toneSoft.path : toneSoft.candidate)}>{label}</span>
      <div className="w-full flex-1 min-h-0">
        <ArrayView
          values={ARR}
          variant="cells"
          range={[l, ARR.length - 1]}
          stateOf={stateOf}
          pointers={[{ index: l, label: 'l', tone: 'neutral' }, { index: r, label: 'r', tone: 'neutral' }]}
        />
      </div>
    </div>
  );
}

function Cells({ values, state }: { values: number[]; state: (i: number) => 'in' | 'enter' | 'leave' | 'out' }) {
  const cls = {
    in: 'bg-state-candidate border-state-candidate text-amber-950',
    enter: 'bg-state-current border-state-current text-white',
    leave: 'border-state-danger text-state-danger border-dashed bg-card',
    out: 'border-border bg-card text-muted-foreground',
  } as const;
  return (
    <div className="flex justify-center gap-1.5">
      {values.map((v, i) => (
        <span key={i} className={cn('w-10 h-10 rounded-xl border-2 flex items-center justify-center font-mono font-bold', cls[state(i)])}>{v}</span>
      ))}
    </div>
  );
}

export default function TwoPointersInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  const sum = (expr: string) => tr(`합 = ${expr}`, `sum = ${expr}`);

  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={MoveHorizontal}
      title={tr('투 포인터', 'Two pointers')}
      subtitle={tr('연속 구간을 한 번 훑어서 처리하기', 'Handle contiguous ranges in one pass')}
      summary={tr(
        '구간의 왼쪽 끝 l과 오른쪽 끝 r, 손가락 두 개를 앞으로만 움직이며 구간을 늘였다 줄였다 하면, 모든 구간을 다 보지 않고도 답을 찾아요.',
        'Keep two fingers, l (left end) and r (right end), and only ever move them forward, growing and shrinking the range. You find the answer without checking every range.',
      )}
      analogy={{
        icon: Worm,
        title: tr('앞으로 기어가는 애벌레', 'A caterpillar crawling forward'),
        body: tr(
          '애벌레는 머리를 앞으로 쭉 뻗고(r), 너무 늘어나면 꼬리를 끌어당겨요(l). 머리도 꼬리도 절대 뒤로 가지 않아요. 그래서 줄 끝까지 한 번만 지나가면 끝나요.',
          'A caterpillar stretches its head forward (r), and when it gets too long it pulls its tail in (l). Neither end ever moves back, so it crosses the line only once.',
        ),
      }}
      storyboard={[
        {
          visual: frame(sum('1'), 0, 0),
          caption: tr(
            `합이 정확히 ${M}인 연속 구간을 세요. l과 r 모두 0번에서 출발해요. 합 1은 ${M}보다 작으니 r을 한 칸 늘려요.`,
            `Count the ranges that add up to exactly ${M}. l and r both start at cell 0. The sum 1 is below ${M}, so move r one step.`,
          ),
        },
        {
          visual: frame(sum('1 + 2 = 3'), 0, 1, { added: 1 }),
          caption: tr(
            `2가 들어와서 1 + 2 = 3. 아직 ${M}보다 작으니 r을 또 늘려요.`,
            `2 comes in: 1 + 2 = 3. Still below ${M}, so move r again.`,
          ),
        },
        {
          visual: frame(sum('3 + 3 = 6'), 0, 2, { added: 2 }),
          caption: tr(
            `3이 들어와서 3 + 3 = 6. ${M}보다 커졌어요! 이제 r 대신 l을 움직여 맨 앞의 값을 빼요.`,
            `3 comes in: 3 + 3 = 6. That is more than ${M}! Now move l instead, removing the front value.`,
          ),
        },
        {
          visual: frame(sum('6 − 1 = 5'), 1, 2, { found: true }),
          caption: tr(
            `1이 빠져서 6 − 1 = 5. 딱 ${M}이에요! 2와 3으로 된 구간이 첫 번째 답이에요.`,
            `1 leaves: 6 − 1 = 5. Exactly ${M}! The range made of 2 and 3 is the first answer.`,
          ),
        },
        {
          visual: frame(sum('3 + 2 = 5'), 2, 3, { found: true }),
          caption: tr(
            `같은 규칙으로 l을 옮기면 2가 빠져 3, 모자라니 r을 늘려 3 + 2 = 5. 3과 2로 된 구간이 두 번째 답이에요.`,
            'Same rule: move l, 2 leaves and the sum is 3. Too small, so move r: 3 + 2 = 5. The range 3, 2 is the second answer.',
          ),
        },
        {
          visual: frame(sum('5'), 4, 4, { found: true }),
          caption: tr(
            `끝까지 이어 가면 5 하나짜리 구간이 세 번째 답이에요. 총 3개! l과 r은 뒤로 간 적이 없어서 각각 최대 5번만 움직였어요.`,
            'Carry on to the end and 5 on its own is the third answer. Three in total! l and r never went back, so each moved at most 5 times.',
          ),
        },
      ]}
      steps={[
        tr('l과 r을 맨 앞에 두고, 구간 [l, r]의 합을 기억해 둬요.', 'Put l and r at the start and keep the sum of the range [l, r].'),
        tr('합이 목표보다 작으면 r을 오른쪽으로 옮기고 새 값을 더해요.', 'If the sum is below the target, move r right and add the new value.'),
        tr('합이 목표 이상이면 l을 오른쪽으로 옮기고 빠지는 값을 빼요.', 'If the sum is at least the target, move l right and subtract the value that leaves.'),
        tr('합이 목표와 같을 때마다 답을 하나 세요. r이 끝에 닿을 때까지 반복해요.', 'Every time the sum equals the target, count one answer. Repeat until r reaches the end.'),
      ]}
      useWhen={[
        tr('"합이 M인 연속 구간 개수"처럼 이어진 구간을 다룰 때', 'Working with contiguous ranges, like "how many ranges sum to M"'),
        tr('"길이가 k인 구간 중 합이 가장 큰 것"처럼 크기가 정해진 창을 밀 때 (슬라이딩 윈도우)', 'Sliding a fixed-size window, like "the largest sum among ranges of length k"'),
        tr('모든 구간을 다 보면(n² 개) 너무 느릴 때', 'Checking every range (about n² of them) is too slow'),
      ]}
      watchOut={[
        tr('"합이 크면 l, 작으면 r" 규칙은 모든 값이 양수일 때만 맞아요. 음수가 섞이면 누적 합과 해시를 써요.', 'The "too big → l, too small → r" rule only works when all values are positive. With negatives, use prefix sums and a hash map.'),
        tr('l이 r을 앞지르지 않게 하고, r이 끝에 닿은 뒤에도 l을 줄여 볼 구간이 남았는지 확인하세요.', 'Do not let l pass r, and after r hits the end, check whether shrinking l still finds answers.'),
      ]}
      complexity={{
        time: 'O(n)',
        space: 'O(1)',
        plain: tr(
          'l과 r이 각각 많아야 n번 움직이니 배열이 2배가 되면 시간도 딱 2배예요. 100만 칸도 순식간이에요.',
          'l and r each move at most n times, so doubling the array exactly doubles the time. A million cells are instant.',
        ),
      }}
    >
      <section>
        <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight mb-3">
          <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <PanelLeftRightDashed className="w-4 h-4" />
          </span>
          {tr('슬라이딩 윈도우: 길이가 정해진 창 밀기', 'Sliding window: a fixed-size window')}
        </h3>
        <div className="rounded-3xl border border-border bg-card p-5 space-y-4">
          <p className="text-muted-foreground">
            {tr(
              '길이 3인 창을 한 칸 밀 때 3개를 다시 더할 필요가 없어요. 새로 들어온 값은 더하고, 빠져나간 값만 빼면 돼요.',
              'When a window of length 3 slides one step, you do not re-add all three values. Add the one that comes in and subtract the one that leaves.',
            )}
          </p>
          <div className="space-y-2">
            <Cells values={[3, 1, 4, 1, 5]} state={i => (i <= 2 ? 'in' : 'out')} />
            <p className="text-center font-mono text-sm font-bold">3 + 1 + 4 = 8</p>
          </div>
          <div className="space-y-2">
            <Cells values={[3, 1, 4, 1, 5]} state={i => (i === 0 ? 'leave' : i === 3 ? 'enter' : i <= 2 ? 'in' : 'out')} />
            <p className="text-center font-mono text-sm font-bold">8 + 1 − 3 = 6</p>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {tr('파란 칸은 새로 들어온 값, 빨간 점선 칸은 빠져나간 값이에요.', 'Blue is the value coming in, the dashed red cell is the one leaving.')}
          </p>
        </div>
      </section>
    </ConceptModal>
  );
}
