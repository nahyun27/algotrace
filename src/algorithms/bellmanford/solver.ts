
import type { BellmanFordStep } from './types';
import { INF, EXAMPLE1_N, EXAMPLE1_EDGES } from './types';

export function generateBellmanFordSteps(
  customEdges?: [number, number, number][],
  customN?: number,
): BellmanFordStep[] {
  const N = customN ?? EXAMPLE1_N;
  const EDGES = customEdges ?? EXAMPLE1_EDGES;
  const steps: BellmanFordStep[] = [];
  const V_MINUS_1 = N - 1;

  const dist = Array(N).fill(INF);
  const roundUpdatesHistory: number[] = [];

  const cloneDist = () => [...dist];

  // ── INIT ────────────────────────────────────────────────────────────
  dist[0] = 0;
  steps.push({
    type: 'INIT',
    description: `초기화: dist[0] = 0, 나머지 = ∞. 총 ${V_MINUS_1}라운드 진행 예정.`,
    dist: cloneDist(),
    currentNode: null, neighborNode: null, activeEdge: null,
    updatedCell: 0, isImprovement: true,
    round: 0, totalRounds: V_MINUS_1,
    updatesThisRound: 0, roundUpdatesHistory: [],
    negativeCycleEdges: [],
    codeLine: 4,
  });

  let negativeCycleDetected = false;
  const negativeCycleEdges: [number, number][] = [];

  // ── V-1 라운드 ──────────────────────────────────────────────────────
  for (let round = 1; round <= V_MINUS_1; round++) {
    let updatesThisRound = 0;

    steps.push({
      type: 'ROUND_START',
      description: `[ 라운드 ${round} / ${V_MINUS_1} ] 모든 간선 완화 시작.`,
      dist: cloneDist(),
      currentNode: null, neighborNode: null, activeEdge: null,
      updatedCell: null, isImprovement: false,
      round, totalRounds: V_MINUS_1,
      updatesThisRound: 0, roundUpdatesHistory: [...roundUpdatesHistory],
      negativeCycleEdges: [],
      codeLine: 8,
    });

    for (const [u, v, w] of EDGES) {
      if (dist[u] === INF) continue; // unreachable source, skip
      const newDist = dist[u] + w;
      const improved = newDist < dist[v];

      steps.push({
        type: 'RELAX',
        description: improved
          ? `완화 성공: dist[${v}] ${dist[v] >= INF ? '∞' : dist[v]} → ${newDist}  (경로: 노드 ${u} →${v}, 가중치 ${w})`
          : `완화 실패: dist[${u}]${w >= 0 ? '+' : ''}${w} = ${newDist} ≥ dist[${v}]=${dist[v] >= INF ? '∞' : dist[v]}  변화 없음`,
        dist: cloneDist(),
        currentNode: u, neighborNode: v, activeEdge: [u, v],
        updatedCell: improved ? v : null, isImprovement: improved,
        round, totalRounds: V_MINUS_1,
        updatesThisRound, roundUpdatesHistory: [...roundUpdatesHistory],
        negativeCycleEdges: [],
        codeLine: improved ? 12 : 11,
      });

      if (improved) {
        dist[v] = newDist;
        updatesThisRound++;
      }
    }

    roundUpdatesHistory.push(updatesThisRound);

    steps.push({
      type: 'ROUND_END',
      description: `라운드 ${round} 완료. 이번 라운드 갱신 횟수: ${updatesThisRound}회.${updatesThisRound === 0 ? ' (조기 종료 가능)' : ''}`,
      dist: cloneDist(),
      currentNode: null, neighborNode: null, activeEdge: null,
      updatedCell: null, isImprovement: false,
      round, totalRounds: V_MINUS_1,
      updatesThisRound, roundUpdatesHistory: [...roundUpdatesHistory],
      negativeCycleEdges: [],
      codeLine: 13,
    });

    // Early termination if no updates
    if (updatesThisRound === 0) break;
  }

  // ── V번째 라운드: 음수 사이클 감지 ──────────────────────────────────
  for (const [u, v, w] of EDGES) {
    if (dist[u] === INF) continue;
    if (dist[u] + w < dist[v]) {
      negativeCycleDetected = true;
      negativeCycleEdges.push([u, v]);
    }
  }

  if (negativeCycleDetected) {
    steps.push({
      type: 'NEGATIVE_CYCLE',
      description: `⚠️ 음수 사이클 감지! V번째 라운드에서도 거리가 갱신됩니다. 최단 경로가 존재하지 않습니다.`,
      dist: cloneDist(),
      currentNode: null, neighborNode: null, activeEdge: null,
      updatedCell: null, isImprovement: false,
      round: N, totalRounds: V_MINUS_1,
      updatesThisRound: 0, roundUpdatesHistory: [...roundUpdatesHistory],
      negativeCycleEdges,
      codeLine: 18,
    });
  } else {
    steps.push({
      type: 'DONE',
      description: `[완료] 벨만-포드 종료. 최단 거리: ${dist.map((d, i) => `${i}→${d >= INF ? '∞' : d}`).join(', ')}`,
      dist: cloneDist(),
      currentNode: null, neighborNode: null, activeEdge: null,
      updatedCell: null, isImprovement: false,
      round: N, totalRounds: V_MINUS_1,
      updatesThisRound: 0, roundUpdatesHistory: [...roundUpdatesHistory],
      negativeCycleEdges: [],
      codeLine: 20,
    });
  }

  return steps;
}
