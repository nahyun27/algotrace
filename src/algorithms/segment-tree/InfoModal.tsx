import { Network, Users, Binary } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import TreeView, { type TreeNode } from '../../components/viz/TreeView';
import type { VizState } from '../../components/viz/palette';
import { cn } from '../../components/ui';
import { toneText } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

/** Tiny segment tree over [3, 1, 4, 2]: ids are heap indices (1 = root, 4..7 = leaves). */
const RANGES: Record<number, string> = { 1: '[0,3]', 2: '[0,1]', 3: '[2,3]', 4: '[0]', 5: '[1]', 6: '[2]', 7: '[3]' };

function frame(values: Record<number, string>, state: Record<number, VizState> = {}, faded: number[] = []) {
  const node = (id: number): TreeNode => ({
    id,
    label: values[id] ?? '?',
    sublabel: RANGES[id],
    children: id < 4 ? [node(id * 2), node(id * 2 + 1)] : undefined,
  });
  return (
    <TreeView
      root={node(1)}
      stateOf={id => state[Number(id)] ?? 'idle'}
      fadedOf={id => faded.includes(Number(id))}
      radius={20}
      className="bg-transparent p-0"
    />
  );
}

const BUILT = { 1: '10', 2: '4', 3: '6', 4: '3', 5: '1', 6: '4', 7: '2' };

