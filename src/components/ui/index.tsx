import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toneSoft, toneBorder, toneText, type Tone } from './tone';

export { type Tone } from './tone';

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/* ─────────────── Button ─────────────── */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'soft';
type ButtonSize = 'sm' | 'md';

const buttonVariant: Record<ButtonVariant, string> = {
  primary:   'bg-primary text-primary-foreground shadow-sm hover:brightness-110',
  secondary: 'bg-card text-foreground border border-border shadow-sm hover:bg-muted',
  ghost:     'text-muted-foreground hover:text-foreground hover:bg-muted',
  soft:      'bg-primary-soft text-primary hover:brightness-95 dark:hover:brightness-125',
};

const buttonSize: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = 'secondary', size = 'sm', className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex items-center justify-center font-semibold whitespace-nowrap transition-all active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none',
        buttonVariant[variant], buttonSize[size], className,
      )}
    />
  );
}

/* ─────────────── IconButton ─────────────── */

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  size?: 'sm' | 'md';
}

export function IconButton({ label, active, size = 'md', className, children, ...rest }: IconButtonProps) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-xl transition-all active:scale-95 disabled:opacity-35 disabled:pointer-events-none',
        size === 'md' ? 'w-9 h-9' : 'w-8 h-8',
        active ? 'bg-primary-soft text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ─────────────── SegmentedControl ─────────────── */

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
  /** Unique id so the sliding pill animates within this control only */
  id: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, size = 'sm', className, id }: SegmentedControlProps<T>) {
  return (
    <div role="tablist" className={cn('inline-flex items-center gap-0.5 rounded-xl bg-muted p-1 max-w-full overflow-x-auto no-scrollbar', className)}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative shrink-0 whitespace-nowrap font-semibold rounded-lg transition-colors',
              size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-lg bg-card shadow-sm"
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────── Badge ─────────────── */

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  outline?: boolean;
}

export function Badge({ tone = 'neutral', outline, children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold leading-4 whitespace-nowrap',
      toneSoft[tone], outline && `border ${toneBorder[tone]}`, className,
    )}>
      {children}
    </span>
  );
}

/* ─────────────── Panel ─────────────── */

interface PanelProps {
  title?: ReactNode;
  /** Optional icon shown before the title */
  icon?: LucideIcon;
  /** Tone for the title icon (default neutral) */
  iconTone?: Tone;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** Bordered section used inside the visualization area (tables, queues, results). */
export function Panel({ title, icon: Icon, iconTone = 'neutral', subtitle, actions, children, className, bodyClassName }: PanelProps) {
  return (
    <section className={cn('rounded-2xl border border-border bg-card overflow-hidden', className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border bg-muted/40">
          <div className="min-w-0">
            {title && (Icon ? (
              <h3 className="flex items-center gap-1.5 text-sm font-bold tracking-tight">
                <Icon className={cn('w-4 h-4 shrink-0', toneText[iconTone])} aria-hidden />
                <span className="truncate">{title}</span>
              </h3>
            ) : (
              <h3 className="text-sm font-bold tracking-tight truncate">{title}</h3>
            ))}
            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/* ─────────────── Kbd ─────────────── */

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[1.5rem] justify-center rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground shadow-[0_1px_0_var(--border)]">
      {children}
    </kbd>
  );
}
