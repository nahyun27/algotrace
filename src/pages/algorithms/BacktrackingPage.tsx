import { useMemo, useState, type ReactNode } from 'react';
import StepController from '../../components/algorithm/StepController';
import RightPanel from '../../components/algorithm/RightPanel';
import AlgorithmLayout from '../../components/algorithm/AlgorithmLayout';
import AlgorithmHeader from '../../components/algorithm/AlgorithmHeader';
import StepBanner from '../../components/algorithm/StepBanner';
import { usePlayback } from '../../components/algorithm/usePlayback';
import { useUrlState } from '../../components/algorithm/useUrlState';
import { Badge, SegmentedControl, type Tone } from '../../components/ui';
import BacktrackingCodeViewer from '../../algorithms/backtracking/CodeViewer';
import BacktrackingInfoModal from '../../algorithms/backtracking/InfoModal';
import BacktrackingProblemList from '../../algorithms/backtracking/ProblemList';
import { DepthTrail, QueensBoard, SolutionGallery } from '../../algorithms/backtracking/QueensView';
import { SudokuBoard } from '../../algorithms/backtracking/SudokuView';
import { generateQueensSteps, generateSudokuSteps } from '../../algorithms/backtracking/solver';
import {
  SUDOKU_PRESETS,
  type QueensMode,
  type QueensStep,
  type QueensStepType,
  type SudokuPresetId,
  type SudokuStep,
  type SudokuStepType,
} from '../../algorithms/backtracking/types';
import { useLang, useTr } from '../../i18n';

const QUEENS_TONE: Record<QueensStepType, Tone> = {
  INIT: 'neutral',
  PLACE: 'current',
  CONFLICT: 'danger',
  BACKTRACK: 'candidate',
  SOLUTION: 'path',
  DONE: 'path',
};

const SUDOKU_TONE: Record<SudokuStepType, Tone> = {
  INIT: 'neutral',
  TRY: 'current',
  INVALID: 'danger',
  FILL_OK: 'visited',
  BACKTRACK: 'candidate',
  SOLVED: 'path',
  DONE: 'path',
};

const VARIANTS = ['queens', 'sudoku'] as const;
const N_VALUES = ['4', '5', '6', '7', '8'] as const;
const RUN_MODES = ['all', 'first'] as const;
const PRESET_IDS = SUDOKU_PRESETS.map(p => p.id) as SudokuPresetId[];

