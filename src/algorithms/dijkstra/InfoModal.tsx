import { Waypoints, MapPinned } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import MiniGraph, { type MiniEdge, type MiniNode } from '../../components/viz/MiniGraph';
import type { VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';

interface DijkstraInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

const EDGES: MiniEdge[] = [['S', 'A', 4], ['S', 'B', 1], ['B', 'A', 2], ['A', 'C', 1], ['B', 'C', 5]];

/** Four-node example: distances as notes, states per frame */
function frame(dist: Record<string, string>, nodeState: Record<string, VizState>, edgeState: Record<string, VizState> = {}) {
  const nodes: MiniNode[] = [
    { id: 'S', x: 60, y: 110, label: 'S', note: dist.S },
    { id: 'A', x: 180, y: 40, label: 'A', note: dist.A },
    { id: 'B', x: 180, y: 180, label: 'B', note: dist.B },
    { id: 'C', x: 300, y: 110, label: 'C', note: dist.C },
  ];
  return <MiniGraph nodes={nodes} edges={EDGES} nodeState={nodeState} edgeState={edgeState} />;
}

export default function DijkstraInfoModal({ isOpen, onClose, onStartVisualization }: DijkstraInfoModalProps) {
  const tr = useTr();
  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Waypoints}
      title={tr('다익스트라 알고리즘', "Dijkstra's algorithm")}
      subtitle={tr('한 출발점에서 모든 곳까지의 최단 거리', 'Shortest distance from one start to everywhere')}
      summary={tr(
        '아직 확정되지 않은 곳 중 가장 가까운 곳을 하나씩 확정해 나가면, 모든 곳까지의 최단 거리가 나와요.',
        'Keep settling the closest place you have not settled yet, and you end up with the shortest distance to every place.',
      )}
      analogy={{
        icon: MapPinned,
        title: tr('가까운 곳부터 도장 찍기', 'Stamping places from nearest to farthest'),
        body: tr(
          '집에서 출발해 동네 지도를 펼쳤다고 해 볼게요. 지금까지 알아낸 곳 중 가장 가까운 곳에 "여기는 이 거리가 최단, 확정!" 도장을 찍고, 그곳에서 갈 수 있는 이웃까지의 거리를 고쳐 적어요. 도장 찍힌 곳은 다시 바뀌지 않아요.',
          'Picture a map of your neighborhood. Among the places you know about, stamp the closest one: "this distance is final." Then update the distances of its neighbors. A stamped place never changes again.',
        ),
      }}
      storyboard={[
        {
          visual: frame({ S: '0', A: '∞', B: '∞', C: '∞' }, { S: 'current' }),
          caption: tr('출발점 S까지의 거리는 0이에요. 나머지는 아직 모르니까 ∞(무한대)로 적어 둬요.', 'The start S is 0 away. Everything else is unknown, so we write ∞ (infinity).'),
        },
        {
          visual: frame({ S: '0', A: '4', B: '1', C: '∞' }, { S: 'visited', A: 'candidate', B: 'candidate' }, { 'S-A': 'candidate', 'S-B': 'candidate' }),
          caption: tr('S를 확정하고, S에서 바로 갈 수 있는 A와 B의 거리를 적어요. A는 4, B는 1이에요.', 'S is settled. Write down the neighbors we can reach from S: A is 4, B is 1.'),
        },
        {
          visual: frame({ S: '0', A: '3', B: '1', C: '6' }, { S: 'visited', B: 'current', A: 'candidate', C: 'candidate' }, { 'S-B': 'visited', 'B-A': 'candidate', 'B-C': 'candidate' }),
          caption: tr('확정 안 된 곳 중 가장 가까운 B(1)를 확정해요. B를 거치면 A까지 1 + 2 = 3이라 4보다 짧으니 3으로 고쳐 적어요.', 'The closest unsettled place is B (1), so settle it. Going through B, A costs 1 + 2 = 3, shorter than 4, so update A to 3.'),
        },
        {
          visual: frame({ S: '0', A: '3', B: '1', C: '4' }, { S: 'visited', B: 'visited', A: 'current', C: 'candidate' }, { 'S-B': 'visited', 'B-A': 'visited', 'A-C': 'candidate' }),
          caption: tr('다음으로 가까운 A(3)를 확정해요. A를 거치면 C까지 3 + 1 = 4라서 6을 4로 고쳐요.', 'Next closest is A (3). Through A, C costs 3 + 1 = 4, so 6 becomes 4.'),
        },
        {
          visual: frame({ S: '0', A: '3', B: '1', C: '4' }, { S: 'path', B: 'path', A: 'path', C: 'path' }, { 'S-B': 'path', 'B-A': 'path', 'A-C': 'path' }),
          caption: tr('마지막으로 C(4)를 확정하면 끝! 보라색 길이 S에서 각 지점까지 가는 가장 짧은 길이에요.', 'Settle C (4) and we are done. The violet roads are the shortest way from S to each place.'),
        },
      ]}
      steps={[
        tr('출발점의 거리는 0, 나머지는 모두 ∞로 적어요.', 'Set the start to 0 and everything else to ∞.'),
        tr('아직 확정 안 된 곳 중 거리가 가장 작은 곳을 골라요. 우선순위 큐가 이걸 빠르게 찾아 줘요.', 'Pick the unsettled place with the smallest distance. A priority queue finds it quickly.'),
        tr('그곳을 확정하고, 이웃마다 "여기를 거쳐 가면 더 짧아질까?"를 확인해서 더 짧으면 고쳐 적어요. 이걸 완화라고 불러요.', 'Settle it, and for each neighbor ask "is it shorter to go through here?" If so, update it. This is called relaxation.'),
        tr('모든 곳이 확정될 때까지 2번과 3번을 반복해요.', 'Repeat steps 2 and 3 until every place is settled.'),
      ]}
      useWhen={[
        tr('지도, 네트워크처럼 길마다 거리나 시간, 비용이 붙어 있을 때', 'Roads have lengths, times or costs, like maps and networks'),
        tr('한 출발점에서 다른 모든 곳까지의 최단 거리가 필요할 때', 'You need the shortest distance from one start to every other place'),
      ]}
      watchOut={[
        tr('음수 비용 길이 있으면 틀린 답이 나와요. 그럴 땐 벨만-포드를 써요.', 'Negative costs break it. Use Bellman-Ford instead.'),
        tr('모든 길의 비용이 같다면 BFS가 더 간단하고 빨라요.', 'If every road costs the same, plain BFS is simpler and faster.'),
        tr('큐에서 꺼낸 곳이 이미 확정됐다면 그냥 건너뛰어야 해요.', 'If a place popped from the queue is already settled, just skip it.'),
      ]}
      complexity={{
        time: 'O((V+E) log V)',
        space: 'O(V)',
        plain: tr(
          '지점(V)과 길(E)의 수가 2배가 되면 시간은 2배보다 조금 더 걸리는 정도예요. 지점이 수만 개여도 눈 깜짝할 사이에 끝나요.',
          'Double the places (V) and roads (E) and it takes a little more than twice as long. Even tens of thousands of places finish in a blink.',
        ),
      }}
    />
  );
}
