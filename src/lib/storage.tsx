import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

// ---------- Безопасная работа с localStorage ----------

const PREFIX = 'dndtk:';

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* приватный режим или переполнение — не критично */
  }
}

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readLS(key, initial));
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    writeLS(key, value);
  }, [key, value]);
  return [value, setValue];
}

// ---------- Избранное и сохранённые результаты ----------

export interface SavedResult {
  id: string;
  section: string; // название раздела, откуда результат
  title: string;
  text: string;
  ts: number;
}

interface StoreValue {
  favorites: string[]; // "раздел:id"
  isFav: (section: string, id: string) => boolean;
  toggleFav: (section: string, id: string) => boolean; // возвращает новое состояние
  saved: SavedResult[];
  saveResult: (r: Omit<SavedResult, 'id' | 'ts'>) => void;
  removeSaved: (id: string) => void;
  clearSaved: () => void;
  settings: Settings;
  setSettings: (s: Partial<Settings>) => void;
}

export interface Settings {
  view: 'cards' | 'table';
  lastTab: string;
}

const defaultSettings: Settings = { view: 'cards', lastTab: 'potions' };

const Ctx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useLocalStorage<string[]>('favorites', []);
  const [saved, setSaved] = useLocalStorage<SavedResult[]>('saved', []);
  const [settings, setSettingsState] = useLocalStorage<Settings>('settings', defaultSettings);

  const favSet = useMemo(() => new Set(favorites), [favorites]);

  const isFav = useCallback((section: string, id: string) => favSet.has(`${section}:${id}`), [favSet]);

  const toggleFav = useCallback(
    (section: string, id: string) => {
      const key = `${section}:${id}`;
      const now = !favSet.has(key);
      setFavorites((prev) => (now ? [key, ...prev.filter((k) => k !== key)] : prev.filter((k) => k !== key)));
      return now;
    },
    [favSet, setFavorites]
  );

  const saveResult = useCallback(
    (r: Omit<SavedResult, 'id' | 'ts'>) => {
      const ts = Date.now();
      setSaved((prev) => [{ ...r, id: `${ts}-${Math.random().toString(36).slice(2, 7)}`, ts }, ...prev].slice(0, 300));
    },
    [setSaved]
  );

  const removeSaved = useCallback((id: string) => setSaved((prev) => prev.filter((s) => s.id !== id)), [setSaved]);
  const clearSaved = useCallback(() => setSaved([]), [setSaved]);
  const setSettings = useCallback(
    (s: Partial<Settings>) => setSettingsState((prev) => ({ ...defaultSettings, ...prev, ...s })),
    [setSettingsState]
  );

  const value: StoreValue = {
    favorites,
    isFav,
    toggleFav,
    saved,
    saveResult,
    removeSaved,
    clearSaved,
    settings: { ...defaultSettings, ...settings },
    setSettings,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('StoreProvider отсутствует');
  return v;
}

// ---------- Всплывающие уведомления ----------

interface ToastValue {
  toast: (msg: string) => void;
}
const ToastCtx = createContext<ToastValue>({ toast: () => undefined });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const toast = useCallback((m: string) => {
    setMsg(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(null), 1800);
  }, []);
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className={`toast${msg ? ' show' : ''}`} role="status" aria-live="polite">
        {msg}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx).toast;
}
