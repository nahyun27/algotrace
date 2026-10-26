import type { FloydWarshallStep } from './types';
import { INF, FW_N, FW_EDGES } from './types';
import { makeTr, type Lang } from '../../i18n';

export function generateFloydWarshallSteps(
  lang: Lang = 'ko',
  input: { n: number; edges: [number, number, number][] } = { n: FW_N, edges: FW_EDGES },
): FloydWarshallStep[] {
  const tr = makeTr(lang);
  const N = input.n;
  const EDGES = input.edges;
  const steps: FloydWarshallStep[] = [];

  // Initialize dist matrix: 0 on diagonal, INF elsewhere
  const dist: number[][] = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => (i === j ? 0 : INF)),
  );
  const next: (number | null)[][] = Array.from({ length: N }, () =>
    Array(N).fill(null),
  );

  // Fill direct edges
  for (const [u, v, w] of EDGES) {
    dist[u][v] = w;
    next[u][v] = v;
  }

  const cloneDist = (): number[][] => dist.map(row => [...row]);
  const cloneNext = (): (number | null)[][] => next.map(row => [...row]);
  const iStr = (v: number) => (v >= INF ? '∞' : String(v));

  // ── INIT ────────────────────────────────────────────────────────────────
  steps.push({
    type: 'INIT',
    description: tr(
      '초기화: 직접 연결된 간선으로 dist 행렬 설정. 나머지는 ∞, 대각선은 0.',
      'Init: fill the dist matrix with direct edges. Everything else is ∞, the diagonal is 0.',
    ),
    distMatrix: cloneDist(),
    nextMatrix: cloneNext(),
    currentK: null, currentI: null, currentJ: null,
    isUpdate: false, prevVal: null, newVal: null,
    hasNegCycle: false, codeLine: 5,
  });

  // ── 3중 for문 ────────────────────────────────────────────────────────────
  for (let k = 0; k < N; k++) {
    steps.push({
      type: 'ROUND_START',
      description: tr(
        `경유 노드 k = ${k} 로 모든 노드 쌍의 경로 갱신 시작.`,
        `Intermediate node k = ${k}: try to improve every pair through it.`,
      ),
      distMatrix: cloneDist(),
      nextMatrix: cloneNext(),
      currentK: k, currentI: null, currentJ: null,
      isUpdate: false, prevVal: null, newVal: null,
      hasNegCycle: false, codeLine: 14,
    });

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i === j) {
          // The diagonal only changes when i lies on a negative cycle through k.
          // Update it silently so the negative-cycle check below can fire.
          if (dist[i][k] < INF && dist[k][i] < INF && dist[i][k] + dist[k][i] < dist[i][i]) {
            dist[i][i] = dist[i][k] + dist[k][i];
          }
          continue;
        }
        // Skip trivial: path i→k→k or k→k→j is never better
        if (i === k || j === k) continue;
        // Skip unreachable through k
        if (dist[i][k] >= INF || dist[k][j] >= INF) continue;

        const d_ik = dist[i][k];
        const d_kj = dist[k][j];
        const newDist = d_ik + d_kj;
        const prevVal = dist[i][j];
        const isUpdate = newDist < prevVal;

        if (isUpdate) {
          dist[i][j] = newDist;
          next[i][j] = next[i][k];
        }

        const description = isUpdate
          ? tr(
              `경유 노드 k=${k}: dist[${i}][${j}] = min(${iStr(prevVal)}, ${d_ik}+${d_kj}) = ${newDist} 로 갱신`,
              `Via k=${k}: dist[${i}][${j}] = min(${iStr(prevVal)}, ${d_ik}+${d_kj}) = ${newDist}, updated`,
            )
          : tr(
              `경유 노드 k=${k}: dist[${i}][${j}] = min(${iStr(prevVal)}, ${d_ik}+${d_kj}) = ${iStr(prevVal)}, 변화 없음`,
              `Via k=${k}: dist[${i}][${j}] = min(${iStr(prevVal)}, ${d_ik}+${d_kj}) = ${iStr(prevVal)}, no change`,
            );

        steps.push({
          type: isUpdate ? 'UPDATE' : 'NO_UPDATE',
          description,
          distMatrix: cloneDist(),
          nextMatrix: cloneNext(),
          currentK: k, currentI: i, currentJ: j,
          isUpdate,
          prevVal,
          newVal: newDist,
          hasNegCycle: false,
          codeLine: isUpdate ? 19 : 17,
        });
      }
    }
  }

  // ── 음수 사이클 감지 ─────────────────────────────────────────────────────
  let hasNegCycle = false;
  for (let i = 0; i < N; i++) {
    if (dist[i][i] < 0) { hasNegCycle = true; break; }
  }

  if (hasNegCycle) {
    steps.push({
      type: 'NEGATIVE_CYCLE',
      description: tr(
        '음수 사이클을 감지했습니다. dist[i][i] < 0인 노드가 존재합니다. 최단 경로가 정의되지 않습니다.',
        'Negative cycle detected: some node has dist[i][i] < 0, so shortest paths are undefined.',
      ),
      distMatrix: cloneDist(),
      nextMatrix: cloneNext(),
      currentK: null, currentI: null, currentJ: null,
      isUpdate: false, prevVal: null, newVal: null,
      hasNegCycle: true, codeLine: 24,
    });
  } else {
    steps.push({
      type: 'DONE',
      description: tr(
        '[완료] 플로이드-워셜 종료. 모든 노드 쌍의 최단거리 계산 완료.',
        '[Done] Floyd-Warshall finished. Shortest distances for every pair are ready.',
      ),
      distMatrix: cloneDist(),
      nextMatrix: cloneNext(),
      currentK: null, currentI: null, currentJ: null,
      isUpdate: false, prevVal: null, newVal: null,
      hasNegCycle: false, codeLine: 27,
    });
  }

  return steps;
}

/** Path reconstruction from next[][] matrix */
export function reconstructPath(
  nextMatrix: (number | null)[][],
  from: number,
  to: number,
): number[] {
  if (from === to) return [from];
  if (nextMatrix[from][to] === null) return [];
  const path: number[] = [from];
  let cur = from;
  let guard = 0;
  while (cur !== to && guard++ < 30) {
    cur = nextMatrix[cur][to] as number;
    path.push(cur);
  }
  return path;
}
