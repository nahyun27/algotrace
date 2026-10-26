import type { SortAlgorithm, SortStep } from './types';
import { DISTRIBUTION_SORTS } from './types';
import type { VizState } from '../../components/viz/palette';
import ArrayView from '../../components/viz/ArrayView';
import { useTr } from '../../i18n';

interface Props {
  step: SortStep;
  algorithm?: SortAlgorithm;
}

function getBarState(idx: number, step: SortStep): VizState {
  if (step.sorted.includes(idx)) return 'visited';
  if (step.swapping.includes(idx)) return 'danger';
  if (step.pivot === idx) return 'current';
  if (step.comparing.includes(idx)) return 'candidate';
  return 'idle';
}

export default function ArrayCanvas({ step, algorithm }: Props) {
  const tr = useTr();
  const distribution = !!algorithm && DISTRIBUTION_SORTS.includes(algorithm);
  return (
    <ArrayView
      values={step.array}
      variant="bars"
      stateOf={idx => getBarState(idx, step)}
      range={distribution ? step.activeRange : undefined}
      legend={
        distribution
          ? [
              { state: 'current', label: tr('처리 중인 원소', 'Element being processed'), kind: 'cell' },
              ...(algorithm === 'radix' ? [{ state: 'candidate' as const, label: tr('방금 꺼낸 원소', 'Just collected'), kind: 'cell' as const }] : []),
              { state: 'visited', label: tr('정렬 완료', 'Sorted'), kind: 'cell' },
              { state: 'idle', label: tr('대기', 'Waiting'), kind: 'cell' },
            ]
          : [
              { state: 'candidate', label: tr('비교 중', 'Comparing'), kind: 'cell' },
              { state: 'danger', label: tr('교환 / 이동', 'Swap / shift'), kind: 'cell' },
              { state: 'current', label: tr('피벗', 'Pivot'), kind: 'cell' },
              { state: 'visited', label: tr('정렬 완료', 'Sorted'), kind: 'cell' },
              { state: 'idle', label: tr('미정렬', 'Unsorted'), kind: 'cell' },
            ]
      }
    />
  );
}
