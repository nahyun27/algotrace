import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function ZeroOneBFSProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 1261,  title: '알고스팟',    tier: 'Gold IV', nLimit: 'N, M ≤ 100',  note: tr('빈 칸 0, 벽 1 (이 페이지의 문제)', 'Empty 0, wall 1 (the problem on this page)') },
        { id: 13549, title: '숨바꼭질 3',  tier: 'Gold V',  nLimit: 'N, K ≤ 100,000', note: tr('순간이동 0초, 걷기 1초', 'Teleport costs 0 s, walking 1 s') },
        { id: 2665,  title: '미로만들기',  tier: 'Gold IV', nLimit: 'n ≤ 50',     note: tr('검은 방을 흰 방으로 바꾸는 최소 횟수', 'Fewest black rooms to turn white') },
      ]}
    />
  );
}
