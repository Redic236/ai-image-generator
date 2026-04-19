import { useEffect, useRef, useState } from 'react';
import { MODEL_OPTIONS } from '../lib/constants';
import { useSettings } from '../context/SettingsContext';

/** Split "CogView-3-Flash · 免费" into ["CogView-3-Flash", "免费"] for
 *  separate rendering of name + descriptor. Falls back gracefully. */
function splitLabel(label: string): { name: string; desc: string } {
  const parts = label.split('·').map((s) => s.trim());
  return { name: parts[0] ?? label, desc: parts[1] ?? '' };
}

export function ModelDropdown() {
  const { settings, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const current = MODEL_OPTIONS.find((m) => m.value === settings.model);
  const currentLabel = current ? splitLabel(current.label) : { name: settings.model, desc: '' };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`当前模型 ${currentLabel.name}，点击切换`}
        title="切换模型"
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-sm text-white/80 transition hover:bg-white/10 sm:px-3"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z"
          />
        </svg>
        <span className="hidden font-medium sm:inline">{currentLabel.name}</span>
        <svg
          className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-30 mt-1.5 w-60 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-2xl dark:border-ink-700 dark:bg-ink-800"
        >
          {MODEL_OPTIONS.map((opt) => {
            const selected = opt.value === settings.model;
            const { name, desc } = splitLabel(opt.label);
            return (
              <button
                key={opt.value}
                role="option"
                aria-selected={selected}
                onClick={() => {
                  updateSettings({ model: opt.value });
                  setIsOpen(false);
                }}
                className={`flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition ${
                  selected
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30'
                    : 'hover:bg-ink-50 dark:hover:bg-ink-700'
                }`}
              >
                <span className="mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center">
                  {selected && (
                    <span className="h-2 w-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                  )}
                </span>
                <span className="flex-1">
                  <span
                    className={`block text-sm font-medium ${
                      selected
                        ? 'text-purple-700 dark:text-purple-300'
                        : 'text-ink-800 dark:text-ink-100'
                    }`}
                  >
                    {name}
                  </span>
                  {desc && (
                    <span className="mt-0.5 block text-[11px] text-ink-400 dark:text-ink-500">
                      {desc}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
