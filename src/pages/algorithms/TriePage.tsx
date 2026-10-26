import { useState, useMemo } from 'react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { useUrlState } from '../../components/algorithm/useUrlState';
import { Badge, Button, SegmentedControl, type Tone } from '../../components/ui';
import TrieCanvas, { WordListPanel } from '../../algorithms/trie/TrieCanvas';
import TrieCodeViewer from '../../algorithms/trie/CodeViewer';
import TrieProblemList from '../../algorithms/trie/ProblemList';
import TrieInfoModal from '../../algorithms/trie/InfoModal';
import { generateTrieSteps } from '../../algorithms/trie/solver';
import { DEFAULT_QUERY, DEFAULT_WORDS, MAX_WORDS, MAX_WORD_LEN, type TrieMode, type TrieStepType } from '../../algorithms/trie/types';
import { useLang, useTr } from '../../i18n';

const STEP_TONE: Record<TrieStepType, Tone> = {
  INIT: 'neutral',
  VISIT: 'current',
  CREATE: 'candidate',
  MARK_END: 'visited',
  SEARCH_STEP: 'current',
  FOUND: 'path',
  NOT_FOUND: 'danger',
  DONE: 'path',
};

interface TrieInput { words: string[]; query: string }

const inputClass =
  'h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground placeholder:text-hint shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

const WORD_RE = new RegExp(`^[a-z]{1,${MAX_WORD_LEN}}$`);

function InputBar({ value, onApply }: { value: TrieInput; onApply: (v: TrieInput) => void }) {
  const tr = useTr();
  const [wordsText, setWordsText] = useState(value.words.join(', '));
  const [query, setQuery] = useState(value.query);
  const [error, setError] = useState<string | null>(null);

  const apply = () => {
    const words = wordsText.toLowerCase().split(/[,\s]+/).filter(Boolean);
    const q = query.trim().toLowerCase();
    if (words.length < 1 || words.length > MAX_WORDS || words.some(w => !WORD_RE.test(w))) {
      setError(tr(
        `단어는 1~${MAX_WORDS}개, 각각 영어 소문자 1~${MAX_WORD_LEN}글자로 입력해 주세요.`,
        `Enter 1 to ${MAX_WORDS} words, each 1 to ${MAX_WORD_LEN} lowercase letters (a-z).`,
      ));
      return;
    }
    if (!WORD_RE.test(q)) {
      setError(tr(`찾을 문자열은 영어 소문자 1~${MAX_WORD_LEN}글자로 입력해 주세요.`, `The query must be 1 to ${MAX_WORD_LEN} lowercase letters (a-z).`));
      return;
    }
    setWordsText(words.join(', '));
    setQuery(q);
    setError(null);
    onApply({ words, query: q });
  };

  return (
    <form className="flex flex-wrap items-center gap-2" onSubmit={e => { e.preventDefault(); apply(); }}>
      <label className="text-xs font-semibold text-muted-foreground" htmlFor="trie-words">{tr('단어', 'Words')}</label>
      <input
        id="trie-words"
        type="text"
        value={wordsText}
        onChange={e => setWordsText(e.target.value)}
        className={`${inputClass} flex-1 min-w-[200px]`}
      />
      <label className="text-xs font-semibold text-muted-foreground" htmlFor="trie-query">{tr('찾을 문자열', 'Query')}</label>
      <input
        id="trie-query"
        type="text"
        value={query}
        maxLength={MAX_WORD_LEN}
        onChange={e => setQuery(e.target.value)}
        className={`${inputClass} w-28`}
      />
      <Button type="submit" variant="primary">{tr('적용', 'Apply')}</Button>
      <Button
        type="button"
        onClick={() => {
          setWordsText(DEFAULT_WORDS.join(', ')); setQuery(DEFAULT_QUERY); setError(null);
          onApply({ words: DEFAULT_WORDS, query: DEFAULT_QUERY });
        }}
      >
        {tr('기본값', 'Default')}
      </Button>
      <p className={`w-full text-[11px] ${error ? 'text-state-danger font-semibold' : 'text-hint'}`}>
        {error ?? tr(
          `쉼표로 구분한 단어 최대 ${MAX_WORDS}개 (영어 소문자, ${MAX_WORD_LEN}글자 이하). 단어를 모두 넣은 뒤 찾을 문자열을 조회해요.`,
          `Up to ${MAX_WORDS} comma-separated words (a-z, at most ${MAX_WORD_LEN} letters). All words are inserted, then the query is looked up.`,
        )}
      </p>
    </form>
  );
}

export default function TriePage() {
  const { lang } = useLang();
  const tr = useTr();
  const [mode, setMode] = useUrlState<TrieMode>('mode', ['search', 'prefix'], 'search');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [input, setInput] = useState<TrieInput>({ words: DEFAULT_WORDS, query: DEFAULT_QUERY });

  const steps = useMemo(() => generateTrieSteps(input.words, input.query, mode, lang), [input, mode, lang]);
  const pb = usePlayback(steps.length);
  const step = steps[pb.index] ?? steps[0];

  const markers = useMemo(
    () => steps.flatMap((s, i) => (s.type === 'MARK_END' ? [{ index: i, tone: 'visited' as Tone }] : [])),
    [steps],
  );

  const tabs: { value: TrieMode; label: string }[] = [
    { value: 'search', label: tr('단어 찾기', 'Search word') },
    { value: 'prefix', label: tr('접두사 찾기', 'Starts with') },
  ];
  const changeMode = (m: TrieMode) => { setMode(m); pb.reset(); };
  const modeLabel = tabs.find(t => t.value === mode)!.label;

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={tr('트라이', 'Trie')}
            onInfo={() => setIsModalOpen(true)}
            tabs={<SegmentedControl id="trie-mode" value={mode} onChange={changeMode} options={tabs} />}
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner
              tone={STEP_TONE[step.type]}
              badge={step.type}
              description={step.description}
              aside={<Badge tone="neutral" className="font-mono">{tr('노드', 'Nodes')} {step.nodes.length}</Badge>}
            />
            <div className="border-b border-border">
              <TrieCanvas step={step} />
            </div>
            <div className="p-3 sm:p-5 flex flex-col gap-4">
              <WordListPanel step={step} words={input.words} query={input.query} modeLabel={modeLabel} />
              <InputBar value={input} onApply={v => { setInput(v); pb.reset(); }} />
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        rightPanel={
          <RightPanel
            code={<TrieCodeViewer codeLine={step.codeLine} />}
            problems={<TrieProblemList />}
          />
        }
      />
      <TrieInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => pb.reset(true)}
      />
    </>
  );
}
