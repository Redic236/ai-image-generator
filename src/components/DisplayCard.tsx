import { useState } from 'react';
import { proxied } from '../lib/proxied';
import { formatRelativeTime, formatSize } from '../lib/format';
import { STYLE_LABEL } from '../lib/constants';
import { useToast } from '../context/ToastContext';
import { Spinner } from './icons';
import { BatchGrid, EmptyState } from './DisplayCard.tiles';
import type { BatchCount, BatchTile, DisplayState, GenerateParams } from '../types';

interface DisplayCardProps {
  state: DisplayState;
  onGenerate: (params: GenerateParams, count?: BatchCount) => void;
  onRetryTile: (tileId: string) => void;
  onDismissTile: (tileId: string) => void;
}

export function DisplayCard({ state, onGenerate, onRetryTile, onDismissTile }: DisplayCardProps) {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [zipping, setZipping] = useState(false);

  // All successful tiles (used by zip download). "Primary" = the first one,
  // which is what the header copy / regenerate / single-download buttons act on.
  const successfulTiles: Array<Extract<BatchTile, { status: 'image' }>> =
    state.type === 'batch'
      ? state.tiles.filter((t): t is Extract<BatchTile, { status: 'image' }> =>
          t.status === 'image'
        )
      : [];
  const primaryTile = successfulTiles[0] ?? null;
  const hasImage = !!primaryTile;
  const canZip = successfulTiles.length >= 2;

  const handleDownload = async () => {
    if (!primaryTile) return;
    const { imageUrl } = primaryTile.item;
    const filename = `ai-image-${Date.now()}.png`;
    setDownloading(true);
    try {
      const res = await fetch(proxied(imageUrl), { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(objectUrl, filename);
      // Defer revoke — Safari and slow-disk setups can still be starting
      // the download when a sync revoke would cancel it.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
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

  const handleCopyPrompt = async () => {
    if (!primaryTile) return;
    try {
      await navigator.clipboard.writeText(primaryTile.item.prompt);
      showToast('提示词已复制');
    } catch {
      showToast('复制失败，请手动选择文本');
    }
  };

  const handleRegenerate = () => {
    if (!primaryTile) return;
    onGenerate({
      prompt: primaryTile.item.prompt,
      size: primaryTile.item.size,
      style: primaryTile.item.style,
    });
  };

  const handleRegenerateAll = () => {
    if (state.type !== 'batch') return;
    const count = state.tiles.length as BatchCount;
    onGenerate(state.params, count);
  };

  const canRegenerateAll = state.type === 'batch' && state.tiles.length > 1;

  const handleDownloadZip = async () => {
    if (successfulTiles.length === 0) return;
    setZipping(true);
    try {
      // Dynamic import — jszip is only loaded the first time a user clicks
      // "download all", keeping the initial bundle ~40KB lighter.
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      const fetched = await Promise.all(
        successfulTiles.map(async (tile) => {
          const res = await fetch(proxied(tile.item.imageUrl), { mode: 'cors' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.blob();
        })
      );
      fetched.forEach((blob, idx) => {
        zip.file(`ai-image-${idx + 1}.png`, blob);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      triggerDownload(url, `ai-images-${Date.now()}.zip`);
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      showToast(`已打包 ${successfulTiles.length} 张图片`);
    } catch {
      showToast('打包失败，部分图片可能无法访问');
    } finally {
      setZipping(false);
    }
  };

  return (
    <section className="glass rounded-3xl p-6 shadow-card md:p-8">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink-800">生成结果</h2>
        <div className="flex items-center gap-1.5">
          {hasImage && (
            <>
              <IconButton onClick={handleCopyPrompt} title="复制提示词">
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
                    d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                  />
                </svg>
                <span className="hidden sm:inline">复制提示词</span>
              </IconButton>
              <IconButton onClick={handleRegenerate} title="用相同参数重新生成一张">
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
                <span className="hidden sm:inline">重新生成</span>
              </IconButton>
            </>
          )}
          {canRegenerateAll && (
            <IconButton
              onClick={handleRegenerateAll}
              title={`用相同参数重新生成 ${state.type === 'batch' ? state.tiles.length : 0} 张`}
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
                  d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
                />
              </svg>
              <span className="hidden sm:inline">全部重生成</span>
            </IconButton>
          )}
          <button
            onClick={handleDownload}
            disabled={!hasImage || downloading || zipping}
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
          {canZip && (
            <button
              onClick={handleDownloadZip}
              disabled={zipping || downloading}
              title="将本批所有图片打包为 ZIP 下载"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {zipping ? (
                <>
                  <Spinner className="h-3.5 w-3.5" />
                  打包中...
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
                      d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                    />
                  </svg>
                  下载全部 ({successfulTiles.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {state.type === 'empty' && (
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-ink-200 bg-ink-50 md:aspect-[4/3]">
          <EmptyState />
        </div>
      )}

      {state.type === 'batch' && (
        <BatchGrid state={state} onRetryTile={onRetryTile} onDismissTile={onDismissTile} />
      )}

      {primaryTile && (
        <div className="mt-4 flex items-center justify-between text-xs text-ink-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-ink-100 px-2.5 py-1">
              {formatSize(primaryTile.item.size)}
            </span>
            <span className="rounded-full bg-ink-100 px-2.5 py-1">
              {STYLE_LABEL[primaryTile.item.style]}
            </span>
            <span className="text-ink-400">{formatRelativeTime(primaryTile.item.createdAt)}</span>
            {state.type === 'batch' && state.tiles.length > 1 && (
              <span className="text-ink-400">
                · 本次共 {state.tiles.filter((t) => t.status === 'image').length}/
                {state.tiles.length} 张
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function IconButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-xs font-medium text-ink-600 transition hover:border-purple-300 hover:text-purple-600 sm:px-3"
    >
      {children}
    </button>
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

