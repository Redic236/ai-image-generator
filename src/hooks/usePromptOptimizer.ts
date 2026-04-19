import { useCallback, useState } from 'react';
import { optimizePrompt } from '../services/zhipu';
import { friendlyError } from '../lib/errors';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import type { ImageStyle } from '../types';

interface OptimizeInput {
  prompt: string;
  style: ImageStyle;
}

interface UseOptimizerOptions {
  onSuccess: (optimized: string) => void;
  requestOpenSettings: () => void;
}

export function usePromptOptimizer({ onSuccess, requestOpenSettings }: UseOptimizerOptions) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { settings } = useSettings();
  const { showToast } = useToast();

  const optimize = useCallback(
    async ({ prompt, style }: OptimizeInput) => {
      const raw = prompt.trim();
      if (!raw) {
        showToast('请先输入图片描述');
        return;
      }
      if (!settings.apiKey) {
        requestOpenSettings();
        showToast('请先在设置中填写 API Key');
        return;
      }
      setIsOptimizing(true);
      try {
        const optimized = await optimizePrompt({
          prompt: raw,
          style,
          apiKey: settings.apiKey,
        });
        onSuccess(optimized);
        showToast('提示词已优化');
      } catch (err) {
        const { title, message } = friendlyError(err);
        showToast(`${title}：${message}`);
      } finally {
        setIsOptimizing(false);
      }
    },
    [settings, showToast, requestOpenSettings, onSuccess]
  );

  return { isOptimizing, optimize };
}
