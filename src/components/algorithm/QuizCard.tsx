import { useEffect, useRef } from 'react';
import { Brain, Check, ChevronRight, HelpCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, cn, IconButton, Kbd } from '../ui';
import { toneBorder, toneSoft, toneText } from '../ui/tone';
import { useTr } from '../../i18n';
import type { QuizQuestion } from './quiz';

export interface QuizScore {
  correct: number;
  total: number;
}

/** Quiz part of the step controller props (only present on pages that pass a quiz to `usePlayback`). */
export interface QuizState {
  enabled: boolean;
  onToggle: () => void;
  score: QuizScore;
  /** The open question (null when none is shown) */
  question: QuizQuestion | null;
  picked: string | null;
  onPick: (id: string) => void;
  onContinue: () => void;
  onDismiss: () => void;
}

/** Toggle for quiz mode; while on, it doubles as the running score badge. */
export function QuizToggle({ quiz }: { quiz: QuizState }) {
  const tr = useTr();
  const { enabled, score } = quiz;
  const label = enabled
    ? tr(`퀴즈 모드 끄기 (맞힌 문제 ${score.correct} / ${score.total})`, `Turn off quiz mode (${score.correct} of ${score.total} correct)`)
    : tr('퀴즈 모드: 다음 단계를 예측해 보세요', 'Quiz mode: predict the next step');
  return (
    <button
      type="button"
      onClick={quiz.onToggle}
      aria-pressed={enabled}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-xl px-1.5 text-[11px] font-bold tabular-nums transition-all active:scale-95',
        enabled ? 'bg-primary-soft text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
      )}
    >
      <Brain className="w-4 h-4" />
      {enabled && <span className="hidden sm:inline">{score.correct}/{score.total}</span>}
    </button>
  );
}

/** Compact question card shown over the bottom of the visualization, above the controller. */
export function QuizCard({ quiz }: { quiz: QuizState }) {
  const tr = useTr();
  const { question, picked, score } = quiz;
  const cardRef = useRef<HTMLDivElement>(null);

  // Move focus to "continue" once answered, so Enter / Space continue from the keyboard as well
  useEffect(() => {
    if (picked) cardRef.current?.querySelector<HTMLButtonElement>('[data-quiz-continue]')?.focus();
  }, [picked]);

  if (!question) return null;
  const answer = question.options.find(o => o.id === question.answerId);
  const correct = picked !== null && picked === question.answerId;

  return (
    <motion.div
      role="dialog"
      aria-label={tr('예측 퀴즈', 'Prediction quiz')}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full inset-x-0 z-30 px-2 sm:px-4 pb-2 pointer-events-none"
    >
      <div ref={cardRef} className="pointer-events-auto mx-auto max-w-xl rounded-2xl border border-border bg-popover p-3 sm:p-3.5 shadow-xl">
        <div className="flex items-start gap-2">
          <HelpCircle className={cn('mt-0.5 w-4 h-4 shrink-0', toneText.primary)} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {tr('예측 퀴즈', 'Predict the next step')}
              <span className="ml-2 normal-case tracking-normal tabular-nums">
                {tr(`맞힘 ${score.correct} / ${score.total}`, `${score.correct} / ${score.total} correct`)}
              </span>
            </p>
            <p className="mt-0.5 text-sm font-bold text-foreground">{question.question}</p>
          </div>
          <IconButton size="sm" label={tr('닫기 (Esc)', 'Close (Esc)')} onClick={quiz.onDismiss} className="-mr-1 -mt-1 shrink-0">
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        <div className={cn('mt-2.5 grid grid-cols-2 gap-1.5', question.options.length === 3 && 'sm:grid-cols-3')}>
          {question.options.map((o, i) => {
            const isAnswer = o.id === question.answerId;
            const isPicked = o.id === picked;
            const state = picked === null ? 'open' : isAnswer ? 'right' : isPicked ? 'wrong' : 'other';
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => quiz.onPick(o.id)}
                disabled={picked !== null}
                aria-pressed={isPicked}
                className={cn(
                  'flex min-h-9 items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left text-xs font-semibold transition-all',
                  state === 'open' && 'border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]',
                  state === 'right' && cn(toneSoft.visited, toneBorder.visited),
                  state === 'wrong' && cn(toneSoft.danger, toneBorder.danger),
                  state === 'other' && 'border-border bg-card text-muted-foreground opacity-60',
                )}
              >
                {state === 'right' ? <Check className="w-4 h-4 shrink-0" />
                  : state === 'wrong' ? <X className="w-4 h-4 shrink-0" />
                    : <Kbd>{i + 1}</Kbd>}
                <span className="min-w-0">{o.label}</span>
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className="mt-2.5 flex flex-wrap items-end gap-2">
            <div className="min-w-0 flex-1 text-xs" role="status">
              <p className={cn('flex items-center gap-1 font-bold', correct ? toneText.visited : toneText.danger)}>
                {correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {correct
                  ? tr('정답이에요!', 'Correct!')
                  : tr(`아쉬워요. 정답: ${answer?.label ?? ''}`, `Not quite. Answer: ${answer?.label ?? ''}`)}
              </p>
              {question.explanation && <p className="mt-0.5 text-muted-foreground">{question.explanation}</p>}
            </div>
            <Button data-quiz-continue variant="primary" onClick={quiz.onContinue} title="Enter" className="ml-auto">
              {tr('계속', 'Continue')}
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
