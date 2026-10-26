import { ArrowDownUp, Scale } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard } from '../../components/algorithm/InfoModal';
import { Badge, cn } from '../../components/ui';
import { toneSoft, type Tone } from '../../components/ui/tone';
import { useLang, useTr, type Tr } from '../../i18n';
import type { SortAlgorithm } from './types';
import { SORT_LABELS } from './types';

/* ─── Per-algorithm detail content ─── */

interface Text { ko: string; en: string }

interface AlgoDetail {
  sections: { title: Text; body: Text }[];
  /** best, average, worst, space */
  complexity: [string, string, string, string];
  stable: boolean;
}

const SORT_ORDER: SortAlgorithm[] = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap'];

const ALGO_DETAILS: Record<SortAlgorithm, AlgoDetail> = {
  bubble: {
    sections: [
      {
        title: { ko: '동작 원리', en: 'How it works' },
        body: {
          ko: '인접한 두 원소를 비교해 순서가 잘못되면 교환합니다. 한 패스가 끝나면 가장 큰 값이 배열 끝으로 "버블"처럼 떠오릅니다. 이 과정을 N-1회 반복하면 정렬이 완성됩니다.',
          en: 'Compare each pair of neighbours and swap them if they are out of order. After one pass the largest value has "bubbled up" to the end of the array. Repeat N-1 times and the array is sorted.',
        },
      },
      {
        title: { ko: '왜 느린가?', en: 'Why is it slow?' },
        body: {
          ko: '모든 인접 쌍을 매 패스마다 비교하므로 비교 횟수가 O(n²)입니다. 이미 정렬된 원소도 반복 검사합니다.',
          en: 'Every adjacent pair is compared on every pass, so it makes O(n²) comparisons — even elements that are already in place get checked again.',
        },
      },
      {
        title: { ko: '조기 종료 최적화', en: 'Early-exit optimisation' },
        body: {
          ko: '한 패스에서 교환이 한 번도 일어나지 않으면 이미 정렬된 것이므로 즉시 종료합니다. 이 경우 최선 시간복잡도는 O(n)입니다.',
          en: 'If a whole pass makes no swaps, the array is already sorted and we can stop. That gives a best case of O(n).',
        },
      },
      {
        title: { ko: '언제 쓰는가?', en: 'When to use it' },
        body: {
          ko: '교육 목적, 아주 작은 배열(N < 10), 거의 정렬된 데이터에서 간단하게 쓸 때 적합합니다.',
          en: 'Teaching, tiny arrays (N < 10), or a quick fix for data that is almost sorted.',
        },
      },
    ],
    complexity: ['O(n)', 'O(n²)', 'O(n²)', 'O(1)'],
    stable: true,
  },
  selection: {
    sections: [
      {
        title: { ko: '동작 원리', en: 'How it works' },
        body: {
          ko: '남은 구간에서 최솟값을 찾아 현재 위치와 교환합니다. 매 회전마다 정렬 확정 구간이 1칸씩 늘어납니다.',
          en: 'Find the minimum in the unsorted part and swap it into the current position. Each round grows the sorted prefix by one.',
        },
      },
      {
        title: { ko: '불안정 정렬인 이유', en: 'Why it is unstable' },
        body: {
          ko: '최솟값을 찾아 교환할 때, 동일한 값의 상대 순서가 바뀔 수 있습니다. 예: [4a, 3, 4b, 1] → [1, 3, 4b, 4a]로 4a와 4b 순서가 뒤바뀜.',
          en: 'The long-distance swap can reorder equal values. Example: [4a, 3, 4b, 1] → [1, 3, 4b, 4a] — 4a and 4b trade places.',
        },
      },
      {
        title: { ko: '교환 횟수가 적다', en: 'Very few swaps' },
        body: {
          ko: '비교는 O(n²)이지만 교환은 최대 O(n)입니다. 쓰기 비용이 비싼 환경(플래시 메모리 등)에서 유리합니다.',
          en: 'Comparisons are O(n²) but swaps are at most O(n) — handy when writes are expensive (e.g. flash memory).',
        },
      },
    ],
    complexity: ['O(n²)', 'O(n²)', 'O(n²)', 'O(1)'],
    stable: false,
  },
  insertion: {
    sections: [
      {
        title: { ko: '동작 원리', en: 'How it works' },
        body: {
          ko: '정렬된 구간의 올바른 위치에 새 원소를 삽입합니다. 카드 게임에서 손에 든 카드를 정렬하는 것과 같은 원리입니다.',
          en: 'Take the next element and insert it into its correct spot in the sorted part — just like sorting a hand of playing cards.',
        },
      },
      {
        title: { ko: '거의 정렬된 배열에서 강점', en: 'Great on nearly sorted data' },
        body: {
          ko: '이미 거의 정렬된 데이터에서는 이동이 거의 없어 O(n)에 가까운 성능을 보입니다. 이것이 삽입 정렬의 최대 장점입니다.',
          en: 'When the data is almost sorted, hardly anything needs to move, so it runs close to O(n). This is its biggest strength.',
        },
      },
      {
        title: { ko: '온라인 알고리즘', en: 'An online algorithm' },
        body: {
          ko: '데이터가 하나씩 들어와도 즉시 정렬할 수 있습니다. 스트리밍 데이터 처리에 적합합니다.',
          en: 'It can keep the data sorted as elements arrive one by one, which suits streaming input.',
        },
      },
      {
        title: { ko: '실전 활용', en: 'In the real world' },
        body: {
          ko: 'Python의 Tim Sort, Java의 Arrays.sort()는 작은 구간에 삽입 정렬을 사용합니다. 소규모(N < 64)에서 오버헤드 없이 빠릅니다.',
          en: "Python's Timsort and Java's Arrays.sort() use insertion sort for small runs — for N < 64 it is fast with no overhead.",
        },
      },
    ],
    complexity: ['O(n)', 'O(n²)', 'O(n²)', 'O(1)'],
    stable: true,
  },
  merge: {
    sections: [
      {
        title: { ko: '분할 정복 원리', en: 'Divide and conquer' },
        body: {
          ko: '배열을 반으로 나누고, 각각을 재귀적으로 정렬한 뒤, 두 정렬된 부분을 하나로 병합합니다. "나눠서 풀고, 합치면서 정렬"하는 전략입니다.',
          en: 'Split the array in half, sort each half recursively, then merge the two sorted halves. "Divide, solve, and sort while merging."',
        },
      },
      {
        title: { ko: '안정 정렬', en: 'Stable' },
        body: {
          ko: '같은 값의 원소는 원래 순서가 유지됩니다. 데이터베이스 정렬 등에서 중요한 성질입니다.',
          en: 'Equal elements keep their original order — an important property for things like database sorting.',
        },
      },
      {
        title: { ko: '추가 메모리 O(n)', en: 'O(n) extra memory' },
        body: {
          ko: '병합 과정에서 임시 배열이 필요합니다. 이것이 병합 정렬의 가장 큰 단점으로, 메모리가 제한된 환경에서는 주의해야 합니다.',
          en: 'Merging needs a temporary array. This is its main drawback, so be careful when memory is tight.',
        },
      },
      {
        title: { ko: '항상 O(n log n)', en: 'Always O(n log n)' },
        body: {
          ko: '입력 데이터와 무관하게 최선/평균/최악 모두 O(n log n)입니다. 성능이 예측 가능한 안정적인 알고리즘입니다.',
          en: 'Best, average and worst case are all O(n log n) regardless of the input, so performance is predictable.',
        },
      },
    ],
    complexity: ['O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n)'],
    stable: true,
  },
  quick: {
    sections: [
      {
        title: { ko: '피벗과 파티션', en: 'Pivot and partition' },
        body: {
          ko: '피벗을 선택하고, 피벗보다 작은 값은 왼쪽, 큰 값은 오른쪽으로 분리(파티션)합니다. 피벗은 최종 위치에 확정되고, 양쪽을 재귀 정렬합니다.',
          en: 'Pick a pivot, then move smaller values to its left and larger ones to its right (partition). The pivot lands in its final spot and both sides are sorted recursively.',
        },
      },
      {
        title: { ko: '실전 최강의 정렬', en: 'The practical champion' },
        body: {
          ko: '평균 O(n log n)이며, 캐시 지역성이 우수하고 상수 계수가 작아 같은 O(n log n)인 병합·힙 정렬보다 실측에서 빠릅니다.',
          en: 'Average O(n log n) with great cache locality and small constants, so in practice it beats merge and heap sort despite the same big-O.',
        },
      },
      {
        title: { ko: '최악 O(n²) 주의', en: 'Beware the O(n²) worst case' },
        body: {
          ko: '이미 정렬된 배열에서 매번 끝 원소를 피벗으로 잡으면 파티션이 극단적으로 불균형해져 O(n²)이 됩니다.',
          en: 'Always picking the last element on an already sorted array makes every partition maximally lopsided — O(n²).',
        },
      },
      {
        title: { ko: '피벗 선택 전략', en: 'Choosing the pivot' },
        body: {
          ko: '랜덤 피벗, median-of-three 등으로 최악을 회피합니다. 실전 라이브러리는 이 전략들을 조합하여 사용합니다.',
          en: 'Random pivots or median-of-three avoid the worst case. Real libraries combine these strategies.',
        },
      },
    ],
    complexity: ['O(n log n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    stable: false,
  },
  heap: {
    sections: [
      {
        title: { ko: '힙 자료구조', en: 'The heap' },
        body: {
          ko: '완전 이진 트리로 부모가 자식보다 항상 크거나 같은(최대 힙) 성질을 가집니다. 배열로 표현 시 인덱스 i의 자식은 2i+1, 2i+2입니다.',
          en: 'A complete binary tree where every parent is ≥ its children (max-heap). Stored in an array, the children of index i are 2i+1 and 2i+2.',
        },
      },
      {
        title: { ko: 'Heapify 과정', en: 'Heapify' },
        body: {
          ko: '한 노드를 자식과 비교해 필요시 교환하고 재귀적으로 내려갑니다. 배열 전체를 힙으로 만드는 Build Heap은 O(n)에 가능합니다.',
          en: 'Compare a node with its children, swap if needed, and keep sifting down. Building a heap from the whole array takes only O(n).',
        },
      },
      {
        title: { ko: 'O(n log n) 보장', en: 'Guaranteed O(n log n)' },
        body: {
          ko: '최선/평균/최악 모두 O(n log n)이며 추가 메모리 O(1)로 in-place 정렬입니다. 최악 성능이 보장되어야 할 때 적합합니다.',
          en: 'O(n log n) in every case and in-place with O(1) extra memory — a good pick when the worst case must be bounded.',
        },
      },
      {
        title: { ko: '단점', en: 'Drawbacks' },
        body: {
          ko: '캐시 지역성이 나쁘고(트리 구조 접근) 불안정 정렬이라 실전에서는 퀵 정렬보다 느린 경우가 많습니다.',
          en: 'Tree-shaped access has poor cache locality and the sort is unstable, so it is often slower than quick sort in practice.',
        },
      },
    ],
    complexity: ['O(n log n)', 'O(n log n)', 'O(n log n)', 'O(1)'],
    stable: false,
  },
};

const complexityLabels = (tr: Tr) => [tr('최선', 'Best'), tr('평균', 'Average'), tr('최악', 'Worst'), tr('공간', 'Space')];
const COMPLEXITY_TONES: Tone[] = ['visited', 'candidate', 'danger', 'current'];

function StableBadge({ stable }: { stable: boolean }) {
  const tr = useTr();
  return (
    <Badge tone={stable ? 'visited' : 'neutral'}>
      {stable ? tr('안정', 'Stable') : tr('불안정', 'Unstable')}
    </Badge>
  );
}

/* ─── Individual algorithm modal ─── */

interface AlgoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
  algorithm: SortAlgorithm;
}

