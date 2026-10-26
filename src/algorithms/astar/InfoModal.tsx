import { Map as MapIcon } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, ComplexityChips } from '../../components/algorithm/InfoModal';
import { cn } from '../../components/ui';
import { toneBorder, toneText } from '../../components/ui/tone';
import { useLang, useTr } from '../../i18n';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function AStarInfoModal({ isOpen, onClose, onStartVisualization }: InfoModalProps) {
  const tr = useTr();
  const { lang } = useLang();

  const terms = [
    { key: 'g(x)', desc: tr('출발점에서 노드까지의 실제 누적 비용', 'Actual cost accumulated from the start to the node') },
    { key: 'h(x)', desc: tr('노드에서 목표점까지의 예상(휴리스틱) 비용', 'Estimated (heuristic) cost from the node to the goal') },
    { key: 'f(x) = g(x) + h(x)', desc: tr('최단 경로를 찾기 위해 우선순위 큐에 담는 기준 값', 'The key that orders the priority queue during the search'), main: true },
  ];

  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={MapIcon}
      title={tr('A* (A-Star) 알고리즘', 'A* (A-star) search')}
      subtitle={tr('휴리스틱을 이용한 최단 경로 탐색', 'Shortest-path search guided by a heuristic')}
    >
      <InfoSection n={1} title={tr('문제 정의', 'The problem')}>
        {lang === 'ko' ? (
          <p>다익스트라 알고리즘에 <strong>목표 지점까지의 예상 거리(휴리스틱)</strong> 개념을 추가한 경로 탐색 알고리즘입니다. 목적지를 향해 똑똑하게 탐색 범위를 줄여 효율성을 극대화합니다.</p>
        ) : (
          <p>A* extends Dijkstra's algorithm with an <strong>estimate of the remaining distance to the goal (a heuristic)</strong>. It steers the search toward the destination and explores far fewer nodes.</p>
        )}
        <div className="flex flex-col gap-2">
          {terms.map(t => (
            <div
              key={t.key}
              className={cn(
                'flex items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2.5',
                t.main ? toneBorder.path : 'border-border',
              )}
            >
              <span className={cn('font-mono font-bold text-xs shrink-0', t.main ? toneText.path : 'text-foreground')}>{t.key}</span>
              <span className="text-xs text-muted-foreground text-right">{t.desc}</span>
            </div>
          ))}
        </div>
      </InfoSection>

      <InfoSection n={2} title={tr('핵심 아이디어', 'Key ideas')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoCard tone="current" title={tr('🧭 목적지 지향적', '🧭 Goal-directed')}>
            {tr(
              '다익스트라는 원형으로 퍼져나가며 모든 방향을 탐색하지만, A*는 목적지 방향으로 나아가도록 휴리스틱이 유도합니다.',
              'Dijkstra spreads out in a circle in every direction, while A* uses the heuristic to push the search toward the goal.',
            )}
          </InfoCard>
          <InfoCard tone="path" title={tr('⭐ 허용성 (Admissibility)', '⭐ Admissibility')}>
            {tr(
              '최단 경로를 보장하기 위한 조건입니다. h(x)가 실제 남은 거리보다 과대평가되지 않아야만 완벽한 답을 찾아냅니다.',
              'The condition that guarantees a shortest path: h(x) must never overestimate the real remaining distance.',
            )}
          </InfoCard>
        </div>
      </InfoSection>

      <InfoSection n={3} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O((V+E) log V)"
          space="O(V)"
          note={lang === 'ko' ? (
            <>💡 <strong>완벽한 휴리스틱 (h(x) = 실제거리)</strong> 을 안다면 최단 경로 위의 노드만 꺼내며 곧바로 목표에 도달합니다. 최악의 경우(h = 0)는 다익스트라와 같습니다.</>
          ) : (
            <>💡 With a <strong>perfect heuristic (h(x) = true distance)</strong>, A* only expands nodes on the shortest path and heads straight to the goal. In the worst case (h = 0) it is the same as Dijkstra.</>
          )}
        />
      </InfoSection>
    </InfoModal>
  );
}
