import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

/** Types for algorithm catalogue entries. Each algorithm folder exports one from its `meta.ts`. */

export interface Localized {
  ko: string;
  en: string;
}

export type CategoryId = 'search' | 'shortest-path' | 'graph' | 'dp' | 'sorting';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Category {
  id: CategoryId;
  name: Localized;
  /** Gradient used for icon tiles of this category */
  gradient: string;
}

export interface AlgorithmMeta {
  /** URL segment: /algorithm/<slug> */
  slug: string;
  category: CategoryId;
  /** Position within its category (ascending) */
  order: number;
  icon: LucideIcon;
  name: Localized;
  /** Shorter name for tight spots (sidebar, breadcrumb); defaults to `name` */
  shortName?: Localized;
  description: Localized;
  difficulty: Difficulty;
  time: string;
  space: string;
  /** Lower-case search terms for the home page */
  keywords: string[];
  /** Lazy page import: the page becomes its own chunk */
  load: () => Promise<{ default: ComponentType }>;
}

/** Identity helper so `meta.ts` files get full type checking. */
export function defineAlgorithm(meta: AlgorithmMeta): AlgorithmMeta {
  return meta;
}
