import { useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDownUp, Scale, Waves, Trophy, Layers, Users, Split, Crown, Tally5, Mail, Car, Gauge, ListChecks, Table2,
} from 'lucide-react';
import ConceptModal, { type ConceptAnalogy, type ConceptComplexity } from '../../components/algorithm/ConceptModal';
import type { StoryFrame } from '../../components/algorithm/Storyboard';
import ArrayView, { type ArrayPointer } from '../../components/viz/ArrayView';
import MiniGraph, { type MiniNode, type MiniEdge } from '../../components/viz/MiniGraph';
import { NODE_COLORS, type VizState } from '../../components/viz/palette';
import { Badge, cn } from '../../components/ui';
import { toneSoft, toneText, type Tone } from '../../components/ui/tone';
import { useLang, useTr, type Tr } from '../../i18n';
import type { SortAlgorithm } from './types';
import { SORT_LABELS } from './types';

/* ─────────────── Small pictures for the storyboards ─────────────── */

/** Bars like the sorting page; `states` maps index → state (default idle) */
function bars(values: number[], states: Record<number, VizState> = {}, pointers: ArrayPointer[] = []) {
  return (
    <div className="w-full max-w-[420px] h-full">
      <ArrayView values={values} variant="bars" stateOf={i => states[i] ?? 'idle'} pointers={pointers} className="bg-transparent" />
    </div>
  );
}

/** Same state for a list of indices */
const all = (idx: number[], s: VizState) => Object.fromEntries(idx.map(i => [i, s])) as Record<number, VizState>;
const range = (lo: number, hi: number) => Array.from({ length: hi - lo + 1 }, (_, k) => lo + k);

function Cell({ v, s = 'idle', size = 'md' }: { v: ReactNode; s?: VizState; size?: 'sm' | 'md' }) {
  const c = NODE_COLORS[s];
  return (
    <span
      className={cn(
        'shrink-0 border-2 flex items-center justify-center font-mono font-bold tabular-nums transition-colors',
        size === 'sm' ? 'w-7 h-7 sm:w-8 sm:h-8 text-xs rounded-lg' : 'w-9 h-9 sm:w-10 sm:h-10 text-sm rounded-xl',
      )}
      style={{ backgroundColor: c.fill, borderColor: c.stroke, color: c.text }}
    >
      {v}
    </span>
  );
}

function RowLabel({ children }: { children: ReactNode }) {
  return <span className="text-[11px] font-semibold text-muted-foreground">{children}</span>;
}

/** Groups of cells separated by gaps (merge sort pieces) */
function Groups({ groups }: { groups: { v: number; s?: VizState }[][] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      {groups.map((g, gi) => (
        <div key={gi} className="flex gap-1 rounded-2xl border border-dashed border-border p-1.5 bg-card/60">
          {g.map((c, ci) => <Cell key={ci} v={c.v} s={c.s} />)}
        </div>
      ))}
    </div>
  );
}

/** Heap sort: the heap part drawn as a tree, the finished tail as cells */
const TREE_POS: [number, number][] = [[160, 26], [90, 84], [230, 84], [52, 140], [128, 140]];
function heapFrame(arr: number[], heapSize: number, states: Record<number, VizState> = {}) {
  const nodes: MiniNode[] = arr.slice(0, heapSize).map((v, i) => ({ id: i, x: TREE_POS[i][0], y: TREE_POS[i][1], label: String(v) }));
  const edges: MiniEdge[] = ([[0, 1], [0, 2], [1, 3], [1, 4]] as MiniEdge[]).filter(([, b]) => (b as number) < heapSize);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <div className="w-full max-w-[300px] h-[150px]">
        {heapSize > 0
          ? <MiniGraph nodes={nodes} edges={edges} nodeState={states} width={320} height={166} radius={19} />
          : null}
      </div>
      <div className="flex gap-1">
        {arr.map((v, i) => <Cell key={i} v={v} s={i >= heapSize ? 'visited' : (states[i] ?? 'idle')} size="sm" />)}
      </div>
    </div>
  );
}

/** Counting sort: input, tally boxes 0..3, output */
function countingFrame(input: VizState[], counts: (number | null)[], out: number[], outState: VizState = 'current', tallyFocus = -1) {
  const INPUT = [3, 1, 0, 3, 1, 1];
  return (
    <CountingPicture input={INPUT} inputStates={input} counts={counts} out={out} outState={outState} tallyFocus={tallyFocus} />
  );
}

