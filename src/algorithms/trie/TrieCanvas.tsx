import { useMemo } from 'react';
import { ListChecks } from 'lucide-react';
import TreeView, { type TreeNode } from '../../components/viz/TreeView';
import type { VizState } from '../../components/viz/palette';
import { Badge, Panel, type Tone } from '../../components/ui';
import { useTr } from '../../i18n';
import type { TrieNodeSnap, TrieStep } from './types';

/** Children in alphabetical order, like a children[26] array. */
function buildTree(nodes: TrieNodeSnap[]): TreeNode {
  const ends = new Set(nodes.filter(n => n.end).map(n => n.id));
  const ids = nodes.map(n => n.id);
  const make = (id: string): TreeNode => ({
    id,
    label: id === '' ? 'root' : '',
    sublabel: ends.has(id) ? id : undefined,
    children: ids.filter(c => c.length === id.length + 1 && c.startsWith(id)).sort().map(make),
  });
  return make('');
}

export default function TrieCanvas({ step }: { step: TrieStep }) {
  const tr = useTr();
  const root = useMemo(() => buildTree(step.nodes), [step.nodes]);
  const ends = useMemo(() => new Set(step.nodes.filter(n => n.end).map(n => n.id)), [step.nodes]);

  // nodes on the current walk: root, word[0..1), word[0..2), ...
  const walk = useMemo(() => new Set(Array.from({ length: step.depth + 1 }, (_, k) => step.word.slice(0, k))), [step.word, step.depth]);
  const searching = step.phase === 'search';
  const failed = step.result === false;
  const settled = step.result !== null;

  const stateOf = (id: TreeNode['id']): VizState => {
    const k = String(id);
    if (k === step.node) {
      if (step.type === 'INIT') return 'idle';
      if (step.type === 'CREATE') return 'candidate';
      if (searching && settled) return failed ? 'danger' : 'path';
      return 'current';
    }
    if (searching && walk.has(k)) return 'path';
    return ends.has(k) ? 'visited' : 'idle';
  };

  const edgeStateOf = (_parent: TreeNode['id'], child: TreeNode['id']): VizState => {
    if (step.type === 'INIT' || !walk.has(String(child))) return 'idle';
    return searching ? 'path' : 'current';
  };

  return (
    <TreeView
      root={root}
      radius={16}
      stateOf={stateOf}
      edgeStateOf={edgeStateOf}
      edgeLabelOf={(_p, c) => String(c).slice(-1)}
      className="min-h-[300px]"
      legend={[
        { state: 'current', label: tr('현재 노드', 'Current node') },
        { state: 'candidate', label: tr('새로 만든 노드', 'New node') },
        { state: 'visited', label: tr('단어 끝', 'Word end') },
        { state: 'path', label: tr('찾은 경로', 'Lookup path') },
        { state: 'danger', label: tr('찾기 실패', 'Lookup failed') },
      ]}
    />
  );
}

/** Input words with their insert status, plus the query. */
export function WordListPanel({ step, words, query, modeLabel }: { step: TrieStep; words: string[]; query: string; modeLabel: string }) {
  const tr = useTr();
  const done = step.inserted.length;
  const toneOf = (i: number): Tone => {
    if (i < done) return 'visited';
    if (i === done && step.phase === 'insert' && step.type !== 'INIT') return 'current';
    return 'neutral';
  };
  const queryTone: Tone = step.phase !== 'search' ? 'neutral' : step.result === null ? 'current' : step.result ? 'path' : 'danger';

  return (
    <Panel
      title={tr('단어 목록', 'Words')}
      icon={ListChecks}
      iconTone="visited"
      actions={<Badge tone="visited" className="font-mono">{done} / {words.length}</Badge>}
      bodyClassName="p-3 flex flex-col gap-3"
    >
      <div className="flex flex-wrap gap-1.5">
        {words.map((w, i) => (
          <Badge key={`${w}-${i}`} tone={toneOf(i)} outline={toneOf(i) === 'neutral'} className="font-mono">{w}</Badge>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-muted-foreground">{modeLabel}</span>
        <Badge tone={queryTone} className="font-mono">{query}</Badge>
        {step.result !== null && (
          <span className="font-mono font-bold">{step.result ? 'True' : 'False'}</span>
        )}
      </div>
    </Panel>
  );
}