export function SortAlgoModal({ isOpen, onClose, onStartVisualization, algorithm }: AlgoModalProps) {
  const tr = useTr();
  const { lang } = useLang();
  const detail = ALGO_DETAILS[algorithm];
  const label = SORT_LABELS[algorithm];
  const labels = complexityLabels(tr);

  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={ArrowDownUp}
      title={label[lang]}
      subtitle={lang === 'ko' ? label.en : label.ko}
    >
      {detail.sections.map((s, i) => (
        <InfoSection key={s.title.en} n={i + 1} title={s.title[lang]}>
          <p>{s.body[lang]}</p>
        </InfoSection>
      ))}

      <InfoSection n={detail.sections.length + 1} title={tr('복잡도', 'Complexity')}>
        <div className="flex flex-wrap items-center gap-2">
          {detail.complexity.map((value, i) => (
            <span key={labels[i]} className={cn('inline-flex items-center gap-2 rounded-xl px-3.5 py-2', toneSoft[COMPLEXITY_TONES[i]])}>
              <span className="text-xs font-semibold opacity-80">{labels[i]}</span>
              <code className="font-mono font-bold">{value}</code>
            </span>
          ))}
          <StableBadge stable={detail.stable} />
        </div>
      </InfoSection>
    </InfoModal>
  );
}

