import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { SIZE_OPTIONS, STYLES } from '../lib/constants';
import type { GenerateParams, ImageSize, ImageStyle } from '../types';

const EXAMPLE_PROMPTS = [
  '夕阳下的京都老街，樱花纷飞',
  '赛博朋克少女，霓虹灯反射的雨夜',
  '水彩画风格的秋日山林',
  '极简主义风格的咖啡馆内景',
];

function charCountClass(length: number): string {
  if (length > 900) return 'text-rose-500';
  if (length > 800) return 'text-amber-500';
  return 'text-ink-400';
}

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
          <span className={`text-xs transition-colors ${charCountClass(promptValue.length)}`}>
            {promptValue.length} / 1000
          </span>
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
        {promptValue.trim().length === 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-400">试试：</span>
            {EXAMPLE_PROMPTS.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => onPromptChange(example)}
                className="rounded-full border border-ink-200 bg-white/60 px-2.5 py-1 text-[11px] text-ink-600 transition hover:border-purple-300 hover:bg-white hover:text-purple-600"
              >
                {example}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-6">
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
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-10">
            {STYLES.map((preset) => (
              <StyleChip
                key={preset.value}
                value={preset.value}
                label={preset.label}
                emoji={preset.emoji}
                gradient={preset.gradient}
                selected={style === preset.value}
                onSelect={() => setStyle(preset.value)}
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
  emoji: string;
  gradient: string;
  selected: boolean;
  onSelect: () => void;
}

function StyleChip({ value, label, emoji, gradient, selected, onSelect }: StyleChipProps) {
  return (
    <label className="chip cursor-pointer" title={label}>
      <input type="radio" name="style" value={value} checked={selected} onChange={onSelect} />
      <div className="flex flex-col items-center gap-1.5 rounded-xl border border-ink-200 bg-white/70 px-1.5 py-2.5 text-center">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-[18px] leading-none`}
          aria-hidden="true"
        >
          {emoji}
        </div>
        <div className="text-[11px] font-medium leading-tight">{label}</div>
      </div>
    </label>
  );
}