function CountingPicture({ input, inputStates, counts, out, outState, tallyFocus }: {
  input: number[]; inputStates: VizState[]; counts: (number | null)[]; out: number[]; outState: VizState; tallyFocus: number;
}) {
  const tr = useTr();
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-col items-center gap-1">
        <RowLabel>{tr('원래 배열', 'Input')}</RowLabel>
        <div className="flex gap-1">{input.map((v, i) => <Cell key={i} v={v} s={inputStates[i]} size="sm" />)}</div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <RowLabel>{tr('값마다 개수 (0, 1, 2, 3)', 'Count per value (0, 1, 2, 3)')}</RowLabel>
        <div className="flex gap-2">
          {counts.map((c, v) => (
            <div key={v} className="flex flex-col items-center">
              <span className={cn('text-[11px] font-mono', v === tallyFocus ? toneText.current : 'text-hint')}>{v}</span>
              <Cell v={c ?? 0} s={v === tallyFocus ? 'current' : c ? 'candidate' : 'idle'} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <RowLabel>{tr('결과', 'Output')}</RowLabel>
        <div className="flex gap-1 min-h-8">
          {range(0, 5).map(i => <Cell key={i} v={out[i] ?? ''} s={out[i] === undefined ? 'idle' : outState} size="sm" />)}
        </div>
      </div>
    </div>
  );
}

/** Radix sort: a number with one digit emphasized */
function Digits({ n, pos }: { n: number; pos: number }) {
  const s = String(n).padStart(2, '0');
  const k = s.length - 1 - pos;
  return (
    <span>
      {s.split('').map((ch, i) => (
        <span key={i} className={i === k ? 'underline underline-offset-2 decoration-2' : 'opacity-45'}>{ch}</span>
      ))}
    </span>
  );
}

function radixArray(values: number[], pos: number | null, s: VizState) {
  return (
    <div className="flex gap-1.5">
      {values.map((v, i) => <Cell key={i} v={pos === null ? v : <Digits n={v} pos={pos} />} s={s} />)}
    </div>
  );
}

function RadixBuckets({ buckets, pos }: { buckets: Record<number, number[]>; pos: number }) {
  return (
    <div className="flex items-end gap-1 sm:gap-1.5">
      {range(0, 9).map(b => (
        <div key={b} className="flex flex-col items-center gap-1">
          <div className="flex flex-col-reverse gap-1 min-h-[72px] justify-start">
            {(buckets[b] ?? []).map(v => <Cell key={v} v={<Digits n={v} pos={pos} />} s="candidate" size="sm" />)}
          </div>
          <span className="w-7 sm:w-8 h-6 rounded-md border-2 border-dashed border-border flex items-center justify-center text-[11px] font-bold text-muted-foreground">{b}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────── Per-algorithm content ─────────────── */

interface AlgoContent {
  icon: LucideIcon;
  subtitle: string;
  summary: string;
  analogy: ConceptAnalogy;
  storyboard: StoryFrame[];
  steps: string[];
  useWhen: string[];
  watchOut: string[];
  complexity: ConceptComplexity;
}

const QUADRATIC_PLAIN = (tr: Tr) => tr(
  '개수가 2배가 되면 시간은 약 4배가 돼요. 수백 개는 순식간이지만 10만 개쯤 되면 눈에 띄게 느려져요.',
  'Double the items and it takes about 4 times as long. A few hundred items is instant, but around 100,000 it gets noticeably slow.',
);

const CONTENT: Record<SortAlgorithm, (tr: Tr) => AlgoContent> = {
  bubble: tr => ({
    icon: ArrowDownUp,
    subtitle: tr('옆 칸끼리 비교해서 큰 값을 뒤로 보내기', 'Swap neighbors until big values float to the end'),
    summary: tr(
      '옆에 붙은 두 칸을 비교해서 순서가 틀렸으면 바꾸는 일을 반복하면, 큰 값이 하나씩 맨 뒤로 밀려나며 정렬돼요.',
      'Keep comparing neighboring pairs and swapping them when they are out of order. The biggest value drifts to the end each round.',
    ),
    analogy: {
      icon: Waves,
      title: tr('물속 거품이 떠오르듯', 'Like bubbles rising in water'),
      body: tr(
        '키 순서로 줄을 세울 때, 옆 사람과 키를 재서 내가 더 크면 자리를 바꿔요. 이걸 줄 끝까지 하면 가장 큰 사람이 거품처럼 맨 뒤로 떠올라요. 한 바퀴마다 한 명씩 뒤에 자리를 잡아요.',
        'To line people up by height, each person compares with the neighbor and swaps if taller. Do that down the line and the tallest one floats to the back like a bubble. Each round settles one more person at the back.',
      ),
    },
    storyboard: [
      { visual: bars([5, 2, 4, 1, 3], all([0, 1], 'candidate')), caption: tr('맨 앞 두 칸 5와 2를 비교해요. 큰 5가 앞에 있으니 순서가 틀렸어요.', 'Compare the first two: 5 and 2. The bigger 5 is in front, so they are out of order.') },
      { visual: bars([2, 5, 4, 1, 3], all([0, 1], 'danger')), caption: tr('두 칸을 바꿔서 2, 5 순서로 만들어요.', 'Swap them, so it reads 2, 5.') },
      { visual: bars([2, 4, 1, 3, 5], { 4: 'visited' }), caption: tr('5는 오른쪽 이웃 4, 1, 3보다 모두 커서 계속 자리를 바꾸며 맨 끝까지 가요. 가장 큰 5가 확정됐어요.', '5 is bigger than each next neighbor (4, 1, 3), so it keeps swapping all the way to the end. The biggest value, 5, is settled.') },
      { visual: bars([2, 1, 3, 4, 5], all([3, 4], 'visited')), caption: tr('두 번째 바퀴: 2와 4는 순서가 맞고, 4는 1, 3과 차례로 바꾸며 뒤로 가요. 4도 확정.', 'Round two: 2 and 4 are fine, then 4 swaps past 1 and 3. Now 4 is settled too.') },
      { visual: bars([1, 2, 3, 4, 5], all([2, 3, 4], 'visited')), caption: tr('세 번째 바퀴: 2와 1을 바꾸면 2, 3은 이미 순서가 맞아요. 3이 확정.', 'Round three: swap 2 and 1, and 2, 3 are already in order. 3 is settled.') },
      { visual: bars([1, 2, 3, 4, 5], all(range(0, 4), 'visited')), caption: tr('네 번째 바퀴에서는 바꿀 일이 한 번도 없어요. 바꿀 게 없으면 다 정렬된 거라 끝! [1, 2, 3, 4, 5]', 'Round four makes no swaps at all. No swaps means everything is in order, so we stop: [1, 2, 3, 4, 5].') },
    ],
    steps: [
      tr('맨 앞부터 옆 칸끼리 두 개씩 비교해요.', 'Walk from the front, comparing each pair of neighbors.'),
      tr('앞이 더 크면 두 칸을 바꿔요. 한 바퀴가 끝나면 가장 큰 값이 맨 뒤에 확정돼요.', 'If the front one is bigger, swap them. After one round the biggest value is settled at the end.'),
      tr('확정된 뒤쪽은 빼고, 남은 부분으로 다시 한 바퀴 돌아요.', 'Leave the settled tail alone and do another round on the rest.'),
      tr('한 바퀴 동안 한 번도 안 바꿨다면 이미 정렬된 거라 바로 멈춰요.', 'If a whole round makes no swaps, the array is already sorted, so stop right away.'),
    ],
    useWhen: [
      tr('정렬이 어떻게 동작하는지 처음 배울 때', 'You are learning how sorting works for the first time'),
      tr('10개 안팎의 아주 작은 배열이거나, 거의 정렬된 배열일 때 (한 바퀴 만에 끝날 수 있어요)', 'The array is tiny (about 10 items) or almost sorted, where one round may be enough'),
    ],
    watchOut: [
      tr('조금만 커져도 아주 느려요. 실전에서는 거의 쓰지 않아요.', 'It gets very slow as soon as the input grows. It is rarely used in practice.'),
      tr('"한 번도 안 바꾸면 멈추기"를 빼먹으면 이미 정렬된 배열에서도 끝까지 다 돌아요.', 'Forget the "stop when nothing swapped" check and it runs every round even on sorted input.'),
    ],
    complexity: { time: 'O(n²)', space: 'O(1)', plain: <>{QUADRATIC_PLAIN(tr)} {tr('이미 정렬돼 있으면 한 바퀴로 끝나서 O(n)이에요.', 'If it is already sorted, one round is enough: O(n).')}</> },
  }),

  selection: tr => ({
    icon: ArrowDownUp,
    subtitle: tr('가장 작은 값을 찾아 앞으로 데려오기', 'Find the smallest and bring it to the front'),
    summary: tr(
      '남은 칸 중에서 가장 작은 값을 찾아 맨 앞 빈자리와 바꾸는 일을 반복하면, 앞에서부터 차곡차곡 정렬돼요.',
      'Find the smallest of what is left and swap it into the next front spot. Repeat, and the array fills up in order from the front.',
    ),
    analogy: {
      icon: Trophy,
      title: tr('시상대에 1등부터 세우기', 'Calling winners to the podium one by one'),
      body: tr(
        '달리기 기록표를 다 훑어보고 가장 빠른 사람을 1등 자리에 세워요. 남은 사람 중에서 다시 가장 빠른 사람을 찾아 2등 자리에, 그다음은 3등 자리에 세워요. 한 번 세운 사람은 다시 움직이지 않아요.',
        'Scan the whole race sheet, find the fastest runner and put them in first place. Among the rest, find the fastest again for second place, then third. Once placed, nobody moves again.',
      ),
    },
    storyboard: [
      { visual: bars([4, 2, 5, 1, 3], { 3: 'candidate' }, [{ index: 0, label: tr('채울 자리', 'fill'), tone: 'current' }]), caption: tr('0번 자리에 올 값을 찾아요. 전부 훑어보니 가장 작은 값은 1이에요.', 'Who goes into spot 0? Scanning everything, the smallest value is 1.') },
      { visual: bars([1, 2, 5, 4, 3], all([0, 3], 'danger')), caption: tr('1과 맨 앞의 4를 맞바꿔요. 이제 1은 제자리라서 확정이에요.', 'Swap 1 with the 4 at the front. 1 is now in its final spot.') },
      { visual: bars([1, 2, 5, 4, 3], { 0: 'visited', 1: 'candidate' }, [{ index: 1, label: tr('채울 자리', 'fill'), tone: 'current' }]), caption: tr('남은 [2, 5, 4, 3] 중 가장 작은 건 2예요. 이미 1번 자리에 있으니 바꿀 필요 없이 확정해요.', 'Of the rest [2, 5, 4, 3], the smallest is 2. It is already in spot 1, so it is settled with no swap.') },
      { visual: bars([1, 2, 3, 4, 5], { 0: 'visited', 1: 'visited', 2: 'danger', 4: 'danger' }), caption: tr('남은 [5, 4, 3] 중 가장 작은 3을 2번 자리의 5와 바꿔요.', 'Of [5, 4, 3], the smallest is 3. Swap it with the 5 in spot 2.') },
      { visual: bars([1, 2, 3, 4, 5], all(range(0, 4), 'visited')), caption: tr('[4, 5]에서 4는 이미 제자리예요. 마지막 한 칸은 저절로 확정되니 완성! [1, 2, 3, 4, 5]', 'In [4, 5], 4 is already in place, and the last one settles itself. Done: [1, 2, 3, 4, 5].') },
    ],
    steps: [
      tr('아직 정렬 안 된 부분을 처음부터 끝까지 훑어 가장 작은 값을 찾아요.', 'Scan the unsorted part from start to end for the smallest value.'),
      tr('그 값을 정렬 안 된 부분의 맨 앞 칸과 바꿔요. 이 칸은 이제 확정이에요.', 'Swap it with the first spot of the unsorted part. That spot is now final.'),
      tr('정렬 안 된 부분이 한 칸 줄었으니, 칸이 하나 남을 때까지 반복해요.', 'The unsorted part is one shorter. Repeat until one spot is left.'),
    ],
    useWhen: [
      tr('배열이 작고, 코드가 간단해야 할 때', 'The array is small and the code should stay simple'),
      tr('값을 옮겨 쓰는 비용이 비쌀 때. 교환이 바퀴마다 최대 한 번이라 총 n번 이하예요.', 'Writing values is expensive. It swaps at most once per round, so n swaps at most.'),
    ],
    watchOut: [
      tr('이미 정렬된 배열이어도 매번 끝까지 훑어서 똑같이 느려요.', 'Even on sorted input it scans everything each round, so it is just as slow.'),
      tr('같은 값끼리의 원래 순서가 바뀔 수 있어요(불안정). 예: [4a, 3, 4b, 1] → [1, 3, 4b, 4a]', 'Equal values can change order (unstable). Example: [4a, 3, 4b, 1] → [1, 3, 4b, 4a].'),
    ],
    complexity: { time: 'O(n²)', space: 'O(1)', plain: QUADRATIC_PLAIN(tr) },
  }),

  insertion: tr => ({
    icon: ArrowDownUp,
    subtitle: tr('카드를 한 장씩 알맞은 자리에 끼워 넣기', 'Slot each card into its place'),
    summary: tr(
      '앞쪽을 정렬된 상태로 유지하면서, 다음 값을 하나씩 집어 그 안의 알맞은 자리에 끼워 넣어요.',
      'Keep the front part sorted, and take the next value each time and slide it into the right place inside that part.',
    ),
    analogy: {
      icon: Layers,
      title: tr('손에 든 카드 정리하기', 'Sorting the cards in your hand'),
      body: tr(
        '카드를 한 장씩 받을 때마다, 이미 정리된 손패에서 그 카드가 들어갈 자리를 찾아 끼워 넣어요. 더 큰 카드들은 한 칸씩 옆으로 밀려나요. 손패는 언제나 정렬된 상태예요.',
        'Each time you are dealt a card, you find its spot among the cards you already sorted and slide it in. Bigger cards shift over by one. Your hand is always in order.',
      ),
    },
    storyboard: [
      { visual: bars([4, 2, 5, 1, 3], { 0: 'visited', 1: 'candidate' }), caption: tr('첫 카드 4는 혼자라서 이미 정렬된 상태예요(초록). 다음 카드 2를 집어요.', 'The first card, 4, is alone, so it is already sorted (green). Pick up the next card, 2.') },
      { visual: bars([2, 4, 5, 1, 3], { 0: 'danger', 1: 'visited' }), caption: tr('2는 4보다 작아요. 4를 한 칸 오른쪽으로 밀고 그 앞에 2를 끼워요. 손패: [2, 4]', '2 is smaller than 4. Shift 4 one step right and put 2 in front. Hand: [2, 4].') },
      { visual: bars([2, 4, 5, 1, 3], { 0: 'visited', 1: 'visited', 2: 'candidate' }), caption: tr('5는 손패의 마지막 4보다 커요. 비교 한 번으로 그 자리에 그대로 둬요.', '5 is bigger than 4, the last card in hand. One comparison and it stays where it is.') },
      { visual: bars([1, 2, 4, 5, 3], { 0: 'danger', 1: 'visited', 2: 'visited', 3: 'visited' }), caption: tr('1은 5, 4, 2보다 모두 작아서, 셋을 한 칸씩 밀고 맨 앞에 끼워요.', '1 is smaller than 5, 4 and 2, so all three shift right and 1 goes to the front.') },
      { visual: bars([1, 2, 3, 4, 5], { 0: 'visited', 1: 'visited', 2: 'danger', 3: 'visited', 4: 'visited' }), caption: tr('3은 5, 4보다 작고 2보다 커요. 5와 4를 밀고 2 뒤에 끼워요.', '3 is smaller than 5 and 4 but bigger than 2. Shift 5 and 4, then slot 3 in after 2.') },
      { visual: bars([1, 2, 3, 4, 5], all(range(0, 4), 'visited')), caption: tr('카드 다섯 장을 모두 끼웠어요. [1, 2, 3, 4, 5] 완성!', 'All five cards are in. Done: [1, 2, 3, 4, 5].') },
    ],
    steps: [
      tr('맨 앞 한 칸은 이미 정렬됐다고 보고 시작해요.', 'Treat the very first item as an already sorted part.'),
      tr('다음 값을 집어, 정렬된 부분을 뒤에서부터 보며 자기보다 큰 값은 한 칸씩 오른쪽으로 밀어요.', 'Pick the next value. Walk the sorted part from the back, shifting every bigger value one step right.'),
      tr('자기보다 작거나 같은 값을 만나면 그 바로 뒤에 내려놓아요.', 'When you meet a value that is smaller or equal, drop it right after that one.'),
      tr('마지막 값까지 반복해요.', 'Repeat up to the last value.'),
    ],
    useWhen: [
      tr('거의 정렬된 배열일 때. 밀 일이 거의 없어서 아주 빨라요.', 'The data is nearly sorted. Almost nothing needs to shift, so it is very fast.'),
      tr('작은 배열(수십 개). 그래서 Python, Java의 기본 정렬도 작은 조각은 삽입 정렬로 처리해요.', 'Small arrays (a few dozen). That is why Python and Java sort small chunks with insertion sort.'),
      tr('값이 하나씩 계속 들어오는데 늘 정렬된 상태를 유지해야 할 때', 'Values arrive one at a time and you must keep everything sorted'),
    ],
    watchOut: [
      tr('거꾸로 정렬된 배열이 최악이에요. 매번 전부 밀어야 해요.', 'Reversed input is the worst case: every value has to shift all the way.'),
      tr('"더 클 때만" 밀어야 같은 값의 원래 순서가 지켜져요(안정 정렬).', 'Shift only when strictly bigger, so equal values keep their order (stable).'),
    ],
    complexity: { time: 'O(n²)', space: 'O(1)', plain: <>{QUADRATIC_PLAIN(tr)} {tr('거의 정렬된 배열이라면 거의 O(n)이에요.', 'On nearly sorted input it is close to O(n).')}</> },
  }),

  merge: tr => ({
    icon: Split,
    subtitle: tr('반으로 나누고, 정렬된 두 줄을 합치기', 'Split in half, then merge two sorted lines'),
    summary: tr(
      '배열을 한 칸짜리가 될 때까지 반씩 나눈 다음, 정렬된 두 묶음을 맨 앞끼리 비교하며 하나로 합쳐 나가요.',
      'Split the array in half until every piece has one item, then join sorted pieces back together by comparing their front items.',
    ),
    analogy: {
      icon: Users,
      title: tr('두 줄로 선 학생들을 한 줄로 합치기', 'Merging two sorted lines of students'),
      body: tr(
        '키 순서로 선 두 줄이 있으면, 두 줄의 맨 앞 학생만 비교해서 더 작은 학생을 새 줄에 보내면 돼요. 이걸 반복하면 한 줄로 정렬돼요. 큰 반은 작은 모둠으로 나눠 각자 줄을 세운 뒤 이렇게 합치면 돼요.',
        'Given two lines already sorted by height, just compare the two students at the front and send the shorter one to the new line. Repeat and you get one sorted line. A big class splits into small groups, lines them up, and merges like this.',
      ),
    },
    storyboard: [
      { visual: <Groups groups={[[5, 2, 4, 1, 6, 3].map(v => ({ v }))]} />, caption: tr('6개를 한 번에 정렬하긴 어려우니, 반으로 자르고 또 반으로 잘라요.', 'Sorting six at once is hard, so cut it in half, and in half again.') },
      { visual: <Groups groups={[5, 2, 4, 1, 6, 3].map(v => [{ v, s: 'visited' as VizState }])} />, caption: tr('한 칸짜리가 될 때까지 잘랐어요. 한 칸은 순서가 틀릴 수 없으니 이미 정렬된 상태예요.', 'Cut down to single items. A single item cannot be out of order, so each is already sorted.') },
      { visual: <Groups groups={[[2, 4, 5].map(v => ({ v, s: 'visited' as VizState })), [1, 3, 6].map(v => ({ v, s: 'visited' as VizState }))]} />, caption: tr('작은 조각끼리 순서대로 합쳐서 [2, 4, 5]와 [1, 3, 6]을 만들어요.', 'Merge the small pieces in order to get [2, 4, 5] and [1, 3, 6].') },
      {
        visual: (
          <div className="flex flex-col items-center gap-4">
            <Groups groups={[[{ v: 2, s: 'candidate' }, { v: 4 }, { v: 5 }], [{ v: 1, s: 'danger' }, { v: 3 }, { v: 6 }]]} />
            <div className="flex flex-col items-center gap-1"><RowLabel>{tr('합친 결과', 'Merged')}</RowLabel><div className="flex gap-1"><Cell v={1} s="danger" /></div></div>
          </div>
        ),
        caption: tr('이제 두 묶음의 맨 앞, 2와 1만 비교해요. 더 작은 1을 결과로 먼저 보내요.', 'Now compare only the fronts, 2 and 1. The smaller 1 goes to the result first.'),
      },
      {
        visual: (
          <div className="flex flex-col items-center gap-4">
            <Groups groups={[[{ v: 5, s: 'candidate' }], [{ v: 6, s: 'candidate' }]]} />
            <div className="flex flex-col items-center gap-1"><RowLabel>{tr('합친 결과', 'Merged')}</RowLabel><div className="flex gap-1">{[1, 2, 3, 4].map(v => <Cell key={v} v={v} s="visited" />)}</div></div>
          </div>
        ),
        caption: tr('계속 맨 앞끼리만 비교해요: 2와 3 → 2, 4와 3 → 3, 4와 6 → 4. 결과는 [1, 2, 3, 4].', 'Keep comparing only the fronts: 2 vs 3 → 2, 4 vs 3 → 3, 4 vs 6 → 4. Result so far: [1, 2, 3, 4].'),
      },
      { visual: bars([1, 2, 3, 4, 5, 6], all(range(0, 5), 'visited')), caption: tr('남은 5와 6을 차례로 보내면 [1, 2, 3, 4, 5, 6] 완성!', 'Send the leftover 5 and 6 and we have [1, 2, 3, 4, 5, 6].') },
    ],
    steps: [
      tr('배열을 반으로 나눠요. 조각이 한 칸이 될 때까지 계속 나눠요.', 'Split the array in half, and keep splitting until each piece has one item.'),
      tr('두 조각을 합칠 때는 양쪽 맨 앞 값만 비교해서 더 작은 쪽을 결과에 옮겨요.', 'To merge two pieces, compare only their front values and move the smaller one to the result.'),
      tr('한쪽이 바닥나면 다른 쪽에 남은 값을 그대로 뒤에 붙여요.', 'When one side runs out, append whatever is left on the other side.'),
      tr('작은 조각부터 차례로 합쳐 올라가면 전체가 정렬돼요.', 'Merge from the smallest pieces upward and the whole array ends up sorted.'),
    ],
    useWhen: [
      tr('입력이 어떻게 생겼든 항상 같은 속도가 보장돼야 할 때', 'You need the same speed no matter what the input looks like'),
      tr('같은 값의 원래 순서를 지켜야 할 때(안정 정렬). 예: 이름순 목록을 다시 점수순으로 정렬', 'Equal values must keep their order (stable), e.g. re-sorting a name-ordered list by score'),
      tr('연결 리스트나, 메모리에 다 안 들어가는 아주 큰 파일을 정렬할 때', 'Sorting linked lists, or huge files that do not fit in memory'),
    ],
    watchOut: [
      tr('합칠 때 결과를 담을 임시 배열이 필요해서 메모리를 배열 크기만큼 더 써요.', 'Merging needs a temporary array, so it uses extra memory equal to the array size.'),
      tr('아주 작은 배열에서는 나누고 합치는 준비가 오히려 손해예요.', 'On tiny arrays, all the splitting and merging is more overhead than help.'),
    ],
    complexity: {
      time: 'O(n log n)', space: 'O(n)',
      plain: tr('개수가 2배가 되면 시간은 2배보다 조금 더 걸려요. 100만 개도 1초 안쪽이면 끝나고, 최악의 경우도 똑같이 빨라요.', 'Double the items and it takes a little more than twice as long. A million items finish in under a second, and the worst case is just as fast.'),
    },
  }),

  quick: tr => ({
    icon: Split,
    subtitle: tr('기준값으로 작은 쪽, 큰 쪽 나누기', 'Split into smaller and bigger around a pivot'),
    summary: tr(
      '기준값(피벗) 하나를 정해 그보다 작은 값은 왼쪽, 큰 값은 오른쪽으로 보내고, 양쪽에서 같은 일을 반복해요.',
      'Pick one value as the pivot, move smaller values to its left and bigger ones to its right, then do the same on each side.',
    ),
    analogy: {
      icon: Users,
      title: tr('"나보다 작은 사람은 왼쪽!"', '"Shorter than me, go left!"'),
      body: tr(
        '반장이 앞에 서서 "나보다 작은 사람은 왼쪽, 큰 사람은 오른쪽!" 하고 외치면, 반장은 그 순간 자기 자리를 확정해요. 왼쪽 무리와 오른쪽 무리도 각자 반장을 뽑아 똑같이 나누면 결국 모두가 정렬돼요.',
        'The class leader shouts "shorter than me go left, taller go right!" and at that moment the leader is in the right spot. Each side picks its own leader and splits the same way, until everyone is in order.',
      ),
    },
    storyboard: [
      { visual: bars([3, 6, 1, 5, 2, 4], { 5: 'current' }, [{ index: 5, label: tr('피벗', 'pivot'), tone: 'current' }]), caption: tr('맨 끝의 4를 기준값, 피벗으로 골라요(파란색).', 'Pick the last value, 4, as the pivot (blue).') },
      { visual: bars([3, 6, 1, 5, 2, 4], { 0: 'candidate', 2: 'candidate', 4: 'candidate', 5: 'current' }), caption: tr('4보다 작은 3, 1, 2(노란색)는 왼쪽으로, 큰 6, 5는 오른쪽으로 보낼 거예요.', 'The values smaller than 4, namely 3, 1 and 2 (amber), go left; the bigger 6 and 5 go right.') },
      { visual: bars([3, 1, 2, 4, 6, 5], { 3: 'visited' }), caption: tr('나누고 나면 [3, 1, 2] 4 [6, 5]. 4의 왼쪽은 다 작고 오른쪽은 다 크니까 4는 최종 자리에 확정돼요.', 'After the split: [3, 1, 2] 4 [6, 5]. Everything left of 4 is smaller and everything right is bigger, so 4 is final.') },
      { visual: bars([1, 2, 3, 4, 6, 5], { 0: 'visited', 1: 'visited', 2: 'visited', 3: 'visited' }, [{ index: 1, label: tr('피벗', 'pivot'), tone: 'current' }]), caption: tr('왼쪽 [3, 1, 2]도 똑같이: 끝의 2를 피벗으로 1은 왼쪽, 3은 오른쪽 → [1, 2, 3]', 'Same on the left [3, 1, 2]: pivot 2, so 1 goes left and 3 goes right → [1, 2, 3].') },
      { visual: bars([1, 2, 3, 4, 5, 6], all(range(0, 5), 'visited')), caption: tr('오른쪽 [6, 5]도 5를 피벗으로 나누면 [5, 6]. 더 나눌 게 없으니 완성!', 'The right side [6, 5] splits around 5 into [5, 6]. Nothing left to split: done!') },
    ],
    steps: [
      tr('구간에서 피벗을 하나 골라요. 이 화면에서는 맨 끝 값을 써요.', 'Pick a pivot in the range. This page uses the last value.'),
      tr('피벗보다 작거나 같은 값은 앞쪽으로 모으고, 마지막에 피벗을 그 바로 뒤에 놓아요. 피벗은 이제 확정이에요.', 'Gather values ≤ pivot at the front, then put the pivot right after them. The pivot is now final.'),
      tr('피벗의 왼쪽 구간과 오른쪽 구간에서 각각 1~2번을 반복해요.', 'Repeat steps 1 and 2 on the left part and the right part.'),
      tr('구간이 한 칸 이하가 되면 더 할 일이 없어요.', 'A range of one item or less needs no work.'),
    ],
    useWhen: [
      tr('대부분의 일반적인 정렬. 같은 O(n log n)인 정렬들 중 실제로 가장 빠른 경우가 많아요.', 'Most everyday sorting. Among O(n log n) sorts it is usually the fastest in practice.'),
      tr('추가 메모리를 거의 쓰지 않아야 할 때(제자리에서 정렬)', 'You want to sort in place with almost no extra memory'),
    ],
    watchOut: [
      tr('이미 정렬된 배열에서 매번 끝 값을 피벗으로 잡으면 한쪽으로만 쏠려서 O(n²)로 느려져요. 무작위 피벗이나 세 값의 중간값으로 피해요.', 'On sorted input, always picking the last value makes every split lopsided, so it drops to O(n²). Random or median-of-three pivots avoid this.'),
      tr('같은 값의 원래 순서가 바뀔 수 있어요(불안정).', 'Equal values can change order (unstable).'),
    ],
    complexity: {
      time: 'O(n log n)', space: 'O(log n)',
      plain: tr('보통은 개수가 2배가 되면 시간이 2배보다 조금 더 걸리는 정도예요. 다만 피벗이 계속 한쪽 끝으로 뽑히는 최악의 경우엔 O(n²)이라 4배씩 늘어나요.', 'Usually doubling the items takes a little more than twice as long. In the worst case, when the pivot keeps landing at one end, it is O(n²) and quadruples instead.'),
    },
  }),

  heap: tr => ({
    icon: Crown,
    subtitle: tr('가장 큰 값을 꼭대기로 올려 하나씩 꺼내기', 'Raise the biggest to the top, then take it out'),
    summary: tr(
      '배열을 "부모가 자식보다 큰" 나무 모양(힙)으로 만들면 꼭대기가 언제나 최댓값이라, 꼭대기를 하나씩 뒤로 빼면 정렬돼요.',
      'Arrange the array as a tree where every parent is bigger than its children (a heap). The top is always the maximum, so keep moving the top to the back.',
    ),
    analogy: {
      icon: Crown,
      title: tr('토너먼트 우승자를 한 명씩 시상하기', 'Awarding tournament winners one at a time'),
      body: tr(
        '토너먼트에서 이긴 사람이 위로 올라가면 맨 꼭대기에는 가장 센 사람이 있어요. 우승자를 시상대로 보내고 빈자리를 다시 겨루게 하면 다음으로 센 사람이 올라와요. 이걸 반복하면 센 순서대로 줄이 서요.',
        'In a tournament the winners move up, so the strongest player sits at the top. Send the champion to the podium, let the others compete for the empty spot, and the next strongest rises. Repeat and everyone lines up by strength.',
      ),
    },
    storyboard: [
      { visual: heapFrame([3, 5, 1, 4, 2], 5), caption: tr('배열 [3, 5, 1, 4, 2]를 위에서 아래, 왼쪽에서 오른쪽 순서로 나무 모양에 올려요.', 'Lay [3, 5, 1, 4, 2] onto a tree, top to bottom and left to right.') },
      { visual: heapFrame([5, 4, 1, 3, 2], 5, { 0: 'current' }), caption: tr('부모가 자식보다 크도록 자리를 바꿔요(최대 힙). 이제 꼭대기가 가장 큰 값 5예요.', 'Swap until every parent is bigger than its children (a max-heap). Now the top is the biggest value, 5.') },
      { visual: heapFrame([2, 4, 1, 3, 5], 4, { 0: 'danger' }), caption: tr('꼭대기 5를 맨 뒤 칸과 바꿔 확정해요(초록). 대신 꼭대기로 올라온 2는 자리가 틀렸어요(빨강).', 'Swap the top 5 with the last spot, so 5 is final (green). The 2 that moved up is in the wrong place (red).') },
      { visual: heapFrame([4, 3, 1, 2, 5], 4, { 0: 'current' }), caption: tr('2를 더 큰 자식과 바꾸며 내려보내요: 2와 4를 바꾸고, 2와 3을 바꿔요. 꼭대기에 다시 가장 큰 4가 와요.', 'Sink 2 by swapping it with its bigger child: 2 with 4, then 2 with 3. The biggest remaining value, 4, is back on top.') },
      { visual: heapFrame([3, 2, 1, 4, 5], 3, { 0: 'current' }), caption: tr('4도 뒤로 보내 확정하고, 올라온 2를 다시 내려보내면 꼭대기는 3이에요.', 'Send 4 to the back as well, sink the 2 again, and 3 is on top.') },
      { visual: heapFrame([1, 2, 3, 4, 5], 0), caption: tr('같은 일을 반복하면 큰 값부터 하나씩 뒤에 쌓여서 [1, 2, 3, 4, 5]가 돼요.', 'Keep going and the values pile up at the back from biggest down: [1, 2, 3, 4, 5].') },
    ],
    steps: [
      tr('배열을 최대 힙으로 만들어요. 부모가 자식보다 작으면 바꾸는 일을 아래쪽 부모부터 해요.', 'Turn the array into a max-heap: starting from the lowest parents, swap any parent smaller than a child.'),
      tr('꼭대기(가장 큰 값)를 힙의 마지막 칸과 바꾸고, 그 칸을 확정해요.', 'Swap the top (the biggest value) with the last spot of the heap and mark that spot final.'),
      tr('꼭대기로 올라온 값을 더 큰 자식과 바꾸며 제자리까지 내려보내요.', 'Sink the new top by swapping it with its bigger child until it fits.'),
      tr('힙이 빌 때까지 2~3번을 반복해요.', 'Repeat steps 2 and 3 until the heap is empty.'),
    ],
    useWhen: [
      tr('최악의 경우에도 O(n log n)이 보장돼야 하고, 추가 메모리도 쓰기 싫을 때', 'You need guaranteed O(n log n) even in the worst case and no extra memory'),
      tr('전체가 아니라 "가장 큰 k개"만 필요할 때. k번만 꺼내면 돼요.', 'You only need the top k values: just take k items out.'),
    ],
    watchOut: [
      tr('배열 여기저기를 건너뛰며 읽어서, 실제로는 퀵 정렬보다 느린 경우가 많아요.', 'It jumps around the array, so in practice it is often slower than quick sort.'),
      tr('같은 값의 원래 순서가 바뀔 수 있어요(불안정).', 'Equal values can change order (unstable).'),
      tr('배열 칸 i의 자식은 2i+1, 2i+2번 칸이에요. 0번부터 세는지 1번부터 세는지 헷갈리지 마세요.', 'The children of index i are 2i+1 and 2i+2. Do not mix up 0-based and 1-based indexing.'),
    ],
    complexity: {
      time: 'O(n log n)', space: 'O(1)',
      plain: tr('개수가 2배가 되면 시간은 2배보다 조금 더 걸려요. 입력이 어떻든 이 속도가 보장되고, 메모리도 거의 더 쓰지 않아요.', 'Double the items and it takes a little more than twice as long. This holds for any input, and it needs almost no extra memory.'),
    },
  }),

  counting: tr => ({
    icon: Tally5,
    subtitle: tr('비교하지 않고, 값마다 개수를 세서 정렬', 'Sort by counting, with no comparisons'),
    summary: tr(
      '값의 범위가 좁을 때, 각 값이 몇 번 나오는지 센 다음 작은 값부터 그 개수만큼 적으면 정렬돼요.',
      'When values fall in a small range, count how many times each value appears, then write each value that many times from smallest up.',
    ),
    analogy: {
      icon: Tally5,
      title: tr('투표함 개표하기', 'Counting votes'),
      body: tr(
        '반장 선거 개표처럼, 표를 하나씩 보며 칠판의 후보 이름 옆에 바를 정(正) 자를 그어요. 다 세고 나면 1번 후보 표를 개수만큼, 그다음 2번 후보 표를 개수만큼 늘어놓으면 끝이에요. 표끼리 비교할 필요가 없어요.',
        'Like counting a class election, look at each ballot and add a tally mark next to the name on the board. When done, lay out candidate 1’s ballots, then candidate 2’s, and so on. No two ballots are ever compared.',
      ),
    },
    storyboard: [
      { visual: countingFrame(Array(6).fill('idle'), [null, null, null, null], []), caption: tr('[3, 1, 0, 3, 1, 1]의 값은 0~3 사이뿐이에요. 0, 1, 2, 3 이름표가 붙은 개수 칸 4개를 준비해요.', 'The values in [3, 1, 0, 3, 1, 1] are all between 0 and 3. Prepare four count boxes labeled 0, 1, 2 and 3.') },
      { visual: countingFrame(['visited', 'visited', 'visited', 'current', 'idle', 'idle'], [1, 1, null, 2], [], 'current', 3), caption: tr('배열을 앞에서부터 하나씩 읽어 해당 칸에 1을 더해요. 네 번째 값 3을 읽으면 3번 칸이 2가 돼요.', 'Read the array one value at a time and add 1 to that box. Reading the fourth value, 3, makes box 3 equal 2.') },
      { visual: countingFrame(Array(6).fill('visited'), [1, 3, 0, 2], []), caption: tr('다 셌어요: 0은 1개, 1은 3개, 2는 0개, 3은 2개.', 'All counted: one 0, three 1s, zero 2s, two 3s.') },
      { visual: countingFrame(Array(6).fill('visited'), [1, 3, 0, 2], [0, 1, 1, 1], 'current', 1), caption: tr('이제 0번 칸부터 개수만큼 적어요. 0을 1번, 1을 3번 → [0, 1, 1, 1]. 2는 0개라 건너뛰어요.', 'Now write values from box 0 up. One 0, three 1s → [0, 1, 1, 1]. Box 2 is empty, so skip it.') },
      { visual: countingFrame(Array(6).fill('visited'), [1, 3, 0, 2], [0, 1, 1, 1, 3, 3], 'visited'), caption: tr('3을 2번 적으면 [0, 1, 1, 1, 3, 3] 완성! 두 값을 서로 비교한 적이 한 번도 없어요.', 'Write 3 twice and we have [0, 1, 1, 1, 3, 3]. No two values were ever compared.') },
    ],
    steps: [
      tr('가장 큰 값 k까지 0~k 이름표가 붙은 개수 칸을 만들어요.', 'Make count boxes labeled 0 to k, where k is the largest value.'),
      tr('배열을 한 번 훑으며 값마다 해당 칸에 1씩 더해요.', 'Scan the array once and add 1 to the box for each value.'),
      tr('개수를 앞에서부터 차례로 더해 두면(누적합) 값마다 결과 배열의 어디까지 들어갈지 알 수 있어요.', 'Add the counts up from the front (prefix sums), which tells you where each value ends in the output.'),
      tr('원래 배열을 뒤에서부터 읽으며 그 자리에 놓아요. 같은 값의 원래 순서가 지켜져요(안정 정렬). 실제 화면이 이 방식이에요.', 'Read the input from the back and place each value at its spot, which keeps equal values in order (stable). The real page does it this way.'),
    ],
    useWhen: [
      tr('시험 점수(0~100), 나이처럼 범위가 좁은 정수를 아주 많이 정렬할 때', 'Sorting lots of integers in a small range, like test scores (0 to 100) or ages'),
      tr('기수 정렬 안에서 자릿수 하나를 기준으로 나눌 때', 'As the per-digit step inside radix sort'),
    ],
    watchOut: [
      tr('값의 범위가 넓으면(예: 0~10억) 칸이 너무 많아져 시간과 메모리가 낭비돼요. 이 화면은 0~99만 받아요.', 'A wide range (say 0 to a billion) needs far too many boxes, wasting time and memory. This page accepts 0 to 99.'),
      tr('음수나 소수는 그대로는 못 써요. 값을 옮기는 등 따로 처리해야 해요.', 'Negative numbers and decimals do not work as is and need extra handling, such as shifting the values.'),
    ],
    complexity: {
      time: 'O(n + k)', space: 'O(n + k)',
      plain: tr('개수(n)가 2배가 되면 시간도 딱 2배 정도예요. 비교 정렬의 한계인 n log n보다도 빨라요. 단, 값의 범위 k가 크면 그만큼 느려져요.', 'Double the items (n) and the time roughly doubles, even faster than the n log n limit of comparison sorts. But a large value range k slows it down just as much.'),
    },
  }),

  radix: tr => ({
    icon: Mail,
    subtitle: tr('1의 자리부터 자릿수별로 나눠 담기', 'Bucket by digit, starting from the ones place'),
    summary: tr(
      '1의 자리 숫자로 0~9번 상자에 나눠 담았다가 순서대로 꺼내고, 10의 자리로 또 같은 일을 하면 정렬돼요.',
      'Drop the numbers into boxes 0 to 9 by their ones digit and collect them in order, then repeat with the tens digit, and they come out sorted.',
    ),
    analogy: {
      icon: Mail,
      title: tr('우편번호로 편지 분류하기', 'Sorting mail by postal code'),
      body: tr(
        '우체국에서 편지를 우편번호 끝자리로 0~9번 칸에 나눠 넣고, 0번 칸부터 순서대로 다시 모아요. 그다음 자리로 또 나눠 넣고 모으기를 반복하면, 편지끼리 하나하나 비교하지 않아도 번호 순서가 돼요.',
        'At the post office, letters go into slots 0 to 9 by the last digit of the postal code and are gathered back from slot 0 up. Do that again for the next digit, and the letters end up in order without comparing any two of them.',
      ),
    },
    storyboard: [
      { visual: radixArray([32, 15, 21, 13, 25], 0, 'idle'), caption: tr('[32, 15, 21, 13, 25]에서 먼저 1의 자리(밑줄)만 봐요: 2, 5, 1, 3, 5.', 'In [32, 15, 21, 13, 25], first look only at the ones digit (underlined): 2, 5, 1, 3, 5.') },
      { visual: <RadixBuckets pos={0} buckets={{ 1: [21], 2: [32], 3: [13], 5: [15, 25] }} />, caption: tr('1의 자리에 맞는 0~9번 상자에 앞에서부터 넣어요. 15와 25는 둘 다 5번 상자인데, 먼저 온 15가 아래에 깔려요.', 'Put each number, front to back, into the box for its ones digit. 15 and 25 both go in box 5, with 15 first at the bottom.') },
      { visual: radixArray([21, 32, 13, 15, 25], 0, 'candidate'), caption: tr('0번 상자부터 넣은 순서대로 꺼내요: [21, 32, 13, 15, 25]. 1의 자리 기준으로는 정렬됐어요.', 'Collect from box 0 up, in the order they went in: [21, 32, 13, 15, 25]. They are sorted by the ones digit.') },
      { visual: <RadixBuckets pos={1} buckets={{ 1: [13, 15], 2: [21, 25], 3: [32] }} />, caption: tr('이번엔 10의 자리로 다시 나눠 담아요. 같은 상자 안에서는 방금 정한 순서(13 → 15, 21 → 25)가 그대로 지켜져요.', 'Now bucket again by the tens digit. Inside each box the order from the last pass stays (13 → 15, 21 → 25).') },
      { visual: radixArray([13, 15, 21, 25, 32], null, 'visited'), caption: tr('꺼내면 [13, 15, 21, 25, 32] 완성! 두 자리 수라서 두 바퀴면 끝나요.', 'Collect them and we get [13, 15, 21, 25, 32]. Two-digit numbers need just two passes.') },
    ],
    steps: [
      tr('가장 큰 수의 자릿수 d를 확인해요. 그만큼 바퀴를 돌아요.', 'Find d, the number of digits of the largest value. That is how many passes you make.'),
      tr('이번 자리의 숫자(0~9)에 맞는 상자에 배열 앞에서부터 차례로 넣어요.', 'Put each value, front to back, into the box for its current digit (0 to 9).'),
      tr('0번 상자부터, 넣은 순서 그대로 꺼내서 배열을 다시 채워요.', 'Refill the array by emptying the boxes from 0 up, keeping the order they went in.'),
      tr('1의 자리, 10의 자리, 100의 자리 순서로 2~3번을 반복해요.', 'Repeat steps 2 and 3 for the ones, tens, hundreds place and so on.'),
    ],
    useWhen: [
      tr('전화번호, 날짜, 학번처럼 자릿수가 정해진 정수나 문자열을 대량으로 정렬할 때', 'Sorting many fixed-width integers or strings, like phone numbers, dates or student IDs'),
      tr('값의 범위가 넓어서 계수 정렬을 쓰기엔 칸이 너무 많을 때', 'The value range is too wide for counting sort'),
    ],
    watchOut: [
      tr('꺼낼 때 넣은 순서를 지켜야 해요. 순서가 섞이면 앞 바퀴의 결과가 망가져요.', 'Collect in the same order things went in. Mixing the order ruins the previous passes.'),
      tr('음수나 소수는 따로 처리해야 해요.', 'Negative numbers and decimals need extra handling.'),
    ],
    complexity: {
      time: 'O(d·(n + b))', space: 'O(n + b)',
      plain: tr('한 바퀴는 개수에 비례하고, 바퀴 수는 자릿수(d)예요. 개수가 2배가 되면 시간도 약 2배. 자릿수가 적을수록 빨라요. (b는 상자 수 10)', 'Each pass is proportional to the item count, and there are d passes (one per digit). Double the items and the time about doubles. Fewer digits means faster. (b is the number of boxes, 10.)'),
    },
  }),
};

/* ─────────────── Individual algorithm modal ─────────────── */

interface AlgoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
  algorithm: SortAlgorithm;
}

export function SortAlgoModal({ isOpen, onClose, onStartVisualization, algorithm }: AlgoModalProps) {
  const tr = useTr();
  const { lang } = useLang();
  const c = CONTENT[algorithm](tr);
  const label = SORT_LABELS[algorithm];

  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={c.icon}
      title={label[lang]}
      subtitle={c.subtitle}
      summary={c.summary}
      analogy={c.analogy}
      storyboard={c.storyboard}
      steps={c.steps}
      useWhen={c.useWhen}
      watchOut={c.watchOut}
      complexity={c.complexity}
    />
  );
}

/* ─────────────── Comparison modal ─────────────── */

const SORT_ORDER: SortAlgorithm[] = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap', 'counting', 'radix'];

/** best, average, worst, space, stable */
const TABLE: Record<SortAlgorithm, [string, string, string, string, boolean]> = {
  bubble:    ['O(n)', 'O(n²)', 'O(n²)', 'O(1)', true],
  selection: ['O(n²)', 'O(n²)', 'O(n²)', 'O(1)', false],
  insertion: ['O(n)', 'O(n²)', 'O(n²)', 'O(1)', true],
  merge:     ['O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n)', true],
  quick:     ['O(n log n)', 'O(n log n)', 'O(n²)', 'O(log n)', false],
  heap:      ['O(n log n)', 'O(n log n)', 'O(n log n)', 'O(1)', false],
  counting:  ['O(n + k)', 'O(n + k)', 'O(n + k)', 'O(n + k)', true],
  radix:     ['O(d·(n + b))', 'O(d·(n + b))', 'O(d·(n + b))', 'O(n + b)', true],
};

interface Family {
  tone: Tone;
  big: string;
  name: (tr: Tr) => string;
  members: SortAlgorithm[];
  steps: (n: number) => number;
}

const FAMILIES: Family[] = [
  { tone: 'danger', big: 'O(n²)', name: tr => tr('느리지만 쉬운 셋', 'Simple but slow'), members: ['bubble', 'selection', 'insertion'], steps: n => n * n },
  { tone: 'current', big: 'O(n log n)', name: tr => tr('빠른 셋', 'The fast three'), members: ['merge', 'quick', 'heap'], steps: n => n * Math.log2(n) },
  { tone: 'visited', big: 'O(n + k)', name: tr => tr('숫자 전용 특급 둘', 'Number-only express'), members: ['counting', 'radix'], steps: n => n },
];

const SIZES = [100, 10_000, 1_000_000];
/** A computer doing about 100 million simple steps per second */
const OPS_PER_SEC = 1e8;

function formatCount(x: number, lang: 'ko' | 'en') {
  if (lang === 'ko') {
    if (x >= 1e12) return `약 ${Math.round(x / 1e12)}조 번`;
    if (x >= 1e8) return `약 ${Math.round(x / 1e8).toLocaleString()}억 번`;
    if (x >= 1e4) return `약 ${Math.round(x / 1e4).toLocaleString()}만 번`;
    return `약 ${Math.round(x).toLocaleString()}번`;
  }
  if (x >= 1e12) return `about ${Math.round(x / 1e12)} trillion steps`;
  if (x >= 1e9) return `about ${Math.round(x / 1e9)} billion steps`;
  if (x >= 1e6) return `about ${Math.round(x / 1e6)} million steps`;
  return `about ${Math.round(x).toLocaleString()} steps`;
}

function formatTime(sec: number, tr: Tr) {
  if (sec >= 3600) return tr(`약 ${(sec / 3600).toFixed(1)}시간`, `about ${(sec / 3600).toFixed(1)} hours`);
  if (sec >= 60) return tr(`약 ${Math.round(sec / 60)}분`, `about ${Math.round(sec / 60)} minutes`);
  if (sec >= 0.5) return tr(`약 ${Math.round(sec)}초`, `about ${Math.round(sec)} s`);
  if (sec >= 0.01) return tr(`약 ${sec.toFixed(2)}초`, `about ${sec.toFixed(2)} s`);
  return tr('눈 깜짝할 새', 'instant');
}

function CompareTitle({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight mb-3">
      <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      {children}
    </h3>
  );
}

function GrowthPicture() {
  const tr = useTr();
  const { lang } = useLang();
  const [n, setN] = useState(10_000);
  const counts = FAMILIES.map(f => f.steps(n));
  const max = Math.max(...counts);

  return (
    <div className="rounded-3xl border border-border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground">{tr('정렬할 개수', 'Items to sort')}</span>
        {SIZES.map(s => (
          <button
            key={s}
            onClick={() => setN(s)}
            aria-pressed={n === s}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-bold tabular-nums border transition-colors',
              n === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted',
            )}
          >
            {s.toLocaleString()}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {FAMILIES.map((f, i) => {
          const pct = (counts[i] / max) * 100;
          return (
            <div key={f.big}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm mb-1">
                <span className="font-bold">
                  {f.name(tr)} <code className={cn('font-mono text-xs', toneText[f.tone])}>{f.big}</code>
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {formatCount(counts[i], lang)} · <strong className="text-foreground">{formatTime(counts[i] / OPS_PER_SEC, tr)}</strong>
                </span>
              </div>
              <div className="h-4 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `max(6px, ${pct}%)`, backgroundColor: `var(--state-${f.tone})` }}
                />
              </div>
              <p className="mt-1 text-xs text-hint">{f.members.map(a => SORT_LABELS[a][lang]).join(', ')}</p>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        {tr(
          '1초에 1억 번 계산하는 컴퓨터 기준의 대략적인 값이에요. 개수를 100만으로 바꿔 보세요. 느린 셋은 몇 시간이 걸리는데, 빠른 셋은 1초도 안 걸려요.',
          'Rough numbers for a computer doing 100 million steps per second. Try 1,000,000: the slow three take hours while the fast three finish in under a second.',
        )}
      </p>
    </div>
  );
}

interface Pick { when: (tr: Tr) => string; pick: (tr: Tr) => string; why: (tr: Tr) => string; tone: Tone }

const PICKS: Pick[] = [
  {
    tone: 'current',
    when: tr => tr('잘 모르겠으면, 그냥 평소에', 'Not sure? Everyday sorting'),
    pick: tr => tr('퀵 정렬 (또는 언어의 기본 정렬)', 'Quick sort (or your language’s built-in sort)'),
    why: tr => tr('평균적으로 가장 빨라요. 언어의 기본 정렬은 이미 이런 빠른 정렬들을 섞어 둔 거라 그냥 쓰면 돼요.', 'Fastest on average. Built-in sorts already blend these fast sorts, so just use them.'),
  },
  {
    tone: 'visited',
    when: tr => tr('거의 정렬돼 있거나, 수십 개뿐일 때', 'Nearly sorted, or only a few dozen items'),
    pick: tr => tr('삽입 정렬', 'Insertion sort'),
    why: tr => tr('밀어야 할 값이 거의 없어서 순식간에 끝나요.', 'Almost nothing has to shift, so it finishes instantly.'),
  },
  {
    tone: 'path',
    when: tr => tr('같은 값의 원래 순서를 지켜야 할 때', 'Equal values must keep their order'),
    pick: tr => tr('병합 정렬', 'Merge sort'),
    why: tr => tr('예: 이름순 목록을 점수순으로 다시 정렬해도, 같은 점수끼리는 이름순이 유지돼요.', 'E.g. re-sort a name-ordered list by score and people with the same score stay in name order.'),
  },
  {
    tone: 'candidate',
    when: tr => tr('어떤 입력에도 느려지면 안 되고, 메모리도 아껴야 할 때', 'Never slow down, and save memory too'),
    pick: tr => tr('힙 정렬', 'Heap sort'),
    why: tr => tr('최악에도 O(n log n)이고 추가 메모리가 거의 없어요.', 'O(n log n) even in the worst case, with almost no extra memory.'),
  },
  {
    tone: 'danger',
    when: tr => tr('점수, 나이처럼 범위가 좁은 정수', 'Integers in a small range, like scores or ages'),
    pick: tr => tr('계수 정렬', 'Counting sort'),
    why: tr => tr('비교 없이 세기만 해서 n log n보다도 빨라요.', 'It only counts, never compares, so it beats n log n.'),
  },
  {
    tone: 'neutral',
    when: tr => tr('전화번호, 날짜처럼 자릿수가 정해진 값', 'Fixed-width values, like phone numbers or dates'),
    pick: tr => tr('기수 정렬', 'Radix sort'),
    why: tr => tr('자릿수만큼만 바퀴를 돌면 끝나요.', 'It takes just one pass per digit.'),
  },
];

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SortCompareModal({ isOpen, onClose }: CompareModalProps) {
  const tr = useTr();
  const { lang } = useLang();
  const heads = [tr('최선', 'Best'), tr('평균', 'Average'), tr('최악', 'Worst'), tr('메모리', 'Memory')];

  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      icon={Scale}
      title={tr('정렬 알고리즘 비교', 'Comparing sorting algorithms')}
      subtitle={tr('8가지 정렬, 언제 무엇을 쓸까요?', 'Eight sorts: which one when?')}
      summary={tr(
        '정렬은 크게 세 무리예요. 쉽지만 느린 셋(버블·선택·삽입), 빠른 셋(병합·퀵·힙), 그리고 숫자일 때만 쓰는 특급 둘(계수·기수).',
        'Sorts come in three groups: three simple but slow ones (bubble, selection, insertion), three fast ones (merge, quick, heap), and two number-only express ones (counting, radix).',
      )}
      analogy={{
        icon: Car,
        title: tr('이동 수단 고르기', 'Picking how to travel'),
        body: tr(
          '집 앞 편의점은 걸어가는 게 제일 빠르고, 먼 도시는 기차가 빨라요. 정렬도 데이터가 적으면 단순한 방법이, 많으면 똑똑한 방법이 이겨요. 숫자 범위가 좁다면 전용 고속도로(계수·기수 정렬)도 있어요.',
          'Walking is fastest to the corner store, but a train wins for a distant city. Sorting is the same: simple methods win on small data, clever ones on big data. And if the numbers fall in a narrow range, there is an express lane (counting and radix sort).',
        ),
      }}
    >
      <section>
        <CompareTitle icon={Gauge}>{tr('개수가 늘면 얼마나 차이 날까요?', 'How big does the gap get?')}</CompareTitle>
        <GrowthPicture />
      </section>

      <section>
        <CompareTitle icon={ListChecks}>{tr('이럴 땐 이 정렬', 'Which sort when')}</CompareTitle>
        <div className="grid sm:grid-cols-2 gap-3">
          {PICKS.map(p => (
            <div key={p.pick(tr)} className={cn('rounded-3xl p-5', toneSoft[p.tone])}>
              <p className="text-sm font-semibold opacity-90">{p.when(tr)}</p>
              <p className="text-lg font-extrabold text-foreground mt-0.5">→ {p.pick(tr)}</p>
              <p className="text-sm text-foreground/75 mt-1">{p.why(tr)}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <CompareTitle icon={Table2}>{tr('한눈에 보는 표', 'Everything in one table')}</CompareTitle>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-[13px] text-left">
            <thead className="bg-muted/60 text-xs font-semibold text-muted-foreground">
              <tr>
                <th className="py-2 px-3">{tr('알고리즘', 'Algorithm')}</th>
                {heads.map(h => <th key={h} className="py-2 px-3 whitespace-nowrap">{h}</th>)}
                <th className="py-2 px-3 whitespace-nowrap">{tr('안정 정렬', 'Stable')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SORT_ORDER.map(algo => {
                const row = TABLE[algo];
                return (
                  <tr key={algo}>
                    <td className="py-2 px-3 font-semibold whitespace-nowrap">{SORT_LABELS[algo][lang]}</td>
                    {row.slice(0, 4).map((v, i) => (
                      <td key={i} className={cn('py-2 px-3 font-mono text-xs whitespace-nowrap', i < 3 && v === 'O(n²)' && toneText.danger)}>{v as string}</td>
                    ))}
                    <td className="py-2 px-3">
                      <Badge tone={row[4] ? 'visited' : 'neutral'}>{row[4] ? tr('예', 'Yes') : tr('아니요', 'No')}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          <li>{tr('안정 정렬: 같은 값끼리의 원래 순서가 정렬 후에도 그대로 유지되는 정렬이에요.', 'Stable: equal values keep their original order after sorting.')}</li>
          <li>{tr('k = 값의 범위, d = 자릿수, b = 상자 수(10)예요.', 'k = value range, d = number of digits, b = number of boxes (10).')}</li>
          <li>{tr(
            '원소끼리 비교하는 정렬은 최악에 n log n보다 빨라질 수 없어요. 계수·기수 정렬은 비교를 하지 않아서 이 한계를 넘어요.',
            'Sorts that compare items can never beat n log n in the worst case. Counting and radix sort never compare, so they get past that limit.',
          )}</li>
        </ul>
      </section>
    </ConceptModal>
  );
}
