import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function TrieProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 14425, title: '문자열 집합',   tier: 'Silver IV', nLimit: 'N, M ≤ 10,000', note: tr('단어 찾기 (search)', 'Whole-word lookup (search)') },
        { id: 14426, title: '접두사 찾기',   tier: 'Silver I',  nLimit: 'N, M ≤ 10,000', note: tr('접두사 찾기 (starts with)', 'Prefix lookup (starts with)') },
        { id: 5052,  title: '전화번호 목록', tier: 'Gold IV',   nLimit: 'n ≤ 10,000',    note: tr('단어 끝을 지나치면 일관성 없음', 'Inconsistent if a walk passes a word end') },
      ]}
    />
  );
}
