import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

const STORAGE_KEY = 'ai-image-gen:favorites';
const FAVORITES_LIMIT = 30;

interface FavoritesContextValue {
  favorites: string[];
  add: (prompt: string) => void;
  remove: (prompt: string) => void;
  has: (prompt: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is string => typeof p === 'string' && p.trim().length > 0);
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      /* quota exceeded — ignore; in-memory list still works this session */
    }
  }, [favorites]);

  const add = useCallback((prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setFavorites((prev) => {
      if (prev.includes(trimmed)) return prev;
      return [trimmed, ...prev].slice(0, FAVORITES_LIMIT);
    });
  }, []);

  const remove = useCallback((prompt: string) => {
    const trimmed = prompt.trim();
    setFavorites((prev) => prev.filter((p) => p !== trimmed));
  }, []);

  const has = useCallback(
    (prompt: string): boolean => favorites.includes(prompt.trim()),
    [favorites]
  );

  const value = useMemo(() => ({ favorites, add, remove, has }), [favorites, add, remove, has]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
