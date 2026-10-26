import type { ReactNode } from 'react';
import { Grid3x3 } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoCode, ComplexityChips, InfoMark } from '../../components/algorithm/InfoModal';
import { useLang, useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function FWInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  const { lang } = useLang();

  const rows: [string, ReactNode, ReactNode, ReactNode][] = [
    [tr('출발점', 'Source'), tr('단일 출발', 'Single source'), tr('단일 출발', 'Single source'), tr('모든 쌍', 'All pairs')],
    [tr('음수 간선', 'Negative edges'), <InfoMark ok={false}>{tr('불가', 'No')}</InfoMark>, <InfoMark ok>{tr('가능', 'Yes')}</InfoMark>, <InfoMark ok>{tr('가능', 'Yes')}</InfoMark>],
    [tr('음수 사이클', 'Negative cycles'), <InfoMark ok={false}>{tr('감지 불가', 'Not detected')}</InfoMark>, <InfoMark ok>{tr('감지 가능', 'Detected')}</InfoMark>, <InfoMark ok>{tr('감지 가능', 'Detected')}</InfoMark>],
    [tr('시간복잡도', 'Time'), 'O((V+E)logV)', 'O(V·E)', 'O(V³)'],
    [tr('공간복잡도', 'Space'), 'O(V)', 'O(V)', 'O(V²)'],
    [tr('구현 난이도', 'Difficulty'), tr('중', 'Medium'), tr('중', 'Medium'), tr('쉬움 (3중 반복문)', 'Easy (triple loop)')],
  ];

  const code = (s: string) => <code className="font-mono bg-muted px-1 rounded">{s}</code>;

  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Grid3x3}
      title={tr('플로이드-워셜 알고리즘', 'Floyd-Warshall algorithm')}
      subtitle={tr('동적 계획법으로 구하는 모든 노드 쌍의 최단거리', 'All-pairs shortest paths with dynamic programming')}
    >
      <InfoSection n={1} title={tr('문제 정의', 'The problem')}>
        <InfoCard tone="current">
          {lang === 'ko' ? (
            <><strong>모든 쌍 최단경로 (All-Pairs Shortest Path)</strong> 문제: 그래프의 <strong>모든 노드 쌍 (i, j)</strong>에 대해 i에서 j까지의 최단 거리를 한 번에 구합니다. 음수 간선도 처리 가능하며, 음수 사이클이 있으면 이를 감지합니다.</>
          ) : (
            <>The <strong>all-pairs shortest path</strong> problem: compute the shortest distance from i to j for <strong>every pair of nodes (i, j)</strong> in one go. Negative edges are fine, and negative cycles are detected.</>
          )}
        </InfoCard>
      </InfoSection>

      <InfoSection n={2} title={tr('핵심 아이디어: 경유 노드 DP', 'Key idea: DP over intermediate nodes')}>
        <p>{tr('"경유할 수 있는 노드 집합을 하나씩 늘려가며" 최단거리를 갱신합니다.', 'Grow the set of nodes a path may pass through, one node at a time, and update distances as you go.')}</p>
        <InfoCode>
          {'for k in 0..V:\n  for i in 0..V:\n    for j in 0..V:\n      dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])'}
        </InfoCode>
        <p className="text-muted-foreground text-[13px]">
          {tr(
            'k=0 라운드가 끝나면 "노드 0만 경유할 때의 최단거리", k=1이 끝나면 "노드 0과 1을 경유할 때의 최단거리"가 확정됩니다. V번 반복하면 모든 경유 노드를 고려한 최단거리가 완성됩니다.',
            'After round k=0 you have the shortest distances using only node 0 as an intermediate node; after k=1, using nodes 0 and 1. After V rounds, every node is allowed as an intermediate and the distances are final.',
          )}
        </p>
      </InfoSection>

      <InfoSection n={3} title={tr('다익스트라 vs 벨만-포드 vs 플로이드-워셜', 'Dijkstra vs Bellman-Ford vs Floyd-Warshall')}>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-2 px-3 font-semibold text-muted-foreground">{tr('특징', 'Feature')}</th>
                <th className="py-2 px-3 font-bold">{tr('다익스트라', 'Dijkstra')}</th>
                <th className="py-2 px-3 font-bold">{tr('벨만-포드', 'Bellman-Ford')}</th>
                <th className="py-2 px-3 font-bold text-primary">{tr('플로이드-워셜', 'Floyd-Warshall')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(([feat, dij, bf, fw]) => (
                <tr key={feat}>
                  <td className="py-2 px-3 font-medium">{feat}</td>
                  <td className="py-2 px-3">{dij}</td>
                  <td className="py-2 px-3">{bf}</td>
                  <td className="py-2 px-3 font-semibold text-primary">{fw}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoSection>

      <InfoSection n={4} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(V³)"
          space="O(V²)"
          note={tr('3중 for문과 V×V 행렬을 사용해요.', 'A triple loop over a V×V matrix.')}
        />
      </InfoSection>

      <InfoSection n={5} title={tr('음수 사이클 감지 원리', 'Detecting negative cycles')}>
        {lang === 'ko' ? (
          <p>정상적인 그래프에서 자기 자신으로의 최단거리는 항상 0입니다. 알고리즘 수행 후 {code('dist[i][i] < 0')}인 노드가 있다면, 그 노드를 포함하는 음수 사이클이 존재한다는 의미입니다.</p>
        ) : (
          <p>Normally the shortest distance from a node to itself is 0. If any node ends up with {code('dist[i][i] < 0')}, there is a negative cycle passing through it.</p>
        )}
      </InfoSection>

      <InfoSection n={6} title={tr('경로 추적 (Path Reconstruction)', 'Path reconstruction')}>
        {lang === 'ko' ? (
          <p>거리 행렬과 함께 {code('next[i][j]')} 배열을 관리합니다. dist[i][j]가 갱신될 때 {code('next[i][j] = next[i][k]')}로 업데이트합니다. 알고리즘 완료 후 next 배열을 따라가면 실제 경로를 복원할 수 있습니다.</p>
        ) : (
          <p>Keep a {code('next[i][j]')} matrix next to the distances. Whenever dist[i][j] improves, set {code('next[i][j] = next[i][k]')}. When the algorithm finishes, follow next to rebuild the actual path.</p>
        )}
      </InfoSection>
    </InfoModal>
  );
}
