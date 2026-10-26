import { Waypoints, CircleDot, Zap, AlertTriangle } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoCode, ComplexityChips } from '../../components/algorithm/InfoModal';
import { cn } from '../../components/ui';
import { toneText } from '../../components/ui/tone';
import { useLang, useTr } from '../../i18n';

interface DijkstraInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function DijkstraInfoModal({ isOpen, onClose, onStartVisualization }: DijkstraInfoModalProps) {
  const tr = useTr();
  const { lang } = useLang();
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Waypoints}
      title={tr('다익스트라 알고리즘', "Dijkstra's algorithm")}
      subtitle={tr('단일 출발점 최단 경로 (SSSP)', 'Single-source shortest paths (SSSP)')}
    >
      <InfoSection n={1} title={tr('문제 정의', 'The problem')}>
        {lang === 'ko' ? (
          <p>가중치가 <strong>음수가 아닌</strong> 그래프에서 <strong>하나의 출발 노드</strong>로부터 다른 모든 노드까지의 <strong>최단 거리</strong>를 구합니다.</p>
        ) : (
          <p>In a graph whose edge weights are <strong>non-negative</strong>, find the <strong>shortest distance</strong> from <strong>one source node</strong> to every other node.</p>
        )}
        <InfoCode caption={tr('예시 그래프: 노드 5개 (0~4), 출발: 노드 0', 'Example: 5 nodes (0..4), source: node 0')}>
          {'0→1(10), 0→2(3), 2→1(4), 2→4(2)\n1→3(2), 2→3(8), 4→3(1), 3→4(5)\n\n'}
          {tr('최단 거리: ', 'Shortest: ')}0→0=0, 0→1=7, 0→2=3, 0→3=6, 0→4=5
        </InfoCode>
      </InfoSection>

      <InfoSection n={2} title={tr('핵심 아이디어', 'Key ideas')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoCard tone="visited" icon={CircleDot} title={tr('탐욕 선택 (Greedy)', 'Greedy choice')}>
            {tr(
              '매 단계에서 현재 dist가 가장 작은 미방문 노드를 고릅니다. 음수 간선이 없으면 이 선택이 항상 최적이에요.',
              'At every step, pick the unsettled node with the smallest dist. Without negative edges this choice is always optimal.',
            )}
          </InfoCard>
          <InfoCard tone="current" icon={Zap} title={tr('우선순위 큐', 'Priority queue')}>
            {tr(
              'min-heap으로 다음 노드를 O(log V)에 꺼내 전체를 O((V+E) log V)로 줄입니다.',
              'A min-heap pops the next node in O(log V), bringing the total down to O((V+E) log V).',
            )}
          </InfoCard>
        </div>
        <InfoCode caption={tr('완화(Relaxation) 연산', 'Relaxation')}>
          {'if dist[u] + w(u,v) < dist[v]:\n    dist[v] = dist[u] + w(u,v)'}
        </InfoCode>
        <p className="text-muted-foreground text-[13px]">
          {tr('u를 거쳐 v로 가는 편이 더 짧으면 dist[v]를 갱신합니다.', 'If going through u is cheaper, update dist[v].')}
        </p>
      </InfoSection>

      <InfoSection n={3} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O((V+E) log V)"
          space="O(V)"
          note={<>
            <AlertTriangle className={cn('w-3.5 h-3.5 inline align-[-2px] mr-1', toneText.danger)} aria-hidden />
            {tr(
              '음수 가중치가 있는 그래프에는 쓸 수 없어요. 그럴 땐 벨만-포드를 사용하세요.',
              'Not valid with negative weights. Use Bellman-Ford instead.',
            )}
          </>}
        />
      </InfoSection>
    </InfoModal>
  );
}
