import type { SortStep } from './types';
import type { VizState } from '../../components/viz/palette';
import ArrayView from '../../components/viz/ArrayView';
import { useTr } from '../../i18n';

interface Props {
  step: SortStep;
}

function getBarState(idx: number, step: SortStep): VizState {
  if (step.sorted.includes(idx)) return 'visited';
  if (step.swapping.includes(idx)) return 'danger';
  if (step.pivot === idx) return 'current';
  if (step.comparing.includes(idx)) return 'candidate';
  return 'idle';
}

export default function ArrayCanvas({ step }: Props) {
  const tr = useTr();
  return (
    <ArrayView
      values={step.array}
      variant="bars"
      stateOf={idx => getBarState(idx, step)}
      legend={[
        { state: 'candidate', label: tr('비교 중', 'Comparing'), kind: 'cell' },
        { state: 'danger', label: tr('교환 / 이동', 'Swap / shift'), kind: 'cell' },
        { state: 'current', label: tr('피벗', 'Pivot'), kind: 'cell' },
        { state: 'visited', label: tr('정렬 완료', 'Sorted'), kind: 'cell' },
        { state: 'idle', label: tr('미정렬', 'Unsorted'), kind: 'cell' },
      ]}
    />
  );
}
