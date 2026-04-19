import { useEffect, useId, useRef } from 'react';
import { CloseIcon } from './icons';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' tints the confirm button rose for destructive actions. */
  tone?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Minimal promise-less confirm dialog. Replaces window.confirm() so the
 * prompt UI matches the rest of the app (dark-mode aware, themed buttons,
 * Esc + backdrop to cancel).
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '确认',
  cancelLabel = '取消',
  tone = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  const confirmClass =
    tone === 'danger'
      ? 'bg-gradient-to-r from-rose-500 to-orange-500 hover:shadow-md'
      : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-md';

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      aria-labelledby={titleId}
      aria-describedby={message ? messageId : undefined}
      className="w-[min(92vw,400px)] rounded-2xl border border-ink-200 bg-white p-0 text-ink-800 shadow-2xl backdrop:bg-ink-900/60 backdrop:backdrop-blur-sm dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
    >
      <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4 dark:border-ink-700">
        <h3 id={titleId} className="text-base font-semibold">
          {title}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          aria-label="关闭"
          className="rounded-lg p-1 text-ink-400 transition hover:bg-ink-50 hover:text-ink-700 dark:hover:bg-ink-700 dark:hover:text-ink-100"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
      {message && (
        <p id={messageId} className="px-6 py-5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
          {message}
        </p>
      )}
      <div className="flex items-center justify-end gap-2 border-t border-ink-100 bg-ink-50/50 px-6 py-3 dark:border-ink-700 dark:bg-ink-900/40">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-700"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          autoFocus
          className={`rounded-lg ${confirmClass} px-4 py-2 text-sm font-semibold text-white shadow-sm transition`}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
