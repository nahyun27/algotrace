import { TrendingDown } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoCode, ComplexityChips } from '../../components/algorithm/InfoModal';
import { useLang, useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function BFInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  const { lang } = useLang();

  const rows: [string, string, string][] = [
    [tr('음수 간선', 'Negative edges'), tr('❌ 불가', '❌ No'), tr('✅ 가능', '✅ Yes')],
    [tr('음수 사이클 감지', 'Detects negative cycles'), tr('❌ 불가', '❌ No'), tr('✅ 가능', '✅ Yes')],
    [tr('시간복잡도', 'Time'), 'O((V+E) log V)', 'O(V·E)'],
    [tr('방식', 'Approach'), tr('그리디 (우선순위 큐)', 'Greedy (priority queue)'), tr('완전 반복 완화', 'Repeated relaxation of all edges')],
  ];

  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={TrendingDown}
      title={tr('벨만-포드 알고리즘', 'Bellman-Ford algorithm')}
      subtitle={tr('음수 간선이 있는 그래프의 단일 출발점 최단경로', 'Single-source shortest paths with negative edges')}
    >
      <InfoSection n={1} title={tr('왜 다익스트라가 음수 간선에서 실패할까?', 'Why does Dijkstra fail with negative edges?')}>
        <InfoCard tone="candidate">
          {lang === 'ko' ? (
            <>다익스트라는 <strong>그리디</strong>로 "지금까지 최소인 노드"를 확정합니다. 하지만 음수 간선이 있으면 나중에 더 좋은 경로가 생길 수 있어 이미 확정한 값이 틀릴 수 있습니다.</>
          ) : (
            <>Dijkstra <strong>greedily</strong> settles "the closest node so far". With negative edges a better path can show up later, so a value it already settled may be wrong.</>
          )}
        </InfoCard>
      </InfoSection>

      <InfoSection n={2} title={tr('핵심 아이디어', 'Key idea')}>
        {lang === 'ko' ? (
          <p>노드 V개의 그래프에서 최단경로는 최대 <strong>V-1개의 간선</strong>을 사용합니다. 따라서 모든 간선을 V-1번 반복 완화하면 모든 최단경로가 확정됩니다.</p>
        ) : (
          <p>In a graph with V nodes, a shortest path uses at most <strong>V-1 edges</strong>. So relaxing every edge V-1 times is enough to fix every shortest distance.</p>
        )}
        <InfoCode caption={tr('완화(Relaxation) 연산', 'Relaxation')}>
          {'for i in range(V - 1):\n    for u, v, w in edges:\n        if dist[u] + w < dist[v]:\n            dist[v] = dist[u] + w'}
        </InfoCode>
      </InfoSection>

      <InfoSection n={3} title={tr('다익스트라 vs 벨만-포드', 'Dijkstra vs Bellman-Ford')}>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-2 px-3 font-semibold text-muted-foreground">{tr('특징', 'Feature')}</th>
                <th className="py-2 px-3 font-bold">{tr('다익스트라', 'Dijkstra')}</th>
                <th className="py-2 px-3 font-bold text-primary">{tr('벨만-포드', 'Bellman-Ford')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(([feat, dij, bf]) => (
                <tr key={feat}>
                  <td className="py-2.5 px-3 font-medium">{feat}</td>
                  <td className="py-2.5 px-3">{dij}</td>
                  <td className="py-2.5 px-3">{bf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoSection>

      <InfoSection n={4} title={tr('음수 사이클 감지 원리', 'Detecting negative cycles')}>
        {lang === 'ko' ? (
          <p>V-1번 반복 후 V번째 라운드에서도 거리가 갱신된다면, 즉 <code className="font-mono bg-muted px-1 rounded">dist[u] + w &lt; dist[v]</code>가 성립한다면 음수 사이클이 존재합니다. 이 경우 최단경로가 <strong>-∞</strong>로 수렴하므로 정의되지 않습니다.</p>
        ) : (
          <p>If a distance still improves in round V — that is, <code className="font-mono bg-muted px-1 rounded">dist[u] + w &lt; dist[v]</code> still holds after V-1 rounds — a negative cycle exists. Distances would keep dropping toward <strong>-∞</strong>, so shortest paths are undefined.</p>
        )}
      </InfoSection>

      <InfoSection n={5} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(V·E)"
          space="O(V)"
          note={tr(
            '갱신이 없는 라운드가 나오면 조기 종료할 수 있어요.',
            'If a round makes no updates you can stop early.',
          )}
        />
      </InfoSection>
    </InfoModal>
  );
}
