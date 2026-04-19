import { useCallback, useRef, useState } from 'react';
import { generateImage } from '../services/zhipu';
import { ApiError, friendlyError } from '../lib/errors';
import { useHistory } from '../context/HistoryContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import type { DisplayState, GenerateParams, HistoryItem } from '../types';

interface UseImageGeneratorOptions {
  requestOpenSettings: () => void;
}

export function useImageGenerator({ requestOpenSettings }: UseImageGeneratorOptions) {
  const [display, setDisplay] = useState<DisplayState>({ type: 'empty' });
  const [isGenerating, setIsGenerating] = useState(false);
  const lastParamsRef = useRef<GenerateParams | null>(null);

  const { settings } = useSettings();
  const { add: addHistory, setActiveId } = useHistory();
  const { showToast } = useToast();

  const generate = useCallback(
    async (params: GenerateParams) => {
      const prompt = params.prompt.trim();
      if (!prompt) {
        showToast('请先输入图片描述');
        return;
      }
      if (!settings.apiKey) {
        requestOpenSettings();
        showToast('请先在设置中填写 API Key');
        return;
      }

      const requestParams: GenerateParams = { ...params, prompt };
      lastParamsRef.current = requestParams;
      setDisplay({ type: 'loading' });
      setIsGenerating(true);

      try {
        const { url } = await generateImage({
          ...requestParams,
          apiKey: settings.apiKey,
          model: settings.model,
        });
        const now = Date.now();
        const item: HistoryItem = {
          id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
          prompt,
          size: params.size,
          style: params.style,
          imageUrl: url,
          createdAt: now,
        };
        addHistory(item);
        setActiveId(item.id);
        setDisplay({ type: 'image', item });
      } catch (err) {
        if (err instanceof ApiError || err instanceof Error) {
          const { title, message } = friendlyError(err);
          setDisplay({ type: 'error', title, message });
        } else {
          setDisplay({ type: 'error', title: '未知错误', message: '请稍后重试。' });
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [settings, addHistory, setActiveId, showToast, requestOpenSettings]
  );

  const retry = useCallback(() => {
    if (lastParamsRef.current) {
      void generate(lastParamsRef.current);
    } else {
      setDisplay({ type: 'empty' });
    }
  }, [generate]);

  const viewHistoryItem = useCallback(
    (item: HistoryItem) => {
      if (isGenerating) {
        showToast('请等待当前生成完成');
        return;
      }
      setActiveId(item.id);
      setDisplay({ type: 'image', item });
    },
    [isGenerating, setActiveId, showToast]
  );

  return { display, isGenerating, generate, retry, viewHistoryItem };
}
