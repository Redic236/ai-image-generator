import { useCallback, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PromptCard } from './components/PromptCard';
import { DisplayCard } from './components/DisplayCard';
import { SettingsDialog } from './components/SettingsDialog';
import { ShortcutsDialog } from './components/ShortcutsDialog';
import { Toast } from './components/Toast';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { HistoryProvider, useHistory } from './context/HistoryContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';
import { useImageGenerator } from './hooks/useImageGenerator';
import { usePromptOptimizer } from './hooks/usePromptOptimizer';

function AppShell() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [promptValue, setPromptValue] = useState('');
  const { settings } = useSettings();
  const { showToast } = useToast();
  const { items: historyItems } = useHistory();

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openShortcuts = useCallback(() => setShortcutsOpen(true), []);
  const closeShortcuts = useCallback(() => setShortcutsOpen(false), []);

  // Global keyboard shortcuts. ? opens help, / focuses prompt.
  // Both only fire when the user is NOT typing inside an input/textarea.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inTypeable =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (inTypeable) return;

      if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        document.getElementById('prompt')?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const { display, isGenerating, generate, retryTile, dismissTile, viewHistoryItem } =
    useImageGenerator({
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
        <Sidebar
          onSelectItem={viewHistoryItem}
          mobileOpen={sidebarOpen}
          onMobileClose={closeSidebar}
        />
        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <Header
            onOpenSettings={openSettings}
            onOpenHistory={openSidebar}
            onOpenShortcuts={openShortcuts}
            historyCount={historyItems.length}
          />
          <PromptCard
            promptValue={promptValue}
            onPromptChange={setPromptValue}
            onGenerate={generate}
            onOptimize={optimize}
            isGenerating={isGenerating}
            isOptimizing={isOptimizing}
          />
          <DisplayCard
            state={display}
            onGenerate={(params, count) => generate(params, count ?? 1)}
            onRetryTile={retryTile}
            onDismissTile={dismissTile}
          />
          <footer className="pb-2 text-center text-[11px] text-white/40">
            由智谱 AI 驱动 · 本地保存历史记录
          </footer>
        </main>
      </div>
      <SettingsDialog open={settingsOpen} onClose={closeSettings} />
      <ShortcutsDialog open={shortcutsOpen} onClose={closeShortcuts} />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <HistoryProvider>
          <FavoritesProvider>
            <ToastProvider>
              <AppShell />
            </ToastProvider>
          </FavoritesProvider>
        </HistoryProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
