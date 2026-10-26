import { Workflow, Zap } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import MiniGraph, { type MiniEdge, type MiniNode } from '../../components/viz/MiniGraph';
import type { VizState } from '../../components/viz/palette';
import MstComparisonTable from '../kruskal/MstComparisonTable';
import { useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

/** Same four-point example as Kruskal, so both reach the same total of 7 */
const EDGES: MiniEdge[] = [['A', 'B', 1], ['B', 'C', 2], ['A', 'C', 3], ['C', 'D', 4], ['B', 'D', 5]];

/** cost = cheapest known way to attach each point to the tree (shown under the node) */
function frame(cost: Record<string, string>, nodeState: Record<string, VizState>, edgeState: Record<string, VizState> = {}) {
  const nodes: MiniNode[] = [
    { id: 'A', x: 30, y: 140, label: 'A', note: cost.A },
    { id: 'B', x: 130, y: 40, label: 'B', note: cost.B },
    { id: 'C', x: 200, y: 195, label: 'C', note: cost.C },
    { id: 'D', x: 340, y: 100, label: 'D', note: cost.D },
  ];
  return <MiniGraph nodes={nodes} edges={EDGES} nodeState={nodeState} edgeState={edgeState} height={235} />;
}

export default function PrimInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Workflow}
      title={tr('프림 알고리즘', "Prim's algorithm")}
      subtitle={tr('한 점에서 시작해 가장 싼 이웃으로 뻗어 나가기 (최소 신장 트리)', 'Grow from one point toward the cheapest neighbor (minimum spanning tree)')}
      summary={tr(
        '한 점에서 시작해, 지금까지 연결된 덩어리에 가장 싸게 붙일 수 있는 점을 하나씩 붙이면 모든 점을 가장 싸게 연결할 수 있어요.',
        'Start from one point and keep attaching whichever point is cheapest to join to what you have so far. You end up linking everything for the lowest total cost.',
      )}
      analogy={{
        icon: Zap,
        title: tr('발전소에서 전기 끌어오기', 'Running power out from a plant'),
        body: tr(
          '발전소 하나에서 시작해 마을 전체에 전선을 깔아요. 이미 전기가 들어온 집들 중 어디서든, 아직 전기가 없는 집까지 전선 값이 가장 싼 곳을 골라 한 줄씩 늘려 가요. 모든 집에 전기가 들어오면 끝이에요.',
          'Start at a power plant and wire up the whole village. From any house that already has power, run one new wire to the not-yet-powered house that is cheapest to reach. Stop when every house has power.',
        ),
      }}
      storyboard={[
        {
          visual: frame({ A: '0', B: '∞', C: '∞', D: '∞' }, { A: 'current' }),
          caption: tr(
            'A에서 시작해요. 점 아래 숫자는 "지금 덩어리에 붙이는 가장 싼 비용"이에요. 아직 모르는 곳은 ∞(무한대)예요.',
            'Start at A. The number under each point is the cheapest cost to attach it to the blob so far. Unknown ones are ∞ (infinity).',
          ),
        },
        {
          visual: frame({ A: '0', B: '1', C: '3', D: '∞' }, { A: 'visited', B: 'candidate', C: 'candidate' }, { 'A-B': 'candidate', 'A-C': 'candidate' }),
          caption: tr(
            'A가 덩어리에 들어갔어요. A에서 B는 1, C는 3에 이을 수 있다고 적어요.',
            'A joins the blob. From A, B can be attached for 1 and C for 3.',
          ),
        },
        {
          visual: frame({ A: '0', B: '1', C: '2', D: '5' }, { A: 'visited', B: 'current', C: 'candidate', D: 'candidate' }, { 'A-B': 'visited', 'B-C': 'candidate', 'B-D': 'candidate' }),
          caption: tr(
            '가장 싼 B(1)를 붙여요. B에서 C로 가면 2라서 3보다 싸니 C를 2로 고쳐 적어요. D는 5예요.',
            'Attach the cheapest, B (1). From B, C costs 2, cheaper than 3, so C becomes 2. D is 5.',
          ),
        },
        {
          visual: frame({ A: '0', B: '1', C: '2', D: '4' }, { A: 'visited', B: 'visited', C: 'current', D: 'candidate' }, { 'A-B': 'visited', 'B-C': 'visited', 'C-D': 'candidate' }),
          caption: tr(
            '다음으로 싼 C(2)를 붙여요. C에서 D로 가면 4라서 5보다 싸니 D를 4로 고쳐 적어요.',
            'Next cheapest is C (2). From C, D costs 4, cheaper than 5, so D becomes 4.',
          ),
        },
        {
          visual: frame({ A: '0', B: '1', C: '2', D: '4' }, { A: 'path', B: 'path', C: 'path', D: 'path' }, { 'A-B': 'path', 'B-C': 'path', 'C-D': 'path' }),
          caption: tr(
            '마지막으로 D(4)를 붙이면 끝! 총비용 1 + 2 + 4 = 7로, 크루스칼과 같은 답이에요.',
            'Attach D (4) and we are done. Total 1 + 2 + 4 = 7, the same answer Kruskal finds.',
          ),
        },
      ]}
      steps={[
        tr('아무 점 하나를 골라 덩어리(이미 연결된 점들)에 넣어요.', 'Pick any point and put it in the blob (the points connected so far).'),
        tr('덩어리 밖의 점마다 덩어리와 잇는 가장 싼 비용을 적어 둬요.', 'For every point outside, keep note of the cheapest way to connect it to the blob.'),
        tr('그중 가장 싼 점을 덩어리에 붙여요. 우선순위 큐(가장 작은 값을 바로 꺼내 주는 상자)가 찾아 줘요.', 'Attach the cheapest of those. A priority queue (a box that always hands you the smallest value) finds it.'),
        tr('새로 붙은 점 덕분에 더 싸진 이웃이 있으면 비용을 고쳐 적어요. 모든 점이 붙을 때까지 3번과 4번을 반복해요.', 'If the new point makes a neighbor cheaper to reach, update that cost. Repeat steps 3 and 4 until every point is attached.'),
      ]}
      useWhen={[
        tr('모든 곳을 가장 싸게 연결하고 싶을 때 (전선, 도로, 배관)', 'You want to connect every place for the lowest total cost (wires, roads, pipes)'),
        tr('간선이 아주 많을 때, 예를 들어 거의 모든 점끼리 이어질 수 있을 때', 'There are lots of edges, for example when almost every pair of points can be connected'),
      ]}
      watchOut={[
        tr('다익스트라와 비슷해 보이지만, 적는 숫자는 출발점부터의 총거리가 아니라 마지막 선 하나의 비용이에요.', 'It looks like Dijkstra, but the number you keep is the cost of one last line, not the total distance from the start.'),
        tr('큐에서 꺼낸 점이 이미 덩어리에 있으면 그냥 건너뛰어야 해요.', 'If a point taken from the queue is already in the blob, just skip it.'),
        tr('그래프가 끊겨 있으면 시작점과 이어진 부분까지만 연결돼요.', 'If the graph is split into parts, only the part containing the start gets connected.'),
      ]}
      complexity={{
        time: 'O(E log V)',
        space: 'O(V + E)',
        plain: tr(
          '간선(E)마다 큐에 한 번씩 넣고 빼요. 간선이 2배가 되면 시간은 2배보다 조금 더 걸리는 정도라서, 수십만 개여도 금방 끝나요.',
          'Each edge (E) goes into and out of the queue about once. Twice as many edges take a little more than twice as long, so hundreds of thousands still finish quickly.',
        ),
      }}
    >
      <MstComparisonTable />
    </ConceptModal>
  );
}
