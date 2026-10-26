
import type { BellmanFordStep } from './types';
import { INF, EXAMPLE1_N, EXAMPLE1_EDGES } from './types';
import { makeTr, type Lang } from '../../i18n';

export function generateBellmanFordSteps(
  customEdges?: [number, number, number][],
  customN?: number,
  lang: Lang = 'ko',
): BellmanFordStep[] {
  const tr = makeTr(lang);
  const fmt = (d: number) => (d >= INF ? '∞' : String(d));
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
    description: tr(
      `초기화: dist[0] = 0, 나머지 = ∞. 총 ${V_MINUS_1}라운드 진행 예정.`,
      `Init: dist[0] = 0, all others = ∞. Up to ${V_MINUS_1} round${V_MINUS_1 === 1 ? '' : 's'} will run.`,
    ),
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
      description: tr(
        `[ 라운드 ${round} / ${V_MINUS_1} ] 모든 간선 완화 시작.`,
        `[ Round ${round} / ${V_MINUS_1} ] Relax all edges.`,
      ),
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
          ? tr(
              `완화 성공: dist[${v}] ${fmt(dist[v])} → ${newDist}  (경로: 노드 ${u} →${v}, 가중치 ${w})`,
              `Relaxed: dist[${v}] ${fmt(dist[v])} → ${newDist}  (via edge ${u} → ${v}, weight ${w})`,
            )
          : tr(
              `완화 실패: dist[${u}]${w >= 0 ? '+' : ''}${w} = ${newDist} ≥ dist[${v}]=${fmt(dist[v])}  변화 없음`,
              `No improvement: dist[${u}]${w >= 0 ? '+' : ''}${w} = ${newDist} ≥ dist[${v}]=${fmt(dist[v])}, no change`,
            ),
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
      description: tr(
        `라운드 ${round} 완료. 이번 라운드 갱신 횟수: ${updatesThisRound}회.${updatesThisRound === 0 ? ' (조기 종료 가능)' : ''}`,
        `Round ${round} done: ${updatesThisRound} update${updatesThisRound === 1 ? '' : 's'}.${updatesThisRound === 0 ? ' (we can stop early)' : ''}`,
      ),
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
      description: tr(
        '음수 사이클을 감지했습니다. V번째 라운드에서도 거리가 갱신됩니다. 최단 경로가 존재하지 않습니다.',
        'Negative cycle detected: distances still improve in round V, so no shortest path exists.',
      ),
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
      description: tr(
        `[완료] 벨만-포드 종료. 최단 거리: ${dist.map((d, i) => `${i}→${fmt(d)}`).join(', ')}`,
        `[Done] Bellman-Ford finished. Shortest distances: ${dist.map((d, i) => `${i}→${fmt(d)}`).join(', ')}`,
      ),
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
