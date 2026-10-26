import { Workflow } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoSteps, ComplexityChips } from '../../components/algorithm/InfoModal';
import MstComparisonTable from '../kruskal/MstComparisonTable';
import { useLang, useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

const codeCls = 'bg-card/70 px-1.5 py-0.5 rounded font-mono text-xs';

export default function PrimInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  const { lang } = useLang();
  const ko = lang === 'ko';
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Workflow}
      title={tr('프림 알고리즘', "Prim's algorithm")}
      subtitle={tr('우선순위 큐로 현재 트리에서 가장 가까운 노드를 반복 확장', 'Grow the tree by repeatedly adding the closest node from a priority queue')}
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

      <InfoSection n={2} title={tr('프림 핵심 아이디어', 'How Prim works')}>
        <InfoSteps
          steps={ko ? [
            <>임의의 시작 노드(0번)를 MST에 포함 — <code className={codeCls}>key[0] = 0</code></>,
            <>현재 MST와 연결된 모든 후보 간선을 <strong>우선순위 큐</strong>에 관리</>,
            <>큐에서 <strong>key가 가장 작은 노드</strong>를 꺼냄</>,
            <>이미 MST에 포함됐으면 스킵 (지연 삭제)</>,
            <>MST에 추가 후, 미방문 인접 노드의 key값 <strong>갱신</strong></>,
            <>N−1개 간선이 모이면 완성</>,
          ] : [
            <>Put any start node (node 0) into the MST — <code className={codeCls}>key[0] = 0</code></>,
            <>Keep every candidate edge touching the tree in a <strong>priority queue</strong></>,
            <>Pop the node with the <strong>smallest key</strong></>,
            <>If it's already in the MST, skip it (lazy deletion)</>,
            <>Add it to the MST, then <strong>update</strong> the keys of its neighbors not yet in the MST</>,
            <>Done once N−1 edges are collected</>,
          ]}
        />
      </InfoSection>

      <InfoSection n={3} title={tr('다익스트라와의 차이', 'How it differs from Dijkstra')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard tone="current" title={tr('다익스트라', 'Dijkstra')}>
            <code className={codeCls}>dist[v] = dist[u] + w</code>
            <p className="mt-1.5">
              {ko
                ? <>시작 노드에서의 <strong>누적 최단 거리</strong>를 최소화</>
                : <>Minimizes the <strong>total distance</strong> from the source</>}
            </p>
          </InfoCard>
          <InfoCard tone="visited" title={tr('프림', 'Prim')}>
            <code className={codeCls}>key[v] = w</code> {tr('(간선 가중치만)', '(edge weight only)')}
            <p className="mt-1.5">
              {ko
                ? <>현재 트리에 연결하는 <strong>간선 가중치</strong>를 최소화</>
                : <>Minimizes the <strong>weight of the edge</strong> that connects to the current tree</>}
            </p>
          </InfoCard>
        </div>
      </InfoSection>

      <InfoSection n={4} title={tr('크루스칼 vs 프림', 'Kruskal vs Prim')}>
        <MstComparisonTable />
      </InfoSection>

      <InfoSection n={5} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(E log V)"
          space="O(V + E)"
          note={tr(
            'heapq 연산이 병목이에요 (E번 push/pop). 공간: key/parent/in_mst 배열 O(V), 큐 O(E).',
            'Heap operations are the bottleneck (E pushes/pops). Space: key/parent/in_mst arrays O(V), queue O(E).',
          )}
        />
      </InfoSection>
    </InfoModal>
  );
}
