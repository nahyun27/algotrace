import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Play } from 'lucide-react';
import Modal from '../ui/Modal';
import { Button, cn } from '../ui';
import { toneSoft, toneBorder, toneSolid, type Tone } from '../ui/tone';
import { useTr } from '../../i18n';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When given, shows a "start visualization" button that closes the modal first */
  onStartVisualization?: () => void;
  icon: LucideIcon;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}

/**
 * Shell for every "개념 보기" modal. Content is composed from InfoSection / InfoCard / InfoCode /
 * ComplexityChips so every algorithm explains itself with the same visual language.
 */
export default function InfoModal({ isOpen, onClose, onStartVisualization, icon: Icon, title, subtitle, children }: InfoModalProps) {
  const tr = useTr();
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      accent="linear-gradient(90deg, var(--state-current), var(--state-path), var(--state-visited))"
      header={
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 shrink-0 rounded-2xl bg-primary-soft text-primary flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
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
              {tr('시각화 시작하기', 'Start visualization')}
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-7 pt-2">{children}</div>
    </Modal>
  );
}

interface InfoSectionProps {
  n: number;
  title: ReactNode;
  children: ReactNode;
}

export function InfoSection({ n, title, children }: InfoSectionProps) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2.5 text-base font-extrabold tracking-tight">
        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-black">{n}</span>
        {title}
      </h3>
      <div className="space-y-3 text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

interface InfoCardProps {
  tone?: Tone;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Tinted callout card for key ideas, comparisons, warnings. */
export function InfoCard({ tone = 'neutral', title, children, className }: InfoCardProps) {
  return (
    <div className={cn('rounded-2xl border p-4', tone === 'neutral' ? 'bg-muted/60 border-border' : `${toneSoft[tone]} ${toneBorder[tone]}`, className)}>
      {title && <p className="font-bold text-sm mb-1.5">{title}</p>}
      <div className={cn('text-[13px] leading-relaxed', tone === 'neutral' ? 'text-muted-foreground' : 'text-foreground/80')}>{children}</div>
    </div>
  );
}

/** Monospace snippet block inside an info section. */
export function InfoCode({ children, caption }: { children: ReactNode; caption?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/60 p-4">
      {caption && <p className="text-xs font-semibold text-muted-foreground mb-2">{caption}</p>}
      <pre className="font-mono text-[13px] leading-relaxed whitespace-pre-wrap">{children}</pre>
    </div>
  );
}

interface ComplexityChipsProps {
  time: string;
  space: string;
  note?: ReactNode;
}

export function ComplexityChips({ time, space, note }: ComplexityChipsProps) {
  const tr = useTr();
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <span className={cn('inline-flex items-center gap-2 rounded-xl px-3.5 py-2', toneSoft.candidate)}>
          <span className="text-xs font-semibold opacity-80">{tr('시간', 'Time')}</span>
          <code className="font-mono font-bold">{time}</code>
        </span>
        <span className={cn('inline-flex items-center gap-2 rounded-xl px-3.5 py-2', toneSoft.current)}>
          <span className="text-xs font-semibold opacity-80">{tr('공간', 'Space')}</span>
          <code className="font-mono font-bold">{space}</code>
        </span>
      </div>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

/** Numbered step list (algorithm procedure). */
export function InfoSteps({ steps }: { steps: ReactNode[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3">
          <span className={cn('w-5 h-5 mt-0.5 shrink-0 rounded-md text-[11px] font-black flex items-center justify-center', toneSolid.primary)}>{i + 1}</span>
          <span className="text-sm leading-relaxed">{s}</span>
        </li>
      ))}
    </ol>
  );
}
