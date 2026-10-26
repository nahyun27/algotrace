/**
 * Shared colors for SVG visualizations. All values are CSS color strings built on the
 * --state-* tokens, so they follow the theme automatically — never branch on dark mode.
 *
 * Apply via `style={{ fill, stroke }}` (color-mix() needs the style property, not attributes).
 */
export type VizState = 'idle' | 'current' | 'candidate' | 'visited' | 'path' | 'danger';

export interface NodeColors {
  fill: string;
  stroke: string;
  text: string;
}

const mix = (color: string, pct: number, base: string) => `color-mix(in oklab, ${color} ${pct}%, ${base})`;

export const NODE_COLORS: Record<VizState, NodeColors> = {
  idle:      { fill: 'var(--state-idle)', stroke: 'var(--state-idle-stroke)', text: 'var(--state-idle-fg)' },
  current:   { fill: 'var(--state-current)', stroke: mix('var(--state-current)', 70, 'black'), text: '#ffffff' },
  candidate: { fill: 'var(--state-candidate)', stroke: mix('var(--state-candidate)', 70, 'black'), text: '#3a2500' },
  visited:   { fill: mix('var(--state-visited)', 24, 'var(--card)'), stroke: 'var(--state-visited)', text: mix('var(--state-visited)', 55, 'var(--foreground)') },
  path:      { fill: 'var(--state-path)', stroke: mix('var(--state-path)', 70, 'black'), text: '#ffffff' },
  danger:    { fill: 'var(--state-danger)', stroke: mix('var(--state-danger)', 70, 'black'), text: '#ffffff' },
};

export const EDGE_COLORS: Record<VizState, string> = {
  idle: 'var(--graph-edge)',
  current: 'var(--state-current)',
  candidate: 'var(--state-candidate)',
  visited: 'var(--state-visited)',
  path: 'var(--state-path)',
  danger: 'var(--state-danger)',
};

/** Soft halo drawn behind an emphasized node */
export const haloColor = (state: VizState) => (state === 'idle' ? 'transparent' : NODE_COLORS[state].fill);
