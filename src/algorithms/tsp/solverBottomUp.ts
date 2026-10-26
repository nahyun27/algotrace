import { type TSPStep, INF, CITIES, W as DEFAULT_W } from './shared';
import { makeTr, type Lang } from '../../i18n';

export function generateTSPStepsBottomUp(
  W: number[][] = DEFAULT_W,
  N: number = CITIES,
  lang: Lang = 'ko',
): TSPStep[] {
  const tr = makeTr(lang);
  const bin = (m: number) => m.toString(2).padStart(N, '0');
  const steps: TSPStep[] = [];
  const dp: number[][] = Array.from({ length: 1 << N }, () => Array(N).fill(INF));
  const cloneDP = () => dp.map(row => [...row]);

  dp[1][0] = 0;
  steps.push({
    type: 'INIT',
    mask: 1, currentCity: 0, nextCity: null, edgeWeight: null,
    dpTable: cloneDP(), activeEdge: null,
    description: tr(`초기식: dp[${bin(1)}][0] = 0 (시작 도시)`, `Base case: dp[${bin(1)}][0] = 0 (start city)`),
    isImprovement: true, codeLine: 1
  });

  for (let mask = 1; mask < (1 << N); mask++) {
    if ((mask & 1) === 0) continue;

    for (let i = 0; i < N; i++) {
       if ((mask & (1 << i)) === 0) continue;

       const prevMask = mask ^ (1 << i);
       if (prevMask === 0) continue; // Base case already set

       steps.push({
         type: 'STATE',
         mask, currentCity: i, nextCity: null, edgeWeight: null, dpTable: cloneDP(),
         activeEdge: null,
         description: tr(
           `dp[${bin(mask)}][${i}]를 구하기 위해 이전 상태들 탐색`,
           `Check the previous states to compute dp[${bin(mask)}][${i}]`,
         ),
         isImprovement: false, codeLine: 5
       });

       for (let j = 0; j < N; j++) {
          if (j !== i && (prevMask & (1 << j)) !== 0 && W[j][i] !== 0) {
             const costFromJ = dp[prevMask][j];
             if (costFromJ === INF) continue;

             steps.push({
               type: 'MOVE',
               mask: prevMask, currentCity: j, nextCity: i, edgeWeight: W[j][i], dpTable: cloneDP(),
               activeEdge: [j, i],
               description: tr(
                 `도시 ${j}에서 ${i}로 이동 (비용: dp[${bin(prevMask)}][${j}]+${W[j][i]} = ${costFromJ + W[j][i]})`,
                 `Move from city ${j} to ${i} (cost: dp[${bin(prevMask)}][${j}] + ${W[j][i]} = ${costFromJ + W[j][i]})`,
               ),
               isImprovement: false, codeLine: 10
             });

             const res = costFromJ + W[j][i];
             const improved = res < dp[mask][i];
             if (improved) dp[mask][i] = res;

             steps.push({
               type: 'UPDATE',
               mask, currentCity: i, nextCity: null, edgeWeight: null, dpTable: cloneDP(),
               activeEdge: [j, i],
               description: tr(
                 `전이 완료. dp[${bin(mask)}][${i}] 값 갱신: ${improved ? `예 (${res})` : '아니오'}`,
                 `Transition done. dp[${bin(mask)}][${i}] ${improved ? `updated to ${res}` : 'unchanged'}`,
               ),
               isImprovement: improved, codeLine: 11
             });
          }
       }
    }
  }

  const finalMask = (1 << N) - 1;
  steps.push({
    type: 'RETURN',
    mask: finalMask, currentCity: 0, nextCity: null, edgeWeight: null, dpTable: cloneDP(),
    activeEdge: null,
    description: tr(
      `모든 도시를 방문한 상태(${bin(finalMask)})에서 출발점(0)으로 돌아가는 최소 비용 계산`,
      `From the all-visited state (${bin(finalMask)}), compute the cheapest way back to the start (0)`,
    ),
    isImprovement: false, codeLine: 14
  });

  let ans = INF;
  let bestLastCity = -1;
  for (let i = 1; i < N; i++) {
    if (dp[finalMask][i] !== INF && W[i][0] !== 0) {
      const total = dp[finalMask][i] + W[i][0];
      steps.push({
        type: 'RETURN',
        mask: finalMask, currentCity: i, nextCity: 0, edgeWeight: W[i][0], dpTable: cloneDP(),
        activeEdge: [i, 0],
        description: tr(
          `마지막 도시 ${i}에서 0으로 귀환 (비용: ${dp[finalMask][i]} + ${W[i][0]} = ${total})`,
          `Return from last city ${i} to 0 (cost: ${dp[finalMask][i]} + ${W[i][0]} = ${total})`,
        ),
        isImprovement: false, codeLine: 16
      });

      if (total < ans) {
        ans = total;
        bestLastCity = i;
        steps.push({
          type: 'BEST',
          mask: finalMask, currentCity: 0, nextCity: null, edgeWeight: W[i][0], dpTable: cloneDP(),
          activeEdge: [i, 0],
          description: tr(`최종 순회 비용 최솟값 갱신: ${ans}`, `New best tour cost: ${ans}`),
          isImprovement: true, codeLine: 17
        });
      }
    }
  }

  steps.push({
    type: 'DONE',
    mask: finalMask, currentCity: 0, nextCity: null, edgeWeight: null, dpTable: cloneDP(),
    activeEdge: bestLastCity !== -1 ? [bestLastCity, 0] : null,
    description: tr(
      `종료. 최종 최소 순회 비용: ${ans === INF ? '도달 불가' : ans}`,
      `Done. Minimum tour cost: ${ans === INF ? 'unreachable' : ans}`,
    ),
    isImprovement: true, codeLine: 18
  });

  return steps;
}
