import { Triangle, ArrowUpFromLine, ArrowDownToLine, Layers, Info } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoCode, ComplexityChips } from '../../components/algorithm/InfoModal';
import { cn } from '../../components/ui';
import { toneText } from '../../components/ui/tone';
import { useLang, useTr } from '../../i18n';

interface HeapInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function HeapInfoModal({ isOpen, onClose, onStartVisualization }: HeapInfoModalProps) {
  const tr = useTr();
  const { lang } = useLang();
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Triangle}
      title={tr('힙 (우선순위 큐)', 'Heap (priority queue)')}
      subtitle={tr('가장 작은 값을 빠르게 넣고 꺼내는 자료구조', 'Insert and remove the smallest value fast')}
    >
      <InfoSection n={1} title={tr('문제 정의', 'The problem')}>
        {lang === 'ko' ? (
          <p>값을 계속 <strong>넣으면서</strong>, 그때그때 <strong>가장 작은 값</strong>(또는 가장 큰 값)을 <strong>꺼내야</strong> 합니다. 매번 정렬하면 느리니, 순서를 일부만 지키는 <strong>힙</strong>을 씁니다.</p>
        ) : (
          <p>Values keep <strong>arriving</strong>, and at any moment you must <strong>remove the smallest</strong> (or largest) one. Sorting every time is slow, so a <strong>heap</strong> keeps just enough order to answer fast.</p>
        )}
        <InfoCode caption={tr('힙 조건과 배열 인덱스', 'Heap property and array indices')}>
          {tr('부모 ≤ 자식 (최소 힙)\n', 'parent ≤ child (min-heap)\n')}
          {'parent(i) = (i - 1) // 2\nleft(i)   = 2 * i + 1\nright(i)  = 2 * i + 2'}
        </InfoCode>
        <p className="text-muted-foreground text-[13px]">
          {tr(
            '완전 이진 트리라서 포인터 없이 배열 하나에 층 순서대로 담을 수 있어요.',
            'It is a complete binary tree, so it fits in one array, level by level, with no pointers.',
          )}
        </p>
      </InfoSection>

      <InfoSection n={2} title={tr('핵심 아이디어', 'Key ideas')}>
        <div className="grid sm:grid-cols-3 gap-3">
          <InfoCard tone="current" icon={ArrowUpFromLine} title={tr('삽입: 위로 올리기', 'Insert: sift up')}>
            {tr(
              '맨 끝에 붙인 뒤, 부모보다 작으면 자리를 바꾸며 올라가요.',
              'Append at the end, then swap with the parent while it is smaller.',
            )}
          </InfoCard>
          <InfoCard tone="candidate" icon={ArrowDownToLine} title={tr('꺼내기: 아래로 내리기', 'Extract: sift down')}>
            {tr(
              '루트를 꺼내고 마지막 원소를 루트에 올린 뒤, 더 작은 자식과 바꾸며 내려가요.',
              'Take the root, move the last element to the root, then swap it with its smaller child on the way down.',
            )}
          </InfoCard>
          <InfoCard tone="visited" icon={Layers} title={tr('힙 만들기', 'Build heap')}>
            {tr(
              '리프는 이미 힙이니 n/2-1번부터 0번까지 거꾸로 내려보내면 O(n)에 끝나요.',
              'Leaves are already heaps, so sifting down from n/2-1 back to 0 finishes in O(n).',
            )}
          </InfoCard>
        </div>
        <InfoCode caption={tr('파이썬 heapq', "Python's heapq")}>
          {'import heapq\nheapq.heappush(pq, x)   # O(log n)\nheapq.heappop(pq)       # O(log n)\nheapq.heapify(arr)      # O(n)'}
        </InfoCode>
      </InfoSection>

      <InfoSection n={3} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(log n)"
          space="O(n)"
          note={<>
            <Info className={cn('w-3.5 h-3.5 inline align-[-2px] mr-1', toneText.current)} aria-hidden />
            {tr(
              '삽입과 꺼내기는 트리 높이만큼 O(log n), 힙 만들기는 O(n), 최솟값 확인은 O(1)이에요.',
              'Insert and extract cost O(log n), the tree height. Building a heap is O(n) and peeking the minimum is O(1).',
            )}
          </>}
        />
      </InfoSection>
    </InfoModal>
  );
}
