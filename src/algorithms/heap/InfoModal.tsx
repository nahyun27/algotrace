import { Triangle, Hospital } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import { InfoCode } from '../../components/algorithm/InfoModal';
import MiniGraph, { type MiniEdge, type MiniNode } from '../../components/viz/MiniGraph';
import { MiniCells } from '../../components/viz/MiniTable';
import type { VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';

interface HeapInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

/** Fixed slot positions: slot i's children are 2i+1 and 2i+2 */
const POS: [number, number][] = [[180, 26], [100, 86], [260, 86], [56, 146], [144, 146], [216, 146]];
const EDGES: MiniEdge[] = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]];

/** Draw a heap (array) as a tree, with the array itself underneath. */
function frame(heap: number[], state: Record<number, VizState>, edgeState: Record<string, VizState> = {}) {
  const nodes: MiniNode[] = heap.map((v, i) => ({ id: i, x: POS[i][0], y: POS[i][1], label: String(v) }));
  const edges = EDGES.filter(([, c]) => (c as number) < heap.length);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
      <div className="w-full max-w-[300px] sm:max-w-[360px] h-[130px] sm:h-[175px]">
        <MiniGraph nodes={nodes} edges={edges} nodeState={state} edgeState={edgeState} width={360} height={172} radius={19} />
      </div>
      <MiniCells values={heap} stateOf={i => state[i] ?? 'idle'} under={i => i} />
    </div>
  );
}

