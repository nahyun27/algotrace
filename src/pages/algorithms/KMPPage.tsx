import { useState, useMemo } from 'react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { Badge, Button, type Tone } from '../../components/ui';
import StringStage from '../../algorithms/kmp/StringStage';
import { PiTable, FoundPanel } from '../../algorithms/kmp/PiTable';
import KMPCodeViewer from '../../algorithms/kmp/CodeViewer';
import KMPProblemList from '../../algorithms/kmp/ProblemList';
import KMPInfoModal from '../../algorithms/kmp/InfoModal';
import { generateKMPSteps } from '../../algorithms/kmp/solver';
import { DEFAULT_PATTERN, DEFAULT_TEXT, MAX_PATTERN, MAX_TEXT, type KMPStepType } from '../../algorithms/kmp/types';
import { useLang, useTr } from '../../i18n';

const STEP_TONE: Record<KMPStepType, Tone> = {
  INIT: 'neutral',
  PI_MATCH: 'candidate',
  PI_FALLBACK: 'danger',
  PI_SET: 'current',
  SEARCH_MATCH: 'candidate',
  SEARCH_MISMATCH: 'danger',
  SEARCH_FALLBACK: 'current',
  FOUND: 'path',
  DONE: 'path',
};

interface KMPInput { text: string; pattern: string }

const inputClass =
  'h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground placeholder:text-hint shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

function InputBar({ value, onApply }: { value: KMPInput; onApply: (v: KMPInput) => void }) {
  const tr = useTr();
  const [text, setText] = useState(value.text);
  const [pattern, setPattern] = useState(value.pattern);
  const [error, setError] = useState<string | null>(null);

  const apply = () => {
    if (text.length < 1 || text.length > MAX_TEXT) {
      setError(tr(`텍스트는 1~${MAX_TEXT}글자로 입력해 주세요.`, `The text must be 1 to ${MAX_TEXT} characters long.`));
      return;
    }
    if (pattern.length < 1 || pattern.length > MAX_PATTERN) {
      setError(tr(`패턴은 1~${MAX_PATTERN}글자로 입력해 주세요.`, `The pattern must be 1 to ${MAX_PATTERN} characters long.`));
      return;
    }
    setError(null);
    onApply({ text, pattern });
  };

  return (
    <form className="flex flex-wrap items-center gap-2" onSubmit={e => { e.preventDefault(); apply(); }}>
      <label className="text-xs font-semibold text-muted-foreground" htmlFor="kmp-text">{tr('텍스트', 'Text')}</label>
      <input
        id="kmp-text"
        type="text"
        value={text}
        maxLength={MAX_TEXT}
        onChange={e => setText(e.target.value)}
        className={`${inputClass} flex-1 min-w-[200px]`}
      />
      <label className="text-xs font-semibold text-muted-foreground" htmlFor="kmp-pattern">{tr('패턴', 'Pattern')}</label>
      <input
        id="kmp-pattern"
        type="text"
        value={pattern}
        maxLength={MAX_PATTERN}
        onChange={e => setPattern(e.target.value)}
        className={`${inputClass} w-36`}
      />
      <Button type="submit" variant="primary">{tr('적용', 'Apply')}</Button>
      <Button type="button" onClick={() => { setText(DEFAULT_TEXT); setPattern(DEFAULT_PATTERN); setError(null); onApply({ text: DEFAULT_TEXT, pattern: DEFAULT_PATTERN }); }}>
        {tr('기본값', 'Default')}
      </Button>
      <p className={`w-full text-[11px] ${error ? 'text-state-danger font-semibold' : 'text-hint'}`}>
        {error ?? tr(
          `텍스트는 ${MAX_TEXT}글자, 패턴은 ${MAX_PATTERN}글자까지 입력할 수 있어요. 대소문자를 구분해요.`,
          `Up to ${MAX_TEXT} characters of text and ${MAX_PATTERN} of pattern. Matching is case-sensitive.`,
        )}
      </p>
    </form>
  );
}

export default function KMPPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [input, setInput] = useState<KMPInput>({ text: DEFAULT_TEXT, pattern: DEFAULT_PATTERN });

  const steps = useMemo(() => generateKMPSteps(input.text, input.pattern, lang), [input, lang]);
  const pb = usePlayback(steps.length);
  const step = steps[pb.index] ?? steps[0];

  const comparisons = useMemo(
    () => steps.slice(0, pb.index + 1).filter(s => s.cmp !== null).length,
    [steps, pb.index],
  );
  const markers = useMemo(
    () => steps.flatMap((s, i) => (s.type === 'FOUND' ? [{ index: i, tone: 'path' as Tone }] : [])),
    [steps],
  );

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={tr('KMP 문자열 검색', 'KMP string search')}
            onInfo={() => setIsModalOpen(true)}
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner
              tone={STEP_TONE[step.type]}
              badge={step.type}
              description={step.description}
              aside={<Badge tone="candidate" className="font-mono">{tr('비교', 'Compares')} {comparisons}</Badge>}
            />
            <div className="border-b border-border">
              <StringStage step={step} text={input.text} pattern={input.pattern} />
            </div>
            <div className="p-3 sm:p-5 flex flex-col gap-4">
              <PiTable step={step} pattern={input.pattern} />
              <FoundPanel step={step} />
              <InputBar value={input} onApply={v => { setInput(v); pb.reset(); }} />
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        rightPanel={
          <RightPanel
            code={<KMPCodeViewer codeLine={step.codeLine} />}
            problems={<KMPProblemList />}
          />
        }
      />
      <KMPInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => pb.reset(true)}
      />
    </>
  );
}
