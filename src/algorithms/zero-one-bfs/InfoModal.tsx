import { ArrowLeftToLine, ArrowRightToLine, BrickWall } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoCode, ComplexityChips } from '../../components/algorithm/InfoModal';
import { useLang, useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function ZeroOneBFSInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  const { lang } = useLang();
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={BrickWall}
      title="0-1 BFS"
      subtitle={tr('가중치가 0과 1뿐인 그래프의 최단 경로', 'Shortest paths when every edge weighs 0 or 1')}
    >
      <InfoSection n={1} title={tr('문제 정의', 'The problem')}>
        {lang === 'ko' ? (
          <p>N×M 미로의 왼쪽 위에서 오른쪽 아래로 가요. <strong>빈 칸으로 가는 비용은 0</strong>, <strong>벽을 부수고 들어가는 비용은 1</strong>입니다. 부숴야 하는 <strong>벽의 최소 개수</strong>를 구합니다 (백준 1261 알고스팟).</p>
        ) : (
          <p>Walk from the top-left to the bottom-right of an N×M maze. <strong>Stepping into an empty cell costs 0</strong>, <strong>breaking into a wall costs 1</strong>. Find the <strong>minimum number of walls</strong> to break (BOJ 1261).</p>
        )}
        <InfoCode caption={tr('백준 1261 예제 1 (3×3, 1 = 벽)', 'BOJ 1261 sample 1 (3×3, 1 = wall)')}>
          {'011\n111\n110\n\n'}
          {tr('답: 3', 'Answer: 3')}
        </InfoCode>
      </InfoSection>

      <InfoSection n={2} title={tr('핵심 아이디어', 'Key ideas')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoCard tone="current" title={<span className="inline-flex items-center gap-1.5"><ArrowLeftToLine className="w-4 h-4" />{tr('0 비용 → 덱 앞', '0-cost → front')}</span>}>
            {tr(
              '거리가 늘지 않는 이웃은 지금 칸과 같은 거리라서 덱 앞에 넣어 바로 다음에 꺼냅니다.',
              'A neighbour reached at no extra cost has the same distance, so it goes to the front and is popped next.',
            )}
          </InfoCard>
          <InfoCard tone="candidate" title={<span className="inline-flex items-center gap-1.5"><ArrowRightToLine className="w-4 h-4" />{tr('1 비용 → 덱 뒤', '1-cost → back')}</span>}>
            {tr(
              '거리가 1 늘어나는 이웃은 덱 뒤에 넣어요. 덱 안의 거리는 늘 d와 d+1 두 값뿐이에요.',
              'A neighbour one step farther goes to the back. The deque only ever holds two distances: d and d+1.',
            )}
          </InfoCard>
        </div>
        {lang === 'ko' ? (
          <p className="text-muted-foreground text-[13px]">덱 앞이 항상 가장 가까운 칸이므로 우선순위 큐 없이도 <strong className="text-foreground">다익스트라와 같은 순서</strong>로 칸을 확정해요. 힙 연산이 없어 log가 사라집니다.</p>
        ) : (
          <p className="text-muted-foreground text-[13px]">The front is always the closest cell, so cells are settled in <strong className="text-foreground">the same order as Dijkstra</strong> without a priority queue. No heap means no log factor.</p>
        )}
        <InfoCode caption={tr('덱에 넣는 규칙', 'Push rule')}>
          {'if dist[u] + w < dist[v]:\n    dist[v] = dist[u] + w\n    dq.appendleft(v) if w == 0 else dq.append(v)'}
        </InfoCode>
      </InfoSection>

      <InfoSection n={3} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(V+E)"
          space="O(V)"
          note={tr(
            '격자에서는 V = N·M, E ≤ 4·N·M이에요. 가중치가 0/1이 아니면 다익스트라를 쓰세요.',
            'On a grid V = N·M and E ≤ 4·N·M. For weights other than 0/1, use Dijkstra.',
          )}
        />
      </InfoSection>
    </InfoModal>
  );
}
