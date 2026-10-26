import { GitCompareArrows } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoCode, ComplexityChips } from '../../components/algorithm/InfoModal';
import { useLang, useTr } from '../../i18n';
import type { LCSMode } from './types';

interface LCSInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
  mode: LCSMode;
}

export default function LCSInfoModal({ isOpen, onClose, onStartVisualization, mode }: LCSInfoModalProps) {
  const tr = useTr();
  const { lang } = useLang();
  const isLcs = mode === 'lcs';
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={GitCompareArrows}
      title={isLcs ? tr('최장 공통 부분 수열 (LCS)', 'Longest common subsequence (LCS)') : tr('편집 거리 (레벤슈타인)', 'Edit distance (Levenshtein)')}
      subtitle={tr('두 문자열을 비교하는 2차원 DP', 'Two-dimensional DP over a pair of strings')}
    >
      <InfoSection n={1} title={tr('문제 정의', 'The problem')}>
        {isLcs ? (
          lang === 'ko' ? (
            <p>두 문자열 A, B에서 순서를 지키며 골라낸 문자들이 같은 <strong>공통 부분 수열</strong> 중 <strong>가장 긴 것의 길이</strong>를 구합니다. 연속할 필요는 없어요.</p>
          ) : (
            <p>Find the <strong>length of the longest subsequence</strong> common to strings A and B. Characters are picked in order but need not be contiguous.</p>
          )
        ) : lang === 'ko' ? (
          <p>문자 하나를 <strong>삽입 · 삭제 · 교체</strong>하는 데 각각 비용 1이 들 때, A를 B로 바꾸는 <strong>최소 비용</strong>을 구합니다.</p>
        ) : (
          <p>With <strong>insert, delete and replace</strong> each costing 1, find the <strong>minimum cost</strong> to turn A into B.</p>
        )}
        <InfoCode caption={tr('예시', 'Example')}>
          {isLcs ? 'A = ACAYKP, B = CAPCAK  →  LCS = ACAK (4)' : 'kitten → sitten → sittin → sitting  (3)'}
        </InfoCode>
      </InfoSection>

      <InfoSection n={2} title={tr('핵심 아이디어', 'Key ideas')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoCard tone="current" title={tr('dp[i][j]의 뜻', 'What dp[i][j] means')}>
            {isLcs
              ? tr('A의 앞 i글자와 B의 앞 j글자의 LCS 길이예요. 0행 · 0열은 빈 문자열이라 0입니다.',
                'The LCS length of the first i characters of A and the first j of B. Row 0 and column 0 are the empty string, so 0.')
              : tr('A의 앞 i글자를 B의 앞 j글자로 바꾸는 최소 비용이에요. dp[i][0] = i, dp[0][j] = j.',
                'The minimum cost to turn the first i characters of A into the first j of B. dp[i][0] = i, dp[0][j] = j.')}
          </InfoCard>
          <InfoCard tone="candidate" title={tr('세 이웃 (↖ ↑ ←)', 'Three neighbours (↖ ↑ ←)')}>
            {isLcs
              ? tr('글자가 같으면 대각선 + 1, 다르면 위와 왼쪽 중 큰 값. 칸을 왼쪽 위에서부터 채우면 필요한 값이 항상 준비돼 있어요.',
                'Equal characters: diagonal + 1. Otherwise the larger of up and left. Filling from the top-left guarantees those cells are ready.')
              : tr('대각선은 교체(같으면 그대로), 위는 A의 글자 삭제, 왼쪽은 B의 글자 삽입이에요. 가장 싼 쪽 + 1.',
                'Diagonal = replace (free when equal), up = delete from A, left = insert from B. Take the cheapest + 1.')}
          </InfoCard>
        </div>
        <InfoCode caption={tr('점화식', 'Recurrence')}>
          {isLcs
            ? 'dp[i][j] = dp[i-1][j-1] + 1               if A[i] == B[j]\n         = max(dp[i-1][j], dp[i][j-1])    otherwise'
            : 'dp[i][j] = dp[i-1][j-1]                   if A[i] == B[j]\n         = 1 + min(dp[i-1][j-1],          # replace\n                   dp[i-1][j],            # delete\n                   dp[i][j-1])            # insert'}
        </InfoCode>
        <p className="text-muted-foreground text-[13px]">
          {isLcs
            ? tr('(n, m)에서 출발해 값을 만든 칸을 거꾸로 따라가면(역추적) 실제 LCS 문자열을 얻을 수 있어요.',
              'Walking back from (n, m) along the cells that produced each value (backtracking) recovers an actual LCS.')
            : tr('(n, m)에서 최솟값을 준 칸을 거꾸로 따라가면 실제 편집 순서를 얻을 수 있어요.',
              'Walking back from (n, m) along the cells that gave the minimum recovers an actual sequence of edits.')}
        </p>
      </InfoSection>

      <InfoSection n={3} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(nm)"
          space="O(nm)"
          note={tr('값만 필요하면 두 행만 유지해 공간을 O(m)으로 줄일 수 있어요. 역추적하려면 전체 표가 필요해요.',
            'If you only need the value, keep two rows for O(m) space. Backtracking needs the full table.')}
        />
      </InfoSection>
    </InfoModal>
  );
}
