import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../ui';
import { toneSoft, toneSolid, type Tone } from '../ui/tone';

interface StepBannerProps {
  tone: Tone;
  description: ReactNode;
  /** Short step-type label shown as a pill, e.g. "RELAX" */
  badge?: ReactNode;
  /** Extra content on the right (counters, etc.) */
  aside?: ReactNode;
  className?: string;
}

/** The "what is happening right now" line above the visualization. */
export default function StepBanner({ tone, description, badge, aside, className }: StepBannerProps) {
  return (
    <div className={cn('flex items-center gap-3 px-4 sm:px-5 py-2.5 min-h-[48px] transition-colors duration-300', toneSoft[tone], className)}>
      {badge && (
        <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide', toneSolid[tone])}>
          {badge}
        </span>
      )}
      <div className="flex-1 min-w-0 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={typeof description === 'string' ? description : undefined}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-semibold leading-snug text-pretty"
          >
            {description}
          </motion.p>
        </AnimatePresence>
      </div>
      {aside && <div className="shrink-0 flex items-center gap-1.5">{aside}</div>}
    </div>
  );
}
