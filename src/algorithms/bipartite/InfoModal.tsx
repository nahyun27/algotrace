import { Compass, Split, Triangle } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoCode, InfoSteps, ComplexityChips } from '../../components/algorithm/InfoModal';
import { useLang, useTr } from '../../i18n';

interface BipartiteInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function BipartiteInfoModal({ isOpen, onClose, onStartVisualization }: BipartiteInfoModalProps) {
  const tr = useTr();
  const { lang } = useLang();
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Split}
      title={tr('이분 그래프 판별', 'Bipartite check')}
      subtitle={tr('BFS로 두 가지 색 칠하기', 'Two-coloring with BFS')}
    >
      <InfoSection n={1} title={tr('문제 정의', 'The problem')}>
        {lang === 'ko' ? (
          <p>노드를 <strong>두 그룹(A, B)</strong>으로 나눠서 <strong>모든 간선이 서로 다른 그룹을 잇도록</strong> 할 수 있으면 그 그래프를 <strong>이분 그래프</strong>라고 해요. 같은 그룹 안에는 간선이 하나도 없어야 합니다.</p>
        ) : (
          <p>A graph is <strong>bipartite</strong> if its nodes can be split into <strong>two groups (A and B)</strong> so that <strong>every edge joins the two groups</strong>. No edge may stay inside one group.</p>
        )}
        <InfoCode caption={tr('BOJ 1707 예제', 'BOJ 1707 sample')}>
          {tr('노드 3개, 간선 1-3, 2-3 → YES (A={1,2}, B={3})\n', 'nodes 3, edges 1-3, 2-3 → YES (A={1,2}, B={3})\n')}
          {tr('노드 4개, 간선 1-2, 2-3, 3-4, 4-2 → NO (2-3-4 삼각형)', 'nodes 4, edges 1-2, 2-3, 3-4, 4-2 → NO (triangle 2-3-4)')}
        </InfoCode>
      </InfoSection>

      <InfoSection n={2} title={tr('핵심 아이디어', 'Key ideas')}>
        <InfoSteps
          steps={[
            tr('아직 색이 없는 노드를 하나 골라 그룹 A로 칠하고 BFS를 시작해요.', 'Pick an uncolored node, color it group A and start a BFS.'),
            tr('큐에서 노드 u를 꺼내 이웃 v를 하나씩 봅니다.', 'Dequeue a node u and look at each neighbor v.'),
            tr('v에 색이 없으면 u와 반대 색으로 칠하고 큐에 넣어요.', 'If v is uncolored, give it the opposite color and enqueue it.'),
            tr('v가 u와 같은 색이면 충돌 → 이분 그래프가 아니에요.', 'If v already has the same color as u, that is a conflict → not bipartite.'),
            tr('큐가 비면 아직 색이 없는 노드에서 다시 1번부터 (연결되지 않은 그래프 대비).', 'When the queue empties, repeat from step 1 for any uncolored node (the graph may be disconnected).'),
          ]}
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoCard tone="danger" title={<span className="inline-flex items-center gap-1.5"><Triangle className="w-4 h-4" />{tr('홀수 사이클', 'Odd cycles')}</span>}>
            {tr(
              '그래프가 이분 그래프가 아닐 필요충분조건은 길이가 홀수인 사이클이 있는 것이에요. 홀수 사이클을 따라 A, B를 번갈아 칠하면 마지막에 반드시 같은 색끼리 만나요.',
              'A graph is non-bipartite exactly when it contains a cycle of odd length: alternating A, B around an odd cycle always ends with two equal colors meeting.',
            )}
          </InfoCard>
          <InfoCard tone="current" title={<span className="inline-flex items-center gap-1.5"><Compass className="w-4 h-4" />{tr('연결 요소마다 BFS', 'One BFS per component')}</span>}>
            {tr(
              '시작 노드 하나에서만 BFS를 돌리면 다른 연결 요소를 놓쳐요. 모든 노드를 돌면서 색이 없으면 새 BFS를 시작해야 해요.',
              'A single BFS from one node misses the other components. Loop over all nodes and start a new BFS from each uncolored one.',
            )}
          </InfoCard>
        </div>
        <p className="text-muted-foreground text-[13px]">
          {tr(
            '화면에서 그룹 A는 보라색, 그룹 B는 초록색, 지금 꺼낸 노드는 파란 테두리, 검사 중인 간선은 주황색, 충돌한 간선과 양 끝 노드는 빨간색이에요.',
            'On screen, group A is violet, group B is green, the dequeued node has a blue ring, the edge being checked is amber, and a conflicting edge with both its ends is red.',
          )}
        </p>
      </InfoSection>

      <InfoSection n={3} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(V+E)"
          space="O(V)"
          note={tr(
            '모든 노드를 한 번씩 큐에 넣고, 인접 리스트의 모든 간선을 양쪽에서 한 번씩 확인해요. 색 배열과 큐가 O(V) 공간을 씁니다.',
            'Every node is enqueued once and every edge is checked once from each end of the adjacency list. The color array and queue take O(V) space.',
          )}
        />
      </InfoSection>
    </InfoModal>
  );
}
