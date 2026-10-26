import { AlertTriangle, TrendingUp } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoCode, ComplexityChips } from '../../components/algorithm/InfoModal';
import { useLang, useTr } from '../../i18n';

interface LISInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function LISInfoModal({ isOpen, onClose, onStartVisualization }: LISInfoModalProps) {
  const tr = useTr();
  const { lang } = useLang();
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={TrendingUp}
      title={tr('최장 증가 부분 수열 (LIS)', 'Longest increasing subsequence (LIS)')}
      subtitle={tr('O(n²) DP와 O(n log n) 이분 탐색', 'O(n²) DP and O(n log n) binary search')}
    >
      <InfoSection n={1} title={tr('문제 정의', 'The problem')}>
        {lang === 'ko' ? (
          <p>수열에서 몇 개의 원소를 <strong>순서를 유지한 채</strong> 골라, 값이 <strong>엄격하게 증가</strong>하는 부분 수열 중 <strong>가장 긴 것</strong>의 길이(와 그 수열)를 구합니다.</p>
        ) : (
          <p>Pick elements from a sequence <strong>keeping their order</strong> so that the values are <strong>strictly increasing</strong>, and find the <strong>longest</strong> such subsequence (its length, and the subsequence itself).</p>
        )}
        <InfoCode caption={tr('예시: 백준 11053 예제', 'Example: BOJ 11053 sample')}>
          {'a = [10, 20, 10, 30, 20, 50]\n'}
          {tr('LIS = [10, 20, 30, 50] → 길이 4', 'LIS = [10, 20, 30, 50] → length 4')}
        </InfoCode>
      </InfoSection>

      <InfoSection n={2} title={tr('O(n²) DP', 'O(n²) DP')}>
        <InfoCode caption={tr('점화식', 'Recurrence')}>
          {'dp[i] = 1 + max(dp[j])  for j < i, a[j] < a[i]\n'}
          {tr('(그런 j가 없으면 dp[i] = 1)', '(dp[i] = 1 if no such j)')}
        </InfoCode>
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoCard tone="current" title={tr('dp[i]의 뜻', 'Meaning of dp[i]')}>
            {tr(
              'a[i]로 끝나는 가장 긴 증가 부분 수열의 길이예요. 답은 dp 전체의 최댓값입니다.',
              'The length of the longest increasing subsequence that ends at a[i]. The answer is the maximum over all dp.',
            )}
          </InfoCard>
          <InfoCard tone="path" title={tr('prev[]로 복원', 'Rebuild with prev[]')}>
            {tr(
              'dp[i]를 갱신할 때 어느 j 뒤에 붙였는지 prev[i]에 적어 두면, 최댓값 위치에서 거꾸로 따라가 수열을 얻어요.',
              'Whenever dp[i] improves, remember the j in prev[i]. Walking prev back from the maximum gives the subsequence.',
            )}
          </InfoCard>
        </div>
      </InfoSection>

      <InfoSection n={3} title={tr('O(n log n): tails + 이분 탐색', 'O(n log n): tails + binary search')}>
        {lang === 'ko' ? (
          <p><code className="font-mono">tails[k]</code>는 <strong>길이 k+1인 증가 수열이 끝날 수 있는 가장 작은 값</strong>이에요. tails는 항상 증가하므로, 새 원소 x가 들어갈 자리(x 이상인 첫 위치)를 <strong>이분 탐색</strong>으로 찾아 교체하거나 끝에 추가합니다. 최종 tails의 길이가 LIS의 길이예요.</p>
        ) : (
          <p><code className="font-mono">tails[k]</code> is <strong>the smallest value an increasing subsequence of length k+1 can end with</strong>. tails is always increasing, so each new x finds its slot (the first value ≥ x) by <strong>binary search</strong> and either replaces it or is appended. The final length of tails is the LIS length.</p>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoCard tone="danger" title={<span className="inline-flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" />{tr('tails는 LIS가 아니에요', 'tails is not an LIS')}</span>}>
            {tr(
              '교체는 나중 원소가 앞자리에 들어가기도 해서, tails의 값을 그대로 읽으면 순서가 맞지 않을 수 있어요. 예: [3, 4, 1] → tails = [1, 4]지만 1 다음에 4는 올 수 없어요.',
              'Replacements can put a later element into an earlier slot, so reading tails directly may break the order. E.g. [3, 4, 1] → tails = [1, 4], yet 4 never comes after 1.',
            )}
          </InfoCard>
          <InfoCard tone="path" title={tr('parent[]로 진짜 LIS 복원', 'Rebuild the real LIS with parent[]')}>
            {tr(
              'x를 위치 lo에 넣을 때 parent[i] = tails_idx[lo-1] (바로 앞 칸의 원소)로 기록해요. 마지막 칸의 원소에서 parent를 따라가면 올바른 LIS가 나와요.',
              'When x goes to slot lo, set parent[i] = tails_idx[lo-1] (the element in the slot before). Following parent from the last slot\'s element yields a valid LIS.',
            )}
          </InfoCard>
        </div>
      </InfoSection>

      <InfoSection n={4} title={tr('복잡도', 'Complexity')}>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">{tr('O(n²) DP', 'O(n²) DP')}</p>
            <ComplexityChips time="O(n²)" space="O(n)" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">{tr('tails + 이분 탐색', 'tails + binary search')}</p>
            <ComplexityChips
              time="O(n log n)"
              space="O(n)"
              note={tr(
                'n이 100만까지 커지는 백준 12015는 O(n log n) 방법이 필요해요.',
                'BOJ 12015 (n up to 1,000,000) needs the O(n log n) method.',
              )}
            />
          </div>
        </div>
      </InfoSection>
    </InfoModal>
  );
}
