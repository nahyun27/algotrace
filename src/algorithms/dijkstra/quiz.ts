import { makeTr, type Lang } from '../../i18n';
import { pickOptions, type QuizFn } from '../../components/algorithm/quiz';
import { INF, type DijkstraStep } from './types';

/**
 * Before each DEQUEUE that settles a node: "which node is settled next?"
 * Options are unvisited nodes with a finite distance (exactly the nodes waiting in the priority queue);
 * the answer is the one with the smallest dist. Skipped when the popped entry is stale or the minimum is tied.
 */
export function buildDijkstraQuiz(steps: DijkstraStep[], lang: Lang = 'ko'): QuizFn {
  const tr = makeTr(lang);
  return (i) => {
    const next = steps[i + 1];
    if (!next || next.type !== 'DEQUEUE') return null;
    const u = next.currentNode;
    if (next.visited[u]) return null; // stale queue entry: nothing gets settled
    // Distances as they stand once step i is done (step i + 1 only pops, it doesn't change dist)
    const dist = next.dist;
    const waiting = dist.flatMap((d, v) => (!next.visited[v] && d !== INF ? [v] : []));
    if (waiting.length < 2) return null;
    const best = Math.min(...waiting.map(v => dist[v]));
    if (dist[u] !== best || waiting.filter(v => dist[v] === best).length > 1) return null;
    const byDist = [...waiting].sort((a, b) => dist[a] - dist[b] || a - b);
    const options = pickOptions(byDist, u, (a, b) => a - b);
    return {
      question: tr('다음으로 확정될 노드는?', 'Which node is settled next?'),
      options: options.map(v => ({ id: String(v), label: tr(`노드 ${v}`, `Node ${v}`) })),
      answerId: String(u),
      explanation: tr(
        `아직 확정되지 않은 노드 중 dist가 가장 작은 노드 ${u} (dist = ${dist[u]})가 우선순위 큐에서 먼저 나와요.`,
        `Among the unsettled nodes, node ${u} has the smallest dist (${dist[u]}), so it leaves the priority queue first.`,
      ),
    };
  };
}
