import { useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import {
  PROMPT_DANGER_CHARS,
  PROMPT_MAX_CHARS,
  PROMPT_WARN_CHARS,
  SIZE_OPTIONS,
  STYLES,
} from '../lib/constants';
import { useFavorites } from '../context/FavoritesContext';
import { CloseIcon, Spinner } from './icons';
import type { BatchCount, GenerateParams, ImageSize, ImageStyle } from '../types';

const BATCH_OPTIONS: ReadonlyArray<{ value: BatchCount; label: string }> = [
  { value: 1, label: '1 张' },
  { value: 2, label: '2 张' },
  { value: 4, label: '4 张' },
];

const EXAMPLE_PROMPTS = [
  '夕阳下的京都老街，樱花纷飞',
  '赛博朋克少女，霓虹灯反射的雨夜',
  '水彩画风格的秋日山林',
  '极简主义风格的咖啡馆内景',
];

function charCountClass(length: number): string {
  if (length > PROMPT_DANGER_CHARS) return 'text-rose-500';
  if (length > PROMPT_WARN_CHARS) return 'text-amber-500';
  return 'text-ink-400';
}

interface PromptCardProps {
  promptValue: string;
  onPromptChange: (value: string) => void;
  onGenerate: (params: GenerateParams, count: BatchCount) => void;
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
  const [count, setCount] = useState<BatchCount>(1);

  const { favorites, add: addFavorite, remove: removeFavorite, has: isFavorited } =
    useFavorites();
  const canFavorite = promptValue.trim().length > 0;
  const favorited = canFavorite && isFavorited(promptValue);

  const handleToggleFavorite = () => {
    if (!canFavorite) return;
    if (favorited) removeFavorite(promptValue);
    else addFavorite(promptValue);
  };

  const busy = isGenerating || isOptimizing;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      // Prevent the shortcut from firing while a batch is already in flight
      // or an optimize call is pending — the onClick handler is disabled via
      // `busy` but the keydown path bypasses that unless we check here.
      if (busy) return;
      onGenerate({ prompt: promptValue, size, style }, count);
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
            {promptValue.length} / {PROMPT_MAX_CHARS}
          </span>
        </div>
        <div className="relative">
          <textarea
            id="prompt"
            rows={4}
            maxLength={PROMPT_MAX_CHARS}
            placeholder="例如：夕阳下的京都老街，樱花飘落，电影感打光，4K 超精细..."
            value={promptValue}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full resize-none rounded-2xl border border-ink-200 bg-white/70 px-4 py-3.5 pr-11 text-[15px] text-ink-800 placeholder-ink-400 shadow-inner outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
          />
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={!canFavorite}
            aria-label={favorited ? '取消收藏此提示词' : '收藏此提示词'}
            title={favorited ? '取消收藏' : '收藏此提示词'}
            className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-40 ${
              favorited
                ? 'text-amber-500 hover:bg-amber-50 hover:text-amber-600'
                : 'text-ink-300 hover:bg-ink-50 hover:text-amber-500'
            }`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill={favorited ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          </button>
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
        {favorites.length > 0 && (
          <div className="mt-2 flex flex-wrap items-start gap-1.5">
            <span className="flex-shrink-0 pt-1 text-[11px] text-ink-400">我的收藏：</span>
            <div className="flex flex-wrap gap-1.5">
              {favorites.map((fav) => (
                <FavoriteChip
                  key={fav}
                  prompt={fav}
                  onApply={() => onPromptChange(fav)}
                  onRemove={() => removeFavorite(fav)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-800">
            <StepBadge n={2} />
            图片尺寸
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
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

        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-800">
            <StepBadge n={4} />
            生成数量
            <span className="text-[11px] font-normal text-ink-400">
              · 并发调用，多张会按倍数消耗配额
            </span>
          </p>
          <div className="inline-flex rounded-xl border border-ink-200 bg-white/70 p-1">
            {BATCH_OPTIONS.map((opt) => {
              const selected = count === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCount(opt.value)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                    selected
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm'
                      : 'text-ink-600 hover:text-ink-800'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
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
          onClick={() => onGenerate({ prompt: promptValue, size, style }, count)}
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
              {count === 1 ? '生成图片' : `生成 ${count} 张`}
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

/** Explicit class map so Tailwind JIT can see every utility used. */
const SIZE_ASPECT_BOX: Record<ImageSize, string> = {
  '1024x1024': 'h-8 w-8',
  '1344x768': 'h-5 w-9',
  '1152x864': 'h-7 w-9',
  '1440x720': 'h-4 w-9',
  '768x1344': 'h-9 w-5',
  '864x1152': 'h-9 w-7',
  '720x1440': 'h-9 w-4',
};

interface SizeChipProps {
  value: ImageSize;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

function SizeChip({ value, label, selected, onSelect }: SizeChipProps) {
  const aspectClass = SIZE_ASPECT_BOX[value];
  return (
    <label className="chip cursor-pointer" title={value.replace('x', ' × ')}>
      <input type="radio" name="size" value={value} checked={selected} onChange={onSelect} />
      <div className="flex flex-col items-center justify-end gap-1.5 rounded-xl border border-ink-200 bg-white/70 px-2 py-2.5">
        <div className="flex h-10 items-center justify-center">
          <div className={`rounded-md border-2 border-current ${aspectClass}`} />
        </div>
        <div className="text-xs font-medium">{label}</div>
      </div>
    </label>
  );
}

interface FavoriteChipProps {
  prompt: string;
  onApply: () => void;
  onRemove: () => void;
}

function FavoriteChip({ prompt, onApply, onRemove }: FavoriteChipProps) {
  const handleRemoveClick = (e: MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };
  return (
    <div className="group relative flex items-center">
      <button
        type="button"
        onClick={onApply}
        title={prompt}
        className="flex max-w-[220px] items-center gap-1 rounded-full border border-amber-200 bg-amber-50/70 py-1 pl-2.5 pr-6 text-[11px] text-amber-800 transition hover:border-amber-300 hover:bg-amber-100"
      >
        <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
        <span className="truncate">{prompt}</span>
      </button>
      <button
        type="button"
        onClick={handleRemoveClick}
        aria-label="移除收藏"
        title="移除收藏"
        className="absolute right-0.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-amber-700/70 opacity-0 transition hover:bg-amber-200 hover:text-amber-900 focus:opacity-100 group-hover:opacity-100"
      >
        <CloseIcon className="h-2.5 w-2.5" />
      </button>
    </div>
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
