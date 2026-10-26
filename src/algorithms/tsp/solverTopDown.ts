import { type TSPStep, INF, CITIES, W as DEFAULT_W } from './shared';
import { makeTr, type Lang } from '../../i18n';

export function generateTSPStepsTopDown(
  W: number[][] = DEFAULT_W,
  N: number = CITIES,
  lang: Lang = 'ko',
): TSPStep[] {
  const tr = makeTr(lang);
  const bin = (m: number) => m.toString(2).padStart(N, '0');
  const steps: TSPStep[] = [];
  const dp: number[][] = Array.from({ length: 1 << N }, () => Array(N).fill(INF));

  const cloneDP = () => dp.map(row => [...row]);

  function solve(mask: number, curr: number): number {
    steps.push({
      type: 'CALL',
      mask, currentCity: curr, nextCity: null, edgeWeight: null, dpTable: cloneDP(),
      activeEdge: null,
      description: tr(`dfs(mask=${bin(mask)}, curr=${curr}) 호출됨`, `Call dfs(mask=${bin(mask)}, curr=${curr})`),
      isImprovement: false, codeLine: 1
    });

    if (mask === (1 << N) - 1) {
      const w = W[curr][0] || INF;
      const returnVal = w === 0 ? INF : w;
      dp[mask][curr] = returnVal;
      steps.push({
        type: 'BASE',
        mask, currentCity: curr, nextCity: 0, edgeWeight: w, dpTable: cloneDP(),
        activeEdge: [curr, 0],
        description: tr(
          `모든 도시 방문 완료. 시작 도시(0)로 귀환 가중치: ${w}`,
          `All cities visited. Weight of the return to start city (0): ${w}`,
        ),
        isImprovement: returnVal !== INF, codeLine: 3
      });
      return returnVal;
    }

    if (dp[mask][curr] !== INF) {
      steps.push({
        type: 'MEMO',
        mask, currentCity: curr, nextCity: null, edgeWeight: null, dpTable: cloneDP(),
        activeEdge: null,
        description: tr(
          `이미 계산된 상태 (Memoization): dp[${bin(mask)}][${curr}] = ${dp[mask][curr]}`,
          `Already computed (memoization): dp[${bin(mask)}][${curr}] = ${dp[mask][curr]}`,
        ),
        isImprovement: false, codeLine: 6
      });
      return dp[mask][curr];
    }

    steps.push({
      type: 'EXPLORE',
      mask, currentCity: curr, nextCity: null, edgeWeight: null, dpTable: cloneDP(),
      activeEdge: null,
      description: tr(`방문하지 않은 도시들에 대해 재귀 탐색 시작`, `Start recursing into the unvisited cities`),
      isImprovement: false, codeLine: 8
    });

    let ans = INF;
    for (let nxt = 0; nxt < N; nxt++) {
      if ((mask & (1 << nxt)) === 0 && W[curr][nxt] !== 0) {
        steps.push({
          type: 'MOVE',
          mask, currentCity: curr, nextCity: nxt, edgeWeight: W[curr][nxt], dpTable: cloneDP(),
          activeEdge: [curr, nxt],
          description: tr(
            `도시 ${nxt}(으)로 진행 확정 (가중치 ${W[curr][nxt]})`,
            `Go to city ${nxt} (weight ${W[curr][nxt]})`,
          ),
          isImprovement: false, codeLine: 11
        });

        const res = solve(mask | (1 << nxt), nxt) + W[curr][nxt];
        const improved = res < ans;
        if (improved) ans = res;

        steps.push({
          type: 'COMPARE',
          mask, currentCity: curr, nextCity: nxt, edgeWeight: W[curr][nxt], dpTable: cloneDP(),
          activeEdge: [curr, nxt],
          description: tr(
            `도시 ${nxt} 탐색 후 최소 비용 갱신 여부: ${improved ? '갱신됨' : '유지'} (${res})`,
            `Back from city ${nxt}: minimum cost ${improved ? 'updated' : 'kept'} (${res})`,
          ),
          isImprovement: improved, codeLine: improved ? 13 : 12
        });
      }
    }

    dp[mask][curr] = ans;
    const isRoot = mask === 1 && curr === 0;
    const ansStr = ans === INF ? 'INF' : String(ans);
    steps.push({
      type: isRoot ? 'DONE' : 'SAVE',
      mask, currentCity: curr, nextCity: null, edgeWeight: null, dpTable: cloneDP(),
      activeEdge: null,
      description: isRoot
        ? tr(
            `dp[${bin(mask)}][${curr}] = ${ansStr} 저장 후 반환 — 최소 순회 비용이에요`,
            `Store dp[${bin(mask)}][${curr}] = ${ansStr} and return — this is the minimum tour cost`,
          )
        : tr(
            `dp[${bin(mask)}][${curr}] = ${ansStr} 저장 후 반환`,
            `Store dp[${bin(mask)}][${curr}] = ${ansStr} and return`,
          ),
      isImprovement: true, codeLine: 15
    });

    return ans;
  }

  solve(1, 0);

  return steps;
}
