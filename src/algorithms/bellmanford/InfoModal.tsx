import type { ReactNode } from 'react';
import { TrendingDown, TicketPercent, Scale } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import { InfoMark } from '../../components/algorithm/InfoModal';
import MiniGraph, { type MiniEdge, type MiniNode } from '../../components/viz/MiniGraph';
import type { VizState } from '../../components/viz/palette';
import { cn } from '../../components/ui';
import { toneSoft } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

/** The edge list, in the order every round walks through it */
const EDGES: MiniEdge[] = [['A', 'B', -3], ['B', 'C', 1], ['S', 'A', 4], ['S', 'B', 2]];
const CYCLE_EDGE: MiniEdge = ['C', 'A', 1];

function frame(
  label: ReactNode,
  dist: Record<string, string>,
  nodeState: Record<string, VizState>,
  edgeState: Record<string, VizState> = {},
  withCycle = false,
) {
  const nodes: MiniNode[] = [
    { id: 'S', x: 55, y: 105, label: 'S', note: dist.S },
    { id: 'A', x: 180, y: 35, label: 'A', note: dist.A },
    { id: 'B', x: 180, y: 170, label: 'B', note: dist.B },
    { id: 'C', x: 305, y: 105, label: 'C', note: dist.C },
  ];
  const edges = withCycle ? [...EDGES, CYCLE_EDGE] : EDGES;
  return (
    <div className="w-full h-full flex flex-col items-center gap-1.5">
      <span className={cn('rounded-full px-3 py-1 text-sm font-bold', withCycle ? toneSoft.danger : toneSoft.primary)}>{label}</span>
      <div className="w-full flex-1 min-h-0">
        <MiniGraph nodes={nodes} edges={edges} nodeState={nodeState} edgeState={edgeState} directed height={210} />
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {edges.map(([u, v, w]) => {
          const s = edgeState[`${u}-${v}`];
          return (
            <span
              key={`${u}-${v}`}
              className={cn('rounded-lg px-2 py-0.5 text-xs font-mono font-bold border', s ? cn(toneSoft[s === 'idle' ? 'neutral' : s], 'border-transparent') : 'border-border text-muted-foreground')}
            >
              {u}→{v} {w}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function BFInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  const round = (n: number) => tr(`${n}라운드`, `Round ${n}`);

  const rows: [string, ReactNode, ReactNode][] = [
    [tr('마이너스 길', 'Negative roads'), <InfoMark ok={false}>{tr('틀릴 수 있음', 'Can be wrong')}</InfoMark>, <InfoMark ok>{tr('괜찮음', 'Fine')}</InfoMark>],
    [tr('음수 사이클 발견', 'Finds negative cycles'), <InfoMark ok={false}>{tr('못 함', 'No')}</InfoMark>, <InfoMark ok>{tr('가능', 'Yes')}</InfoMark>],
    [tr('속도', 'Speed'), 'O((V+E) log V)', 'O(V·E)'],
    [tr('방식', 'Approach'), tr('가장 가까운 곳부터 확정', 'Settle the closest first'), tr('모든 길을 여러 번 다시 보기', 'Re-check every road many times')],
  ];

  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={TrendingDown}
      title={tr('벨만-포드 알고리즘', 'Bellman-Ford algorithm')}
      subtitle={tr('마이너스 길이 있어도 되는 최단 거리', 'Shortest distances, even with negative roads')}
      summary={tr(
        '모든 길을 처음부터 끝까지 훑으며 "이 길로 가면 더 짧아질까?"를 확인하는 일을 (지점 수 − 1)번 반복하면, 마이너스 길이 있어도 최단 거리가 나와요.',
        'Go through every road asking "is it shorter this way?", and repeat that (number of places − 1) times. You get the shortest distances even with negative roads.',
      )}
      analogy={{
        icon: TicketPercent,
        title: tr('캐시백 버스 노선표', 'A bus map with cashback routes'),
        body: tr(
          '어떤 노선은 타면 오히려 돈을 돌려줘요(마이너스 요금). 그러면 "지금 제일 싼 곳"이 나중에 더 싸질 수 있어서 한 번에 확정할 수가 없어요. 그래서 노선표 전체를 처음부터 다시 훑어보고, 더 싼 방법이 보이면 고쳐 적기를 여러 번 반복해요.',
          'Some routes pay you back (a negative fare). Then the cheapest place right now might get even cheaper later, so nothing can be settled at once. Instead you re-read the whole route list, fixing any price that can be beaten, over and over.',
        ),
      }}
      storyboard={[
        {
          visual: frame(tr('시작', 'Start'), { S: '0', A: '∞', B: '∞', C: '∞' }, { S: 'current' }),
          caption: tr(
            'S는 0, 나머지는 모르니 ∞예요. 아래 길 목록 4개를 순서대로 한 번씩 다 보는 걸 "라운드"라고 불러요. A→B는 −3, 마이너스 길이에요.',
            'S is 0, the rest are unknown (∞). Going through the 4 roads below once, in order, is one "round". A→B is −3, a negative road.',
          ),
        },
        {
          visual: frame(round(1), { S: '0', A: '4', B: '2', C: '∞' }, { S: 'visited', A: 'candidate', B: 'candidate' }, { 'S-A': 'candidate', 'S-B': 'candidate' }),
          caption: tr(
            'A→B와 B→C는 출발 쪽이 아직 ∞라 그냥 넘어가요. S→A로 A = 0 + 4 = 4, S→B로 B = 0 + 2 = 2를 적어요.',
            'A→B and B→C start from ∞, so skip them. S→A gives A = 0 + 4 = 4, S→B gives B = 0 + 2 = 2.',
          ),
        },
        {
          visual: frame(round(2), { S: '0', A: '4', B: '1', C: '∞' }, { S: 'visited', A: 'visited', B: 'current' }, { 'A-B': 'candidate' }),
          caption: tr(
            '다시 처음부터. A→B를 보면 4 + (−3) = 1이라 2보다 작아요. B를 1로 고쳐 적어요(이걸 완화라고 해요). 다익스트라는 B(2)를 이미 확정해서 이걸 놓쳐요.',
            'Start over. A→B gives 4 + (−3) = 1, smaller than 2, so B becomes 1 (this fix is called relaxation). Dijkstra would have already settled B at 2 and missed it.',
          ),
        },
        {
          visual: frame(round(2), { S: '0', A: '4', B: '1', C: '2' }, { S: 'visited', A: 'visited', B: 'visited', C: 'current' }, { 'B-C': 'candidate' }),
          caption: tr(
            '이어서 B→C: 1 + 1 = 2라서 C를 ∞에서 2로 적어요. S→A, S→B는 더 줄일 게 없어요.',
            'Next, B→C: 1 + 1 = 2, so C goes from ∞ to 2. S→A and S→B change nothing.',
          ),
        },
        {
          visual: frame(round(3), { S: '0', A: '4', B: '1', C: '2' }, { S: 'path', A: 'path', B: 'path', C: 'path' }, { 'S-A': 'path', 'A-B': 'path', 'B-C': 'path' }),
          caption: tr(
            '3라운드에서는 아무것도 안 바뀌어요. 그럼 더 돌려도 똑같으니 끝! 보라색 S → A → B → C가 최단 경로예요. 지점이 4개라 최대 3라운드면 충분해요.',
            'Round 3 changes nothing, so more rounds would not either. Done! Violet S → A → B → C is the shortest route. With 4 places, 3 rounds are always enough.',
          ),
        },
        {
          visual: frame(tr('음수 사이클', 'Negative cycle'), { S: '0', A: '4 → 3', B: '1 → 0', C: '2 → 1' }, { S: 'visited', A: 'danger', B: 'danger', C: 'danger' }, { 'A-B': 'danger', 'B-C': 'danger', 'C-A': 'danger' }, true),
          caption: tr(
            '만약 C→A(1) 길이 더 있다면? A → B → C → A 한 바퀴가 −3 + 1 + 1 = −1이라 돌 때마다 1씩 줄어 끝이 없어요. 4라운드에서도 값이 바뀌면 이런 음수 사이클이 있다는 뜻이에요.',
            'What if there is also a road C→A (1)? One loop A → B → C → A costs −3 + 1 + 1 = −1, so every lap gets cheaper forever. If anything still changes in round 4, such a negative cycle exists.',
          ),
        },
      ]}
      steps={[
        tr('출발점은 0, 나머지는 모두 ∞로 적어요.', 'Set the start to 0 and everything else to ∞.'),
        tr('모든 길 u→v(비용 w)를 하나씩 보며 dist[u] + w가 dist[v]보다 작으면 고쳐 적어요.', 'For every road u→v (cost w), if dist[u] + w is smaller than dist[v], update it.'),
        tr('2번을 (지점 수 − 1)번 반복해요. 한 라운드 동안 아무것도 안 바뀌면 일찍 끝내도 돼요.', 'Repeat step 2 (number of places − 1) times. If a whole round changes nothing, you can stop early.'),
        tr('한 번 더 돌렸는데도 줄어드는 값이 있으면 음수 사이클이 있다고 알려요.', 'Run one extra round. If anything still shrinks, report a negative cycle.'),
      ]}
      useWhen={[
        tr('비용이 마이너스인 길이 있을 때 (환불, 할인, 에너지 회복 같은 것)', 'Some roads have negative costs (refunds, discounts, energy gains)'),
        tr('끝없이 줄어드는 고리(음수 사이클)가 있는지 확인해야 할 때', 'You need to check for a loop that keeps getting cheaper (a negative cycle)'),
      ]}
      watchOut={[
        tr('다익스트라보다 훨씬 느려요. 마이너스 길이 없다면 다익스트라를 쓰세요.', 'It is much slower than Dijkstra. Without negative roads, use Dijkstra.'),
        tr('∞인 곳에서 출발하는 길은 건너뛰어야 해요. ∞ + (−3)을 계산하면 엉뚱한 값이 생겨요.', 'Skip roads that start from an ∞ place. Computing ∞ + (−3) gives nonsense.'),
        tr('C++이나 Java에서 거리가 아주 작아질 수 있으니 long 같은 큰 자료형을 쓰세요.', 'In C++ or Java distances can get very negative, so use a wide type like long.'),
      ]}
      complexity={{
        time: 'O(V·E)',
        space: 'O(V)',
        plain: tr(
          '라운드를 최대 V번, 매번 길 E개를 다 봐요. 지점과 길이 둘 다 2배가 되면 시간은 약 4배예요. 지점 500개, 길 수천 개 정도는 금방 끝나요.',
          'Up to V rounds, each looking at all E roads. Double both and it takes about 4 times as long. A few hundred places and a few thousand roads finish quickly.',
        ),
      }}
    >
      <section>
        <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight mb-3">
          <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4" />
          </span>
          {tr('다익스트라와 비교', 'Compared with Dijkstra')}
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-2 px-3 font-semibold text-muted-foreground" />
                <th className="py-2 px-3 font-bold">{tr('다익스트라', 'Dijkstra')}</th>
                <th className="py-2 px-3 font-bold text-primary">{tr('벨만-포드', 'Bellman-Ford')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(([feat, dij, bf]) => (
                <tr key={feat}>
                  <td className="py-2.5 px-3 font-medium">{feat}</td>
                  <td className="py-2.5 px-3">{dij}</td>
                  <td className="py-2.5 px-3">{bf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </ConceptModal>
  );
}
