import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { HistoryItem } from '../types';

const STORAGE_KEY = 'ai-image-gen:history';
const HISTORY_LIMIT = 50;

interface HistoryContextValue {
  items: HistoryItem[];
  activeId: string | null;
  add: (item: HistoryItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  setActiveId: (id: string | null) => void;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

/** Runtime shape check — defends against corrupted localStorage (manual
 *  edits, older schema versions, or a rogue extension). Items that fail
 *  are silently dropped so the app never crashes on a bad entry. */
function isValidHistoryItem(x: unknown): x is HistoryItem {
  if (typeof x !== 'object' || x === null) return false;
  const it = x as Record<string, unknown>;
  return (
    typeof it.id === 'string' &&
    typeof it.prompt === 'string' &&
    typeof it.size === 'string' &&
    typeof it.style === 'string' &&
    typeof it.imageUrl === 'string' &&
    typeof it.createdAt === 'number'
  );
}

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter(isValidHistoryItem);
  } catch {
    return [];
  }
}

function writeHistory(items: HistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota exceeded — trim aggressively and retry once.
    const trimmed = items.slice(0, Math.max(10, Math.floor(items.length / 2)));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      /* give up; next session will reload from whatever did persist */
    }
  }
}

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<HistoryItem[]>(() => loadHistory());
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    writeHistory(items);
  }, [items]);

  const add = useCallback((item: HistoryItem) => {
    setItems((prev) => [item, ...prev].slice(0, HISTORY_LIMIT));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setActiveId(null);
  }, []);

  const value = useMemo(
    () => ({ items, activeId, add, remove, clear, setActiveId }),
    [items, activeId, add, remove, clear]
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}