export default function HeapInfoModal({ isOpen, onClose, onStartVisualization }: HeapInfoModalProps) {
  const tr = useTr();
  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Triangle}
      title={tr('힙 (우선순위 큐)', 'Heap (priority queue)')}
      subtitle={tr('가장 작은 값을 빠르게 넣고 꺼내는 자료구조', 'Insert and remove the smallest value fast')}
      summary={tr(
        '"부모는 자식보다 작다"는 규칙 하나만 지키는 트리라서, 가장 작은 값은 늘 꼭대기에 있고 넣고 꺼낼 때도 몇 칸만 자리를 바꾸면 돼요.',
        'A tree that keeps just one rule, "a parent is smaller than its children", so the smallest value is always on top, and inserting or removing only takes a few swaps.',
      )}
      analogy={{
        icon: Hospital,
        title: tr('응급실 대기 명단', 'An emergency room queue'),
        body: tr(
          '응급실에서는 먼저 온 순서가 아니라 가장 급한 환자부터 봐요. 간호사는 명단 전체를 매번 다시 정렬하지 않고, 새 환자가 오면 "나보다 덜 급한 사람"과 몇 번만 자리를 바꿔 줘요. 그래도 맨 위에는 항상 가장 급한 환자가 있어요.',
          'An emergency room treats the most urgent patient first, not whoever came first. The nurse never re-sorts the whole list; a new patient just swaps places with "less urgent" people a few times. The most urgent patient is still always on top.',
        ),
      }}
      storyboard={[
        {
          visual: frame([2, 4, 3, 7, 5], { 0: 'current' }),
          caption: tr(
            '최소 힙이에요. 부모는 항상 자식보다 작아서, 가장 작은 값 2가 꼭대기(루트)에 있어요. 트리는 아래 배열에 층 순서대로 담겨요.',
            'This is a min-heap. Every parent is smaller than its children, so the smallest value, 2, sits on top (the root). The tree is stored level by level in the array below.',
          ),
        },
        {
          visual: frame([2, 4, 3, 7, 5, 1], { 5: 'current', 2: 'candidate' }, { '2-5': 'candidate' }),
          caption: tr(
            '1을 넣어요. 일단 맨 끝(5번 칸)에 붙여요. 부모 3보다 작으니 규칙이 깨졌어요.',
            'Insert 1. First append it at the end (slot 5). It is smaller than its parent 3, so the rule is broken.',
          ),
        },
        {
          visual: frame([2, 4, 1, 7, 5, 3], { 2: 'current', 0: 'candidate', 5: 'visited' }, { '0-2': 'candidate' }),
          caption: tr(
            '1과 3의 자리를 바꿔요(위로 올리기). 이제 새 부모 2와 비교해요. 1 < 2라서 한 번 더 바꿔야 해요.',
            'Swap 1 and 3 (sift up). Now compare it with its new parent 2: since 1 < 2, swap again.',
          ),
        },
        {
          visual: frame([1, 4, 2, 7, 5, 3], { 0: 'path', 2: 'visited' }, { '0-2': 'path' }),
          caption: tr(
            '1이 꼭대기에 도착했어요. 바꾼 건 단 2번, 트리의 층 수만큼만 움직였어요.',
            '1 reached the top. Only 2 swaps: it moved at most the number of levels.',
          ),
        },
        {
          visual: frame([3, 4, 2, 7, 5], { 0: 'current', 1: 'candidate', 2: 'candidate' }, { '0-1': 'candidate', '0-2': 'candidate' }),
          caption: tr(
            '이번엔 가장 작은 1을 꺼내요. 비어 버린 꼭대기에는 맨 끝 값 3을 올려요. 두 자식 4와 2 중 더 작은 2보다 3이 크니 내려가야 해요.',
            'Now remove the smallest, 1. Move the last value, 3, into the empty top. Of its children 4 and 2, the smaller is 2, and 3 is bigger, so it must go down.',
          ),
        },
        {
          visual: frame([2, 4, 3, 7, 5], { 0: 'path', 2: 'visited' }, { '0-2': 'path' }),
          caption: tr(
            '3과 2를 바꾸면(아래로 내리기) 규칙이 다시 맞아요. 새 꼭대기 2가 그다음으로 작은 값이에요.',
            'Swap 3 and 2 (sift down) and the rule holds again. The new top, 2, is the next smallest value.',
          ),
        },
      ]}
      steps={[
        tr('트리를 배열에 층 순서대로 담아요. i번 칸의 자식은 2i+1, 2i+2번, 부모는 (i-1)/2번이에요.', 'Store the tree level by level in an array. Slot i has children 2i+1 and 2i+2, and its parent is (i-1)/2.'),
        tr('넣기: 맨 끝에 붙이고, 부모보다 작은 동안 부모와 자리를 바꾸며 올라가요.', 'Insert: append at the end, then swap with the parent while it is smaller.'),
        tr('꺼내기: 꼭대기를 꺼내고 맨 끝 값을 꼭대기로 옮긴 뒤, 더 작은 자식과 자리를 바꾸며 내려가요.', 'Remove: take the top, move the last value to the top, then swap it with its smaller child on the way down.'),
        tr('가장 작은 값이 궁금하면 꼭대기(0번 칸)만 보면 돼요.', 'To see the smallest value, just look at the top (slot 0).'),
      ]}
      useWhen={[
        tr('값이 계속 들어오는데, 그때그때 가장 작은(또는 큰) 값을 꺼내야 할 때', 'Values keep arriving and you keep needing the smallest (or largest) one'),
        tr('다익스트라, 프림처럼 "지금 가장 가까운 것"을 반복해서 고르는 알고리즘', 'Algorithms like Dijkstra and Prim that keep picking "the closest one right now"'),
        tr('"상위 K개", "K번째로 작은 값"처럼 일부만 순서가 필요할 때', 'You only need part of the order, like "top K" or "the K-th smallest"'),
      ]}
      watchOut={[
        tr('힙은 전체가 정렬된 상태가 아니에요. 형제끼리, 다른 가지끼리는 순서가 없어요.', 'A heap is not fully sorted. Siblings and different branches have no order.'),
        tr('파이썬 heapq는 최소 힙이에요. 최대 힙이 필요하면 값에 -1을 곱해 넣어요.', "Python's heapq is a min-heap. For a max-heap, push values multiplied by -1."),
        tr('중간에 있는 값을 찾거나 지우는 건 느려요(전부 훑어야 해요).', 'Finding or deleting a value in the middle is slow (you scan everything).'),
      ]}
      complexity={{
        time: 'O(log n)',
        space: 'O(n)',
        plain: tr(
          '넣기와 꺼내기는 트리의 층 수만큼만 움직여요. 값이 2배가 돼도 층은 하나만 늘어서, 100만 개가 있어도 20번 정도만 바꾸면 끝나요. 가장 작은 값 확인은 O(1)이에요.',
          'Insert and remove move at most the number of levels. Doubling the values adds just one level, so even with 1 million values it takes about 20 swaps. Peeking at the smallest is O(1).',
        ),
      }}
    >
      <InfoCode caption={tr('파이썬 heapq', "Python's heapq")}>
        {'import heapq\nheapq.heappush(pq, x)   # O(log n)\nheapq.heappop(pq)       # O(log n)\nheapq.heapify(arr)      # O(n)'}
      </InfoCode>
    </ConceptModal>
  );
}
