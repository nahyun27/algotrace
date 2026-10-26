import { Network, Lightbulb } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, ComplexityChips } from '../../components/algorithm/InfoModal';
import { cn } from '../../components/ui';
import { toneText } from '../../components/ui/tone';
import { useLang, useTr } from '../../i18n';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'BFS' | 'DFS';
  onStartVisualization?: () => void;
}

export default function BFSDFSInfoModal({ isOpen, onClose, mode, onStartVisualization }: InfoModalProps) {
  const tr = useTr();
  const { lang } = useLang();

  const rows: [string, string, string][] = [
    [tr('자료구조', 'Data structure'), tr('큐 (Queue)', 'Queue'), tr('스택 (Stack) 또는 재귀', 'Stack or recursion')],
    [tr('방문 순서', 'Visit order'), tr('시작점부터 거리가 가까운 순', 'Closest to the start first'), tr('한 갈래를 끝까지 탐색 후 되돌아옴', 'Follow one branch to the end, then backtrack')],
    [tr('주요 용도', 'Typical uses'), tr('가중치 없는 최단 경로, 영역 넓이', 'Unweighted shortest paths, region size'), tr('경로 특징 저장, 사이클 판별, 백트래킹', 'Path properties, cycle detection, backtracking')],
    [tr('단점', 'Drawbacks'), tr('노드가 많을수록 메모리(큐) 소모 큼', 'The queue can use a lot of memory on wide graphs'), tr('최단 경로가 아닐 수 있음, 무한 루프 위험', 'Not necessarily the shortest path; risk of infinite loops')],
  ];

  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Network}
      title={mode === 'BFS' ? tr('너비 우선 탐색 (BFS)', 'Breadth-first search (BFS)') : tr('깊이 우선 탐색 (DFS)', 'Depth-first search (DFS)')}
      subtitle={mode === 'BFS'
        ? tr('가까운 노드부터 차례대로 탐색', 'Explore the nearest nodes first, level by level')
        : tr('한 방향으로 갈 수 있을 때까지 깊게 탐색', 'Go as deep as possible in one direction before backtracking')}
    >
      <InfoSection n={1} title={tr('핵심 차이점', 'Key differences')}>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="py-2 px-3 font-semibold text-muted-foreground">{tr('특징', 'Aspect')}</th>
                <th className={`py-2 px-3 font-bold ${toneText.current}`}>BFS</th>
                <th className={`py-2 px-3 font-bold ${toneText.visited}`}>DFS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(([feat, bfs, dfs], i) => (
                <tr key={i}>
                  <td className="py-2.5 px-3 font-semibold">{feat}</td>
                  <td className={`py-2.5 px-3 ${i === 0 ? `font-bold ${toneText.current}` : ''}`}>{bfs}</td>
                  <td className={`py-2.5 px-3 ${i === 0 ? `font-bold ${toneText.visited}` : ''}`}>{dfs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoSection>

      <InfoSection n={2} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(V + E)"
          space="O(V)"
          note={tr(
            '인접 리스트 기준으로 모든 노드(V)와 간선(E)을 한 번씩 확인해요. 최악의 경우 큐/스택에 모든 노드가 들어가므로 공간은 O(V)입니다.',
            'With an adjacency list every node (V) and edge (E) is checked once. In the worst case every node sits in the queue/stack, so space is O(V).',
          )}
        />
      </InfoSection>

      <InfoSection n={3} title={tr('팁', 'Tip')}>
        <InfoCard tone="current">
          <Lightbulb className={cn('w-3.5 h-3.5 inline align-[-2px] mr-1', toneText.current)} aria-hidden />
          {lang === 'ko' ? (
            <>BFS와 DFS는 모두 모든 노드를 탐색하는 완전 탐색 기법입니다. 문제에 "최단 경로"라는 말이 있다면 대체로 <strong>BFS</strong>를, "모든 경로를 탐색하여 특정 조건 만족 여부 파악"이라면 재귀를 활용한 <strong>DFS(백트래킹)</strong>가 유리한 경우가 많습니다.</>
          ) : (
            <>BFS and DFS both visit every reachable node. If a problem asks for the "shortest path", <strong>BFS</strong> is usually the right tool; if it asks you to explore every path and check a condition, recursive <strong>DFS (backtracking)</strong> is often the better fit.</>
          )}
        </InfoCard>
      </InfoSection>
    </InfoModal>
  );
}
