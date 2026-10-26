import { Network } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoSteps, ComplexityChips } from '../../components/algorithm/InfoModal';
import MstComparisonTable from './MstComparisonTable';
import { useLang, useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function KruskalInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  const { lang } = useLang();
  const ko = lang === 'ko';
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Network}
      title={tr('크루스칼 알고리즘', "Kruskal's algorithm")}
      subtitle={tr('간선 정렬 + Union-Find로 MST(최소 신장 트리) 구축', 'Build a minimum spanning tree with sorted edges + Union-Find')}
    >
      <InfoSection n={1} title={tr('MST(최소 신장 트리)란?', 'What is an MST?')}>
        <InfoCard tone="path">
          {ko ? (
            <>그래프의 모든 노드를 <strong>사이클 없이</strong> 연결하되, 사용한 간선의 <strong>총 가중치가 최소</strong>인 트리입니다. N개 노드를 연결하는 MST는 정확히 <strong>N−1개의 간선</strong>으로 구성됩니다.</>
          ) : (
            <>A tree that connects every node of the graph <strong>without cycles</strong> while keeping the <strong>total edge weight as small as possible</strong>. An MST over N nodes always has exactly <strong>N−1 edges</strong>.</>
          )}
        </InfoCard>
      </InfoSection>

      <InfoSection n={2} title={tr('크루스칼 핵심 아이디어', 'How Kruskal works')}>
        <InfoSteps
          steps={ko ? [
            <>모든 간선을 <strong>가중치 오름차순</strong>으로 정렬</>,
            <>가장 가벼운 간선부터 순서대로 검토</>,
            <><strong>Union-Find</strong>로 두 노드가 같은 컴포넌트인지 확인</>,
            <>같은 컴포넌트면 <strong>사이클 발생 → 스킵</strong></>,
            <>다른 컴포넌트면 <strong>MST에 추가 + Union</strong></>,
            <>MST 간선 수 = N−1이 되면 종료</>,
          ] : [
            <>Sort every edge by <strong>weight, ascending</strong></>,
            <>Look at the edges one by one, lightest first</>,
            <>Use <strong>Union-Find</strong> to check whether both ends are already in the same component</>,
            <>Same component → <strong>it would make a cycle, skip it</strong></>,
            <>Different components → <strong>add it to the MST and Union them</strong></>,
            <>Stop once the MST has N−1 edges</>,
          ]}
        />
      </InfoSection>

      <InfoSection n={3} title={tr('Union-Find 핵심 연산', 'Union-Find operations')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard tone="current" title={tr('Find (경로 압축)', 'Find (path compression)')}>
            {tr(
              '노드의 루트를 찾는 연산. 경로 압축으로 이후 조회를 O(1)에 가깝게 최적화해요.',
              'Finds the root of a node. Path compression makes later lookups almost O(1).',
            )}
            <code className="block mt-2 text-xs bg-card/70 px-2 py-1 rounded-lg font-mono">parent[x] = find(parent[x])</code>
          </InfoCard>
          <InfoCard tone="visited" title={tr('Union (랭크 기반)', 'Union (by rank)')}>
            {tr(
              '두 집합을 합치는 연산. 랭크(트리 높이)가 낮은 쪽을 높은 쪽 아래에 붙여 트리를 얕게 유지해요.',
              'Merges two sets. The lower-rank (shorter) tree is attached under the taller one so trees stay shallow.',
            )}
            <code className="block mt-2 text-xs bg-card/70 px-2 py-1 rounded-lg font-mono">parent[ry] = rx</code>
          </InfoCard>
        </div>
      </InfoSection>

      <InfoSection n={4} title={tr('크루스칼 vs 프림', 'Kruskal vs Prim')}>
        <MstComparisonTable />
      </InfoSection>

      <InfoSection n={5} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(E log E)"
          space="O(V + E)"
          note={tr(
            '간선 정렬이 병목이에요 (Union-Find는 사실상 O(1)). 공간: parent/rank 배열 O(V), 간선 목록 O(E).',
            'Sorting the edges is the bottleneck (Union-Find is practically O(1)). Space: parent/rank arrays O(V), edge list O(E).',
          )}
        />
      </InfoSection>
    </InfoModal>
  );
}
