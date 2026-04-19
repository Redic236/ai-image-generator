import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { MODEL_OPTIONS } from '../lib/constants';
import type { ImageModel } from '../types';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState<ImageModel>(settings.model);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      setApiKey(settings.apiKey);
      setModel(settings.model);
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [open, settings]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateSettings({ apiKey: apiKey.trim(), model });
    onClose();
    showToast('设置已保存');
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[min(92vw,440px)] rounded-2xl border border-ink-200 bg-white p-0 text-ink-800 shadow-2xl backdrop:bg-ink-900/60 backdrop:backdrop-blur-sm dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4 dark:border-ink-700">
          <h3 className="text-base font-semibold text-ink-800 dark:text-ink-100">设置</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-ink-400 transition hover:bg-ink-50 hover:text-ink-700 dark:hover:bg-ink-700 dark:hover:text-ink-100"
            aria-label="关闭"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <label
              htmlFor="apiKey"
              className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200"
            >
              智谱 AI API Key
            </label>
            <input
              id="apiKey"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="xxxxxxxx.xxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-800 placeholder-ink-300 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:placeholder-ink-500 dark:focus:ring-purple-900/40"
            />
            <p className="mt-1.5 text-[11px] leading-relaxed text-ink-400 dark:text-ink-500">
              前往{' '}
              <a
                href="https://bigmodel.cn/usercenter/proj-mgmt/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline dark:text-purple-400"
              >
                智谱 AI 开放平台
              </a>{' '}
              创建 API Key。Key 仅保存在你的浏览器本地，不会上传。
            </p>
          </div>
          <div>
            <label
              htmlFor="model"
              className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200"
            >
              模型
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value as ImageModel)}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-800 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:focus:ring-purple-900/40"
            >
              {MODEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-ink-100 bg-ink-50/50 px-6 py-3 dark:border-ink-700 dark:bg-ink-900/40">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-700"
          >
            取消
          </button>
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            保存
          </button>
        </div>
      </form>
    </dialog>
  );
}
