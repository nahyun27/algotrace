import { describe, it, expect } from 'vitest';
import { generateBFSSteps } from './solverBFS';
import { generateDFSSteps } from './solverDFS';
import { buildBFSQuiz, buildDFSQuiz } from './quiz';
import type { BaseStep } from './types';
import { SEEDS, mulberry32, randInt, randomUndirectedEdges } from '../../test/utils';
import { collectQuizzes, expectQuizLangIndependent } from '../../test/quiz';

/** The node that is added to the visit order next after step i */
function nextVisited(steps: BaseStep[], i: number): number | undefined {
  const k = steps[i].visitedNodes.length;
  return steps.slice(i + 1).find(s => s.visitedNodes.length > k)?.visitedNodes[k];
}

function checkBFS(steps: ReturnType<typeof generateBFSSteps>) {
  const qs = collectQuizzes(buildBFSQuiz(steps, 'en'), steps.length);
  for (const [i, q] of qs) {
    expect(steps[i + 1].type).toBe('DEQUEUE');
    expect(String(steps[i + 1].currentNode)).toBe(q.answerId);
    expect(String(nextVisited(steps, i))).toBe(q.answerId);
    // every option is a node waiting in the queue
    for (const o of q.options) expect(steps[i].queue.map(e => String(e.value))).toContain(o.id);
  }
  return qs;
}

function checkDFS(steps: ReturnType<typeof generateDFSSteps>) {
  const qs = collectQuizzes(buildDFSQuiz(steps, 'en'), steps.length);
  for (const [i, q] of qs) {
    expect(String(steps[i + 1].currentNode)).toBe(q.answerId);
    expect(String(nextVisited(steps, i))).toBe(q.answerId);
    for (const o of q.options) {
      expect(steps[i].stack.map(e => String(e.value))).toContain(o.id);
      expect(steps[i].visitedSet.map(String)).not.toContain(o.id);
    }
  }
  return qs;
}

describe('BFS / DFS quiz', () => {
  it('asks on the default example and the answer is the next visited node', () => {
    const bfs = generateBFSSteps(undefined, undefined, 'en');
    const dfs = generateDFSSteps(undefined, undefined, 'en');
    expect(checkBFS(bfs).length).toBeGreaterThanOrEqual(3);
    expect(checkDFS(dfs).length).toBeGreaterThanOrEqual(3);
    expectQuizLangIndependent(buildBFSQuiz(generateBFSSteps(), 'ko'), buildBFSQuiz(bfs, 'en'), bfs.length);
    expectQuizLangIndependent(buildDFSQuiz(generateDFSSteps(), 'ko'), buildDFSQuiz(dfs, 'en'), dfs.length);
  });

  it('answers match the next visited node on 20 seeded random graphs', () => {
    for (const seed of SEEDS) {
      const rng = mulberry32(seed);
      const n = randInt(rng, 2, 9);
      const edges = randomUndirectedEdges(rng, n, 0.4);
      checkBFS(generateBFSSteps(edges, n, 'en'));
      checkDFS(generateDFSSteps(edges, n, 'en'));
    }
  });
});
