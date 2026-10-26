import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle2, Clock, Footprints, Images, Play, Quote } from 'lucide-react';
import Modal from '../ui/Modal';
import { Button, cn } from '../ui';
import { toneSoft, toneText } from '../ui/tone';
import Storyboard, { type StoryFrame } from './Storyboard';
import { useTr } from '../../i18n';

export interface ConceptAnalogy {
  icon: LucideIcon;
  title: ReactNode;
  body: ReactNode;
}

export interface ConceptComplexity {
  time: string;
  space: string;
  /** The same thing in everyday words, e.g. "노드가 2배가 되면 시간도 약 2배" */
  plain: ReactNode;
}

interface ConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization?: () => void;
  icon: LucideIcon;
  title: ReactNode;
  subtitle?: ReactNode;
  /** One sentence a beginner can repeat back */
  summary: ReactNode;
  analogy?: ConceptAnalogy;
  /** A tiny example shown moment by moment */
  storyboard?: StoryFrame[];
  /** The procedure in 3 to 5 short steps */
  steps?: ReactNode[];
  /** When it is the right tool */
  useWhen?: ReactNode[];
  /** Common traps */
  watchOut?: ReactNode[];
  complexity?: ConceptComplexity;
  /** Anything specific to this algorithm (comparison table, formula), shown last */
  children?: ReactNode;
}

function SectionTitle({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight mb-3">
      <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      {children}
    </h3>
  );
}

/**
 * "개념 보기" for every algorithm: a plain-language, picture-first explanation.
 * Order: one-line summary → everyday analogy → storyboard → steps → when to use / watch out → complexity.
 */
export default function ConceptModal({
  isOpen, onClose, onStartVisualization, icon: Icon, title, subtitle,
  summary, analogy, storyboard, steps, useWhen, watchOut, complexity, children,
}: ConceptModalProps) {
  const tr = useTr();
  const AnalogyIcon = analogy?.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="wide"
      accent="linear-gradient(90deg, var(--state-current), var(--state-path), var(--state-visited))"
      header={
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary-soft text-primary flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-black tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      }
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>{tr('닫기', 'Close')}</Button>
          {onStartVisualization && (
            <Button variant="primary" size="md" onClick={() => { onClose(); onStartVisualization(); }}>
              <Play className="w-4 h-4" fill="currentColor" />
              {tr('시각화로 직접 보기', 'Watch it step by step')}
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-9 pt-1 pb-2 text-[15px] leading-relaxed">
        {/* One-line summary */}
        <div className="rounded-3xl bg-primary-soft px-5 sm:px-7 py-5">
          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1.5">{tr('한 줄 요약', 'In one sentence')}</p>
          <p className="text-lg sm:text-xl font-extrabold leading-snug text-foreground text-pretty">{summary}</p>
        </div>

        {/* Analogy */}
        {analogy && AnalogyIcon && (
          <section>
            <SectionTitle icon={Quote}>{tr('일상에 비유하면', 'Think of it like this')}</SectionTitle>
            <div className="flex gap-4 rounded-3xl border border-border bg-card p-5">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-state-candidate/15 flex items-center justify-center">
                <AnalogyIcon className={cn('w-7 h-7', toneText.candidate)} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-base mb-1">{analogy.title}</p>
                <div className="text-muted-foreground">{analogy.body}</div>
              </div>
            </div>
          </section>
        )}

        {/* Storyboard */}
        {storyboard && storyboard.length > 0 && (
          <section>
            <SectionTitle icon={Images}>{tr('그림으로 보기', 'See it in pictures')}</SectionTitle>
            <Storyboard frames={storyboard} />
          </section>
        )}

        {/* Steps */}
        {steps && steps.length > 0 && (
          <section>
            <SectionTitle icon={Footprints}>{tr('이렇게 동작해요', 'How it works')}</SectionTitle>
            <ol className="grid gap-2.5">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-3.5 items-start rounded-2xl border border-border bg-card px-4 py-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-primary text-primary-foreground text-sm font-black flex items-center justify-center">{i + 1}</span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* When to use / watch out */}
        {(useWhen?.length || watchOut?.length) ? (
          <section className="grid md:grid-cols-2 gap-3">
            {useWhen && useWhen.length > 0 && (
              <div className={cn('rounded-3xl p-5', toneSoft.visited)}>
                <p className="flex items-center gap-2 font-bold mb-2"><CheckCircle2 className="w-4 h-4" />{tr('이럴 때 써요', 'Use it when')}</p>
                <ul className="space-y-1.5 text-foreground/85">
                  {useWhen.map((u, i) => <li key={i} className="flex gap-2"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-state-visited shrink-0" />{u}</li>)}
                </ul>
              </div>
            )}
            {watchOut && watchOut.length > 0 && (
              <div className={cn('rounded-3xl p-5', toneSoft.candidate)}>
                <p className="flex items-center gap-2 font-bold mb-2"><AlertTriangle className="w-4 h-4" />{tr('조심하세요', 'Watch out')}</p>
                <ul className="space-y-1.5 text-foreground/85">
                  {watchOut.map((w, i) => <li key={i} className="flex gap-2"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-state-candidate shrink-0" />{w}</li>)}
                </ul>
              </div>
            )}
          </section>
        ) : null}

        {/* Complexity in plain words */}
        {complexity && (
          <section>
            <SectionTitle icon={Clock}>{tr('얼마나 빠를까요?', 'How fast is it?')}</SectionTitle>
            <div className="rounded-3xl border border-border bg-card p-5 space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className={cn('inline-flex items-center gap-2 rounded-xl px-3.5 py-2', toneSoft.current)}>
                  <span className="text-xs font-semibold opacity-80">{tr('시간', 'Time')}</span>
                  <code className="font-mono font-bold">{complexity.time}</code>
                </span>
                <span className={cn('inline-flex items-center gap-2 rounded-xl px-3.5 py-2', toneSoft.path)}>
                  <span className="text-xs font-semibold opacity-80">{tr('메모리', 'Memory')}</span>
                  <code className="font-mono font-bold">{complexity.space}</code>
                </span>
              </div>
              <p className="text-muted-foreground">{complexity.plain}</p>
            </div>
          </section>
        )}

        {children}
      </div>
    </Modal>
  );
}
