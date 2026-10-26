export type TrieStepType = 'INIT' | 'VISIT' | 'CREATE' | 'MARK_END' | 'SEARCH_STEP' | 'FOUND' | 'NOT_FOUND' | 'DONE';

/** 'search': is the query a stored word? 'prefix': does any stored word start with the query? */
export type TrieMode = 'search' | 'prefix';

/** A trie node; its id is the prefix it spells ('' = root). */
export interface TrieNodeSnap {
  id: string;
  end: boolean;
}

export interface TrieStep {
  type: TrieStepType;
  phase: 'insert' | 'search';
  /** Word being inserted, or the query */
  word: string;
  /** Characters of `word` consumed so far */
  depth: number;
  /** Node the walk is on (prefix id) */
  node: string;
  /** Node created on this step */
  created: string | null;
  /** Every node in the trie after this step, in creation order */
  nodes: TrieNodeSnap[];
  /** Words fully inserted so far (in input order, duplicates kept) */
  inserted: string[];
  /** Search outcome on FOUND / NOT_FOUND / DONE */
  result: boolean | null;
  description: string;
  codeLine: number;
}

export const DEFAULT_WORDS = ['tree', 'trie', 'algo', 'assoc', 'all', 'also'];
export const DEFAULT_QUERY = 'al';
export const MAX_WORDS = 8;
export const MAX_WORD_LEN = 8;
