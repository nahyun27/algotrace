import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn, IconButton } from '.';
import { useTr } from '../../i18n';

const sizeClass = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl h-[90vh]',
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: keyof typeof sizeClass;
  /** Rendered in the sticky top bar next to the close button */
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
  /** Accent strip color at the top of the dialog */
  accent?: string;
}

export default function Modal({ isOpen, onClose, size = 'lg', header, footer, children, bodyClassName, accent }: ModalProps) {
  const tr = useTr();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6">
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0b0d1f]/55 backdrop-blur-[2px]"
          />
          <motion.div
            key="dialog"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={cn(
              'relative w-full max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-xl',
              sizeClass[size],
            )}
          >
            {accent && <div className="h-1.5 w-full shrink-0" style={{ background: accent }} />}
            <div className="flex items-start gap-3 px-5 sm:px-7 pt-5 pb-3 shrink-0">
              <div className="flex-1 min-w-0">{header}</div>
              <IconButton label={tr('닫기 (Esc)', 'Close (Esc)')} onClick={onClose} className="-mr-2 -mt-1">
                <X className="w-5 h-5" />
              </IconButton>
            </div>
            <div className={cn('flex-1 min-h-0 overflow-y-auto px-5 sm:px-7 pb-6', bodyClassName)}>
              {children}
            </div>
            {footer && (
              <div className="shrink-0 border-t border-border bg-muted/40 px-5 sm:px-7 py-3.5 flex items-center justify-end gap-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
