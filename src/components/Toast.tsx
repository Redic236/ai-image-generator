import { useToast } from '../context/ToastContext';

export function Toast() {
  const { message } = useToast();
  const visible = !!message;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-800 shadow-2xl transition-all duration-300 dark:border-ink-700 dark:bg-ink-100 dark:text-ink-900 ${
        visible ? 'opacity-100 translate-y-0' : 'translate-y-2 opacity-0'
      }`}
    >
      {message}
    </div>
  );
}
