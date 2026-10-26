import ProblemList from '../../components/algorithm/ProblemList';
import { useTr } from '../../i18n';

export default function LCAProblemList() {
  const tr = useTr();
  return (
    <ProblemList
      problems={[
        { id: 11437, title: 'LCA',         tier: 'Gold III',     nLimit: 'N ≤ 50,000',  note: tr('기본 LCA (단순 올라가기로도 통과)', 'Basic LCA (naive climbing also passes)') },
        { id: 11438, title: 'LCA 2',       tier: 'Platinum V',   nLimit: 'N ≤ 100,000', note: tr('희소 배열 binary lifting 필수', 'Needs binary lifting') },
        { id: 3176,  title: '도로 네트워크', tier: 'Platinum IV', nLimit: 'N ≤ 100,000', note: tr('up 표에 구간 최소·최대 길이도 함께 저장', 'Store min and max edge lengths next to up[k][v]') },
      ]}
    />
  );
}
