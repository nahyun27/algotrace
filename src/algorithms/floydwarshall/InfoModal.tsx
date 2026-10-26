import type { ReactNode } from 'react';
import { Grid3x3, Plane, Scale } from 'lucide-react';
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

const N = ['A', 'B', 'C', 'D'];
const EDGES: MiniEdge[] = [['A', 'B', 3], ['B', 'C', 1], ['C', 'D', 2], ['D', 'A', 1], ['A', 'C', 6]];
const NODES: MiniNode[] = [
  { id: 'A', x: 40, y: 35, label: 'A' },
  { id: 'B', x: 200, y: 35, label: 'B' },
  { id: 'C', x: 200, y: 175, label: 'C' },
  { id: 'D', x: 40, y: 175, label: 'D' },
];
const X = '∞';

/** Distance table after each round (rows = from, columns = to) */
const M0 = [['0', '3', '6', X], [X, '0', '1', X], [X, X, '0', '2'], ['1', X, X, '0']];
const M1 = [M0[0], M0[1], M0[2], ['1', '4', '7', '0']];
const M2 = [['0', '3', '4', X], M1[1], M1[2], ['1', '4', '5', '0']];
const M3 = [['0', '3', '4', '6'], [X, '0', '1', '3'], M2[2], M2[3]];
const M4 = [M3[0], ['4', '0', '1', '3'], ['3', '6', '0', '2'], M3[3]];

/**
 * One frame: the graph on the left, the distance table on the right.
 * k = the stopover allowed in this round (blue row and column), changed = cells that just got shorter.
 */
