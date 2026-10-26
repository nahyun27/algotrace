import type { FloydWarshallStep } from './types';
import { INF, FW_N } from './types';
import { Badge, Panel, cn } from '../../components/ui';
import { toneSoft, toneBorder, toneText } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface Props {
  step: FloydWarshallStep;
}

const iStr = (v: number) => (v >= INF ? '∞' : String(v));

export default function FWDistMatrix({ step }: Props) {
  const tr = useTr();
  const { distMatrix, currentK, currentI, currentJ, isUpdate, prevVal, newVal, type } = step;
  const N = FW_N;
  const isDone = type === 'DONE';
  const isNegCycle = type === 'NEGATIVE_CYCLE';
  const isRoundStart = type === 'ROUND_START';

  // Build formula string for current step
  const formula = (() => {
    if (currentK === null || currentI === null || currentJ === null) return null;
    const d_ik = distMatrix[currentI]?.[currentK];
    const d_kj = distMatrix[currentK]?.[currentJ];
    if (d_ik === undefined || d_kj === undefined) return null;
    if (prevVal === null || newVal === null) return null;
    const head = `dist[${currentI}][${currentJ}] = min(${iStr(prevVal)}, ${d_ik}+${d_kj})`;
    return isUpdate
      ? tr(`경유 노드 k=${currentK}: ${head} = ${newVal} 로 갱신`, `Via k=${currentK}: ${head} = ${newVal} — updated`)
      : tr(`경유 노드 k=${currentK}: ${head} = ${iStr(prevVal)}, 변화 없음`, `Via k=${currentK}: ${head} = ${iStr(prevVal)} — no change`);
  })();

  return (
    <div className="flex flex-col gap-3">
      {/* Formula / status banner */}
      {formula && (
        <div className={cn(
          'text-xs font-mono font-semibold px-4 py-2 rounded-xl border text-center transition-colors',
          isUpdate ? `${toneSoft.candidate} ${toneBorder.candidate}` : 'bg-muted border-border text-muted-foreground',
        )}>
          {formula}
        </div>
      )}
      {isRoundStart && currentK !== null && (
        <div className={cn('text-xs font-semibold px-4 py-2 rounded-xl border text-center', toneSoft.current, toneBorder.current)}>
          {tr(
            `경유 노드 k = ${currentK} 라운드 시작 — 파란색 행/열이 경유 노드에 해당합니다`,
            `Round k = ${currentK} begins — the blue row and column belong to intermediate node k`,
          )}
        </div>
      )}

      {/* Matrix table */}
      <Panel
        title={tr('거리 행렬 dist[i][j]', 'Distance matrix dist[i][j]')}
        actions={
          <>
            <Badge className="hidden sm:inline-flex">{tr('O(V³) 시간', 'O(V³) time')}</Badge>
            <Badge className="hidden sm:inline-flex">{tr('O(V²) 공간', 'O(V²) space')}</Badge>
            {currentK !== null && <Badge tone="current" outline>k = {currentK}</Badge>}
            {isNegCycle && <Badge tone="danger" outline>{tr('음수 사이클!', 'Negative cycle!')}</Badge>}
            {isDone && <Badge tone="visited" outline>{tr('완료', 'Done')}</Badge>}
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="text-sm w-full">
            <thead>
              <tr className="border-b border-border">
                {/* Top-left corner */}
                <th className="px-3 py-2 text-xs font-bold text-center min-w-[44px]">
                  <span className={toneText.candidate}>i</span>
                  <span className="text-hint">╲</span>
                  <span className={toneText.candidate}>j</span>
                </th>
                {Array.from({ length: N }, (_, j) => (
                  <th key={j} className={cn(
                    'px-3 py-2 text-center text-xs font-bold min-w-[52px] transition-colors',
                    j === currentK ? toneSoft.current : 'text-muted-foreground',
                  )}>
                    {j}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {distMatrix.map((row, i) => {
                const isKRow = i === currentK;
                return (
                  <tr key={i} className={cn('border-t border-border', isKRow && 'bg-state-current/5')}>
                    {/* Row header */}
                    <td className={cn(
                      'px-3 py-2.5 text-center text-xs font-bold border-r border-border transition-colors',
                      isKRow ? toneSoft.current : 'text-muted-foreground',
                    )}>
                      {i}
                    </td>
                    {row.map((val, j) => {
                      const isDiag = i === j;
                      const isActiveCell = i === currentI && j === currentJ;
                      const isKCol = j === currentK;

                      let cellClass = '';
                      let textClass = '';

                      if (isDiag) {
                        cellClass = isNegCycle && val < 0 ? toneSoft.danger : 'bg-muted';
                        textClass = isNegCycle && val < 0 ? '' : 'text-hint';
                      } else if (isActiveCell && isUpdate) {
                        cellClass = `${toneSoft.candidate} ring-2 ring-inset ring-state-candidate/60`;
                      } else if (isActiveCell) {
                        cellClass = 'ring-2 ring-inset ring-state-candidate/50';
                        textClass = toneText.candidate;
                      } else if (isDone && val < INF) {
                        cellClass = toneSoft.visited;
                      } else if (isNegCycle) {
                        cellClass = toneSoft.danger;
                      } else if (isKRow || isKCol) {
                        cellClass = 'bg-state-current/8';
                        textClass = val >= INF ? 'text-hint' : '';
                      } else {
                        textClass = val >= INF ? 'text-hint' : '';
                      }

                      return (
                        <td key={j}
                          className={cn('px-3 py-2.5 text-center border-l border-border transition-colors duration-300', cellClass)}>
                          <div className="flex flex-col items-center">
                            <span className={cn('font-mono font-bold text-sm', textClass)}>{iStr(val)}</span>
                            {/* Show prev value crossed out for updated cell */}
                            {isActiveCell && isUpdate && prevVal !== null && (
                              <span className="text-[11px] text-muted-foreground line-through font-mono">
                                {iStr(prevVal)}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Negative cycle warning */}
      {isNegCycle && (
        <div className={cn('rounded-2xl border p-4 text-sm', toneSoft.danger, toneBorder.danger)}>
          <div className="font-bold mb-1">{tr('⚠️ 음수 사이클 감지됨', '⚠️ Negative cycle detected')}</div>
          <p className="text-[13px] leading-relaxed">
            {tr(
              '대각선 dist[i][i] < 0인 노드가 존재합니다. 해당 노드를 포함하는 사이클의 가중치 합이 음수입니다. 이 경우 최단 경로가 -∞로 수렴하므로 정의되지 않습니다.',
              'Some diagonal entry dist[i][i] is below 0, meaning a cycle through that node has a negative total weight. Distances would drop toward -∞, so shortest paths are undefined.',
            )}
          </p>
        </div>
      )}

      {/* Done hint */}
      {isDone && (
        <div className={cn('rounded-2xl border p-3 text-[13px] font-medium text-center', toneSoft.visited, toneBorder.visited)}>
          {tr(
            '모든 쌍 최단거리 계산 완료 — 위의 경로 탐색에서 출발·도착 노드를 골라 최단 경로를 확인하세요',
            'All-pairs shortest distances are ready — choose From and To in the path finder above to see the route',
          )}
        </div>
      )}
    </div>
  );
}
