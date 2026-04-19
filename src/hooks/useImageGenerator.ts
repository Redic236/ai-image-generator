import { useCallback, useRef, useState } from 'react';
import { generateImage } from '../services/zhipu';
import { ApiError, friendlyError } from '../lib/errors';
import { useHistory } from '../context/HistoryContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import type {
  BatchCount,
  BatchTile,
  DisplayState,
  GenerateParams,
  HistoryItem,
} from '../types';

interface UseImageGeneratorOptions {
  requestOpenSettings: () => void;
}

function makeTileId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeHistoryItem(params: GenerateParams, url: string): HistoryItem {
  const now = Date.now();
  return {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    prompt: params.prompt,
    size: params.size,
    style: params.style,
    imageUrl: url,
    createdAt: now,
  };
}

export function useImageGenerator({ requestOpenSettings }: UseImageGeneratorOptions) {
  const [display, setDisplay] = useState<DisplayState>({ type: 'empty' });
  const [isGenerating, setIsGenerating] = useState(false);
  // A separate ref mirroring the in-flight batch state, used as a guard
  // that's immune to stale-closure issues. Prevents keyboard shortcut /
  // button / retryAll from starting a second batch on top of the first.
  const batchInFlightRef = useRef(false);

  const { settings } = useSettings();
  // Destructure to primitives so useCallback deps don't invalidate when an
  // unrelated settings field changes.
  const { apiKey, model } = settings;
  const { add: addHistory, remove: removeHistory, setActiveId } = useHistory();
  const { showToast } = useToast();

  /** Update a single tile in the current batch display state, identified by tileId. */
  const updateTile = useCallback((tileId: string, next: BatchTile) => {
    setDisplay((prev) => {
      if (prev.type !== 'batch') return prev;
      return {
        ...prev,
        tiles: prev.tiles.map((t) => (t.tileId === tileId ? next : t)),
      };
    });
  }, []);

  const runOneTile = useCallback(
    async (tileId: string, params: GenerateParams) => {
      try {
        const { url } = await generateImage({
          ...params,
          apiKey,
          model,
        });
        const item = makeHistoryItem(params, url);
        addHistory(item);
        // Last successful tile wins the sidebar highlight (acceptable — they're siblings).
        setActiveId(item.id);
        updateTile(tileId, { tileId, status: 'image', item });
      } catch (err) {
        if (err instanceof ApiError || err instanceof Error) {
          const { title, message } = friendlyError(err);
          updateTile(tileId, { tileId, status: 'error', title, message });
        } else {
          updateTile(tileId, {
            tileId,
            status: 'error',
            title: '未知错误',
            message: '请稍后重试。',
          });
        }
      }
    },
    [apiKey, model, addHistory, setActiveId, updateTile]
  );

  const generate = useCallback(
    async (params: GenerateParams, count: BatchCount = 1) => {
      // Concurrent-batch guard. A ref keeps this correct even if the
      // caller fires before React flushes the isGenerating state update.
      if (batchInFlightRef.current) return;

      const prompt = params.prompt.trim();
      if (!prompt) {
        showToast('请先输入图片描述');
        return;
      }
      if (!apiKey) {
        requestOpenSettings();
        showToast('请先在设置中填写 API Key');
        return;
      }

      const finalParams: GenerateParams = { ...params, prompt };
      const tiles: BatchTile[] = Array.from({ length: count }, () => ({
        tileId: makeTileId(),
        status: 'loading',
      }));

      // Clear active highlight so the first new success becomes active.
      setActiveId(null);
      setDisplay({ type: 'batch', params: finalParams, tiles });
      batchInFlightRef.current = true;
      setIsGenerating(true);

      try {
        // Fire all in parallel; each tile updates independently.
        await Promise.allSettled(
          tiles.map((tile) => runOneTile(tile.tileId, finalParams))
        );
      } finally {
        batchInFlightRef.current = false;
        setIsGenerating(false);
      }
    },
    [apiKey, showToast, requestOpenSettings, setActiveId, runOneTile]
  );

  /** Re-run a single failed tile using the batch's params. */
  const retryTile = useCallback(
    async (tileId: string) => {
      let params: GenerateParams | null = null;
      setDisplay((prev) => {
        if (prev.type !== 'batch') return prev;
        params = prev.params;
        return {
          ...prev,
          tiles: prev.tiles.map((t) => (t.tileId === tileId ? { tileId, status: 'loading' } : t)),
        };
      });
      if (!params) return;
      setIsGenerating(true);
      await runOneTile(tileId, params);
      setIsGenerating(false);
    },
    [runOneTile]
  );

  /** Remove a tile from the display grid and (if it was an image) from history. */
  const dismissTile = useCallback(
    (tileId: string) => {
      setDisplay((prev) => {
        if (prev.type !== 'batch') return prev;
        const removed = prev.tiles.find((t) => t.tileId === tileId);
        if (removed?.status === 'image') {
          removeHistory(removed.item.id);
        }
        const remaining = prev.tiles.filter((t) => t.tileId !== tileId);
        if (remaining.length === 0) return { type: 'empty' };
        return { ...prev, tiles: remaining };
      });
    },
    [removeHistory]
  );

  const viewHistoryItem = useCallback(
    (item: HistoryItem) => {
      if (isGenerating) {
        showToast('请等待当前生成完成');
        return;
      }
      setActiveId(item.id);
      setDisplay({
        type: 'batch',
        params: { prompt: item.prompt, size: item.size, style: item.style },
        tiles: [{ tileId: item.id, status: 'image', item }],
      });
    },
    [isGenerating, setActiveId, showToast]
  );

  return {
    display,
    isGenerating,
    generate,
    retryTile,
    dismissTile,
    viewHistoryItem,
  };
}