function frame(m: string[][], k: number | null, changed: [number, number][], edgeState: Record<string, VizState> = {}, done = false) {
  const nodeState: Record<string, VizState> = {};
  if (k !== null) nodeState[N[k]] = 'current';
  if (done) N.forEach(n => { nodeState[n] = 'visited'; });
  const isChanged = (i: number, j: number) => changed.some(([a, b]) => a === i && b === j);
  return (
    <div className="w-full h-full flex items-center justify-center gap-3 sm:gap-8">
      <div className="h-full w-[45%] max-w-[240px] min-w-0">
        <MiniGraph nodes={NODES} edges={EDGES} nodeState={nodeState} edgeState={edgeState} directed width={240} height={210} />
      </div>
      <table className="border-separate border-spacing-[3px] text-center font-mono text-xs sm:text-sm shrink-0">
        <thead>
          <tr>
            <th className="text-[10px] text-muted-foreground font-sans font-semibold">{'→'}</th>
            {N.map((n, j) => <th key={n} className={cn('w-7 sm:w-9 font-black', k === j && 'text-[var(--state-current)]')}>{n}</th>)}
          </tr>
        </thead>
        <tbody>
          {m.map((row, i) => (
            <tr key={i}>
              <th className={cn('w-6 font-black', k === i && 'text-[var(--state-current)]')}>{N[i]}</th>
              {row.map((v, j) => (
                <td
                  key={j}
                  className={cn(
                    'w-7 h-7 sm:w-9 sm:h-9 rounded-md font-bold border',
                    isChanged(i, j) ? 'bg-state-candidate border-state-candidate text-amber-950'
                      : done ? cn(toneSoft.visited, 'border-transparent')
                      : k !== null && (i === k || j === k) ? cn(toneSoft.current, 'border-transparent')
                      : i === j ? 'bg-muted text-muted-foreground border-transparent'
                      : 'bg-card border-border',
                  )}
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FWInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();

  const rows: [string, ReactNode, ReactNode, ReactNode][] = [
    [tr('구하는 것', 'Answers'), tr('한 곳 → 모든 곳', 'One → all'), tr('한 곳 → 모든 곳', 'One → all'), tr('모든 곳 → 모든 곳', 'All → all')],
    [tr('마이너스 길', 'Negative roads'), <InfoMark ok={false}>{tr('안 됨', 'No')}</InfoMark>, <InfoMark ok>{tr('가능', 'Yes')}</InfoMark>, <InfoMark ok>{tr('가능', 'Yes')}</InfoMark>],
    [tr('음수 사이클 발견', 'Finds negative cycles'), <InfoMark ok={false}>{tr('못 함', 'No')}</InfoMark>, <InfoMark ok>{tr('가능', 'Yes')}</InfoMark>, <InfoMark ok>{tr('가능', 'Yes')}</InfoMark>],
    [tr('시간', 'Time'), 'O((V+E) log V)', 'O(V·E)', 'O(V³)'],
    [tr('구현', 'Code'), tr('보통', 'Medium'), tr('보통', 'Medium'), tr('쉬움 (for문 3개)', 'Easy (3 loops)')],
  ];

  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Grid3x3}
      title={tr('플로이드-워셜 알고리즘', 'Floyd-Warshall algorithm')}
      subtitle={tr('모든 곳에서 모든 곳까지의 최단 거리 표', 'A table of shortest distances between every pair')}
      summary={tr(
        '거리표를 하나 만들고, "A를 거쳐 가면 더 짧아질까?", "B를 거쳐 가면?"… 경유지를 하나씩 늘려 가며 표의 모든 칸을 고쳐 적으면 모든 쌍의 최단 거리가 완성돼요.',
        'Make one distance table, then ask "is it shorter through A?", "through B?"… adding one stopover at a time and fixing every cell. You end up with the shortest distance for every pair.',
      )}
      analogy={{
        icon: Plane,
        title: tr('환승 요금표 고치기', 'Updating a flight price chart'),
        body: tr(
          '여행사 직원이 도시끼리 직항 요금표를 갖고 있어요. 오늘은 "서울에서 갈아타면 더 싼 표가 있나?"를 모든 칸에 대해 확인하고, 내일은 "부산 환승"을 확인해요. 모든 도시를 한 번씩 환승지로 써 보면 표가 완성돼요.',
          'A travel agent has a chart of direct flight prices between cities. Today she checks every cell for "is it cheaper with a stop in Seoul?", tomorrow "with a stop in Busan". Once every city has been tried as a stopover, the chart is final.',
        ),
      }}
      storyboard={[
        {
          visual: frame(M0, null, []),
          caption: tr(
            '표의 칸 (행, 열)은 "행에서 열까지 거리"예요. 처음엔 바로 가는 길만 적고, 길이 없으면 ∞로 둬요. 자기 자신까지는 0이에요.',
            'Cell (row, column) means "distance from row to column". Start with direct roads only, ∞ where there is none, and 0 to yourself.',
          ),
        },
        {
          visual: frame(M1, 0, [[3, 1], [3, 2]], { 'D-A': 'candidate', 'A-B': 'candidate' }),
          caption: tr(
            'A를 거쳐도 되는 라운드예요(파란 줄). D에서 B로는 길이 없었는데, D→A→B = 1 + 3 = 4가 생겨요. D→C도 1 + 6 = 7이 돼요.',
            'Round "stop at A" (the blue row and column). D had no way to B, but D→A→B = 1 + 3 = 4 appears. D→C becomes 1 + 6 = 7 too.',
          ),
        },
        {
          visual: frame(M2, 1, [[0, 2], [3, 2]], { 'A-B': 'candidate', 'B-C': 'candidate' }),
          caption: tr(
            'B를 거쳐도 되는 라운드. A→B→C = 3 + 1 = 4라서 직항 6보다 짧아요. 4로 고쳐요. D→C도 4 + 1 = 5로 줄어요.',
            'Round "stop at B". A→B→C = 3 + 1 = 4 beats the direct 6, so write 4. D→C shrinks to 4 + 1 = 5.',
          ),
        },
        {
          visual: frame(M3, 2, [[0, 3], [1, 3]], { 'B-C': 'candidate', 'C-D': 'candidate' }),
          caption: tr(
            'C를 거쳐도 되는 라운드. B→C→D = 1 + 2 = 3이 새로 생기고, A→D도 표에 있는 A→C(4)를 써서 4 + 2 = 6이 돼요.',
            'Round "stop at C". B→C→D = 1 + 2 = 3 appears, and A→D uses the table value A→C (4): 4 + 2 = 6.',
          ),
        },
        {
          visual: frame(M4, 3, [[1, 0], [2, 0], [2, 1]], { 'C-D': 'candidate', 'D-A': 'candidate' }),
          caption: tr(
            'D를 거쳐도 되는 라운드. C→D→A = 2 + 1 = 3. 같은 식으로 B→A = 3 + 1 = 4, C→B = 2 + 4 = 6이 채워져요.',
            'Round "stop at D". C→D→A = 2 + 1 = 3. The same way B→A = 3 + 1 = 4 and C→B = 2 + 4 = 6 fill in.',
          ),
        },
        {
          visual: frame(M4, null, [], {}, true),
          caption: tr(
            '네 곳을 모두 경유지로 써 봤으니 끝! 이제 표의 모든 칸이 최단 거리예요. 예를 들어 C→B는 C→D→A→B로 6이에요.',
            'All four places have been tried as a stopover, so we are done. Every cell is now a shortest distance. For example C→B is 6, via C→D→A→B.',
          ),
        },
      ]}
      steps={[
        tr('V×V 표를 만들어 자기 자신은 0, 바로 가는 길은 그 비용, 나머지는 ∞로 채워요.', 'Make a V×V table: 0 to yourself, the road cost for direct roads, ∞ elsewhere.'),
        tr('경유지 k를 하나 정해요. 처음엔 첫 번째 지점부터 시작해요.', 'Pick a stopover k, starting with the first place.'),
        tr('표의 모든 칸 (i, j)에 대해 i→k + k→j가 지금 값보다 작으면 고쳐 적어요.', 'For every cell (i, j), if i→k + k→j is smaller than what is there, write it in.'),
        tr('k를 다음 지점으로 바꿔 3번을 반복해요. 모든 지점을 한 번씩 거치면 끝이에요.', 'Move k to the next place and repeat step 3. Once every place has been k, you are done.'),
      ]}
      useWhen={[
        tr('"어디서 어디까지든" 최단 거리가 모두 필요할 때', 'You need the shortest distance between any two places'),
        tr('지점 수가 수백 개 이하로 적을 때 (V³이 감당 가능할 때)', 'There are only a few hundred places or fewer, so V³ is affordable'),
        tr('코드를 짧고 실수 없이 짜고 싶을 때 (for문 3개면 끝)', 'You want short, low-risk code (three loops and done)'),
      ]}
      watchOut={[
        tr('반복문 순서가 중요해요. 경유지 k가 가장 바깥 for문이어야 해요.', 'Loop order matters: the stopover k must be the outermost loop.'),
        tr('끝나고 자기 자신까지 거리(대각선)가 0보다 작아진 곳이 있으면 음수 사이클이 있다는 뜻이에요.', 'If any diagonal cell (distance to yourself) ends up below 0, there is a negative cycle.'),
        tr('∞ + ∞가 넘치지 않도록 ∞는 적당히 큰 수(예: 10억)로 두세요.', 'Make ∞ a moderately large number (like 10⁹) so ∞ + ∞ does not overflow.'),
      ]}
      complexity={{
        time: 'O(V³)',
        space: 'O(V²)',
        plain: tr(
          '지점이 2배가 되면 시간은 8배예요(2 × 2 × 2). 지점 100개면 100만 번 계산이라 순식간, 500개 정도까지가 편안해요.',
          'Double the places and it takes 8 times as long (2 × 2 × 2). 100 places is a million steps, instant. Up to about 500 is comfortable.',
        ),
      }}
    >
      <section>
        <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight mb-3">
          <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4" />
          </span>
          {tr('최단 거리 알고리즘 셋 비교', 'Three shortest-path algorithms side by side')}
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-2 px-3" />
                <th className="py-2 px-3 font-bold">{tr('다익스트라', 'Dijkstra')}</th>
                <th className="py-2 px-3 font-bold">{tr('벨만-포드', 'Bellman-Ford')}</th>
                <th className="py-2 px-3 font-bold text-primary">{tr('플로이드-워셜', 'Floyd-Warshall')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(([feat, dij, bf, fw]) => (
                <tr key={feat}>
                  <td className="py-2 px-3 font-medium whitespace-nowrap">{feat}</td>
                  <td className="py-2 px-3">{dij}</td>
                  <td className="py-2 px-3">{bf}</td>
                  <td className="py-2 px-3 font-semibold text-primary">{fw}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </ConceptModal>
  );
}
