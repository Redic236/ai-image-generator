import { useEffect, useRef } from 'react';
import { CloseIcon } from './icons';

interface Shortcut {
  keys: string[];
  description: string;
}

const SHORTCUTS: ReadonlyArray<Shortcut> = [
  { keys: ['Ctrl', 'Enter'], description: '生成图片（在输入框内）' },
  { keys: ['/'], description: '聚焦提示词输入框' },
  { keys: ['?'], description: '显示此快捷键帮助' },
  { keys: ['Esc'], description: '关闭弹窗 / 抽屉 / 放大预览' },
];

interface ShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[min(92vw,420px)] rounded-2xl border border-ink-200 bg-white p-0 text-ink-800 shadow-2xl backdrop:bg-ink-900/60 backdrop:backdrop-blur-sm dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
    >
      <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4 dark:border-ink-700">
        <h3 className="text-base font-semibold">键盘快捷键</h3>
        <button
          onClick={onClose}
          aria-label="关闭"
          className="rounded-lg p-1 text-ink-400 transition hover:bg-ink-50 hover:text-ink-700 dark:hover:bg-ink-700 dark:hover:text-ink-100"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
      <ul className="space-y-3 px-6 py-5">
        {SHORTCUTS.map((s) => (
          <li key={s.description} className="flex items-center justify-between gap-4">
            <span className="text-sm text-ink-600 dark:text-ink-300">{s.description}</span>
            <div className="flex gap-1">
              {s.keys.map((key) => (
                <kbd
                  key={key}
                  className="rounded border border-ink-200 bg-ink-50 px-2 py-0.5 font-mono text-[11px] text-ink-700 shadow-sm dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t border-ink-100 px-6 py-3 text-[11px] text-ink-400 dark:border-ink-700 dark:text-ink-500">
        提示：在输入框聚焦时，<kbd className="mx-0.5 rounded border border-ink-200 bg-ink-50 px-1 font-mono text-[10px] text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300">?</kbd>
        和 <kbd className="mx-0.5 rounded border border-ink-200 bg-ink-50 px-1 font-mono text-[10px] text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300">/</kbd> 会当作普通字符输入。
      </div>
    </dialog>
  );
}
