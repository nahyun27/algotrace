import { MapPin, Truck } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import MiniGraph, { type MiniEdge, type MiniNode } from '../../components/viz/MiniGraph';
import { MiniTable } from '../../components/viz/MiniTable';
import type { VizState } from '../../components/viz/palette';
import { cn } from '../../components/ui';
import { toneText } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface TSPInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

const NODES: MiniNode[] = [
  { id: 'A', x: 40, y: 40, label: 'A' },
  { id: 'B', x: 250, y: 40, label: 'B' },
  { id: 'C', x: 145, y: 200, label: 'C' },
  { id: 'D', x: 145, y: 110, label: 'D' },
];
const EDGES: MiniEdge[] = [['A', 'B', 1], ['A', 'C', 4], ['A', 'D', 3], ['B', 'C', 2], ['B', 'D', 5], ['C', 'D', 1]];

/**
 * dp[set][city] = shortest distance starting at A, visiting exactly `set`, standing at `city`.
 * '·' = impossible (city not in set). Best tour: A → B → C → D → A = 7.
 */
const SETS = ['A B', 'A C', 'A D', 'A B C', 'A B D', 'A C D', 'A B C D'];
const FULL: (number | '·')[][] = [
  [1, '·', '·'],
  ['·', 4, '·'],
  ['·', '·', 3],
  [6, 3, '·'],
  [8, '·', 6],
  ['·', 4, 5],
  [6, 7, 4],
];

function graph(nodeState: Record<string, VizState>, edgeState: Record<string, VizState>) {
  return <MiniGraph nodes={NODES} edges={EDGES} nodeState={nodeState} edgeState={edgeState} width={290} height={240} radius={18} />;
}

/** Graph on the left, the table filled up to (row, col) on the right */
function frame(
  row: number,
  col: number,
  cells: Record<string, VizState>,
  nodeState: Record<string, VizState>,
  edgeState: Record<string, VizState>,
  corner: string,
) {
  const values = FULL.map((r, i) => r.map((v, j) => (v === '·' || i < row || (i === row && j <= col) ? v : null)));
  return (
    <div className="w-full h-full flex items-center justify-center gap-3 sm:gap-6">
      <div className="hidden sm:block w-[38%] max-w-[220px] h-full">{graph(nodeState, edgeState)}</div>
      <MiniTable
        corner={corner}
        rowLabels={SETS}
        colLabels={['B', 'C', 'D']}
        values={values}
        cellState={(r, c) => cells[`${r},${c}`] ?? (values[r][c] === null || values[r][c] === '·' ? 'idle' : 'visited')}
        className="[&_td]:py-0 [&_th]:py-0.5"
      />
    </div>
  );
}

