import { ListOrdered, GraduationCap, Hammer, Package, CalendarDays, X } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, ComplexityChips } from '../../components/algorithm/InfoModal';
import { toneText } from '../../components/ui/tone';
import { useLang, useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function TopoInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  const { lang } = useLang();

  const examples = [
    { icon: GraduationCap, title: tr('수강신청 선수과목', 'Course prerequisites'), desc: tr('미적분 → 선형대수 → 알고리즘 순서로 이수해야 하는 커리큘럼', 'A curriculum where Calculus → Linear Algebra → Algorithms must be taken in order') },
    { icon: Hammer, title: tr('빌드 시스템 의존성', 'Build dependencies'), desc: tr('make, gradle 등에서 파일 A가 B에 의존할 때 B를 먼저 컴파일', 'In make, gradle, etc., if A depends on B, compile B first') },
    { icon: Package, title: tr('패키지 설치 순서', 'Package install order'), desc: tr('npm, pip 등에서 의존 패키지를 먼저 설치한 뒤 상위 패키지 설치', 'npm, pip, etc. install dependencies before the packages that need them') },
    { icon: CalendarDays, title: tr('프로젝트 일정 계획', 'Project scheduling'), desc: tr('선행 작업이 끝나야 다음 작업을 시작할 수 있는 태스크 순서 결정', 'Order tasks so each one starts only after its prerequisites are done') },
  ];

  const rows: [string, string, string][] = [
    [tr('핵심 자료구조', 'Core structure'), tr('큐 (Queue)', 'Queue'), tr('스택 (재귀 호출)', 'Stack (recursion)')],
    [tr('진행 방향', 'How it works'), tr('진입차수 0 노드부터 처리', 'Process nodes with in-degree 0 first'), tr('깊이 우선으로 후위 순서 push', 'Push nodes in DFS post-order')],
    [tr('사이클 감지', 'Cycle detection'), tr('결과 수 ≠ 전체 노드 수', 'Result size ≠ number of nodes'), tr('in_stack 배열로 back edge 탐지', 'Detect back edges with an in_stack array')],
    [tr('직관성', 'Intuition'), tr('단계가 명확해 이해하기 쉬움', 'Clear steps, easy to follow'), tr('재귀 구조 익숙하면 간결', 'Concise if you are comfortable with recursion')],
    [tr('시간복잡도', 'Time complexity'), 'O(V + E)', 'O(V + E)'],
  ];

  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={ListOrdered}
      title={tr('위상정렬 (Topological Sort)', 'Topological sort')}
      subtitle={tr('DAG에서 선행 관계를 만족하는 노드 순서 결정', 'Order the nodes of a DAG so every prerequisite comes first')}
    >
      <InfoSection n={1} title={tr('위상정렬이란?', 'What is it?')}>
        <InfoCard tone="path">
          {lang === 'ko' ? (
            <>방향 비순환 그래프(DAG)에서 각 노드를 <strong>선행 관계를 위반하지 않는 순서</strong>로 나열하는 것입니다. 즉, 간선 u → v가 있으면 정렬 결과에서 u는 반드시 v 앞에 위치해야 합니다.</>
          ) : (
            <>It lists the nodes of a directed acyclic graph (DAG) in an order that <strong>never breaks a prerequisite</strong>: whenever there is an edge u → v, u must come before v in the result.</>
          )}
        </InfoCard>
      </InfoSection>

      <InfoSection n={2} title={tr('실생활 예시', 'Real-world examples')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {examples.map(item => (
            <InfoCard key={item.title} icon={item.icon} title={item.title}>
              {item.desc}
            </InfoCard>
          ))}
        </div>
      </InfoSection>

      <InfoSection n={3} title={tr('칸의 알고리즘 vs DFS 방식', "Kahn's algorithm vs DFS")}>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="py-2 px-3 font-semibold text-muted-foreground">{tr('특징', 'Aspect')}</th>
                <th className={`py-2 px-3 font-bold ${toneText.current}`}>{tr('칸의 알고리즘 (BFS)', "Kahn's algorithm (BFS)")}</th>
                <th className={`py-2 px-3 font-bold ${toneText.visited}`}>{tr('DFS 방식', 'DFS-based')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(([feat, kahn, dfs], i) => (
                <tr key={i}>
                  <td className="py-2.5 px-3 font-semibold">{feat}</td>
                  <td className="py-2.5 px-3">{kahn}</td>
                  <td className="py-2.5 px-3">{dfs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoSection>

      <InfoSection n={4} title={tr('사이클이 있으면 위상정렬이 불가능한 이유', 'Why cycles make it impossible')}>
        {lang === 'ko' ? (
          <p>A → B → C → A 처럼 순환이 존재하면, A를 출력하려면 C가 앞에 와야 하고, C를 출력하려면 B가, B를 출력하려면 A가 먼저 와야 합니다. 이 모순을 해결할 순서가 없으므로 <strong>위상정렬이 정의되지 않습니다.</strong> 이 때문에 위상정렬의 입력은 반드시 <strong>방향 비순환 그래프(DAG)</strong>여야 합니다.</p>
        ) : (
          <p>With a cycle like A → B → C → A, A needs C before it, C needs B, and B needs A. No order can satisfy all of that, so <strong>a topological order does not exist.</strong> That is why the input must be a <strong>directed acyclic graph (DAG)</strong>.</p>
        )}
        <InfoCard tone="danger">
          <span className="font-mono">A → B → C → A</span>
          {tr(' (사이클', ' (cycle')}
          <X className="w-3.5 h-3.5 inline align-[-2px] mx-0.5" aria-hidden />
          {tr('위상정렬 불가)', 'no topological order)')}
        </InfoCard>
      </InfoSection>

      <InfoSection n={5} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(V + E)"
          space="O(V + E)"
          note={tr(
            '모든 노드와 간선을 한 번씩 처리해요. 공간은 인접 리스트, 큐/스택, in_degree 배열에 쓰입니다.',
            'Every node and edge is handled once. Space goes to the adjacency list, the queue/stack and the in_degree array.',
          )}
        />
      </InfoSection>
    </InfoModal>
  );
}
