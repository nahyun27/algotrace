/**
 * Semantic tones shared by badges, banners, legends and highlights.
 * The visualization tones map 1:1 to the --state-* tokens in index.css.
 * Class strings are written out in full so Tailwind can detect them.
 */
export type Tone = 'neutral' | 'primary' | 'current' | 'candidate' | 'visited' | 'path' | 'danger';

/** Tinted background + readable tinted text */
export const toneSoft: Record<Tone, string> = {
  neutral:   'bg-muted text-muted-foreground',
  primary:   'bg-primary-soft text-primary',
  current:   'bg-state-current/12 text-[color-mix(in_oklab,var(--state-current)_72%,var(--foreground))]',
  candidate: 'bg-state-candidate/15 text-[color-mix(in_oklab,var(--state-candidate)_62%,var(--foreground))]',
  visited:   'bg-state-visited/12 text-[color-mix(in_oklab,var(--state-visited)_68%,var(--foreground))]',
  path:      'bg-state-path/12 text-[color-mix(in_oklab,var(--state-path)_72%,var(--foreground))]',
  danger:    'bg-state-danger/12 text-[color-mix(in_oklab,var(--state-danger)_75%,var(--foreground))]',
};

/** Tinted text only */
export const toneText: Record<Tone, string> = {
  neutral:   'text-muted-foreground',
  primary:   'text-primary',
  current:   'text-[color-mix(in_oklab,var(--state-current)_72%,var(--foreground))]',
  candidate: 'text-[color-mix(in_oklab,var(--state-candidate)_62%,var(--foreground))]',
  visited:   'text-[color-mix(in_oklab,var(--state-visited)_68%,var(--foreground))]',
  path:      'text-[color-mix(in_oklab,var(--state-path)_72%,var(--foreground))]',
  danger:    'text-[color-mix(in_oklab,var(--state-danger)_75%,var(--foreground))]',
};

/** Filled background */
export const toneSolid: Record<Tone, string> = {
  neutral:   'bg-muted-foreground text-white',
  primary:   'bg-primary text-primary-foreground',
  current:   'bg-state-current text-white',
  candidate: 'bg-state-candidate text-amber-950',
  visited:   'bg-state-visited text-white',
  path:      'bg-state-path text-white',
  danger:    'bg-state-danger text-white',
};

export const toneBorder: Record<Tone, string> = {
  neutral:   'border-border',
  primary:   'border-primary/30',
  current:   'border-state-current/35',
  candidate: 'border-state-candidate/40',
  visited:   'border-state-visited/35',
  path:      'border-state-path/35',
  danger:    'border-state-danger/35',
};

/** CSS color value: use for SVG fill/stroke */
export const toneVar: Record<Tone, string> = {
  neutral:   'var(--muted-foreground)',
  primary:   'var(--primary)',
  current:   'var(--state-current)',
  candidate: 'var(--state-candidate)',
  visited:   'var(--state-visited)',
  path:      'var(--state-path)',
  danger:    'var(--state-danger)',
};
