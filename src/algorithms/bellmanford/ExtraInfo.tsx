import type { BellmanFordStep } from './types';
import { Badge, Panel } from '../../components/ui';
import { InfoCard } from '../../components/algorithm/InfoModal';
import { useTr } from '../../i18n';

interface Props {
  step: BellmanFordStep;
}

export default function BFExtraInfo({ step }: Props) {
  const tr = useTr();
  const { type, roundUpdatesHistory, totalRounds } = step;
  const totalUpdates = roundUpdatesHistory.reduce((a, b) => a + b, 0);
  const stoppedEarly = type === 'DONE' && roundUpdatesHistory.length < totalRounds;

  return (
    <div className="flex flex-col gap-4">
      <Panel
        title={tr('진행 요약', 'Progress')}
        bodyClassName="p-4 flex flex-wrap gap-2"
      >
        <Badge tone="current">{tr(`완료한 라운드 ${roundUpdatesHistory.length} / ${totalRounds}`, `Rounds done: ${roundUpdatesHistory.length} / ${totalRounds}`)}</Badge>
        <Badge tone="candidate">{tr(`총 갱신 ${totalUpdates}회`, `${totalUpdates} update${totalUpdates === 1 ? '' : 's'} total`)}</Badge>
        {stoppedEarly && <Badge tone="visited">{tr('조기 종료', 'Stopped early')}</Badge>}
        {type === 'NEGATIVE_CYCLE' && <Badge tone="danger">{tr('음수 사이클', 'Negative cycle')}</Badge>}
      </Panel>

      <Panel title={tr('다익스트라 vs 벨만-포드', 'Dijkstra vs Bellman-Ford')} bodyClassName="p-4 flex flex-col gap-3">
        <InfoCard tone="candidate" title={tr('다익스트라', 'Dijkstra')}>
          {tr(
            '그리디 방식이라 음수 간선이 있으면 틀린 결과를 낼 수 있습니다.',
            'Being greedy, it can give wrong answers when negative edges exist.',
          )}
        </InfoCard>
        <InfoCard tone="current" title={tr('벨만-포드', 'Bellman-Ford')}>
          {tr(
            '모든 간선을 V-1번 반복 완화하여 음수 간선도 올바르게 처리합니다. O(VE)',
            'Relaxes every edge V-1 times, so negative edges are handled correctly. O(VE)',
          )}
        </InfoCard>
      </Panel>
    </div>
  );
}