/* ─── Comparison table modal ─── */

const SUMMARY: Record<SortAlgorithm, Text> = {
  bubble:    { ko: '인접 비교·교환, 큰 값을 뒤로', en: 'Compare and swap neighbours, pushing big values back' },
  selection: { ko: '최솟값 찾아 앞으로', en: 'Find the minimum and move it to the front' },
  insertion: { ko: '정렬 구간에 삽입', en: 'Insert into the sorted part' },
  merge:     { ko: '분할 → 재귀 → 병합', en: 'Split → recurse → merge' },
  quick:     { ko: '피벗 파티션 → 재귀', en: 'Partition around a pivot → recurse' },
  heap:      { ko: '최대 힙 → 루트 추출', en: 'Build a max-heap → extract the root' },
};

const WHEN_TO_USE: { when: Text; pick: Text; tone: Tone }[] = [
  { when: { ko: '소규모 (N < 50)', en: 'Small input (N < 50)' }, pick: { ko: '삽입 정렬', en: 'Insertion sort' }, tone: 'visited' },
  { when: { ko: '안정 정렬이 필요할 때', en: 'Need a stable sort' }, pick: { ko: '병합 정렬', en: 'Merge sort' }, tone: 'current' },
  { when: { ko: '평균 성능', en: 'Best average speed' }, pick: { ko: '퀵 정렬 (실전 최강)', en: 'Quick sort (fastest in practice)' }, tone: 'candidate' },
  { when: { ko: '최악 성능 보장', en: 'Guaranteed worst case' }, pick: { ko: '힙 / 병합 정렬', en: 'Heap / merge sort' }, tone: 'path' },
  { when: { ko: '메모리 제한', en: 'Tight memory' }, pick: { ko: '힙 정렬 (in-place)', en: 'Heap sort (in-place)' }, tone: 'neutral' },
];

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SortCompareModal({ isOpen, onClose }: CompareModalProps) {
  const tr = useTr();
  const { lang } = useLang();
  const labels = complexityLabels(tr);

  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      icon={Scale}
      title={tr('정렬 알고리즘 비교', 'Comparing sorting algorithms')}
      subtitle={tr('6가지 정렬의 복잡도와 특성 비교', 'Complexity and traits of six sorts')}
    >
      <InfoSection n={1} title={tr('복잡도 비교표', 'Complexity table')}>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-[13px] text-left">
            <thead className="bg-muted/60 text-xs font-semibold text-muted-foreground">
              <tr>
                <th className="py-2 px-3">{tr('알고리즘', 'Algorithm')}</th>
                {labels.map(l => <th key={l} className="py-2 px-3 whitespace-nowrap">{l}</th>)}
                <th className="py-2 px-3">{tr('안정성', 'Stability')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SORT_ORDER.map(algo => {
                const d = ALGO_DETAILS[algo];
                return (
                  <tr key={algo}>
                    <td className="py-2 px-3 font-semibold whitespace-nowrap">{SORT_LABELS[algo][lang]}</td>
                    {d.complexity.map((v, i) => (
                      <td key={i} className={cn('py-2 px-3 font-mono text-xs whitespace-nowrap', v === 'O(n²)' && i < 3 && 'text-muted-foreground')}>{v}</td>
                    ))}
                    <td className="py-2 px-3"><StableBadge stable={d.stable} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </InfoSection>

      <InfoSection n={2} title={tr('한 줄 요약', 'In one line')}>
        <ul className="space-y-1.5 text-[13px]">
          {SORT_ORDER.map(algo => (
            <li key={algo} className="flex flex-wrap gap-x-2">
              <strong className="font-bold">{SORT_LABELS[algo][lang]}</strong>
              <span className="text-muted-foreground">— {SUMMARY[algo][lang]}</span>
            </li>
          ))}
        </ul>
      </InfoSection>

      <InfoSection n={3} title={tr('언제 어떤 정렬?', 'Which sort when?')}>
        <div className="grid sm:grid-cols-2 gap-3">
          {WHEN_TO_USE.map(w => (
            <InfoCard key={w.when.en} tone={w.tone} title={w.when[lang]}>
              {w.pick[lang]}
            </InfoCard>
          ))}
        </div>
      </InfoSection>
    </InfoModal>
  );
}
