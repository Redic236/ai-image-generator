import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { SIZE_OPTIONS, STYLE_OPTIONS } from '../lib/constants';
import type { GenerateParams, ImageSize, ImageStyle } from '../types';

interface PromptCardProps {
  promptValue: string;
  onPromptChange: (value: string) => void;
  onGenerate: (params: GenerateParams) => void;
  onOptimize: (params: Pick<GenerateParams, 'prompt' | 'style'>) => void;
  isGenerating: boolean;
  isOptimizing: boolean;
}

export function PromptCard({
  promptValue,
  onPromptChange,
  onGenerate,
  onOptimize,
  isGenerating,
  isOptimizing,
}: PromptCardProps) {
  const [size, setSize] = useState<ImageSize>('1024x1024');
  const [style, setStyle] = useState<ImageStyle>('realistic');

  const busy = isGenerating || isOptimizing;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onGenerate({ prompt: promptValue, size, style });
    }
  };

  return (
    <section className="glass rounded-3xl p-6 shadow-card md:p-8">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label
            htmlFor="prompt"
            className="flex items-center gap-2 text-sm font-semibold text-ink-800"
          >
            <StepBadge n={1} />
            描述你想要的画面
          </label>
          <span className="text-xs text-ink-400">{promptValue.length} / 1000</span>
        </div>
        <div className="relative">
          <textarea
            id="prompt"
            rows={4}
            maxLength={1000}
            placeholder="例如：夕阳下的京都老街，樱花飘落，电影感打光，4K 超精细..."
            value={promptValue}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full resize-none rounded-2xl border border-ink-200 bg-white/70 px-4 py-3.5 text-[15px] text-ink-800 placeholder-ink-400 shadow-inner outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
          />
          <div className="pointer-events-none absolute bottom-3 right-3 text-[11px] text-ink-300">
            Ctrl + Enter 生成
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-800">
            <StepBadge n={2} />
            图片尺寸
          </p>
          <div className="grid grid-cols-3 gap-2">
            {SIZE_OPTIONS.map((opt) => (
              <SizeChip
                key={opt.value}
                value={opt.value}
                label={opt.label}
                selected={size === opt.value}
                onSelect={() => setSize(opt.value)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-800">
            <StepBadge n={3} />
            图片风格
          </p>
          <div className="grid grid-cols-2 gap-2">
            {STYLE_OPTIONS.map((opt) => (
              <StyleChip
                key={opt.value}
                value={opt.value}
                label={opt.label}
                desc={opt.desc}
                selected={style === opt.value}
                onSelect={() => setStyle(opt.value)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => onOptimize({ prompt: promptValue, style })}
          disabled={busy}
          className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-5 py-3.5 text-sm font-semibold text-ink-700 shadow-sm transition hover:-translate-y-[1px] hover:border-purple-300 hover:text-purple-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isOptimizing ? (
            <>
              <Spinner className="h-4 w-4" /> 优化中...
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4 transition group-hover:rotate-12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09Z"
                />
              </svg>
              优化提示词
            </>
          )}
        </button>
        <button
          onClick={() => onGenerate({ prompt: promptValue, size, style })}
          disabled={busy}
          className="group relative inline-flex flex-[1.5] items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-[1px] hover:shadow-[0_24px_60px_-16px_rgba(236,72,153,0.55)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGenerating ? (
            <>
              <Spinner className="h-4 w-4" /> 生成中...
            </>
          ) : (
            <>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
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
                  d="m5 12 4.24-4.24a4 4 0 0 1 5.66 0L19 12m-7 8v-8"
                />
              </svg>
              生成图片
            </>
          )}
        </button>
      </div>
    </section>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-pink-500 text-[11px] font-bold text-white">
      {n}
    </span>
  );
}

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4Z" />
    </svg>
  );
}

interface SizeChipProps {
  value: ImageSize;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

function SizeChip({ value, label, selected, onSelect }: SizeChipProps) {
  const [w, h] = value.split('x');
  const aspectClass =
    value === '1024x1024' ? 'h-8 w-8' : value === '1344x768' ? 'h-6 w-10' : 'h-10 w-6';
  return (
    <label className="chip cursor-pointer">
      <input type="radio" name="size" value={value} checked={selected} onChange={onSelect} />
      <div className="rounded-xl border border-ink-200 bg-white/70 px-3 py-3 text-center">
        <div className={`mx-auto rounded-md border-2 border-current ${aspectClass}`} />
        <div className="mt-2 text-sm font-medium">{label}</div>
        <div className="chip-sub mt-0.5 text-[11px] text-ink-400">
          {w} × {h}
        </div>
      </div>
    </label>
  );
}

interface StyleChipProps {
  value: ImageStyle;
  label: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
}

function StyleChip({ value, label, desc, selected, onSelect }: StyleChipProps) {
  const gradient =
    value === 'realistic' ? 'from-blue-500 to-cyan-400' : 'from-pink-500 to-rose-400';
  return (
    <label className="chip cursor-pointer">
      <input type="radio" name="style" value={value} checked={selected} onChange={onSelect} />
      <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white/70 px-4 py-3">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white`}
        >
          {value === 'realistic' ? (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75 7.5 10.5l4.5 4.5m-4.5-4.5 4.5 4.5m0 0L16.5 10.5m-4.5 4.5 4.5 4.5M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.998 15.998 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
              />
            </svg>
          )}
        </div>
        <div className="text-left">
          <div className="text-sm font-medium">{label}</div>
          <div className="chip-sub text-[11px] text-ink-400">{desc}</div>
        </div>
      </div>
    </label>
  );
}
