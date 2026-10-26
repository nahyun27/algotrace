import { makeTr, type Lang } from '../../i18n';
import { pickOptions, type QuizFn } from '../../components/algorithm/quiz';
import type { BFSStep, DFSStep } from './types';

const byId = (a: number, b: number) => a - b;

/**
 * BFS: before each DEQUEUE, "which node is visited next?" Options are the nodes in the queue
 * (front first when trimming to four); the answer is the queue front.
 */
export function buildBFSQuiz(steps: BFSStep[], lang: Lang = 'ko'): QuizFn {
  const tr = makeTr(lang);
  return (i) => {
    const cur = steps[i];
    const next = steps[i + 1];
    if (!cur || !next || next.type !== 'DEQUEUE' || next.currentNode === null) return null;
    const queue = cur.queue.map(e => e.value);
    const answer = next.currentNode;
    if (queue[0] !== answer || new Set(queue).size < 2) return null;
    return {
      question: tr('다음에 방문할 노드는?', 'Which node is visited next?'),
      options: pickOptions(queue, answer, byId).map(v => ({ id: String(v), label: tr(`노드 ${v}`, `Node ${v}`) })),
      answerId: String(answer),
      explanation: tr(
        `큐는 먼저 들어온 것이 먼저 나가요 (FIFO). 큐의 맨 앞에 있는 노드 ${answer}을(를) 꺼내 방문해요.`,
        `A queue is first in, first out. Node ${answer} sits at the front of the queue, so it is dequeued and visited next.`,
      ),
    };
  };
}

/**
 * DFS: before popping a node that is still unvisited, "which node is visited next?" Options are the unvisited
 * nodes on the stack (top first when trimming to four); the answer is the stack top.
 * Pops of already visited nodes are skipped (nothing is visited there).
 */
export function buildDFSQuiz(steps: DFSStep[], lang: Lang = 'ko'): QuizFn {
  const tr = makeTr(lang);
  return (i) => {
    const cur = steps[i];
    const next = steps[i + 1];
    if (!cur || !next || next.type !== 'POP' || next.currentNode === null) return null;
    if (next.stack.length !== cur.stack.length - 1) return null; // not the pop itself (the visit / skip step after it)
    const answer = next.currentNode;
    const top = cur.stack[cur.stack.length - 1]?.value;
    if (top !== answer || cur.visitedSet.includes(answer)) return null;
    const fromTop = cur.stack.map(e => e.value).reverse().filter(v => !cur.visitedSet.includes(v));
    if (new Set(fromTop).size < 2) return null;
    return {
      question: tr('다음에 방문할 노드는?', 'Which node is visited next?'),
      options: pickOptions(fromTop, answer, byId).map(v => ({ id: String(v), label: tr(`노드 ${v}`, `Node ${v}`) })),
      answerId: String(answer),
      explanation: tr(
        `스택은 마지막에 넣은 것이 먼저 나와요 (LIFO). 스택의 맨 위에 있는 노드 ${answer}을(를) 꺼내 방문해요.`,
        `A stack is last in, first out. Node ${answer} is on top of the stack, so it is popped and visited next.`,
      ),
    };
  };
}
