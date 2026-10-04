import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#181a24] rounded-2xl border border-[#e5e7eb] dark:border-[#1e2030] shadow-2xl max-w-md w-full p-6 animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5 stroke-[2.25]" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9ca3af] hover:text-[#4b5563] dark:hover:text-[#e5e7eb] hover:bg-[#f3f4f6] dark:hover:bg-[#252836] transition-colors"
            title="Cancel"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <h3
            id="confirm-delete-title"
            className="text-base font-bold text-[#111827] dark:text-[#f3f4f6] tracking-tight mb-2"
          >
            {title}
          </h3>

          {itemName && (
            <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-[#f3f4f6] dark:bg-[#12141c] border border-[#e5e7eb] dark:border-[#252836] text-xs font-semibold text-[#1f2937] dark:text-[#e5e7eb] truncate">
              "{itemName}"
            </div>
          )}

          <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
            {message ||
              'Are you sure you want to delete this item? This action is permanent and cannot be undone.'}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#6b7280] dark:text-[#9ca3af] hover:text-[#111827] dark:hover:text-white hover:bg-[#f3f4f6] dark:hover:bg-[#252836] transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
