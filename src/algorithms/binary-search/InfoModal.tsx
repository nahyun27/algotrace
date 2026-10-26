import type { ReactNode } from 'react';
import { Search, ArrowUpDown, Layers } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import ArrayView, { type ArrayPointer } from '../../components/viz/ArrayView';
import type { VizState } from '../../components/viz/palette';
import { cn } from '../../components/ui';
import { toneSoft } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

const ARR = [2, 5, 8, 12, 16, 23, 38, 56];
const TARGET = 16;

/** One frame of the "find 16" example */
function frame(label: ReactNode, lo: number, hi: number, mid: number | null, midState: VizState = 'current') {
  // One cell left: a single marker keeps the stack short on phones
  const pointers: ArrayPointer[] = lo === hi ? [{ index: lo, label: 'lo=hi', tone: 'path' }] : [
    { index: lo, label: 'lo', tone: 'visited' },
    ...(mid !== null ? [{ index: mid, label: 'mid', tone: 'current' as const }] : []),
    { index: hi, label: 'hi', tone: 'danger' },
  ];
  return (
    <div className="w-full h-full flex flex-col items-center gap-2">
      <span className={cn('rounded-full px-3 py-1 text-sm font-bold', toneSoft.primary)}>{label}</span>
      <div className="w-full flex-1 min-h-0">
        <ArrayView
          values={ARR}
          variant="cells"
          compact
          range={[lo, hi]}
          stateOf={i => (i === mid ? midState : 'idle')}
          pointers={pointers}
        />
      </div>
    </div>
  );
}

