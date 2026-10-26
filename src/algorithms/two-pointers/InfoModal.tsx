import { MoveHorizontal } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoCode, ComplexityChips } from '../../components/algorithm/InfoModal';
import { useLang, useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function TwoPointersInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  const { lang } = useLang();
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={MoveHorizontal}
      title={tr('투 포인터', 'Two pointers')}
      subtitle={tr('연속 구간을 한 번의 훑기로 다루기', 'Handle contiguous ranges in a single pass')}
    >
      <InfoSection n={1} title={tr('문제 정의', 'The problem')}>
        {lang === 'ko' ? (
          <p>양의 정수 배열에서 합이 정확히 <strong>M</strong>인 <strong>연속 구간</strong>의 개수를 셉니다. 모든 구간을 보면 O(n²)이지만, 구간의 양 끝을 가리키는 <strong>두 포인터</strong>를 앞으로만 움직이면 O(n)에 끝나요.</p>
        ) : (
          <p>Count the <strong>contiguous subarrays</strong> of a positive array whose sum is exactly <strong>M</strong>. Checking every range is O(n²), but moving <strong>two pointers</strong> (the two ends of the range) only forward takes O(n).</p>
        )}
        <InfoCode caption={tr('예시: BOJ 2003, M = 5', 'Example: BOJ 2003, M = 5')}>
          {'[1, 2, 3, 4, 2, 5, 3, 1, 1, 2]\n'}
          {tr('합이 5인 구간: [2, 3], [5], [3, 1, 1] → 3개', 'Subarrays summing to 5: [2, 3], [5], [3, 1, 1] → 3')}
        </InfoCode>
      </InfoSection>

      <InfoSection n={2} title={tr('핵심 아이디어', 'Key ideas')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoCard tone="candidate" title={tr('늘리기와 줄이기', 'Grow and shrink')}>
            {tr(
              '합이 M보다 작으면 r을 늘려 원소를 더하고, M 이상이면 l을 늘려 원소를 뺍니다. 모든 값이 양수라서 이 선택이 항상 옳아요.',
              'If the sum is below M, advance r to add an element. If it is M or more, advance l to remove one. Because every value is positive, this choice is always right.',
            )}
          </InfoCard>
          <InfoCard tone="current" title={tr('슬라이딩 윈도우', 'Sliding window')}>
            {tr(
              '길이가 k로 고정된 구간은 한 칸 밀 때 들어오는 값을 더하고 나가는 값을 빼면 됩니다. 매번 다시 더하지 않아도 돼요.',
              'For a window of fixed length k, sliding by one means adding the value that enters and subtracting the one that leaves. No need to re-sum.',
            )}
          </InfoCard>
        </div>
        <InfoCode caption={tr('윈도우 합 갱신', 'Updating the window sum')}>
          {'total += arr[r] - arr[r - k]'}
        </InfoCode>
        <p className="text-muted-foreground text-[13px]">
          {tr('l과 r은 각각 최대 n번만 움직이므로 전체 이동 횟수는 2n 이하예요.', 'l and r each move at most n times, so there are at most 2n moves in total.')}
        </p>
      </InfoSection>

      <InfoSection n={3} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(n)"
          space="O(1)"
          note={tr(
            '음수가 섞여 있으면 구간 합 버전의 "늘리기/줄이기" 판단이 깨져요. 그럴 땐 누적 합과 해시를 쓰세요.',
            'With negative values the grow/shrink rule of the subarray-sum version breaks. Use prefix sums with a hash map instead.',
          )}
        />
      </InfoSection>
    </InfoModal>
  );
}
