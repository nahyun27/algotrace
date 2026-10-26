import type { TrieMode, TrieNodeSnap, TrieStep } from './types';
import { makeTr, type Lang } from '../../i18n';

type StepInput = Omit<TrieStep, 'nodes' | 'inserted' | 'created' | 'result'> & Partial<Pick<TrieStep, 'created' | 'result'>>;

/**
 * Inserts every word into a trie, then looks up `query` as a whole word ('search') or as a prefix ('prefix').
 * Node ids are the prefixes they spell, so the root is ''.
 */
export function generateTrieSteps(words: string[], query: string, mode: TrieMode, lang: Lang = 'ko'): TrieStep[] {
  const tr = makeTr(lang);
  const steps: TrieStep[] = [];
  const nodes = new Map<string, TrieNodeSnap>([['', { id: '', end: false }]]);
  const inserted: string[] = [];
  const show = (id: string) => (id === '' ? 'root' : `"${id}"`);

  const push = (s: StepInput) => {
    steps.push({
      created: null, result: null, ...s,
      nodes: [...nodes.values()].map(n => ({ ...n })),
      inserted: [...inserted],
    });
  };

  push({
    type: 'INIT', phase: 'insert', word: '', depth: 0, node: '',
    description: tr(
      `빈 트라이(루트만 있음)에서 시작해요. 단어 ${words.length}개를 차례로 넣은 뒤 "${query}"를 찾아요.`,
      `Start with an empty trie (just the root). Insert ${words.length} word${words.length === 1 ? '' : 's'}, then look up "${query}".`,
    ),
    codeLine: 1,
  });

  // Insert
  for (const word of words) {
    let id = '';
    push({
      type: 'VISIT', phase: 'insert', word, depth: 0, node: '',
      description: tr(`"${word}" 넣기: 루트에서 출발해요.`, `Insert "${word}": start at the root.`),
      codeLine: 2,
    });
    for (let d = 0; d < word.length; d++) {
      const c = word[d];
      const next = id + c;
      if (nodes.has(next)) {
        push({
          type: 'VISIT', phase: 'insert', word, depth: d + 1, node: next,
          description: tr(
            `${show(id)}에 '${c}' 자식이 이미 있어요. 새로 만들지 않고 그 노드로 내려가요.`,
            `${show(id)} already has a '${c}' child. Reuse it and move down.`,
          ),
          codeLine: 3,
        });
      } else {
        nodes.set(next, { id: next, end: false });
        push({
          type: 'CREATE', phase: 'insert', word, depth: d + 1, node: next, created: next,
          description: tr(
            `${show(id)}에 '${c}' 자식이 없어요. 새 노드 ${show(next)}를 만들고 내려가요.`,
            `${show(id)} has no '${c}' child. Create node ${show(next)} and move down.`,
          ),
          codeLine: 4,
        });
      }
      id = next;
    }
    const wasEnd = nodes.get(id)!.end;
    nodes.get(id)!.end = true;
    inserted.push(word);
    push({
      type: 'MARK_END', phase: 'insert', word, depth: word.length, node: id,
      description: wasEnd
        ? tr(`"${word}"는 이미 단어 끝으로 표시되어 있어요. 그대로 둬요.`, `"${word}" is already marked as a word end. Nothing changes.`)
        : tr(`${show(id)}를 단어 끝(end = True)으로 표시해요. "${word}" 삽입 완료!`, `Mark ${show(id)} as a word end (end = True). "${word}" inserted!`),
      codeLine: 5,
    });
  }

  // Lookup
  const what = mode === 'search' ? tr('단어', 'word') : tr('접두사', 'prefix');
  push({
    type: 'SEARCH_STEP', phase: 'search', word: query, depth: 0, node: '',
    description: mode === 'search'
      ? tr(`단어 "${query}" 찾기: 루트에서 한 글자씩 따라 내려가요.`, `Search word "${query}": follow it down from the root one character at a time.`)
      : tr(`접두사 "${query}" 찾기: 루트에서 한 글자씩 따라 내려가요.`, `Starts with "${query}": follow it down from the root one character at a time.`),
    codeLine: 6,
  });

  let id = '';
  let result: boolean | null = null;
  for (let d = 0; d < query.length; d++) {
    const c = query[d];
    const next = id + c;
    if (!nodes.has(next)) {
      result = false;
      push({
        type: 'NOT_FOUND', phase: 'search', word: query, depth: d, node: id, result,
        description: tr(
          `${show(id)}에 '${c}' 자식이 없어요. "${query}"로 시작하는 단어가 없으니 False.`,
          `${show(id)} has no '${c}' child. No stored word starts with "${query}", so False.`,
        ),
        codeLine: 8,
      });
      break;
    }
    id = next;
    push({
      type: 'SEARCH_STEP', phase: 'search', word: query, depth: d + 1, node: id,
      description: tr(`'${c}' 간선을 따라 ${show(id)}로 내려가요.`, `Follow the '${c}' edge down to ${show(id)}.`),
      codeLine: 7,
    });
  }

  if (result === null) {
    const end = nodes.get(id)!.end;
    result = mode === 'prefix' || end;
    push({
      type: result ? 'FOUND' : 'NOT_FOUND', phase: 'search', word: query, depth: query.length, node: id, result,
      description: mode === 'prefix'
        ? tr(
          `"${query}"를 끝까지 따라왔어요. 이 노드 아래의 단어들은 모두 "${query}"로 시작하니 True.`,
          `Reached the end of "${query}". Every word below this node starts with "${query}", so True.`,
        )
        : end
          ? tr(`${show(id)}는 단어 끝으로 표시되어 있어요. "${query}"는 저장된 단어예요. True.`, `${show(id)} is marked as a word end, so "${query}" is a stored word. True.`)
          : tr(
            `경로는 있지만 ${show(id)}가 단어 끝이 아니에요. "${query}"는 다른 단어의 접두사일 뿐이라 False.`,
            `The path exists, but ${show(id)} is not a word end. "${query}" is only a prefix of other words, so False.`,
          ),
      codeLine: 9,
    });
  }

  push({
    type: 'DONE', phase: 'search', word: query, depth: steps[steps.length - 1].depth, node: id, result,
    description: tr(
      `[완료] ${what} "${query}": ${result ? '있음 (True)' : '없음 (False)'}. 조회는 글자 수 L에 비례해 O(L)이에요.`,
      `[Done] ${what} "${query}": ${result ? 'found (True)' : 'not found (False)'}. A lookup costs O(L) in the query length.`,
    ),
    codeLine: 10,
  });

  return steps;
}

/** Final answer of a lookup (for tests and summaries). */
export function trieLookup(words: string[], query: string, mode: TrieMode): boolean {
  return generateTrieSteps(words, query, mode, 'en').at(-1)!.result === true;
}