export default function BacktrackingPage() {
  const { lang } = useLang();
  const tr = useTr();
  const [variant, setVariant] = useUrlState('mode', VARIANTS, 'queens');
  const [nText, setNText] = useUrlState('n', N_VALUES, '4');
  const [runMode, setRunMode] = useUrlState<QueensMode>('run', RUN_MODES, 'all');
  const [presetId, setPresetId] = useUrlState<SudokuPresetId>('puzzle', PRESET_IDS, 'small');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const n = Number(nText);
  const puzzle = (SUDOKU_PRESETS.find(p => p.id === presetId) ?? SUDOKU_PRESETS[0]).grid;

  const queensSteps = useMemo(() => (variant === 'queens' ? generateQueensSteps(n, runMode, lang) : []), [variant, n, runMode, lang]);
  const sudokuSteps = useMemo(() => (variant === 'sudoku' ? generateSudokuSteps(puzzle, lang) : []), [variant, puzzle, lang]);
  const total = variant === 'queens' ? queensSteps.length : sudokuSteps.length;
  const pb = usePlayback(total);

  const markers = useMemo(
    () => variant === 'queens'
      ? queensSteps.flatMap((s, i) => (s.type === 'SOLUTION' ? [{ index: i, tone: 'path' as Tone }] : []))
      : sudokuSteps.flatMap((s, i) => (s.type === 'BACKTRACK' ? [{ index: i, tone: 'candidate' as Tone }] : [])),
    [variant, queensSteps, sudokuSteps],
  );

  const change = <T,>(set: (v: T) => void) => (v: T) => { set(v); pb.reset(); };

  const tabs = (
    <SegmentedControl
      id="backtracking-variant"
      value={variant}
      onChange={change(setVariant)}
      options={[
        { value: 'queens', label: 'N-Queen' },
        { value: 'sudoku', label: tr('스도쿠', 'Sudoku') },
      ]}
    />
  );

  let body: ReactNode;
  let banner: ReactNode;
  let codeLine: number;

  if (variant === 'queens') {
    const step: QueensStep = queensSteps[pb.index] ?? queensSteps[0];
    const capped = queensSteps.some(s => s.skipped > 0);
    codeLine = step.codeLine;
    banner = (
      <StepBanner
        tone={QUEENS_TONE[step.type]}
        badge={step.type}
        description={step.description}
        aside={
          <>
            <Badge tone="current" className="font-mono">{tr('시도', 'Tries')} {step.tries}</Badge>
            <Badge tone="path" className="font-mono">{tr('해', 'Solutions')} {step.solutions}</Badge>
          </>
        }
      />
    );
    body = (
      <>
        <div className="flex flex-wrap gap-2 items-center justify-center">
          <span className="text-xs font-semibold text-muted-foreground">N</span>
          <SegmentedControl
            id="backtracking-n"
            value={nText}
            onChange={change(setNText)}
            options={N_VALUES.map(v => ({ value: v, label: v }))}
          />
          <SegmentedControl
            id="backtracking-run"
            value={runMode}
            onChange={change(setRunMode)}
            options={[
              { value: 'all', label: tr('모든 해 세기', 'Count all') },
              { value: 'first', label: tr('첫 해에서 멈춤', 'First solution only') },
            ]}
          />
        </div>
        <QueensBoard step={step} />
        <DepthTrail step={step} />
        <SolutionGallery step={step} capped={capped} />
      </>
    );
  } else {
    const step: SudokuStep = sudokuSteps[pb.index] ?? sudokuSteps[0];
    const blanks = puzzle.flat().filter(v => v === 0).length;
    codeLine = step.codeLine;
    banner = (
      <StepBanner
        tone={step.type === 'DONE' && !step.solved ? 'danger' : SUDOKU_TONE[step.type]}
        badge={step.type}
        description={step.description}
        aside={
          <>
            <Badge tone="current" className="font-mono">{tr('깊이', 'Depth')} {step.depth}/{blanks}</Badge>
            <Badge tone="candidate" className="font-mono">{tr('되돌림', 'Backtracks')} {step.backtracks}</Badge>
          </>
        }
      />
    );
    body = (
      <>
        <div className="flex flex-wrap gap-2 items-center justify-center">
          <SegmentedControl
            id="backtracking-puzzle"
            value={presetId}
            onChange={change(setPresetId)}
            options={SUDOKU_PRESETS.map(p => ({ value: p.id, label: p.label[lang] }))}
          />
        </div>
        <SudokuBoard step={step} puzzle={puzzle} />
      </>
    );
  }

  return (
    <>
      <AlgorithmLayout
        header={
          <AlgorithmHeader
            title={tr('N-Queen · 스도쿠', 'N-Queens · Sudoku')}
            onInfo={() => setIsModalOpen(true)}
            tabs={tabs}
          />
        }
        scrollable={
          <div className="flex flex-col">
            {banner}
            <div className="flex flex-col p-3 sm:p-5 gap-4">{body}</div>
          </div>
        }
        stepController={<StepController {...pb.controller} markers={markers} />}
        rightPanel={
          <RightPanel
            code={<BacktrackingCodeViewer variant={variant} codeLine={codeLine} />}
            problems={<BacktrackingProblemList />}
          />
        }
      />
      <BacktrackingInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartVisualization={() => pb.reset(true)}
      />
    </>
  );
}
