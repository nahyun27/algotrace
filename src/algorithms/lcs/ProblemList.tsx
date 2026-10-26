import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function LCSProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 9251,  title: 'LCS',       tier: 'Gold V',   nLimit: '|A|, |B| ≤ 1,000', note: tr('LCS 길이 구하기', 'Length of the LCS') },
        { id: 9252,  title: 'LCS 2',     tier: 'Gold IV',  nLimit: '|A|, |B| ≤ 1,000', note: tr('역추적으로 LCS 문자열 출력', 'Print the LCS by backtracking') },
        { id: 15483, title: '최소 편집', tier: 'Gold III', nLimit: '|A|, |B| ≤ 1,000', note: tr('편집 거리 (레벤슈타인)', 'Edit distance (Levenshtein)') },
      ]}
    />
  );
}
