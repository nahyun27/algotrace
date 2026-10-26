import { Grid3x3 } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoCode, ComplexityChips } from '../../components/algorithm/InfoModal';
import { useLang, useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function GridAStarInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  const { lang } = useLang();
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Grid3x3}
      title={tr('A* (격자 기반)', 'A* on a grid')}
      subtitle={tr('맨해튼 휴리스틱으로 격자에서 최단 경로 탐색', 'Shortest paths on a grid with the Manhattan heuristic')}
    >
      <InfoSection n={1} title={tr('A* 핵심 공식', 'The A* formula')}>
        <InfoCode>{'f(n) = g(n) + h(n)'}</InfoCode>
        {lang === 'ko' ? (
          <ul className="space-y-1 text-[13px]">
            <li><strong>g(n)</strong> — 시작점에서 n까지 실제 비용</li>
            <li><strong>h(n)</strong> — n에서 목표까지 예상 비용 (휴리스틱)</li>
            <li><strong>f(n)</strong> — 총 추정 비용 (최소 f를 가진 셀을 우선 탐색)</li>
          </ul>
        ) : (
          <ul className="space-y-1 text-[13px]">
            <li><strong>g(n)</strong> — actual cost from the start to n</li>
            <li><strong>h(n)</strong> — estimated cost from n to the goal (heuristic)</li>
            <li><strong>f(n)</strong> — total estimate; the cell with the smallest f is explored first</li>
          </ul>
        )}
      </InfoSection>

      <InfoSection n={2} title={tr('맨해튼 거리 (Manhattan)', 'Manhattan distance')}>
        <InfoCode>{'h(r, c) = |r − goal.r| + |c − goal.c|'}</InfoCode>
        {lang === 'ko' ? (
          <p>격자에서 대각선 이동 없이 상하좌우만 가능할 때, <strong>이동 칸 수의 최솟값</strong>입니다. 실제 거리보다 절대 크지 않으므로 (admissible) A*가 최단 경로를 보장합니다.</p>
        ) : (
          <p>When you can only move up, down, left and right, this is the <strong>minimum number of moves</strong> to the goal. It never exceeds the real distance (it is admissible), so A* is guaranteed to find a shortest path.</p>
        )}
      </InfoSection>

      <InfoSection n={3} title={tr('다익스트라와의 차이', 'Compared with Dijkstra')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard tone="neutral" title={tr('다익스트라', 'Dijkstra')}>
            {tr('h = 0 → 모든 방향으로 균등 확산. 셀을 골고루 많이 탐색.', 'h = 0 → spreads evenly in every direction and explores many cells.')}
          </InfoCard>
          <InfoCard tone="current" title="A* (Manhattan)">
            {tr('h > 0 → 목표 방향으로 집중 탐색. 같은 결과를 더 적은 셀로.', 'h > 0 → focuses on the goal direction. Same result with fewer cells.')}
          </InfoCard>
        </div>
      </InfoSection>

      <InfoSection n={4} title={tr('Admissible 조건', 'Admissibility')}>
        {lang === 'ko' ? (
          <p>h(n) ≤ 실제 남은 거리 — 즉 휴리스틱이 <strong>실제 비용을 과대평가하지 않아야</strong> 최적해 보장. 상하좌우로만 움직이는 격자에서 맨해튼 거리는 항상 이를 만족합니다 (벽이 없을 때의 최단 거리이므로).</p>
        ) : (
          <p>h(n) ≤ true remaining distance — the heuristic must <strong>never overestimate the real cost</strong> for the answer to be optimal. Manhattan distance always satisfies this (without diagonals it is the true shortest distance on an empty grid).</p>
        )}
      </InfoSection>

      <InfoSection n={5} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(b^d)"
          space="O(b^d)"
          note={tr(
            '최악 O(b^d) (b=분기, d=깊이). 격자에서는 보통 다익스트라보다 훨씬 적은 셀만 탐색합니다.',
            'Worst case O(b^d) (b = branching factor, d = depth). On grids it usually explores far fewer cells than Dijkstra.',
          )}
        />
      </InfoSection>
    </InfoModal>
  );
}
