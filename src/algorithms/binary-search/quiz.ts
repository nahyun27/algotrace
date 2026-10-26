import { makeTr, type Lang } from '../../i18n';
import type { QuizFn } from '../../components/algorithm/quiz';
import type { BSStep } from './types';

const ANSWER: Partial<Record<BSStep['type'], string>> = { GO_LEFT: 'left', GO_RIGHT: 'right', FOUND: 'found' };

/**
 * Binary search for a value: on every MID step after the first, "which way next?" (left / right / found).
 * arr[mid] and the target are on screen, so the answer is a single comparison.
 */
export function buildFindQuiz(steps: BSStep[], arr: number[], target: number, lang: Lang = 'ko'): QuizFn {
  const tr = makeTr(lang);
  const firstMid = steps.findIndex(s => s.type === 'MID');
  return (i) => {
    const cur = steps[i];
    const next = steps[i + 1];
    if (!cur || !next || cur.type !== 'MID' || cur.mid === null || i === firstMid) return null;
    const answerId = ANSWER[next.type];
    if (!answerId) return null;
    const v = arr[cur.mid];
    return {
      question: tr('다음 탐색 방향은?', 'Which way next?'),
      options: [
        { id: 'left', label: tr('왼쪽 절반', 'Left half') },
        { id: 'right', label: tr('오른쪽 절반', 'Right half') },
        { id: 'found', label: tr('찾음', 'Found') },
      ],
      answerId,
      explanation: answerId === 'found'
        ? tr(`arr[${cur.mid}] = ${v}이(가) 찾는 값 ${target}과(와) 같아요.`, `arr[${cur.mid}] = ${v} equals the target ${target}.`)
        : answerId === 'right'
          ? tr(`${v} < ${target}이라 답은 mid보다 오른쪽에만 있을 수 있어요.`, `${v} < ${target}, so the target can only be to the right of mid.`)
          : tr(`${v} > ${target}이라 답은 mid보다 왼쪽에만 있을 수 있어요.`, `${v} > ${target}, so the target can only be to the left of mid.`),
    };
  };
}
