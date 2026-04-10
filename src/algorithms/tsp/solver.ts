export interface TSPStep {
  mask: number;
  currentCity: number;
  nextCity: number | null;
  edgeWeight: number | null;
  dpTable: number[][];
  activeEdge: [number, number] | null;
  description: string;
  isImprovement: boolean;
  codeLine: number;
}

export const INF = 1e9;
export const CITIES = 4;

// Directed asymmetric graph for TSP
export const W = [
  [0, 10, 15, 20],
  [5,  0,  9, 10],
  [6, 13,  0, 12],
  [8,  8,  9,  0]
];

export function generateTSPSteps(): TSPStep[] {
  const steps: TSPStep[] = [];
  const N = CITIES;
  const dp: number[][] = Array.from({ length: 1 << N }, () => Array(N).fill(INF));
  
  const cloneDP = () => dp.map(row => [...row]);

  function solve(mask: number, curr: number): number {
    steps.push({
      mask, currentCity: curr, nextCity: null, edgeWeight: null, dpTable: cloneDP(),
      activeEdge: null, description: `dfs(mask=${mask.toString(2).padStart(N, '0')}, curr=${curr}) 호출됨`,
      isImprovement: false, codeLine: 1
    });

    if (mask === (1 << N) - 1) {
      const w = W[curr][0] || INF;
      const returnVal = w === 0 ? INF : w;
      steps.push({
        mask, currentCity: curr, nextCity: 0, edgeWeight: w, dpTable: cloneDP(),
        activeEdge: [curr, 0], description: `모든 도시 방문 완료. 시작 도시(0)로 귀환 가중치: ${w}`,
        isImprovement: false, codeLine: 3
      });
      return returnVal;
    }

    if (dp[mask][curr] !== INF) {
      steps.push({
        mask, currentCity: curr, nextCity: null, edgeWeight: null, dpTable: cloneDP(),
        activeEdge: null, description: `이미 계산된 상태 (Memoization): dp[${mask.toString(2).padStart(N, '0')}][${curr}] = ${dp[mask][curr]}`,
        isImprovement: false, codeLine: 6
      });
      return dp[mask][curr];
    }

    steps.push({
      mask, currentCity: curr, nextCity: null, edgeWeight: null, dpTable: cloneDP(),
      activeEdge: null, description: `방문하지 않은 도시들에 대해 재귀 탐색 시작`,
      isImprovement: false, codeLine: 8
    });

    let ans = INF;
    for (let nxt = 0; nxt < N; nxt++) {
      if ((mask & (1 << nxt)) === 0 && W[curr][nxt] !== 0) {
        steps.push({
          mask, currentCity: curr, nextCity: nxt, edgeWeight: W[curr][nxt], dpTable: cloneDP(),
          activeEdge: [curr, nxt], description: `도시 ${nxt}(으)로 진행 확정 (가중치 ${W[curr][nxt]})`,
          isImprovement: false, codeLine: 11
        });

        const res = solve(mask | (1 << nxt), nxt) + W[curr][nxt];
        const improved = res < ans;
        if (improved) ans = res;

        steps.push({
          mask, currentCity: curr, nextCity: nxt, edgeWeight: W[curr][nxt], dpTable: cloneDP(),
          activeEdge: [curr, nxt], description: `도시 ${nxt} 탐색 후 최소 비용 갱신 여부: ${improved ? '갱신됨' : '유지'} (${res})`,
          isImprovement: improved, codeLine: improved ? 13 : 12
        });
      }
    }

    dp[mask][curr] = ans;
    steps.push({
      mask, currentCity: curr, nextCity: null, edgeWeight: null, dpTable: cloneDP(),
      activeEdge: null, description: `dp[${mask.toString(2).padStart(N, '0')}][${curr}] = ${ans === INF ? 'INF' : ans} 저장 후 반환`,
      isImprovement: true, codeLine: 15
    });

    return ans;
  }

  solve(1, 0);

  return steps;
}
