import { makeTr, type Lang } from '../../i18n';
import type { QuizFn } from '../../components/algorithm/quiz';
import type { SortStep } from './types';

/**
 * Bubble sort: on every COMPARE step, "swap these two?" The two compared values are highlighted on screen,
 * and bubble sort swaps exactly when the left one is larger.
 */
export function buildBubbleQuiz(steps: SortStep[], lang: Lang = 'ko'): QuizFn {
  const tr = makeTr(lang);
  return (i) => {
    const cur = steps[i];
    const next = steps[i + 1];
    if (!cur || !next || cur.type !== 'COMPARE' || cur.comparing.length !== 2) return null;
    const [j, k] = cur.comparing;
    const a = cur.array[j];
    const b = cur.array[k];
    const swap = next.type === 'SWAP';
    return {
      question: tr(`두 값 ${a}와(과) ${b}을(를) 바꿀까요?`, `Swap ${a} and ${b}?`),
      options: [
        { id: 'yes', label: tr('바꿔요', 'Yes, swap') },
        { id: 'no', label: tr('그대로 둬요', 'No, keep') },
      ],
      answerId: swap ? 'yes' : 'no',
      explanation: swap
        ? tr(`왼쪽 ${a}이(가) 오른쪽 ${b}보다 커서 자리를 바꿔요.`, `The left value ${a} is larger than ${b}, so they swap.`)
        : tr(`왼쪽 ${a}이(가) 오른쪽 ${b}보다 크지 않아서 그대로 둬요.`, `The left value ${a} is not larger than ${b}, so they stay.`),
    };
  };
}
