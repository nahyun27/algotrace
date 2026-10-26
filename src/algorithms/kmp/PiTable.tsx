import { Repeat, MapPin } from 'lucide-react';
import DPGrid from '../../components/viz/DPGrid';
import { Badge, Panel } from '../../components/ui';
import { useTr } from '../../i18n';
import type { KMPStep } from './types';

/** The failure table as a two-row grid: the pattern characters and pi. */
export function PiTable({ step, pattern }: { step: KMPStep; pattern: string }) {
  const tr = useTr();
  return (
    <DPGrid
      title={<span className="inline-flex items-center gap-1.5"><Repeat className="w-4 h-4" aria-hidden />{tr('실패 함수 pi', 'Failure table pi')}</span>}
      corner="i"
      rowLabels={['p[i]', 'pi[i]']}
      colLabels={Array.from(pattern, (_, k) => k)}
      values={[Array.from(pattern, c => (c === ' ' ? '␣' : c)), step.pi]}
      cellState={(r, c) => {
        if (r === 0) return step.phase === 'pi' && c === step.i && step.type !== 'INIT' ? 'current' : 'idle';
        if (c === step.piCell) return 'current';
        return step.pi[c] !== null ? 'visited' : 'idle';
      }}
      deps={step.piRead !== null ? [[1, step.piRead]] : []}
    />
  );
}

/** Every start position found so far. */
export function FoundPanel({ step }: { step: KMPStep }) {
  const tr = useTr();
  return (
    <Panel
      title={tr('찾은 위치', 'Matches found')}
      icon={MapPin}
      iconTone="path"
      actions={<Badge tone={step.found.length > 0 ? 'path' : 'neutral'} className="font-mono">{step.found.length}</Badge>}
      bodyClassName="p-3 flex flex-col gap-2"
    >
      {step.found.length === 0 ? (
        <p className="text-sm text-muted-foreground">{tr('아직 찾은 위치가 없어요.', 'No match yet.')}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {step.found.map(s => (
            <Badge key={s} tone="path" className="font-mono">
              {tr(`인덱스 ${s}`, `index ${s}`)}
            </Badge>
          ))}
        </div>
      )}
      <p className="text-[11px] text-hint">
        {tr('백준 1786은 1부터 센 위치를 출력해요: ', 'BOJ 1786 prints positions counted from 1: ')}
        <span className="font-mono">{step.found.length > 0 ? step.found.map(s => s + 1).join(' ') : tr('없음', 'none')}</span>
      </p>
    </Panel>
  );
}