/** A row of yes/no answers: binary search finds where X turns into O (or O into X) */
function OXRow({ top, ok, answer, topLabel, okLabel }: {
  top: (number | string)[];
  ok: boolean[];
  answer: number;
  topLabel: ReactNode;
  okLabel: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto border-separate border-spacing-1 text-center font-mono text-sm">
        <tbody>
          <tr>
            <th className="pr-2 text-right font-sans text-xs font-semibold text-muted-foreground whitespace-nowrap">{topLabel}</th>
            {top.map((v, i) => (
              <td key={i} className={cn('w-10 h-9 rounded-lg border-2 font-bold', i === answer ? 'bg-state-path border-state-path text-white' : 'border-border bg-card')}>{v}</td>
            ))}
          </tr>
          <tr>
            <th className="pr-2 text-right font-sans text-xs font-semibold text-muted-foreground whitespace-nowrap">{okLabel}</th>
            {ok.map((o, i) => (
              <td key={i} className={cn('h-8 rounded-lg font-black', o ? toneSoft.visited : toneSoft.danger)}>{o ? 'O' : 'X'}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ExtraTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight mb-3">
      <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
        <Layers className="w-4 h-4" />
      </span>
      {children}
    </h3>
  );
}

export default function BinarySearchInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  const find = tr(`찾는 값: ${TARGET}`, `Looking for ${TARGET}`);

  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Search}
      title={tr('이분 탐색', 'Binary search')}
      subtitle={tr('정렬된 곳에서 절반씩 버리며 찾기', 'Find things by throwing away half each time')}
      summary={tr(
        '정렬된 줄의 한가운데를 보고 "답은 이쪽엔 없다"는 절반을 통째로 버리기를 반복하면, 아주 빠르게 답에 도착해요.',
        'Look at the middle of a sorted line, throw away the half that cannot hold the answer, and repeat. You reach the answer very fast.',
      )}
      analogy={{
        icon: ArrowUpDown,
        title: tr('업다운 숫자 맞히기 게임', 'The higher-or-lower guessing game'),
        body: tr(
          '친구가 1부터 100 사이 숫자를 하나 생각했어요. 1, 2, 3… 차례로 부르면 최대 100번이지만, 50을 불러 "업!"을 들으면 1~50은 볼 필요가 없어요. 매번 남은 범위의 가운데를 부르면 7번 안에 꼭 맞힐 수 있어요.',
          'A friend picks a number from 1 to 100. Calling 1, 2, 3… could take 100 tries, but if you say 50 and hear "higher!", you can forget 1 to 50. Always guess the middle of what is left and you win within 7 tries.',
        ),
      }}
      storyboard={[
        {
          visual: frame(find, 0, 7, null),
          caption: tr(
            `작은 수부터 정렬된 8칸에서 ${TARGET}을 찾아요. 처음엔 0번(lo)부터 7번(hi)까지 전부가 후보예요.`,
            `Find ${TARGET} in 8 cells sorted from small to large. At first every cell from 0 (lo) to 7 (hi) is a candidate.`,
          ),
        },
        {
          visual: frame(find, 0, 7, 3),
          caption: tr(
            `가운데 칸은 (0 + 7) ÷ 2 = 3번(소수점 버림)이에요. 3번 칸의 12는 ${TARGET}보다 작아요.`,
            `The middle is (0 + 7) ÷ 2 = 3 (round down). Cell 3 holds 12, which is smaller than ${TARGET}.`,
          ),
        },
        {
          visual: frame(find, 4, 7, null),
          caption: tr(
            `정렬돼 있으니 12 왼쪽은 전부 12보다 작아요. 0~3번을 통째로 버리고 lo를 4로 옮겨요. 한 번에 절반이 사라졌어요!`,
            'The line is sorted, so everything left of 12 is even smaller. Drop cells 0 to 3 and move lo to 4. Half is gone in one step!',
          ),
        },
        {
          visual: frame(find, 4, 7, 5),
          caption: tr(
            `남은 4~7번의 가운데는 (4 + 7) ÷ 2 = 5번, 값은 23이에요. 23은 ${TARGET}보다 크니 이번엔 오른쪽(5~7번)을 버려요.`,
            `The middle of 4 to 7 is (4 + 7) ÷ 2 = 5, holding 23. 23 is bigger than ${TARGET}, so this time drop the right side (5 to 7).`,
          ),
        },
        {
          visual: frame(find, 4, 4, 4, 'path'),
          caption: tr(
            `hi가 4로 와서 4번 칸 하나만 남았어요. 값이 ${TARGET}, 찾았어요! 8칸을 3번 비교로 끝냈어요.`,
            `hi moves to 4, so only cell 4 is left. It holds ${TARGET}: found! Three comparisons for eight cells.`,
          ),
        },
      ]}
      steps={[
        tr('찾을 범위의 양 끝을 lo(왼쪽 끝), hi(오른쪽 끝)로 정해요.', 'Mark the two ends of the range: lo (left) and hi (right).'),
        tr('가운데 칸 mid = (lo + hi) ÷ 2를 봐요.', 'Look at the middle cell, mid = (lo + hi) ÷ 2.'),
        tr(
          '찾는 값보다 작으면 왼쪽 절반을 버리고(lo = mid + 1), 크면 오른쪽 절반을 버려요(hi = mid − 1).',
          'If it is smaller than what you want, drop the left half (lo = mid + 1). If bigger, drop the right half (hi = mid − 1).',
        ),
        tr('같으면 찾은 거예요. lo가 hi를 넘어가 범위가 비면 그 값은 없는 거예요.', 'If it is equal, you found it. If lo passes hi and the range is empty, the value is not there.'),
      ]}
      useWhen={[
        tr('정렬된 배열에서 값이 있는지, 어디 있는지 찾을 때', 'Checking whether, and where, a value is in a sorted array'),
        tr('"x 이상인 첫 위치"처럼 경계를 찾을 때 (lower bound)', 'Finding a boundary such as "the first position ≥ x" (lower bound)'),
        tr('"답이 x면 가능할까?"의 답이 한 지점에서 딱 한 번 바뀔 때 (파라메트릭 서치)', 'The answer to "does x work?" flips exactly once (parametric search)'),
      ]}
      watchOut={[
        tr('정렬이 안 돼 있으면 쓸 수 없어요. 먼저 정렬하세요.', 'It only works on sorted data. Sort first.'),
        tr('lo ≤ hi인지 lo < hi인지, mid ± 1인지 mid인지 한 글자 차이로 무한 반복이 생겨요. 한 가지 틀을 정해 그대로 쓰세요.', 'lo ≤ hi vs lo < hi, mid ± 1 vs mid: one character can cause an endless loop. Pick one template and stick to it.'),
        tr('C++이나 Java에서 lo + hi가 너무 크면 넘칠 수 있어요. lo + (hi − lo) ÷ 2로 쓰면 안전해요.', 'In C++ or Java, lo + hi can overflow. lo + (hi − lo) ÷ 2 is safe.'),
      ]}
      complexity={{
        time: 'O(log n)',
        space: 'O(1)',
        plain: tr(
          '칸 수가 2배가 돼도 비교는 딱 1번 늘어요. 100만 칸이어도 20번이면 끝나요. 파라메트릭 서치는 "가능할까?" 확인 한 번에 드는 시간이 이 횟수만큼 곱해져요.',
          'Double the cells and you need just one more comparison. A million cells take about 20. In parametric search, each "does x work?" check is repeated that many times.',
        ),
      }}
    >
      <section className="space-y-4">
        <ExtraTitle>{tr('같은 아이디어, 다른 질문 두 가지', 'Same idea, two other questions')}</ExtraTitle>
        <div className="rounded-3xl border border-border bg-card p-5 space-y-3">
          <p className="font-bold">{tr('lower bound: "5 이상인 첫 칸은 어디?"', 'Lower bound: "where is the first cell ≥ 5?"')}</p>
          <p className="text-muted-foreground">
            {tr(
              '각 칸에 "5 이상이야?"를 물으면 X X X O O O처럼 X가 쭉 나오다 O로 한 번만 바뀌어요. 이분 탐색으로 처음 O가 나오는 칸을 찾으면 돼요. 5가 여러 개여도 가장 앞의 5를 찾아 줘요.',
              'Ask each cell "are you ≥ 5?" and you get X X X O O O: it switches from X to O only once. Binary search finds the first O. Even with several 5s, you get the first one.',
            )}
          </p>
          <OXRow
            top={[1, 3, 3, 5, 5, 8]}
            ok={[false, false, false, true, true, true]}
            answer={3}
            topLabel={tr('값', 'value')}
            okLabel={tr('5 이상?', '≥ 5?')}
          />
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 space-y-3">
          <p className="font-bold">{tr('파라메트릭 서치: 답 자체를 이분 탐색하기', 'Parametric search: binary-search the answer itself')}</p>
          <p className="text-muted-foreground">
            {tr(
              '나무 4그루(20, 15, 10, 17m)를 높이 H에서 잘라 7m 이상 가져가려면 H를 최대 얼마로 할까요? H가 낮을수록 많이 얻으니 "7m 이상 얻을까?"는 O O O O X X처럼 한 번만 바뀌어요. 마지막 O인 H = 15가 답이에요.',
              'Cut four trees (20, 15, 10, 17 m) at height H and you need at least 7 m of wood. How high can H be? The lower H, the more wood, so "do I get 7 m?" goes O O O O X X and flips once. The last O, H = 15, is the answer.',
            )}
          </p>
          <OXRow
            top={[12, 13, 14, 15, 16, 17]}
            ok={[true, true, true, true, false, false]}
            answer={3}
            topLabel="H"
            okLabel={tr('7m 이상?', '≥ 7 m?')}
          />
          <p className="text-xs text-muted-foreground text-center">
            {tr('H = 15 → 5 + 0 + 0 + 2 = 7m (O),  H = 16 → 4 + 0 + 0 + 1 = 5m (X)', 'H = 15 → 5 + 0 + 0 + 2 = 7 m (O),  H = 16 → 4 + 0 + 0 + 1 = 5 m (X)')}
          </p>
        </div>
      </section>
    </ConceptModal>
  );
}
