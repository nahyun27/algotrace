import { useState, useMemo } from 'react';
import { SkipForward } from 'lucide-react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { Badge, Button, cn, type Tone } from '../../components/ui';
import { LCATree, UpTable } from '../../algorithms/lca/LCAViz';
import LCACodeViewer from '../../algorithms/lca/CodeViewer';
import LCAProblemList from '../../algorithms/lca/ProblemList';
import LCAInfoModal from '../../algorithms/lca/InfoModal';
import { generateLCASteps } from '../../algorithms/lca/solver';
import { DEFAULT_TREE, MAX_NODES, PRESET_QUERIES, parseTree, type LCAStepType, type TreeInput } from '../../algorithms/lca/types';
import { useLang, useTr } from '../../i18n';

const STEP_TONE: Record<LCAStepType, Tone> = {
  INIT: 'neutral',
  DFS_VISIT: 'current',
  TABLE_FILL: 'current',
  QUERY: 'current',
  LIFT: 'candidate',
  JUMP_BOTH: 'candidate',
  SKIP_JUMP: 'neutral',
  FOUND: 'path',
  DONE: 'path',
};

const selectClass =
  'h-8 rounded-lg border border-border bg-card px-2 text-xs font-mono font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40';
const inputClass =
  'h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground placeholder:text-hint shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

const edgesText = (tree: TreeInput) => tree.edges.map(([a, b]) => `${a} ${b}`).join(', ');

function TreeInputBar({ value, onApply }: { value: TreeInput; onApply: (t: TreeInput) => void }) {
  const tr = useTr();
  const [text, setText] = useState(edgesText(value));
  const [error, setError] = useState<string | null>(null);

  const apply = () => {
    const parsed = parseTree(text);
    if ('error' in parsed) {
      const messages = {
        format: tr('간선은 "a b" 쌍을 쉼표로 구분해 입력해 주세요.', 'Write each edge as "a b", separated by commas.'),
        size: tr(`노드는 2~${MAX_NODES}개 (간선 1~${MAX_NODES - 1}개)여야 해요.`, `Use 2 to ${MAX_NODES} nodes (1 to ${MAX_NODES - 1} edges).`),
        range: tr('노드 번호는 1부터 N(간선 수 + 1)까지, 자기 자신과 잇는 간선은 안 돼요.', 'Node numbers must be 1..N (edges + 1), with no self-loops.'),
        notTree: tr('사이클이 있어요. 하나의 트리가 되도록 입력해 주세요.', 'That has a cycle. The edges must form one tree.'),
      };
      setError(messages[parsed.error]);
      return;
    }
    setError(null);
    onApply(parsed);
  };

  return (
    <form className="flex flex-wrap items-center gap-2" onSubmit={e => { e.preventDefault(); apply(); }}>
      <label className="text-xs font-semibold text-muted-foreground" htmlFor="lca-edges">{tr('간선', 'Edges')}</label>
      <input
        id="lca-edges"
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        className={`${inputClass} flex-1 min-w-[200px]`}
      />
      <Button type="submit" variant="primary">{tr('적용', 'Apply')}</Button>
      <Button type="button" onClick={() => { setText(edgesText(DEFAULT_TREE)); setError(null); onApply(DEFAULT_TREE); }}>
        {tr('예제로', 'Reset')}
      </Button>
      <p className={cn('w-full text-[11px]', error ? 'text-state-danger font-semibold' : 'text-hint')}>
        {error ?? tr(
          `루트는 1이에요. 노드 번호는 1부터 차례로, 최대 ${MAX_NODES}개까지 쓸 수 있어요.`,
          `The root is node 1. Number the nodes 1, 2, 3, ... (up to ${MAX_NODES}).`,
        )}
      </p>
    </form>
  );
}

export default function LCAPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tree, setTree] = useState<TreeInput>(DEFAULT_TREE);
  const [query, setQuery] = useState({ u: PRESET_QUERIES[0].u, v: PRESET_QUERIES[0].v });

  const steps = useMemo(() => generateLCASteps(tree, query.u, query.v, lang), [tree, query, lang]);
  const pb = usePlayback(steps.length);
  const step = steps[pb.index] ?? steps[0];

  const queryIndex = useMemo(() => steps.findIndex(s => s.type === 'QUERY'), [steps]);
  const markers = useMemo(
    () => steps.flatMap((s, i) =>
      s.type === 'QUERY' ? [{ index: i, tone: 'current' as Tone }]
        : s.type === 'FOUND' ? [{ index: i, tone: 'path' as Tone }] : []),
    [steps],
  );

  // The preprocessing does not depend on the query, so a new query keeps its QUERY step index
  const changeQuery = (u: number, v: number) => {
    setQuery({ u, v });
    pb.goTo(queryIndex);
  };
  const changeTree = (t: TreeInput) => {
    setTree(t);
    setQuery(t === DEFAULT_TREE ? { u: PRESET_QUERIES[0].u, v: PRESET_QUERIES[0].v } : { u: t.n, v: Math.max(1, t.n - 1) });
    pb.reset();
  };

  const nodes = Array.from({ length: tree.n }, (_, i) => i + 1);
  const presetLabel = { depth: tr('깊이가 다른 쌍', 'Different depths'), subtree: tr('다른 서브트리', 'Different subtrees') };

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={tr('최소 공통 조상 (LCA)', 'Lowest common ancestor (LCA)')}
            onInfo={() => setIsModalOpen(true)}
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner
              tone={STEP_TONE[step.type]}
              badge={step.type}
              description={step.description}
              aside={
                <>
                  {step.k !== null && <Badge tone="current" outline className="font-mono">k = {step.k}</Badge>}
                  {step.diff !== null && <Badge tone="candidate" className="font-mono">diff = {step.diff}</Badge>}
                  {step.lca !== null && <Badge tone="path" className="font-mono">LCA = {step.lca}</Badge>}
                </>
              }
            />
            <div className="px-3 sm:px-5 py-2.5 border-b border-border flex items-center gap-x-3 gap-y-2 flex-wrap">
              <span className="text-xs font-bold text-foreground">{tr('쿼리', 'Query')}</span>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                u
                <select value={query.u} onChange={e => changeQuery(Number(e.target.value), query.v)} className={selectClass}>
                  {nodes.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                v
                <select value={query.v} onChange={e => changeQuery(query.u, Number(e.target.value))} className={selectClass}>
                  {nodes.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </label>
              {tree === DEFAULT_TREE && PRESET_QUERIES.map(p => (
                <Button
                  key={p.id}
                  variant={query.u === p.u && query.v === p.v ? 'primary' : 'soft'}
                  onClick={() => changeQuery(p.u, p.v)}
                >
                  {presetLabel[p.id]} <span className="font-mono">({p.u}, {p.v})</span>
                </Button>
              ))}
              <Button variant="ghost" onClick={() => pb.goTo(queryIndex)} className="ml-auto">
                <SkipForward className="w-3.5 h-3.5" aria-hidden />
                {tr('쿼리 단계로', 'Skip to query')}
              </Button>
            </div>
            <div className="border-b border-border">
              <LCATree tree={tree} steps={steps} index={pb.index} query={query} />
            </div>
            <div className="p-3 sm:p-5 flex flex-col gap-4">
              <UpTable step={step} />
              <TreeInputBar value={tree} onApply={changeTree} />
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        rightPanel={
          <RightPanel
            code={<LCACodeViewer codeLine={step.codeLine} />}
            problems={<LCAProblemList />}
          />
        }
      />
      <LCAInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => pb.reset(true)}
      />
    </>
  );
}
