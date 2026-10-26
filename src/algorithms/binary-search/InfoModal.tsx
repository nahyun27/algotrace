import { Search } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoCode, ComplexityChips } from '../../components/algorithm/InfoModal';
import { useLang, useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function BinarySearchInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  const { lang } = useLang();
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Search}
      title={tr('이분 탐색', 'Binary search')}
      subtitle={tr('구간을 절반씩 줄여 나가는 탐색', 'Search by halving the range')}
    >
      <InfoSection n={1} title={tr('문제 정의', 'The problem')}>
        {lang === 'ko' ? (
          <p><strong>정렬된</strong> 배열에서 원하는 값의 위치를 찾습니다. 처음부터 하나씩 보면 O(n)이지만, 가운데 값과 비교해 <strong>절반을 한 번에 버리면</strong> O(log n)이면 충분해요.</p>
        ) : (
          <p>Find a value in a <strong>sorted</strong> array. Scanning one by one takes O(n), but comparing with the middle element lets you <strong>throw away half</strong> at a time, so O(log n) is enough.</p>
        )}
        <InfoCode caption={tr('예시: 23 찾기', 'Example: find 23')}>
          {'[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]\n'}
          {tr('mid=4 (16 < 23) → 오른쪽, mid=7 (56 > 23) → 왼쪽, mid=5 → 찾음!', 'mid=4 (16 < 23) → right, mid=7 (56 > 23) → left, mid=5 → found!')}
        </InfoCode>
      </InfoSection>

      <InfoSection n={2} title={tr('핵심 아이디어', 'Key ideas')}>
        <div className="grid sm:grid-cols-3 gap-3">
          <InfoCard tone="current" title={tr('값 찾기', 'Find a value')}>
            {tr(
              '닫힌 구간 [lo, hi]에서 arr[mid]와 target을 비교해 lo = mid+1 또는 hi = mid−1로 줄입니다.',
              'On a closed range [lo, hi], compare arr[mid] with the target and shrink to lo = mid+1 or hi = mid−1.',
            )}
          </InfoCard>
          <InfoCard tone="candidate" title={tr('lower bound', 'Lower bound')}>
            {tr(
              'target 이상인 첫 위치를 찾아요. 반열린 구간 [lo, hi)를 쓰고, 조건을 만족하면 hi = mid로 답 후보를 남겨 둡니다.',
              'The first position with a value ≥ target. Use a half-open range [lo, hi) and keep a candidate with hi = mid.',
            )}
          </InfoCard>
          <InfoCard tone="path" title={tr('파라메트릭 서치', 'Parametric search')}>
            {tr(
              '"답이 x일 때 가능한가?"가 어느 지점을 기준으로 참/거짓이 한 번만 바뀌면, 답 자체를 이분 탐색할 수 있어요.',
              'If "is x feasible?" flips between true and false only once, you can binary-search the answer itself.',
            )}
          </InfoCard>
        </div>
        <InfoCode caption={tr('나무 자르기 (BOJ 2805): 높이 H가 낮을수록 얻는 나무가 많아요', 'Cutting trees (BOJ 2805): the lower H, the more wood')}>
          {'H         0 … 14  15 | 16 … 20\nwood ≥ 7  O … O   O  | X  … X\n'}
          {tr('→ O인 가장 큰 H = 15', '→ the largest H marked O is 15')}
        </InfoCode>
      </InfoSection>

      <InfoSection n={3} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(log n)"
          space="O(1)"
          note={tr(
            '배열이 정렬되어 있어야 해요. 파라메트릭 서치는 판정 한 번의 비용이 곱해져 O(n log H)가 됩니다.',
            'The array must be sorted. In parametric search each check costs extra, giving O(n log H) overall.',
          )}
        />
      </InfoSection>
    </InfoModal>
  );
}
