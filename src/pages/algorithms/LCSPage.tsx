import { useState, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { Badge, Button, SegmentedControl, type Tone } from '../../components/ui';
import LCSGrid from '../../algorithms/lcs/LCSGrid';
import StringsView from '../../algorithms/lcs/StringsView';
import LCSCodeViewer from '../../algorithms/lcs/CodeViewer';
import LCSProblemList from '../../algorithms/lcs/ProblemList';
import LCSInfoModal from '../../algorithms/lcs/InfoModal';
import { generateEditSteps, generateLCSSteps } from '../../algorithms/lcs/solver';
import { DEFAULT_INPUT, MAX_LEN, type LCSMode, type LCSStepType } from '../../algorithms/lcs/types';
import { useLang, useTr } from '../../i18n';

const STEP_TONE: Record<LCSStepType, Tone> = {
  INIT: 'neutral',
  MATCH: 'visited',
  MISMATCH: 'candidate',
  REPLACE: 'candidate',
  INSERT: 'current',
  DELETE: 'danger',
  BACKTRACK: 'path',
  DONE: 'path',
};

const clean = (s: string) => s.replace(/\s+/g, '').slice(0, MAX_LEN);

interface StringFormProps {
  a: string;
  b: string;
  onApply: (a: string, b: string) => void;
  onReset: () => void;
}

/** Two string inputs; remounted (via key) whenever the applied strings change. */
function StringForm({ a, b, onApply, onReset }: StringFormProps) {
  const tr = useTr();
  const [draftA, setDraftA] = useState(a);
  const [draftB, setDraftB] = useState(b);
  const valid = clean(draftA).length > 0 && clean(draftB).length > 0;
  const inputClass = 'h-8 w-28 sm:w-32 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground placeholder:text-hint shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={e => { e.preventDefault(); if (valid) onApply(clean(draftA), clean(draftB)); }}
    >
      {([['A', draftA, setDraftA], ['B', draftB, setDraftB]] as const).map(([label, value, set]) => (
        <label key={label} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          {label}
          <input
            type="text"
            value={value}
            maxLength={MAX_LEN}
            onChange={e => set(e.target.value)}
            aria-label={tr(`문자열 ${label} (최대 ${MAX_LEN}글자)`, `String ${label} (up to ${MAX_LEN} characters)`)}
            title={tr(`문자열 ${label} (최대 ${MAX_LEN}글자)`, `String ${label} (up to ${MAX_LEN} characters)`)}
            className={inputClass}
          />
        </label>
      ))}
      <Button type="submit" variant="primary" disabled={!valid}>{tr('적용', 'Apply')}</Button>
      <Button type="button" variant="secondary" onClick={onReset}>
        <RotateCcw className="w-3.5 h-3.5" />
        {tr('예제', 'Example')}
      </Button>
    </form>
  );
}

export default function LCSPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [mode, setMode] = useState<LCSMode>('lcs');
  const [inputs, setInputs] = useState(DEFAULT_INPUT);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { a, b } = inputs[mode];

  const steps = useMemo(
    () => (mode === 'lcs' ? generateLCSSteps(a, b, lang) : generateEditSteps(a, b, lang)),
    [mode, a, b, lang],
  );
  const pb = usePlayback(steps.length);
  const step = steps[pb.index] ?? steps[0];

  const markers = useMemo(
    () => steps.flatMap((s, i) => (s.type === 'MATCH' ? [{ index: i, tone: 'visited' as Tone }] : [])),
    [steps],
  );

  const handleMode = (m: LCSMode) => { setMode(m); pb.reset(); };
  const apply = (na: string, nb: string) => {
    setInputs(prev => ({ ...prev, [mode]: { a: na, b: nb } }));
    pb.reset();
  };

  const title = mode === 'lcs' ? tr('최장 공통 부분 수열 (LCS)', 'Longest common subsequence') : tr('편집 거리', 'Edit distance');

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={title}
            onInfo={() => setIsModalOpen(true)}
            tabs={
              <SegmentedControl
                id="lcs-mode"
                value={mode}
                onChange={handleMode}
                options={[
                  { value: 'lcs', label: 'LCS' },
                  { value: 'edit', label: tr('편집 거리', 'Edit distance') },
                ]}
              />
            }
          />
        }
        scrollable={
          <div className="flex flex-col">
            <StepBanner
              tone={STEP_TONE[step.type]}
              badge={step.type}
              description={step.description}
              aside={step.result !== null && (
                <Badge tone="path" className="font-mono">
                  {mode === 'lcs' ? 'LCS' : tr('거리', 'dist')} {step.result}
                </Badge>
              )}
            />
            <div className="px-3 sm:px-5 py-2.5 border-y border-border">
              <StringForm
                key={`${mode}|${a}|${b}`}
                a={a}
                b={b}
                onApply={apply}
                onReset={() => apply(DEFAULT_INPUT[mode].a, DEFAULT_INPUT[mode].b)}
              />
            </div>
            <div className="p-3 sm:p-5 flex flex-col gap-4">
              <LCSGrid mode={mode} a={a} b={b} step={step} />
              <StringsView mode={mode} a={a} b={b} step={step} />
            </div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        rightPanel={
          <RightPanel
            code={<LCSCodeViewer mode={mode} codeLine={step.codeLine} />}
            problems={<LCSProblemList />}
          />
        }
      />
      <LCSInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => pb.reset(true)}
        mode={mode}
      />
    </>
  );
}
