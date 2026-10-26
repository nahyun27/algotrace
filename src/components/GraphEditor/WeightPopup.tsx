import { useEffect, useRef } from 'react';
import { Button, Kbd } from '../ui';
import { useTr } from '../../i18n';

interface WeightPopupProps {
  /** SVG container div의 bounding rect 기준 px 좌표 */
  x: number;
  y: number;
  defaultValue?: number;
  onConfirm: (weight: number) => void;
  onCancel: () => void;
}

export default function WeightPopup({ x, y, defaultValue = 1, onConfirm, onCancel }: WeightPopupProps) {
  const tr = useTr();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const confirm = () => {
    const v = parseInt(inputRef.current?.value ?? '1', 10);
    onConfirm(isNaN(v) || v <= 0 ? 1 : v);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') confirm();
    else if (e.key === 'Escape') onCancel();
  };

  return (
    <div
      className="absolute z-50 rounded-2xl border border-border bg-popover p-3.5 shadow-xl flex flex-col gap-2.5 min-w-[200px]"
      style={{ left: x, top: y, transform: 'translate(-50%, -110%)' }}
    >
      <p className="text-xs font-bold text-muted-foreground">{tr('간선 가중치', 'Edge weight')}</p>
      <div className="flex gap-1.5">
        <input
          ref={inputRef}
          type="number"
          min={1}
          defaultValue={defaultValue}
          onKeyDown={handleKeyDown}
          className="w-20 h-8 text-sm font-mono font-bold rounded-lg border border-border bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <Button variant="primary" onClick={confirm}>{tr('확인', 'OK')}</Button>
        <Button variant="ghost" onClick={onCancel}>{tr('취소', 'Cancel')}</Button>
      </div>
      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
        <Kbd>Enter</Kbd> {tr('확인', 'confirm')} · <Kbd>Esc</Kbd> {tr('취소', 'cancel')}
      </p>
    </div>
  );
}
