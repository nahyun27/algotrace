import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function BacktrackingProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 15649, title: 'N과 M (1)',     tier: 'Silver III', nLimit: 'M ≤ N ≤ 8', note: tr('백트래킹 입문: 순열 나열', 'Intro to backtracking: list permutations') },
        { id: 1182,  title: '부분수열의 합', tier: 'Silver II',  nLimit: 'N ≤ 20',    note: tr('고르거나 안 고르거나', 'Take it or leave it') },
        { id: 9663,  title: 'N-Queen',       tier: 'Gold IV',    nLimit: 'N < 15',    note: tr('열과 대각선 사용 여부로 가지치기', 'Prune with used columns and diagonals') },
        { id: 2580,  title: '스도쿠',        tier: 'Gold IV',    nLimit: '9×9',       note: tr('빈칸마다 1~9 시도', 'Try 1 to 9 in each blank') },
      ]}
    />
  );
}