export default function SegmentTreeInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Network}
      title={tr('세그먼트 트리 · 펜윅 트리', 'Segment tree · Fenwick tree')}
      subtitle={tr('숫자가 자꾸 바뀌는 배열에서 구간 합 빨리 구하기', 'Fast range sums on an array whose numbers keep changing')}
      summary={tr(
        '배열을 반씩 나눈 묶음마다 합을 미리 적어 두면, 구간 합도 값 바꾸기도 묶음 몇 개만 보고 끝낼 수 있어요.',
        'Write down the sum of every half, quarter and so on of the array. Then both range sums and changes only touch a few of those groups.',
      )}
      analogy={{
        icon: Users,
        title: tr('반장이 반 합계를 알고 있는 학교', 'A school where every class leader knows the class total'),
        body: tr(
          '학년 대표는 학년 전체의 점수 합을, 반장은 자기 반의 합을 알고 있어요. 2반부터 5반까지의 합이 궁금하면 학생을 한 명씩 세지 않고 반장 몇 명에게만 물어보면 돼요. 한 학생의 점수가 바뀌면 그 학생의 반장과 학년 대표만 숫자를 고치면 돼요.',
          'The grade leader knows the total of the whole grade, and each class leader knows the total of their class. To get the total of classes 2 to 5, you ask a few leaders instead of counting every student. When one student\'s score changes, only their class leader and the grade leader update their numbers.',
        ),
      }}
      storyboard={[
        {
          visual: frame({ 4: '3', 5: '1', 6: '4', 7: '2' }, { 4: 'visited', 5: 'visited', 6: 'visited', 7: 'visited' }),
          caption: tr('배열 [3, 1, 4, 2]예요. 맨 아래 칸(리프)에 숫자를 하나씩 넣어요.', 'The array is [3, 1, 4, 2]. Each bottom node (a leaf) holds one number.'),
        },
        {
          visual: frame(BUILT, { 1: 'visited', 2: 'visited', 3: 'visited', 4: 'visited', 5: 'visited', 6: 'visited', 7: 'visited' }),
          caption: tr('부모는 두 자식의 합을 적어요. 맨 위 10은 배열 전체의 합이에요.', 'A parent holds the sum of its two children. The top node, 10, is the sum of everything.'),
        },
        {
          visual: frame(BUILT, { 1: 'current' }),
          caption: tr('인덱스 1부터 3까지의 합을 구해 볼게요. 맨 위 [0,3]은 일부만 겹치니까 둘로 나눠서 물어봐요.', 'Now find the sum of indices 1 to 3. The top node [0,3] only partly overlaps, so ask its two children.'),
        },
        {
          visual: frame(BUILT, { 1: 'candidate', 2: 'candidate', 5: 'path' }, [4]),
          caption: tr('[0,1]도 일부만 겹쳐서 또 나눠요. [0]은 범위 밖이라 버리고, [1]은 안에 있으니 1을 가져가요.', '[0,1] also overlaps only partly, so split again. [0] is outside, so skip it. [1] is inside, so take 1.'),
        },
        {
          visual: frame(BUILT, { 1: 'candidate', 2: 'candidate', 3: 'path', 5: 'path' }, [4]),
          caption: tr('[2,3]은 통째로 범위 안이라 더 내려가지 않고 6을 바로 써요. 답은 1 + 6 = 7이에요.', '[2,3] is fully inside, so use 6 right away without going deeper. The answer is 1 + 6 = 7.'),
        },
        {
          visual: frame({ ...BUILT, 1: '15', 3: '11', 6: '9' }, { 1: 'visited', 3: 'visited', 6: 'current' }, [2, 4, 5, 7]),
          caption: tr('arr[2]를 4에서 9로 바꾸면, 그 칸부터 맨 위까지 노드 3개만 고치면 돼요.', 'Change arr[2] from 4 to 9. Only the 3 nodes from that leaf up to the top need fixing.'),
        },
      ]}
      steps={[
        tr('배열을 반으로, 또 반으로 나눠서 나무 모양을 만들고 각 노드에 그 구간의 합을 적어요.', 'Split the array in half again and again to form a tree. Each node stores the sum of its part.'),
        tr('구간 합을 물으면 맨 위에서 출발해요. 통째로 범위 안인 노드는 그 합을 바로 써요.', 'For a range sum, start at the top. A node fully inside the range gives its sum right away.'),
        tr('범위 밖인 노드는 버리고, 일부만 겹치는 노드는 두 자식에게 다시 물어봐요.', 'Skip nodes outside the range. For a node that only partly overlaps, ask its two children.'),
        tr('값을 바꾸면 그 리프에서 맨 위까지 올라가며 합을 다시 계산해요.', 'To change a value, update its leaf and recompute the sums on the way up to the top.'),
      ]}
      useWhen={[
        tr('배열의 값이 자주 바뀌면서 구간 합도 자주 물어볼 때', 'Values change often and range sums are asked often'),
        tr('합 대신 최솟값, 최댓값, 곱처럼 두 값을 합칠 수 있는 연산을 구간마다 알고 싶을 때', 'You need min, max or a product over ranges instead of a sum'),
      ]}
      watchOut={[
        tr('값이 바뀌지 않는다면 누적 합 배열 하나로 충분해요. 훨씬 간단해요.', 'If values never change, a prefix sum array is enough and much simpler.'),
        tr('세그먼트 트리 배열은 넉넉하게 4n칸으로 잡아요. 2n칸이면 모자랄 수 있어요.', 'Give the segment tree array 4n cells. 2n can be too small.'),
        tr('"값 바꾸기"인지 "값 더하기"인지 문제를 꼭 확인해요. 펜윅 트리는 차이(새 값 − 옛 값)를 더해요.', 'Check whether the problem replaces a value or adds to it. A Fenwick tree adds the difference (new − old).'),
      ]}
      complexity={{
        time: 'O(log n)',
        space: 'O(n)',
        plain: tr(
          '구간 합 하나, 값 바꾸기 하나에 O(log n)이에요. 배열이 2배로 길어져도 보는 노드는 한 층(몇 개)만 늘어나요. 처음 만들 때는 O(n)이에요.',
          'Each range sum or change takes O(log n). If the array doubles in length, only one more level (a few nodes) is visited. Building it once takes O(n).',
        ),
      }}
    >
      <section className="rounded-3xl border border-border bg-card p-5 space-y-2">
        <p className="flex items-center gap-2 font-bold text-base">
          <Binary className={cn('w-5 h-5', toneText.current)} />
          {tr('펜윅 트리 (BIT): 더 짧은 코드', 'Fenwick tree (BIT): shorter code')}
        </p>
        <p className="text-muted-foreground">
          {tr(
            '칸 i는 i의 가장 낮은 1비트(i & -i)만큼의 원소 합을 맡아요. 앞부분 합은 i -= i & -i로, 값 바꾸기는 i += i & -i로 이동해요. 구간 [l, r]의 합은 앞부분 합 두 개의 차예요.',
            'Cell i covers as many elements as the lowest set bit of i (i & -i). A prefix sum moves with i -= i & -i, an update with i += i & -i. The sum of [l, r] is the difference of two prefix sums.',
          )}
        </p>
        <pre className="rounded-2xl bg-muted px-4 py-3 text-sm font-mono overflow-x-auto">
          {'range_sum(l, r) = prefix_sum(r + 1) − prefix_sum(l)\ni = 7 (0111) → 6 (0110) → 4 (0100) → 0'}
        </pre>
      </section>
    </ConceptModal>
  );
}
