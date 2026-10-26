import type { AlgorithmMeta, Category, CategoryId, Difficulty, Localized } from './catalog';

export type { AlgorithmMeta, Category, CategoryId, Difficulty, Localized } from './catalog';

/**
 * Single source of truth for the algorithm catalogue — the sidebar, home page,
 * top bar breadcrumb and router all read from here.
 *
 * Algorithms register themselves: every `src/algorithms/<folder>/meta.ts` is picked up
 * automatically, so adding an algorithm never touches this file.
 */

export const CATEGORIES: Category[] = [
  { id: 'search',        name: { ko: '탐색', en: 'Searching' },                gradient: 'from-rose-400 to-pink-500' },
  { id: 'shortest-path', name: { ko: '최단 경로', en: 'Shortest paths' },        gradient: 'from-sky-400 to-blue-500' },
  { id: 'graph',         name: { ko: '그래프 & 트리', en: 'Graphs & trees' },      gradient: 'from-emerald-400 to-teal-500' },
  { id: 'dp',            name: { ko: '동적 계획법', en: 'Dynamic programming' }, gradient: 'from-violet-400 to-fuchsia-500' },
  { id: 'sorting',       name: { ko: '정렬', en: 'Sorting' },                   gradient: 'from-amber-400 to-orange-500' },
];

const modules = import.meta.glob<{ default: AlgorithmMeta }>('./*/meta.ts', { eager: true });

const categoryRank = (id: CategoryId) => CATEGORIES.findIndex(c => c.id === id);

/** All algorithms, ordered by category then `order`. */
export const ALGORITHMS: AlgorithmMeta[] = Object.values(modules)
  .map(m => m.default)
  .sort((a, b) => categoryRank(a.category) - categoryRank(b.category) || a.order - b.order);

/** Categories that currently have at least one algorithm. */
export const ACTIVE_CATEGORIES: Category[] = CATEGORIES.filter(c => ALGORITHMS.some(a => a.category === c.id));

export function getAlgorithm(slug: string | undefined) {
  return ALGORITHMS.find(a => a.slug === slug);
}

export function getCategory(id: CategoryId) {
  return CATEGORIES.find(c => c.id === id)!;
}

export const DIFFICULTY_LABEL: Record<Difficulty, Localized> = {
  easy:   { ko: '쉬움', en: 'Easy' },
  medium: { ko: '보통', en: 'Medium' },
  hard:   { ko: '어려움', en: 'Hard' },
};
