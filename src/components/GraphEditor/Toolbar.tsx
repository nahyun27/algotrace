import { MousePointer2, PlusCircle, ArrowRightCircle, Trash2, RotateCcw, ArrowLeftRight, ChevronDown, MoveRight } from 'lucide-react';
import { useState } from 'react';
import { Button, SegmentedControl, cn } from '../ui';
import { toneSoft } from '../ui/tone';
import { useTr } from '../../i18n';

export type EditorMode = 'SELECT' | 'ADD_NODE' | 'ADD_EDGE';

interface Preset {
  label: string;
  onLoad: () => void;
}

interface ToolbarProps {
  mode: EditorMode;
  onModeChange: (m: EditorMode) => void;
  directed: boolean;
  onDirectedToggle: () => void;
  canDelete: boolean;
  onDelete: () => void;
  onReset: () => void;
  presets: Preset[];
  nodeCount: number;
  maxNodes: number;
}

export default function Toolbar({
  mode, onModeChange, directed, onDirectedToggle,
  canDelete, onDelete, onReset, presets, nodeCount, maxNodes,
}: ToolbarProps) {
  const tr = useTr();
  const [presetOpen, setPresetOpen] = useState(false);

  const modeOptions: { value: EditorMode; label: React.ReactNode }[] = [
    { value: 'SELECT',   label: <span className="flex items-center gap-1.5"><MousePointer2 size={14} /><span className="hidden sm:inline">{tr('선택 / 이동', 'Select / move')}</span></span> },
    { value: 'ADD_NODE', label: <span className="flex items-center gap-1.5"><PlusCircle size={14} /><span className="hidden sm:inline">{tr('노드 추가', 'Add node')}</span></span> },
    { value: 'ADD_EDGE', label: <span className="flex items-center gap-1.5"><ArrowRightCircle size={14} /><span className="hidden sm:inline">{tr('간선 추가', 'Add edge')}</span></span> },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-border bg-muted/40">
      <SegmentedControl id="graph-editor-mode" options={modeOptions} value={mode} onChange={onModeChange} />

      <Button
        onClick={onDirectedToggle}
        title={tr('방향 그래프 / 무방향 그래프 전환', 'Toggle directed / undirected')}
        className={directed ? 'bg-primary-soft text-primary border-primary/30' : ''}
      >
        {directed ? <MoveRight size={14} /> : <ArrowLeftRight size={14} />}
        {directed ? tr('방향 그래프', 'Directed') : tr('무방향 그래프', 'Undirected')}
      </Button>

      <Button
        onClick={onDelete}
        disabled={!canDelete}
        title={tr('선택한 노드/간선 삭제 (Delete)', 'Delete selection (Delete)')}
        className={canDelete ? `${toneSoft.danger} border-state-danger/30` : ''}
      >
        <Trash2 size={14} />
        <span className="hidden sm:inline">{tr('삭제', 'Delete')}</span>
      </Button>

      <Button onClick={onReset} title={tr('캔버스 비우기', 'Clear canvas')}>
        <RotateCcw size={14} />
        <span className="hidden sm:inline">{tr('비우기', 'Clear')}</span>
      </Button>

      <div className="ml-auto flex items-center gap-2">
        {presets.length > 0 && (
          <div className="relative">
            <Button onClick={() => setPresetOpen(p => !p)} aria-expanded={presetOpen}>
              {tr('예제 불러오기', 'Load example')}
              <ChevronDown size={13} className={cn('transition-transform', presetOpen && 'rotate-180')} />
            </Button>
            {presetOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setPresetOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[200px] rounded-xl border border-border bg-popover p-1 shadow-xl">
                  {presets.map(p => (
                    <button
                      key={p.label}
                      onClick={() => { p.onLoad(); setPresetOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <span className={cn(
          'text-xs font-bold px-2.5 py-1 rounded-full tabular-nums',
          nodeCount >= maxNodes ? toneSoft.danger : 'bg-card border border-border text-muted-foreground',
        )}>
          {tr('노드', 'Nodes')} {nodeCount} / {maxNodes}
        </span>
      </div>
    </div>
  );
}