export default function TSPInfoModal({ isOpen, onClose, onStartVisualization }: TSPInfoModalProps) {
  const tr = useTr();
  const corner = tr('들른 곳 \\ 지금', 'visited \\ at');

  const growth = [
    { n: 4, all: '6', dp: '256', ok: true },
    { n: 10, all: '362,880', dp: tr('약 10만', '≈ 100,000'), ok: true },
    { n: 15, all: tr('약 870억', '≈ 8.7 × 10¹⁰'), dp: tr('약 740만', '≈ 7.4 million'), ok: true },
    { n: 20, all: tr('약 12경 (수백 년)', '≈ 1.2 × 10¹⁷ (centuries)'), dp: tr('약 4억 (몇 초)', '≈ 420 million (seconds)'), ok: false },
  ];

  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={MapPin}
      title={tr('외판원 순회 문제 (TSP)', 'Traveling Salesperson Problem (TSP)')}
      subtitle={tr('모든 도시를 한 번씩 들르고 돌아오는 가장 짧은 길', 'The shortest trip that visits every city once and comes back')}
      summary={tr(
        '"어떤 도시들을 들렀고 지금 어디 있는가"가 같으면 그동안의 순서는 상관없으니, 그 상황마다 가장 짧은 거리만 표에 적어 두고 재사용해요.',
        'If "which cities you have visited and where you are now" is the same, the order you took does not matter. So keep only the shortest distance for each such situation in a table and reuse it.',
      )}
      analogy={{
        icon: Truck,
        title: tr('택배 기사의 하루', "A delivery driver's day"),
        body: tr(
          '택배 기사가 창고에서 출발해 모든 집을 한 번씩 들르고 창고로 돌아와야 해요. 순서를 전부 따져 보면 집이 조금만 늘어도 경우의 수가 폭발해요. 대신 "B, C를 이미 들렀고 지금 C에 있다"처럼 같은 상황을 묶어서, 그 상황까지의 가장 짧은 거리만 메모해요.',
          'A driver leaves the depot, must visit every house once, and return. Trying every order explodes as soon as there are a few more houses. Instead, group identical situations like "already visited B and C, now at C" and note only the shortest distance to reach each one.',
        ),
      }}
      storyboard={[
        {
          visual: <div className="w-full max-w-[320px] h-full">{graph({ A: 'current' }, {})}</div>,
          caption: tr(
            'A에서 출발해 B, C, D를 한 번씩 들르고 A로 돌아와요. 순서를 다 세면 도시 4개는 6가지뿐이지만, 20개면 12경 가지가 넘어 다 볼 수 없어요.',
            'Start at A, visit B, C and D once each, and return to A. With 4 cities there are only 6 orders, but with 20 there are over 10¹⁷: far too many to try.',
          ),
        },
        {
          visual: frame(2, 2, {}, { A: 'visited', B: 'candidate', C: 'candidate', D: 'candidate' }, { 'A-B': 'candidate', 'A-C': 'candidate', 'A-D': 'candidate' }, corner),
          caption: tr(
            '표의 칸 = "왼쪽 도시들을 들렀고 지금 위쪽 도시에 있을 때, 지금까지의 가장 짧은 거리"예요. A에서 바로 가면 B는 1, C는 4, D는 3.',
            'A cell = "the shortest distance so far, having visited the cities on the left and standing at the city on top". Straight from A: B is 1, C is 4, D is 3.',
          ),
        },
        {
          visual: frame(3, 1, { '3,1': 'current', '0,0': 'candidate' }, { A: 'visited', B: 'visited', C: 'current' }, { 'A-B': 'visited', 'B-C': 'current' }, corner),
          caption: tr(
            '{A, B, C}를 들르고 C에 있으려면 바로 전에 B에 있었어야 해요: 1 + 2 = 3. 같은 방식으로 A → C → B는 4 + 2 = 6.',
            'To have visited {A, B, C} and stand at C, you must have come from B: 1 + 2 = 3. Likewise A → C → B is 4 + 2 = 6.',
          ),
        },
        {
          visual: frame(6, 2, { '6,2': 'current', '3,0': 'candidate', '3,1': 'candidate' }, { A: 'visited', B: 'visited', C: 'candidate', D: 'current' }, { 'A-B': 'visited', 'B-C': 'visited', 'C-D': 'candidate', 'B-D': 'candidate' }, corner),
          caption: tr(
            '모두 들르고 D에 도착하는 길: B에서 오면 6 + 5 = 11, C에서 오면 3 + 1 = 4. 어떤 순서로 왔는지는 잊고 짧은 4만 적어요. 이게 다시 쓰는 핵심이에요.',
            'Everything visited, arriving at D: from B it is 6 + 5 = 11, from C it is 3 + 1 = 4. Forget the order and keep only the shorter 4. That is the reuse trick.',
          ),
        },
        {
          visual: frame(6, 2, { '0,0': 'path', '3,1': 'path', '6,2': 'path' }, { A: 'path', B: 'path', C: 'path', D: 'path' }, { 'A-B': 'path', 'B-C': 'path', 'C-D': 'path', 'A-D': 'path' }, corner),
          caption: tr(
            '마지막 줄에 A로 돌아가는 길을 더해요: B는 6 + 1 = 7, C는 7 + 4 = 11, D는 4 + 3 = 7. 가장 짧은 7, A → B → C → D → A가 답이에요.',
            'Add the trip back to A on the last row: B gives 6 + 1 = 7, C gives 7 + 4 = 11, D gives 4 + 3 = 7. The shortest, 7, is A → B → C → D → A.',
          ),
        },
      ]}
      steps={[
        tr('이 방법을 동적 계획법이라고 해요. 작은 문제(적은 도시를 들른 상황)의 답을 적어 두고, 큰 문제를 풀 때 다시 꺼내 쓰는 거예요.', 'This is called dynamic programming: write down answers to small problems (situations with few cities visited) and reuse them for bigger ones.'),
        tr('상황 = (들른 도시 집합, 지금 있는 도시). 집합은 도시마다 0/1 한 자리씩 쓴 정수(비트마스크)로 저장해요. 예: 0111 = A, B, C를 들름.', 'A situation = (set of visited cities, current city). The set is stored as an integer with one 0/1 digit per city (a bitmask), e.g. 0111 = A, B, C visited.'),
        tr('들른 도시가 적은 상황부터: 아직 안 간 도시로 한 칸 더 가 보고, 그 상황의 기록보다 짧으면 고쳐 적어요.', 'Starting from situations with fewer cities: step to an unvisited city, and if that beats the record for the new situation, overwrite it.'),
        tr('모든 도시를 들른 상황마다 출발점으로 돌아가는 거리를 더해서, 가장 작은 값이 답이에요.', 'For each situation with every city visited, add the trip back to the start. The smallest total is the answer.'),
      ]}
      useWhen={[
        tr('들러야 할 곳이 20개 안팎으로 적고, 정확히 가장 짧은 순서가 필요할 때', 'There are only about 20 stops or fewer and you need the exact best order'),
        tr('"모두 한 번씩 방문" 문제를 비트마스크로 상태를 묶어 풀 때(외판원 순회, 작업 배정 등)', '"Visit everything once" problems solved by grouping states with a bitmask (TSP, task assignment, …)'),
      ]}
      watchOut={[
        tr('도시가 30개만 돼도 표가 너무 커져서 못 풀어요. 그땐 근사 알고리즘을 써요.', 'At just 30 cities the table is far too big. Use an approximation algorithm instead.'),
        tr('길이 없는 두 도시(거리 0 또는 없음)를 그냥 지나가지 않게 조심하세요.', 'Do not walk between two cities that have no road (distance 0 or missing).'),
        tr('마지막에 출발 도시로 돌아가는 거리를 꼭 더해야 해요.', 'Remember to add the trip back to the starting city at the end.'),
      ]}
      complexity={{
        time: 'O(N² × 2ᴺ)',
        space: 'O(N × 2ᴺ)',
        plain: tr(
          '도시가 1개 늘 때마다 시간이 2배 넘게 늘어요. 15개 정도는 순식간이고 20개 근처가 한계예요. 그래도 모든 순서를 다 보는 것보다는 비교할 수 없이 빨라요.',
          'Each extra city more than doubles the time. Around 15 cities is instant and about 20 is the limit. Still, that is incomparably faster than trying every order.',
        ),
      }}
    >
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60 text-muted-foreground text-xs">
              <th className="px-4 py-2 text-left font-semibold">{tr('도시 수', 'Cities')}</th>
              <th className="px-4 py-2 text-left font-semibold">{tr('모든 순서 보기 (N-1)!', 'Try every order (N-1)!')}</th>
              <th className="px-4 py-2 text-left font-semibold">{tr('표로 풀기 N² × 2ᴺ', 'Table method N² × 2ᴺ')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {growth.map(row => (
              <tr key={row.n}>
                <td className="px-4 py-2 font-mono font-bold">{row.n}</td>
                <td className={cn('px-4 py-2 font-mono', row.n >= 15 && `${toneText.danger} font-bold`)}>{row.all}</td>
                <td className={cn('px-4 py-2 font-mono', row.ok ? toneText.visited : toneText.candidate)}>{row.dp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ConceptModal>
  );
}
