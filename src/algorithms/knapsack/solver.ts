import { makeTr, type Lang } from '../../i18n';
import type { KnapsackInput, KnapsackStep } from './types';

type Cell = [number, number];

const snapshot = (dp: (number | null)[][]) => dp.map(row => [...row]);

/** Code lines of knapsack.py (see CodeViewer) */
export const KNAP_LINE = {
  INIT: 3, CONSIDER: 6, SKIP_HEAVY: 8, SKIP_WORSE: 9, TAKE: 10,
  BT_START: 11, BT_SKIP: 13, BT_TAKE: 14, DONE: 16,
} as const;

/** 0/1 knapsack: fill dp[i][c] row by row, then walk back from (N, K). */
export function generateKnapsackSteps({ items, K }: KnapsackInput, lang: Lang = 'ko'): KnapsackStep[] {
  const tr = makeTr(lang);
  const N = items.length;
  const dp: (number | null)[][] = Array.from({ length: N + 1 }, (_, i) =>
    Array.from({ length: K + 1 }, () => (i === 0 ? 0 : null)));
  const steps: KnapsackStep[] = [];
  const base = { path: [] as Cell[], chosen: [] as number[], result: null };

  steps.push({
    ...base, type: 'INIT', codeLine: KNAP_LINE.INIT, dp: snapshot(dp), cell: null, deps: [], source: null,
    description: tr(
      `물건을 하나도 고르지 않으면 가치는 0이에요. 0행을 0으로 채우고 물건 ${N}개, 용량 ${K}로 시작해요.`,
      `With no items the value is 0, so row 0 is all zeros. Start with ${N} items and capacity ${K}.`,
    ),
  });

  for (let i = 1; i <= N; i++) {
    const { weight: w, value: v } = items[i - 1];
    for (let c = 0; c <= K; c++) {
      const skip = dp[i - 1][c] as number;
      const up: Cell = [i - 1, c];
      if (w > c) {
        dp[i][c] = skip;
        steps.push({
          ...base, type: 'SKIP', codeLine: KNAP_LINE.SKIP_HEAVY, dp: snapshot(dp), cell: [i, c], deps: [up], source: up,
          description: tr(
            `${i}번 물건(무게 ${w})은 용량 ${c}에 들어가지 않아요. 위 칸을 그대로 가져와요: dp[${i}][${c}] = ${skip}`,
            `Item ${i} (weight ${w}) does not fit in capacity ${c}. Copy the cell above: dp[${i}][${c}] = ${skip}`,
          ),
        });
        continue;
      }
      const left: Cell = [i - 1, c - w];
      const take = (dp[i - 1][c - w] as number) + v;
      const deps: Cell[] = [up, left];
      steps.push({
        ...base, type: 'CONSIDER', codeLine: KNAP_LINE.CONSIDER, dp: snapshot(dp), cell: [i, c], deps, source: null,
        description: tr(
          `${i}번 물건(무게 ${w}, 가치 ${v}), 용량 ${c}: 넣지 않으면 ${skip}, 넣으면 dp[${i - 1}][${c - w}] + ${v} = ${take}`,
          `Item ${i} (weight ${w}, value ${v}), capacity ${c}: skip gives ${skip}, take gives dp[${i - 1}][${c - w}] + ${v} = ${take}`,
        ),
      });
      if (take > skip) {
        dp[i][c] = take;
        steps.push({
          ...base, type: 'TAKE', codeLine: KNAP_LINE.TAKE, dp: snapshot(dp), cell: [i, c], deps, source: left,
          description: tr(
            `넣는 쪽이 더 커요 (${take} > ${skip}). dp[${i}][${c}] = ${take}`,
            `Taking it is better (${take} > ${skip}). dp[${i}][${c}] = ${take}`,
          ),
        });
      } else {
        dp[i][c] = skip;
        steps.push({
          ...base, type: 'SKIP', codeLine: KNAP_LINE.SKIP_WORSE, dp: snapshot(dp), cell: [i, c], deps, source: up,
          description: tr(
            `넣지 않는 쪽이 더 크거나 같아요 (${skip} ≥ ${take}). dp[${i}][${c}] = ${skip}`,
            `Skipping is at least as good (${skip} ≥ ${take}). dp[${i}][${c}] = ${skip}`,
          ),
        });
      }
    }
  }

  const val = (r: number, c: number) => dp[r][c] as number;
  const result = val(N, K);
  const path: Cell[] = [[N, K]];
  const chosen: number[] = [];
  let c = K;
  for (let i = N; i >= 1; i--) {
    let codeLine: number, description: string;
    if (val(i, c) !== val(i - 1, c)) {
      const { weight: w } = items[i - 1];
      chosen.unshift(i - 1);
      codeLine = KNAP_LINE.BT_TAKE;
      description = tr(
        `dp[${i}][${c}] = ${val(i, c)} ≠ dp[${i - 1}][${c}] = ${val(i - 1, c)}이므로 ${i}번 물건을 넣었어요. 용량을 ${w} 줄여 ${c - w}로 이동해요.`,
        `dp[${i}][${c}] = ${val(i, c)} ≠ dp[${i - 1}][${c}] = ${val(i - 1, c)}, so item ${i} was taken. Move to capacity ${c} − ${w} = ${c - w}.`,
      );
      c -= w;
    } else {
      codeLine = KNAP_LINE.BT_SKIP;
      description = tr(
        `dp[${i}][${c}] = dp[${i - 1}][${c}] = ${val(i, c)}이므로 ${i}번 물건은 넣지 않았어요. 바로 위로 이동해요.`,
        `dp[${i}][${c}] = dp[${i - 1}][${c}] = ${val(i, c)}, so item ${i} was not taken. Move straight up.`,
      );
    }
    path.push([i - 1, c]);
    steps.push({
      ...base, type: 'BACKTRACK', codeLine, dp: snapshot(dp), cell: [i - 1, c], deps: [], source: null,
      path: path.map(p => [...p] as Cell), chosen: [...chosen], result, description,
    });
  }

  const totalW = chosen.reduce((s, k) => s + items[k].weight, 0);
  const list = chosen.map(k => k + 1).join(', ');
  steps.push({
    ...base, type: 'DONE', codeLine: KNAP_LINE.DONE, dp: snapshot(dp), cell: null, deps: [], source: null,
    path, chosen, result,
    description: chosen.length > 0
      ? tr(
        `완료! 최대 가치 = ${result} (물건 ${list}, 총 무게 ${totalW} / ${K})`,
        `Done! Maximum value = ${result} (items ${list}, total weight ${totalW} / ${K})`,
      )
      : tr(`완료! 넣을 수 있는 물건이 없어 최대 가치 = 0`, `Done! Nothing fits, so the maximum value = 0`),
  });
  return steps;
}
