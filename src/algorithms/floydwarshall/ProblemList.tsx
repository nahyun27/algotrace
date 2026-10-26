import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function FWProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 11404, title: '플로이드',                 tier: 'Gold IV',  nLimit: 'N ≤ 100', note: tr('기본 구현', 'Basic implementation') },
        { id: 11403, title: '경로 찾기',                tier: 'Silver I', nLimit: 'N ≤ 100', note: tr('연결 여부 (dist 대신 bool)', 'Reachability (bool instead of dist)') },
        { id: 1389,  title: '케빈 베이컨의 6단계 법칙', tier: 'Silver I', nLimit: 'N ≤ 100', note: tr('거리 합 최소화', 'Minimize the sum of distances') },
        { id: 11780, title: '플로이드 2',               tier: 'Gold II',  nLimit: 'N ≤ 100', note: tr('경로 추적 포함', 'Includes path reconstruction') },
      ]}
    />
  );
}
