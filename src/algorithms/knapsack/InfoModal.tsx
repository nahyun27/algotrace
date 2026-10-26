import { Backpack } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoCode, ComplexityChips } from '../../components/algorithm/InfoModal';
import { useLang, useTr } from '../../i18n';

interface KnapsackInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function KnapsackInfoModal({ isOpen, onClose, onStartVisualization }: KnapsackInfoModalProps) {
  const tr = useTr();
  const { lang } = useLang();
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Backpack}
      title={tr('0/1 배낭 문제', '0/1 knapsack')}
      subtitle={tr('물건마다 넣거나 말거나, 두 가지 선택', 'Each item is either taken or left behind')}
    >
      <InfoSection n={1} title={tr('문제 정의', 'The problem')}>
        {lang === 'ko' ? (
          <p>무게 w와 가치 v를 가진 물건 N개가 있어요. 무게 합이 <strong>K 이하</strong>가 되도록 골랐을 때 <strong>가치 합의 최댓값</strong>을 구합니다. 물건은 쪼갤 수 없고 한 번씩만 쓸 수 있어요.</p>
        ) : (
          <p>There are N items, each with a weight w and a value v. Choose items with total weight <strong>at most K</strong> to get the <strong>largest total value</strong>. Items cannot be split and each can be used once.</p>
        )}
        <InfoCode caption={tr('예시 (BOJ 12865)', 'Example (BOJ 12865)')}>
          {'K = 7, (w, v) = (6, 13) (4, 8) (3, 6) (5, 12)\n'}
          {tr('답: 물건 2 + 3 → 무게 7, 가치 14', 'Answer: items 2 + 3 → weight 7, value 14')}
        </InfoCode>
      </InfoSection>

      <InfoSection n={2} title={tr('핵심 아이디어', 'Key ideas')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoCard tone="current" title={tr('dp[i][c]의 뜻', 'What dp[i][c] means')}>
            {tr('앞의 i개 물건만 써서 용량 c 안에 담을 수 있는 최대 가치예요. 0행은 물건이 없으니 모두 0입니다.',
              'The best value using only the first i items with capacity c. Row 0 has no items, so it is all zeros.')}
          </InfoCard>
          <InfoCard tone="candidate" title={tr('두 후보', 'Two candidates')}>
            {tr('물건 i를 넣지 않으면 바로 위 dp[i-1][c], 넣으면 w만큼 왼쪽 위 dp[i-1][c-w] + v. 둘 중 큰 값을 고릅니다.',
              'Skip item i: the cell above, dp[i-1][c]. Take it: dp[i-1][c-w] + v, w columns to the left. Keep the larger one.')}
          </InfoCard>
        </div>
        <InfoCode caption={tr('점화식', 'Recurrence')}>
          {'dp[i][c] = max(dp[i-1][c],              # skip\n               dp[i-1][c-w_i] + v_i)    # take, if w_i <= c'}
        </InfoCode>
        <p className="text-muted-foreground text-[13px]">
          {tr('표를 다 채운 뒤 (N, K)에서 위로 올라가며 값이 바뀐 행의 물건을 고르면 실제 선택을 복원할 수 있어요.',
            'After filling the table, walk up from (N, K). Wherever the value changes between rows, that item was taken.')}
        </p>
      </InfoSection>

      <InfoSection n={3} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(NK)"
          space="O(NK)"
          note={tr('최댓값만 필요하면 1차원 배열을 c를 큰 쪽부터 갱신해 O(K) 공간으로 풀 수 있어요. K에 비례하므로 K가 아주 크면 다른 방법이 필요해요.',
            'If you only need the value, a 1-D array updated from high c to low c uses O(K) space. The cost grows with K, so a huge K needs another approach.')}
        />
      </InfoSection>
    </InfoModal>
  );
}
