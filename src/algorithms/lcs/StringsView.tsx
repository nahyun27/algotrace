import { Badge, Panel, cn, type Tone } from '../../components/ui';
import { toneSoft, toneSolid } from '../../components/ui/tone';
import { useTr } from '../../i18n';
import type { EditOpType, LCSMode, LCSStep } from './types';

interface StringsViewProps {
  mode: LCSMode;
  a: string;
  b: string;
  step: LCSStep;
}

const FILL_TYPES = new Set(['MATCH', 'MISMATCH', 'REPLACE', 'INSERT', 'DELETE']);

const OP_TONE: Record<EditOpType, Tone> = {
  MATCH: 'visited',
  REPLACE: 'candidate',
  INSERT: 'current',
  DELETE: 'danger',
};

const OP_SYMBOL: Record<EditOpType, string> = { MATCH: '=', REPLACE: 'R', INSERT: 'I', DELETE: 'D' };

function CharBox({ ch, tone, solid }: { ch: string; tone: Tone | null; solid?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex w-8 h-8 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-bold transition-colors duration-300',
        tone === null ? 'bg-card border-border text-foreground' : cn('border-transparent', solid ? toneSolid[tone] : toneSoft[tone]),
      )}
    >
      {ch}
    </span>
  );
}

/** The two input strings under the DP table: matched characters (LCS) or the edit script (edit distance). */
export default function StringsView({ mode, a, b, step }: StringsViewProps) {
  const tr = useTr();
  const filling = FILL_TYPES.has(step.type) && step.cell !== null;
  const [ci, cj] = step.cell ?? [-1, -1];

  if (mode === 'edit' && step.script.length > 0) {
    const counts = { REPLACE: 0, INSERT: 0, DELETE: 0 };
    for (const o of step.script) if (o.op !== 'MATCH') counts[o.op]++;
    const opLabel: Record<EditOpType, string> = {
      MATCH: tr('유지', 'keep'),
      REPLACE: tr('교체', 'replace'),
      INSERT: tr('삽입', 'insert'),
      DELETE: tr('삭제', 'delete'),
    };
    return (
      <Panel
        title={step.type === 'DONE' ? tr('편집 순서', 'Edit script') : tr('편집 순서 (역추적 중)', 'Edit script (backtracking)')}
        actions={(['REPLACE', 'INSERT', 'DELETE'] as const).map(op => (
          <Badge key={op} tone={OP_TONE[op]} className="font-mono">{opLabel[op]} {counts[op]}</Badge>
        ))}
        bodyClassName="p-3 sm:p-4 overflow-x-auto"
      >
        <div className="inline-grid grid-flow-col auto-cols-max gap-x-1.5 gap-y-1 items-center" style={{ gridTemplateRows: 'repeat(3, auto)' }}>
          <span className="text-xs font-semibold text-muted-foreground pr-1">A</span>
          <span className="text-xs font-semibold text-muted-foreground pr-1" />
          <span className="text-xs font-semibold text-muted-foreground pr-1">B</span>
          {step.script.flatMap((o, k) => [
            <CharBox key={`a${k}`} ch={o.a ?? '-'} tone={o.a === null ? null : OP_TONE[o.op]} />,
            <span key={`o${k}`} className="text-center font-mono text-[11px] font-bold text-muted-foreground" title={opLabel[o.op]}>{OP_SYMBOL[o.op]}</span>,
            <CharBox key={`b${k}`} ch={o.b ?? '-'} tone={o.b === null ? null : OP_TONE[o.op]} />,
          ])}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {tr('= 유지 · R 교체 · I 삽입 · D 삭제', '= keep · R replace · I insert · D delete')}
        </p>
      </Panel>
    );
  }

  const inLcsA = new Set(step.matchA), inLcsB = new Set(step.matchB);
  const toneFor = (k: number, active: number, inLcs: Set<number>): Tone | null =>
    inLcs.has(k) ? 'path' : filling && k === active ? 'current' : null;
  const lcs = step.matchA.map(k => a[k]).join('');

  return (
    <Panel
      title={tr('두 문자열', 'The two strings')}
      actions={mode === 'lcs' && step.type === 'DONE' && (
        <Badge tone="path" className="font-mono">LCS = "{lcs}"</Badge>
      )}
      bodyClassName="p-3 sm:p-4 flex flex-col gap-2 overflow-x-auto"
    >
      {[{ label: 'A', s: a, active: ci - 1, set: inLcsA }, { label: 'B', s: b, active: cj - 1, set: inLcsB }].map(row => (
        <div key={row.label} className="flex items-center gap-1.5">
          <span className="w-5 text-xs font-semibold text-muted-foreground">{row.label}</span>
          {[...row.s].map((ch, k) => (
            <CharBox key={k} ch={ch} tone={toneFor(k, row.active, row.set)} solid={row.set.has(k)} />
          ))}
        </div>
      ))}
      {mode === 'lcs' && (
        <p className="text-xs text-muted-foreground">
          {tr('역추적이 끝나면 LCS에 들어간 글자가 보라색으로 표시돼요.', 'Characters in the LCS turn violet as the backtrack finds them.')}
        </p>
      )}
      {mode === 'edit' && (
        <p className="text-xs text-muted-foreground">
          {tr('표를 다 채우면 역추적으로 편집 순서를 만들어요.', 'Once the table is full, backtracking builds the edit script.')}
        </p>
      )}
    </Panel>
  );
}
