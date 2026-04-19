import { useCallback, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PromptCard } from './components/PromptCard';
import { DisplayCard } from './components/DisplayCard';
import { SettingsDialog } from './components/SettingsDialog';
import { Toast } from './components/Toast';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { HistoryProvider } from './context/HistoryContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { useImageGenerator } from './hooks/useImageGenerator';
import { usePromptOptimizer } from './hooks/usePromptOptimizer';

function AppShell() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [promptValue, setPromptValue] = useState('');
  const { settings } = useSettings();
  const { showToast } = useToast();

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const { display, isGenerating, generate, retry, viewHistoryItem } = useImageGenerator({
    requestOpenSettings: openSettings,
  });

  const { isOptimizing, optimize } = usePromptOptimizer({
    onSuccess: setPromptValue,
    requestOpenSettings: openSettings,
  });

  // First-run nudge: if there's no API key, tell the user where to set it.
  useEffect(() => {
    if (settings.apiKey) return;
    const id = setTimeout(() => showToast('首次使用请在「设置」中填写 API Key'), 600);
    return () => clearTimeout(id);
  }, [settings.apiKey, showToast]);

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1400px] gap-6 p-4 md:p-6 lg:p-8">
        <Sidebar onSelectItem={viewHistoryItem} />
        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <Header onOpenSettings={openSettings} />
          <PromptCard
            promptValue={promptValue}
            onPromptChange={setPromptValue}
            onGenerate={generate}
            onOptimize={optimize}
            isGenerating={isGenerating}
            isOptimizing={isOptimizing}
          />
          <DisplayCard state={display} onRetry={retry} onGenerate={generate} />
          <footer className="pb-2 text-center text-[11px] text-white/40">
            由智谱 AI 驱动 · 本地保存历史记录
          </footer>
        </main>
      </div>
      <SettingsDialog open={settingsOpen} onClose={closeSettings} />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <HistoryProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </HistoryProvider>
    </SettingsProvider>
  );
}
