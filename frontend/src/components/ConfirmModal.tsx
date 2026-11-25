import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { modalBackdropVariants, modalPanelVariants } from '../animations/motion';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onClose,
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => !loading && onClose()}
            className="fixed inset-0 bg-[#0B1120]/70 backdrop-blur-[2px]"
          />
          <motion.div
            variants={modalPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full max-w-md border border-[#DDDAD0] bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id="modal-title"
                className="font-display text-xl font-semibold text-[#0B1120]"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                aria-label="Close dialog"
                className="text-[#141D30]/60 hover:text-[#0B1120] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#141D30]/80">
              {description}
            </p>
            {children && <div className="mt-4">{children}</div>}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#DDDAD0]/60 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="border border-[#DDDAD0] bg-white px-4 py-2 text-sm font-medium text-[#0B1120] hover:bg-[#F7F6F2] transition-colors rounded-[4px]"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white transition-colors rounded-[4px] disabled:opacity-60 ${
                  destructive
                    ? 'bg-[#E05A47] hover:bg-[#c35941]'
                    : 'bg-[#0B1120] hover:bg-[#141D30]'
                }`}
              >
                {loading ? 'Processing...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
