import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { proxied } from '../lib/proxied';
import { Lightbox } from './Lightbox';
import { CloseIcon, Spinner } from './icons';
import type { BatchTile, DisplayState, HistoryItem, ImageSize } from '../types';

/**
 * Tile-level UI extracted from DisplayCard. BatchGrid is the public entry;
 * everything else is private to this module. Keeping the tile components
 * co-located here instead of exporting each file-by-file is intentional —
 * they're all rendered in exactly one parent and share the same visual
 * language, so splitting them further would be churn for no reuse.
 */

function aspectClassFor(size: ImageSize): string {
  switch (size) {
    case '1024x1024':
      return 'aspect-square';
    case '1344x768':
      return 'aspect-[16/9]';
    case '1152x864':
      return 'aspect-[4/3]';
    case '1440x720':
      return 'aspect-[2/1]';
    case '768x1344':
      return 'aspect-[9/16]';
    case '864x1152':
      return 'aspect-[3/4]';
    case '720x1440':
      return 'aspect-[1/2]';
  }
}

interface BatchGridProps {
  state: Extract<DisplayState, { type: 'batch' }>;
  onRetryTile: (tileId: string) => void;
  onDismissTile: (tileId: string) => void;
}

export function BatchGrid({ state, onRetryTile, onDismissTile }: BatchGridProps) {
  const { params, tiles } = state;
  const isSingle = tiles.length === 1;
  const wrapperClass = isSingle ? '' : 'grid grid-cols-2 gap-2 md:gap-3';
  const tileAspect = aspectClassFor(params.size);

  return (
    <div className={wrapperClass}>
      {tiles.map((tile) => (
        <div
          key={tile.tileId}
          className={`group relative w-full overflow-hidden rounded-2xl border border-ink-200 bg-ink-50 ${tileAspect}`}
        >
          <TileContent
            tile={tile}
            onRetry={() => onRetryTile(tile.tileId)}
            onDismiss={() => onDismissTile(tile.tileId)}
          />
        </div>
      ))}
    </div>
  );
}

interface TileContentProps {
  tile: BatchTile;
  onRetry: () => void;
  onDismiss: () => void;
}

function TileContent({ tile, onRetry, onDismiss }: TileContentProps) {
  if (tile.status === 'loading') return <LoadingTile />;
  if (tile.status === 'error')
    return (
      <ErrorTile
        title={tile.title}
        message={tile.message}
        onRetry={onRetry}
        onDismiss={onDismiss}
      />
    );
  return <ImageTile item={tile.item} onDismiss={onDismiss} />;
}

export function EmptyState() {
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
            aria-hidden="true"
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
        在上方输入图片描述，选择尺寸、风格和数量，点击生成按钮即可
      </p>
    </div>
  );
}

function LoadingTile() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - start), 500);
    return () => clearInterval(id);
  }, []);
  const seconds = Math.floor(elapsed / 1000);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-50 p-4">
      <div className="shimmer absolute inset-0 animate-shimmer" />
      <div className="relative flex flex-col items-center">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/30" />
          <div className="absolute inset-2 animate-ping rounded-full bg-pink-500/30 [animation-delay:0.4s]" />
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-glow">
            <Spinner className="h-4 w-4 text-white" />
          </div>
        </div>
        <p className="mt-4 text-xs font-semibold text-ink-800">AI 正在作画...</p>
        <p className="mt-0.5 text-[11px] text-ink-400">
          {seconds > 0 ? `${seconds}s · ` : ''}10-30 秒
        </p>
      </div>
    </div>
  );
}

interface ErrorTileProps {
  title: string;
  message: string;
  onRetry: () => void;
  onDismiss: () => void;
}

function ErrorTile({ title, message, onRetry, onDismiss }: ErrorTileProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
      <button
        onClick={onDismiss}
        aria-label="移除"
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-ink-400 opacity-60 transition hover:bg-rose-500/20 hover:text-rose-600 hover:opacity-100"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-md">
        <svg
          className="h-5 w-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286ZM12 15.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>
      <p className="mt-3 text-xs font-semibold text-ink-800">{title}</p>
      <p className="mt-1 line-clamp-2 max-w-[90%] text-[11px] leading-snug text-ink-500">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="mt-3 inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:shadow-md"
      >
        <svg
          className="h-3 w-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
        重试此张
      </button>
    </div>
  );
}

interface ImageTileProps {
  item: HistoryItem;
  onDismiss: () => void;
}

function ImageTile({ item, onDismiss }: ImageTileProps) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // Guards img.onLoad / img.onError callbacks that may fire after the
  // component has unmounted (rapid history navigation), preventing the
  // React "setState on unmounted" warning.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setStatus('loading');
    setLightboxOpen(false);
  }, [item.id]);

  const handleDismissClick = (e: MouseEvent) => {
    e.stopPropagation();
    onDismiss();
  };

  if (status === 'error') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-50 p-4 text-center">
        <button
          onClick={handleDismissClick}
          aria-label="移除"
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-white/80 text-ink-400 backdrop-blur-sm transition hover:bg-rose-500/20 hover:text-rose-600"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 shadow-lg">
          <svg
            className="h-6 w-6 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm-1.5-1.5L22 22"
            />
          </svg>
        </div>
        <p className="mt-3 text-xs font-semibold text-ink-700">图片暂不可用</p>
        <p className="mt-1 max-w-[90%] text-[11px] leading-snug text-ink-500">
          CDN 加载失败或图片已过期
        </p>
        <button
          onClick={() => {
            setStatus('loading');
            setReloadKey((k) => k + 1);
          }}
          className="mt-3 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-[11px] font-medium text-ink-600 transition hover:border-purple-300 hover:text-purple-600"
        >
          重试加载
        </button>
      </div>
    );
  }

  return (
    <>
      {status === 'loading' && (
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-ink-100 via-white to-ink-100 bg-[length:1000px_100%]" />
      )}
      <img
        key={`${item.id}-${reloadKey}`}
        src={proxied(item.imageUrl)}
        alt={item.prompt.slice(0, 60)}
        decoding="async"
        onLoad={() => {
          if (mountedRef.current) setStatus('ok');
        }}
        onError={() => {
          if (mountedRef.current) setStatus('error');
        }}
        onClick={() => status === 'ok' && setLightboxOpen(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          status === 'ok' ? 'cursor-zoom-in opacity-100' : 'opacity-0'
        }`}
      />
      {status === 'ok' && (
        <button
          onClick={handleDismissClick}
          aria-label="删除这张"
          title="删除这张"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-black/40 text-white opacity-0 backdrop-blur-sm transition hover:bg-rose-500/80 group-hover:opacity-100 focus:opacity-100"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      )}
      {lightboxOpen && (
        <Lightbox
          src={proxied(item.imageUrl)}
          alt={item.prompt.slice(0, 60)}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
