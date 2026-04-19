import { useState } from 'react';
import { proxied } from '../lib/proxied';
import { formatRelativeTime, formatSize } from '../lib/format';
import { STYLE_LABEL } from '../lib/constants';
import { useToast } from '../context/ToastContext';
import type { DisplayState } from '../types';

interface DisplayCardProps {
  state: DisplayState;
  onRetry: () => void;
}

export function DisplayCard({ state, onRetry }: DisplayCardProps) {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const hasImage = state.type === 'image';

  const handleDownload = async () => {
    if (state.type !== 'image') return;
    const { imageUrl } = state.item;
    const filename = `ai-image-${Date.now()}.png`;
    setDownloading(true);
    try {
      const res = await fetch(proxied(imageUrl), { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(objectUrl, filename);
      URL.revokeObjectURL(objectUrl);
      showToast('图片已开始下载');
    } catch {
      try {
        triggerDownload(imageUrl, filename);
        showToast('已触发下载，若在新标签页打开请右键另存为');
      } catch {
        window.open(imageUrl, '_blank', 'noopener');
        showToast('无法直接下载，已在新标签页打开图片');
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="glass rounded-3xl p-6 shadow-card md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-800">生成结果</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={!hasImage || downloading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 transition hover:border-purple-300 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {downloading ? (
              <>
                <Spinner className="h-3.5 w-3.5" />
                下载中...
              </>
            ) : (
              <>
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                  />
                </svg>
                下载
              </>
            )}
          </button>
        </div>
      </div>

      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-ink-200 bg-ink-50 md:aspect-[4/3]">
        {state.type === 'empty' && <EmptyState />}
        {state.type === 'loading' && <LoadingState />}
        {state.type === 'image' && (
          <img
            key={state.item.id}
            src={proxied(state.item.imageUrl)}
            alt={state.item.prompt.slice(0, 40)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {state.type === 'error' && (
          <ErrorState title={state.title} message={state.message} onRetry={onRetry} />
        )}
      </div>

      {state.type === 'image' && (
        <div className="mt-4 flex items-center justify-between text-xs text-ink-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-ink-100 px-2.5 py-1">
              {formatSize(state.item.size)}
            </span>
            <span className="rounded-full bg-ink-100 px-2.5 py-1">
              {STYLE_LABEL[state.item.style]}
            </span>
            <span className="text-ink-400">{formatRelativeTime(state.item.createdAt)}</span>
          </div>
        </div>
      )}
    </section>
  );
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4Z" />
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-2xl" />
        <div className="relative flex h-20 w-20 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-glow">
          <svg
            className="h-10 w-10 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
        </div>
      </div>
      <p className="mt-6 text-sm font-medium text-ink-700">开始创作吧</p>
      <p className="mt-1 max-w-xs text-xs text-ink-400">
        在上方输入图片描述，选择尺寸和风格，点击生成按钮即可获得 AI 创作的图片
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-50 p-8">
      <div className="shimmer absolute inset-0 animate-shimmer" />
      <div className="relative flex flex-col items-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/30" />
          <div className="absolute inset-2 animate-ping rounded-full bg-pink-500/30 [animation-delay:0.4s]" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-glow">
            <svg
              className="h-5 w-5 animate-spin text-white"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4Z"
              />
            </svg>
          </div>
        </div>
        <p className="mt-5 text-sm font-semibold text-ink-800">AI 正在作画中...</p>
        <p className="mt-1 text-xs text-ink-400">通常需要 10-30 秒，请稍候</p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry: () => void;
}

function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-[0_16px_40px_-12px_rgba(244,63,94,0.5)]">
        <svg
          className="h-8 w-8 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286ZM12 15.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>
      <p className="mt-5 text-sm font-semibold text-ink-800">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-500">{message}</p>
      <button
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-ink-800 px-4 py-2 text-xs font-medium text-white transition hover:bg-ink-700"
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
        重试
      </button>
    </div>
  );
}
