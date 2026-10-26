import { GitMerge, Users } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import MiniGraph, { type MiniEdge, type MiniNode } from '../../components/viz/MiniGraph';
import type { VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';

interface LCAInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

/** Root 1. Query LCA(6, 7): 6 sits at depth 4, 7 at depth 2, the answer is 2. */
const EDGES: MiniEdge[] = [[1, 2], [1, 3], [2, 4], [2, 7], [3, 8], [4, 5], [5, 6]];
const POS: Record<number, [number, number]> = {
  1: [210, 22], 2: [140, 80], 3: [290, 80], 4: [95, 138], 7: [190, 138], 8: [290, 138], 5: [60, 196], 6: [30, 254],
};

function tree(notes: Record<number, string>, nodeState: Record<number, VizState>, edgeState: Record<string, VizState> = {}) {
  const nodes: MiniNode[] = Object.entries(POS).map(([id, [x, y]]) => ({ id: Number(id), x, y, label: id, note: notes[Number(id)] }));
  return <MiniGraph nodes={nodes} edges={EDGES} nodeState={nodeState} edgeState={edgeState} height={280} radius={18} />;
}

export default function LCAInfoModal({ isOpen, onClose, onStartVisualization }: LCAInfoModalProps) {
  const tr = useTr();
  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={GitMerge}
      title={tr('최소 공통 조상 (LCA)', 'Lowest common ancestor (LCA)')}
      subtitle={tr('트리에서 두 점의 가장 가까운 공통 윗사람 찾기', 'The nearest shared ancestor of two nodes in a tree')}
      summary={tr(
        '두 점의 높이를 먼저 맞춘 뒤 함께 위로 올라가다 처음 만나는 점이 답이에요. 한 칸씩이 아니라 1, 2, 4, 8칸씩 점프해서 아주 빨라요.',
        'Bring the two nodes to the same height, then climb together until they meet. Jumping 1, 2, 4, 8 levels at a time instead of one makes it very fast.',
      )}
      analogy={{
        icon: Users,
        title: tr('족보에서 두 사촌의 가장 가까운 조상 찾기', 'Finding two cousins’ nearest common ancestor'),
        body: tr(
          '가계도에서 두 사람의 가장 가까운 공통 조상을 찾을 때, 먼저 세대를 맞추고 둘이 같은 사람에 닿을 때까지 함께 거슬러 올라가요. 이때 "할아버지", "할아버지의 할아버지"를 미리 메모해 두면 한 세대씩 오르지 않고 여러 세대를 한 번에 건너뛸 수 있어요.',
          'To find two people’s nearest common ancestor in a family tree, first line up their generations, then climb back together until you reach the same person. If you have noted down each person’s grandparent, great-great-grandparent and so on, you can skip several generations in one go.',
        ),
      }}
      storyboard={[
        {
          visual: tree({ 6: tr('깊이 4', 'depth 4'), 7: tr('깊이 2', 'depth 2') }, { 6: 'current', 7: 'current' }),
          caption: tr(
            '6과 7의 가장 가까운 공통 조상(둘 다의 윗사람 중 가장 아래 있는 점)을 찾아요. 6은 뿌리 1에서 4칸 아래, 7은 2칸 아래에 있어요.',
            'Find the nearest common ancestor of 6 and 7 (the lowest node above both). 6 is 4 levels below the root 1, and 7 is 2 levels below.',
          ),
        },
        {
          visual: tree({ 5: tr('1칸 위', '1 up'), 4: tr('2칸 위', '2 up'), 1: tr('4칸 위', '4 up') }, { 6: 'current', 5: 'candidate', 4: 'candidate', 1: 'candidate' }),
          caption: tr(
            '준비 단계: 모든 점마다 1칸, 2칸, 4칸, 8칸 위의 조상을 표에 미리 적어 둬요. 6이라면 1칸 위는 5, 2칸 위는 4, 4칸 위는 1이에요.',
            'Preparation: for every node, write down its ancestor 1, 2, 4, 8 levels up in a table. For 6: 1 up is 5, 2 up is 4, 4 up is 1.',
          ),
        },
        {
          visual: tree({ 4: 'u', 7: 'v' }, { 6: 'visited', 5: 'visited', 4: 'current', 7: 'current' }, { '5-6': 'visited', '4-5': 'visited' }),
          caption: tr(
            '깊이 차이가 4와 2, 즉 2칸이에요. 표의 "2칸 위"로 6을 한 번에 4로 옮겨요. 한 칸씩 오르면 2번 걸릴 일을 1번에 끝냈어요.',
            'The depths are 4 and 2, a gap of 2. Using the "2 up" entry, 6 jumps straight to 4: one jump instead of two single steps.',
          ),
        },
        {
          visual: tree({ 4: 'u', 7: 'v' }, { 6: 'visited', 5: 'visited', 4: 'current', 7: 'current', 2: 'candidate' }, { '5-6': 'visited', '4-5': 'visited', '2-4': 'candidate', '2-7': 'candidate' }),
          caption: tr(
            '이제 4와 7은 높이가 같지만 다른 점이에요. 큰 점프부터 봐요: 2칸 위는 둘 다 1, 1칸 위는 둘 다 2로 같아요. 같으면 뛰지 않아요. 너무 높이 올라가 버릴 수 있으니까요.',
            'Now 4 and 7 are level but different. Try the big jumps first: 2 up is 1 for both, and 1 up is 2 for both. When they match we do not jump, because we might overshoot.',
          ),
        },
        {
          visual: tree({ 2: 'LCA' }, { 6: 'visited', 5: 'visited', 4: 'visited', 7: 'visited', 2: 'path' }, { '5-6': 'path', '4-5': 'path', '2-4': 'path', '2-7': 'path' }),
          caption: tr(
            '더 뛸 수 있는 게 없으니 바로 위 부모가 답이에요. LCA(6, 7) = 2. 보라색 길이 6과 7을 잇는 길이에요.',
            'No jump is left, so the parent right above them is the answer: LCA(6, 7) = 2. The violet path links 6 and 7.',
          ),
        },
      ]}
      steps={[
        tr('DFS(한 갈래씩 끝까지 둘러보기)로 모든 점의 깊이와 바로 위 부모를 구해요.', 'Use a DFS (walking each branch to the end) to find every node’s depth and its parent.'),
        tr('표를 채워요. 2칸 위는 "1칸 위의 1칸 위", 4칸 위는 "2칸 위의 2칸 위"처럼 앞 칸을 두 번 쓰면 돼요.', 'Fill the table. 2 up is "1 up of 1 up", 4 up is "2 up of 2 up": each entry reuses the one before it twice.'),
        tr('더 깊은 점을 깊이 차이만큼 점프시켜 높이를 맞춰요. 이때 두 점이 같아지면 그 점이 답이에요.', 'Jump the deeper node up by the depth gap so both are level. If they are now the same node, that is the answer.'),
        tr('큰 점프부터 확인해서, 두 점의 조상이 서로 다를 때만 둘 다 점프해요. 다 보고 나면 바로 위 부모가 답이에요.', 'Going from the biggest jump down, jump both only when their ancestors differ. At the end, their parent is the answer.'),
      ]}
      useWhen={[
        tr('같은 트리에 "두 점의 공통 조상"이나 "두 점 사이 거리" 질문이 수만 개 쏟아질 때', 'One tree gets tens of thousands of questions about common ancestors or distances between two nodes'),
        tr('조직도나 폴더 구조처럼 위아래가 있는 구조에서 공통 상위를 찾을 때', 'You need the shared parent in a hierarchy like an org chart or folder tree'),
      ]}
      watchOut={[
        tr('조상이 같을 때 뛰면 LCA를 지나쳐 더 위로 가 버려요. 다를 때만 뛰어야 해요.', 'Jumping when the ancestors match can overshoot past the LCA. Only jump when they differ.'),
        tr('한 점이 다른 점의 조상이면 높이를 맞추자마자 둘이 같아져요. 이 경우를 먼저 확인하세요.', 'If one node is an ancestor of the other, they become equal right after leveling. Check that case first.'),
        tr('질문이 한두 개뿐이라면 한 칸씩 올라가는 단순한 방법으로도 충분해요.', 'For just one or two questions, simply climbing one level at a time is enough.'),
      ]}
      complexity={{
        time: 'O(N log N)',
        space: 'O(N log N)',
        plain: tr(
          '표를 채우는 준비는 한 번만 하고, 그 뒤 질문 하나는 log N번 점프면 끝나요. 점이 100만 개여도 질문 하나에 20번 정도만 뛰면 돼요.',
          'Filling the table happens once. After that each question takes about log N jumps: even with a million nodes, about 20 jumps per question.',
        ),
      }}
    />
  );
}
