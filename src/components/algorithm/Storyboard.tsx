import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { IconButton, cn } from '../ui';
import { useTr } from '../../i18n';

export interface StoryFrame {
  /** The picture for this moment (MiniGraph, ArrayView, TreeView, any small JSX) */
  visual: ReactNode;
  /** One or two plain sentences about what changed */
  caption: ReactNode;
}

/** A tiny slideshow: one small example shown moment by moment, with a caption under each picture. */
export default function Storyboard({ frames }: { frames: StoryFrame[] }) {
  const tr = useTr();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const last = frames.length - 1;

  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setI(p => (p >= last ? 0 : p + 1)), i >= last ? 3600 : 2600);
    return () => clearTimeout(t);
  }, [playing, i, last]);

  const go = (n: number) => { setPlaying(false); setI(Math.max(0, Math.min(last, n))); };
  const frame = frames[i];

  return (
    <div className="rounded-3xl border border-border overflow-hidden bg-card">
      <div className="viz-surface relative h-[240px] sm:h-[280px] flex items-center justify-center p-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full flex items-center justify-center"
          >
            {frame.visual}
          </motion.div>
        </AnimatePresence>
        <span className="absolute top-3 left-3 rounded-full bg-card/90 border border-border px-2.5 py-0.5 text-xs font-bold tabular-nums">
          {i + 1} / {frames.length}
        </span>
      </div>
      <div className="border-t border-border px-4 sm:px-5 py-3.5 flex items-start gap-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 text-[15px] leading-relaxed font-medium min-h-[3.2em]"
          >
            {frame.caption}
          </motion.p>
        </AnimatePresence>
        <div className="flex items-center gap-0.5 shrink-0">
          <IconButton size="sm" label={tr('이전 장면', 'Previous')} onClick={() => go(i - 1)} disabled={i === 0}>
            <ChevronLeft className="w-4 h-4" />
          </IconButton>
          <IconButton size="sm" label={playing ? tr('멈춤', 'Pause') : tr('자동 재생', 'Autoplay')} onClick={() => setPlaying(p => !p)} active={playing}>
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </IconButton>
          <IconButton size="sm" label={tr('다음 장면', 'Next')} onClick={() => go(i + 1)} disabled={i === last}>
            <ChevronRight className="w-4 h-4" />
          </IconButton>
        </div>
      </div>
      <div className="flex justify-center gap-1.5 pb-3">
        {frames.map((_, n) => (
          <button
            key={n}
            onClick={() => go(n)}
            aria-label={tr(`${n + 1}번째 장면`, `Frame ${n + 1}`)}
            className={cn('h-1.5 rounded-full transition-all', n === i ? 'w-6 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground')}
          />
        ))}
      </div>
    </div>
  );
}
