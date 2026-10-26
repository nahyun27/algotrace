import { Split, Shirt } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import MiniGraph, { type MiniEdge, type MiniNode } from '../../components/viz/MiniGraph';
import type { VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';

interface BipartiteInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

/** A four-point loop (even, so it splits fine); the last frame adds the line A, C to make an odd loop */
const SQUARE: MiniEdge[] = [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']];
const WITH_DIAGONAL: MiniEdge[] = [...SQUARE, ['A', 'C']];
const POS: Record<string, [number, number]> = { A: [130, 40], B: [230, 40], C: [320, 175], D: [40, 175] };

/** Team 1 is violet and team 2 is green, the same colors as the main page */
const T1: VizState = 'path';
const T2: VizState = 'visited';

export default function BipartiteInfoModal({ isOpen, onClose, onStartVisualization }: BipartiteInfoModalProps) {
  const tr = useTr();
  const teamName = { [T1]: tr('1팀', 'team 1'), [T2]: tr('2팀', 'team 2'), danger: tr('충돌', 'clash') } as Record<VizState, string>;

  const frame = (nodeState: Record<string, VizState>, edgeState: Record<string, VizState> = {}, edges: MiniEdge[] = SQUARE) => {
    const nodes: MiniNode[] = Object.entries(POS).map(([id, [x, y]]) => ({ id, x, y, label: id, note: nodeState[id] ? teamName[nodeState[id]] : undefined }));
    return <MiniGraph nodes={nodes} edges={edges} nodeState={nodeState} edgeState={edgeState} height={220} />;
  };

  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Split}
      title={tr('이분 그래프 판별', 'Bipartite check')}
      subtitle={tr('모든 선이 두 팀 사이만 잇도록 나눌 수 있을까?', 'Can every line run between two teams?')}
      summary={tr(
        '선으로 이어진 두 점은 항상 다른 팀이 되도록 두 가지 색으로 번갈아 칠해 보고, 같은 색끼리 이어진 선이 하나도 없으면 이분 그래프예요.',
        'Paint the points in two colors so every line joins different colors. If no line ends up joining two of the same color, the graph is bipartite.',
      )}
      analogy={{
        icon: Shirt,
        title: tr('라이벌끼리는 다른 팀으로 나누기', 'Splitting rivals into two teams'),
        body: tr(
          '체육대회에서 반을 두 팀으로 나누는데, 서로 라이벌인 두 사람(선으로 이어진 두 점)은 꼭 다른 팀이어야 해요. 한 명을 1팀에 넣으면 그 라이벌은 2팀, 그 라이벌의 라이벌은 다시 1팀으로 정해져요. 이렇게 하다가 같은 팀에 라이벌이 생기면 나눌 수 없는 거예요.',
          'Split a class into two teams for sports day, but two rivals (two points joined by a line) must be on different teams. Put one person on team 1, their rivals go to team 2, the rivals of those go back to team 1, and so on. If two rivals ever land on the same team, it cannot be done.',
        ),
      }}
      storyboard={[
        {
          visual: frame({ A: T1 }),
          caption: tr(
            '아무 점이나 골라요. A를 1팀(보라색)으로 칠해요.',
            'Pick any point. Paint A as team 1 (violet).',
          ),
        },
        {
          visual: frame({ A: T1, B: T2, D: T2 }, { 'A-B': 'candidate', 'D-A': 'candidate' }),
          caption: tr(
            'A와 선으로 이어진 B와 D는 A와 다른 팀이어야 해요. 그래서 2팀(초록색)으로 칠해요.',
            'B and D are joined to A, so they must be on the other team. Paint them team 2 (green).',
          ),
        },
        {
          visual: frame({ A: T1, B: T2, D: T2, C: T1 }, { 'B-C': 'candidate' }),
          caption: tr(
            'B와 이어진 C는 B(2팀)의 반대인 1팀으로 칠해요.',
            'C is joined to B (team 2), so C gets the opposite: team 1.',
          ),
        },
        {
          visual: frame({ A: T1, B: T2, D: T2, C: T1 }, { 'A-B': 'visited', 'B-C': 'visited', 'C-D': 'visited', 'D-A': 'visited' }),
          caption: tr(
            '마지막 선 C, D도 1팀과 2팀을 이어요. 모든 선이 서로 다른 팀을 잇으니 이분 그래프가 맞아요!',
            'The last line, C and D, also joins team 1 to team 2. Every line connects different teams, so the graph is bipartite.',
          ),
        },
        {
          visual: frame({ A: 'danger', B: T2, D: T2, C: 'danger' }, { 'A-C': 'danger' }, WITH_DIAGONAL),
          caption: tr(
            '만약 A와 C 사이에 선이 하나 더 있다면? 둘 다 1팀이라 충돌이에요. A, B, C가 점 3개짜리(홀수) 고리를 이뤄서 어떻게 칠해도 나눌 수 없어요.',
            'What if there were also a line between A and C? Both are team 1: a clash. A, B and C form a loop of 3 (an odd number), so no coloring can work.',
          ),
        },
      ]}
      steps={[
        tr('아직 색이 없는 점 하나를 1팀으로 칠하고, BFS(가까운 점부터 차례로 둘러보기)를 시작해요.', 'Paint an uncolored point team 1 and start a BFS (visiting nearby points first, in order).'),
        tr('꺼낸 점의 이웃을 하나씩 봐요. 색이 없으면 반대 팀으로 칠하고 큐(대기 줄)에 넣어요.', 'Look at each neighbor of the point you took out. If it has no color, paint it the other team and add it to the queue (a waiting line).'),
        tr('이웃이 이미 나와 같은 팀 색이면 충돌이에요. 이분 그래프가 아니라고 답해요.', 'If a neighbor already has your color, that is a clash. Answer "not bipartite".'),
        tr('큐가 비었는데 색 없는 점이 남아 있으면(따로 떨어진 무리) 1번부터 다시 해요.', 'If the queue is empty but some points are still uncolored (a separate group), go back to step 1.'),
      ]}
      useWhen={[
        tr('사람과 일, 학생과 동아리처럼 "두 종류 사이에만 관계가 있는지" 확인할 때', 'Checking whether connections only run between two kinds of things, like people and jobs or students and clubs'),
        tr('그래프에 홀수 길이의 고리(사이클)가 있는지 알고 싶을 때', 'You want to know whether the graph has a loop (cycle) of odd length'),
      ]}
      watchOut={[
        tr('그래프가 여러 무리로 떨어져 있을 수 있어요. 무리마다 새로 칠하기를 시작해야 해요.', 'The graph may be in several separate pieces. Start a new coloring in each piece.'),
        tr('짝수 개짜리 고리(사각형)는 괜찮지만, 홀수 개짜리 고리(삼각형)가 하나라도 있으면 불가능해요.', 'Loops with an even number of points (squares) are fine, but a single odd loop (a triangle) makes it impossible.'),
      ]}
      complexity={{
        time: 'O(V+E)',
        space: 'O(V)',
        plain: tr(
          '모든 점(V)을 한 번 칠하고 모든 선(E)을 한 번씩 확인해요. 그래프가 2배가 되면 시간도 2배 정도라서, 점이 수십만 개여도 금방 끝나요.',
          'Each point (V) is painted once and each line (E) checked once. Double the graph and it takes about twice as long, so even hundreds of thousands of points finish quickly.',
        ),
      }}
    />
  );
}
