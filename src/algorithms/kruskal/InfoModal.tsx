import { Network, Construction } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import MiniGraph, { type MiniEdge, type MiniNode } from '../../components/viz/MiniGraph';
import TokenRow, { GraphWithRow } from '../../components/viz/TokenRow';
import type { VizState } from '../../components/viz/palette';
import MstComparisonTable from './MstComparisonTable';
import { useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

/** Four islands, five possible bridges (already in cheapest-first order). Same example as Prim. */
const EDGES: MiniEdge[] = [['A', 'B', 1], ['B', 'C', 2], ['A', 'C', 3], ['C', 'D', 4], ['B', 'D', 5]];
const NODES: MiniNode[] = [
  { id: 'A', x: 30, y: 140, label: 'A' },
  { id: 'B', x: 130, y: 40, label: 'B' },
  { id: 'C', x: 200, y: 195, label: 'C' },
  { id: 'D', x: 340, y: 100, label: 'D' },
];

/** One frame: node and edge states, plus the sorted edge list with the same edge states */
function frame(nodeState: Record<string, VizState>, edgeState: Record<string, VizState>, title: string) {
  return (
    <GraphWithRow
      graph={<MiniGraph nodes={NODES} edges={EDGES} nodeState={nodeState} edgeState={edgeState} height={220} />}
      row={<TokenRow title={title} items={EDGES.map(([u, v, w]) => ({ label: `${u}${v}`, sub: String(w), state: edgeState[`${u}-${v}`] ?? 'idle' }))} />}
    />
  );
}

export default function KruskalInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  const list = tr('싼 순서', 'Cheapest first');

  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Network}
      title={tr('크루스칼 알고리즘', "Kruskal's algorithm")}
      subtitle={tr('모든 점을 가장 싸게 잇는 방법 (최소 신장 트리)', 'Connect every point as cheaply as possible (minimum spanning tree)')}
      summary={tr(
        '가장 싼 선부터 하나씩 고르되, 이미 이어진 두 점을 또 잇는 선은 건너뛰면 모든 점을 가장 싸게 연결할 수 있어요.',
        'Pick lines from cheapest to most expensive, skipping any line between two points that are already connected, and you link everything for the lowest total cost.',
      )}
      analogy={{
        icon: Construction,
        title: tr('섬과 섬 사이에 다리 놓기', 'Building bridges between islands'),
        body: tr(
          '섬 여러 개를 다리로 모두 연결하되 공사비는 최대한 아끼고 싶어요. 가장 싼 다리부터 놓는데, 이미 다른 다리로 오갈 수 있는 두 섬 사이라면 그 다리는 돈 낭비라서 건너뛰어요.',
          'You want every island reachable by bridge while spending as little as possible. Build the cheapest bridges first, but skip any bridge between two islands you can already travel between: it would be wasted money.',
        ),
      }}
      storyboard={[
        {
          visual: frame({}, {}, list),
          caption: tr(
            '섬(점) 4개와 놓을 수 있는 다리(선) 5개가 있어요. 숫자는 공사비예요. 먼저 다리를 싼 순서로 줄 세워요: 1, 2, 3, 4, 5.',
            'There are 4 islands (points) and 5 possible bridges (lines). The numbers are costs. First, line the bridges up cheapest first: 1, 2, 3, 4, 5.',
          ),
        },
        {
          visual: frame({ A: 'visited', B: 'visited' }, { 'A-B': 'visited' }, list),
          caption: tr(
            '가장 싼 1짜리 다리(A, B)를 놓아요. 이제 A와 B는 서로 오갈 수 있는 한 팀이에요.',
            'Build the cheapest bridge, cost 1 (A, B). A and B are now one team: you can travel between them.',
          ),
        },
        {
          visual: frame({ A: 'visited', B: 'visited', C: 'visited' }, { 'A-B': 'visited', 'B-C': 'visited' }, list),
          caption: tr(
            '다음은 2짜리(B, C). C는 아직 다른 팀이니 놓아요. A, B, C가 한 팀이 됐어요.',
            'Next is cost 2 (B, C). C is on another team, so build it. A, B and C are one team now.',
          ),
        },
        {
          visual: frame({ A: 'danger', B: 'visited', C: 'danger' }, { 'A-B': 'visited', 'B-C': 'visited', 'A-C': 'danger' }, list),
          caption: tr(
            '3짜리(A, C)는 건너뛰어요. A와 C는 이미 B를 거쳐 오갈 수 있어서, 놓으면 쓸데없는 고리(사이클)만 생겨요.',
            'Skip cost 3 (A, C). A and C are already connected through B, so this bridge would only make a useless loop (a cycle).',
          ),
        },
        {
          visual: frame({ A: 'path', B: 'path', C: 'path', D: 'path' }, { 'A-B': 'path', 'B-C': 'path', 'C-D': 'path', 'A-C': 'danger' }, list),
          caption: tr(
            '4짜리(C, D)를 놓으면 섬 4개가 다리 3개로 모두 이어져서 끝! 총공사비는 1 + 2 + 4 = 7이에요. 5짜리는 볼 필요도 없어요.',
            'Build cost 4 (C, D) and all 4 islands are joined by 3 bridges. Done! Total cost 1 + 2 + 4 = 7. We never even need the 5.',
          ),
        },
      ]}
      steps={[
        tr('모든 간선(두 점을 잇는 선)을 비용이 싼 순서로 정렬해요.', 'Sort every edge (a line between two points) from cheapest to most expensive.'),
        tr('가장 싼 간선부터 하나씩 봐요.', 'Look at the edges one by one, cheapest first.'),
        tr('양 끝이 이미 같은 팀이면 고리가 생기니 건너뛰어요. 같은 팀인지는 Union-Find(누가 어느 팀인지 적어 둔 명부)로 빠르게 확인해요.', 'If both ends are already on the same team, it would make a loop, so skip it. Union-Find (a roster of who is on which team) answers this quickly.'),
        tr('다른 팀이면 그 간선을 고르고 두 팀을 하나로 합쳐요.', 'Otherwise, pick the edge and merge the two teams into one.'),
        tr('고른 간선이 점 개수보다 1 적어지면 모두 이어진 거라 끝이에요.', 'Once you have picked one fewer edge than there are points, everything is connected. Stop.'),
      ]}
      useWhen={[
        tr('전선, 도로, 네트워크 케이블로 모든 곳을 가장 싸게 연결하고 싶을 때', 'You want to connect every place as cheaply as possible: power lines, roads, network cables'),
        tr('문제에서 간선 목록(누구와 누구, 비용 얼마)이 바로 주어질 때', 'The problem hands you a list of edges (who, who, how much)'),
      ]}
      watchOut={[
        tr('최소 신장 트리는 "두 점 사이의 가장 짧은 길"이 아니에요. 그건 다익스트라가 풀어요.', 'A minimum spanning tree is not "the shortest route between two points". That is what Dijkstra solves.'),
        tr('그래프가 끊겨 있으면 모두를 잇는 트리를 만들 수 없어요. 고른 간선 수로 확인하세요.', 'If the graph is split into parts, no single tree can connect everything. Check how many edges you picked.'),
      ]}
      complexity={{
        time: 'O(E log E)',
        space: 'O(V + E)',
        plain: tr(
          '시간 대부분은 간선을 정렬하는 데 써요. 간선(E)이 2배가 되면 시간은 2배보다 조금 더 걸려요. 간선이 수십만 개여도 순식간이에요.',
          'Most of the time goes into sorting the edges. Twice as many edges (E) take a little more than twice as long. Hundreds of thousands of edges finish in an instant.',
        ),
      }}
    >
      <MstComparisonTable />
    </ConceptModal>
  );
}
