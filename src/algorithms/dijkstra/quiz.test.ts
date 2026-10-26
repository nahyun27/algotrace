import { describe, it, expect } from 'vitest';
import { generateDijkstraSteps } from './solver';
import { buildDijkstraQuiz } from './quiz';
import { SEEDS, mulberry32, randInt, randomDirectedEdges } from '../../test/utils';
import { collectQuizzes, expectQuizLangIndependent } from '../../test/quiz';

function check(steps: ReturnType<typeof generateDijkstraSteps>) {
  const qs = collectQuizzes(buildDijkstraQuiz(steps, 'en'), steps.length);
  for (const [i, q] of qs) {
    // The answer is the node the next step pops, and the step after that settles it
    expect(steps[i + 1].type).toBe('DEQUEUE');
    expect(String(steps[i + 1].currentNode)).toBe(q.answerId);
    expect(steps[i + 2].type).toBe('VISITED');
    expect(String(steps[i + 2].currentNode)).toBe(q.answerId);
  }
  return qs;
}

describe('dijkstra quiz', () => {
  it('asks before settling nodes on the default example, with the popped node as the answer', () => {
    const steps = generateDijkstraSteps(undefined, undefined, 'en');
    expect(check(steps).length).toBeGreaterThanOrEqual(2);
    expectQuizLangIndependent(buildDijkstraQuiz(generateDijkstraSteps(), 'ko'), buildDijkstraQuiz(steps, 'en'), steps.length);
  });

  it('answers match the next step on 20 seeded random graphs', () => {
    for (const seed of SEEDS) {
      const rng = mulberry32(seed);
      const n = randInt(rng, 2, 8);
      check(generateDijkstraSteps(randomDirectedEdges(rng, n, 0.35, 0, 9), n, 'en'));
    }
  });
});
