import { useState } from 'react';
import type { ReactNode } from 'react';
import { RARITY_LABEL } from '../types';
import type { Rarity } from '../types';
import { copyText } from '../lib/utils';
import { useStore, useToast } from '../lib/storage';

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  return <span className={`badge rarity-${rarity}`}>{RARITY_LABEL[rarity]}</span>;
}

export function HomebrewMark() {
  return (
    <span className="badge homebrew" title="Авторская (домашняя) механика, не из официальных книг">
      дом. правило
    </span>
  );
}

export function FavButton({ section, id }: { section: string; id: string }) {
  const { isFav, toggleFav } = useStore();
  const toast = useToast();
  const on = isFav(section, id);
  return (
    <button
      type="button"
      className={`icon-btn${on ? ' on' : ''}`}
      aria-pressed={on}
      aria-label={on ? 'Убрать из избранного' : 'В избранное'}
      onClick={() => toast(toggleFav(section, id) ? 'Добавлено в избранное' : 'Убрано из избранного')}
    >
      {on ? '★' : '☆'}
    </button>
  );
}

export function CopyButton({ text, label = 'Копировать', icon = false }: { text: string; label?: string; icon?: boolean }) {
  const toast = useToast();
  const [done, setDone] = useState(false);
  const onClick = async () => {
    const ok = await copyText(text);
    toast(ok ? 'Скопировано' : 'Не удалось скопировать');
    if (ok) {
      setDone(true);
      window.setTimeout(() => setDone(false), 1200);
    }
  };
  if (icon) {
    return (
      <button type="button" className="icon-btn" aria-label={label} onClick={onClick}>
        {done ? '✓' : '⧉'}
      </button>
    );
  }
  return (
    <button type="button" className="btn ghost" onClick={onClick}>
      {done ? '✓ Скопировано' : `⧉ ${label}`}
    </button>
  );
}

export function SaveButton({ section, title, text }: { section: string; title: string; text: string }) {
  const { saveResult } = useStore();
  const toast = useToast();
  return (
    <button
      type="button"
      className="btn ghost"
      onClick={() => {
        saveResult({ section, title, text });
        toast('Результат сохранён в «Избранное»');
      }}
    >
      ⚑ Сохранить
    </button>
  );
}

export function Chips<T extends string>({
  label,
  value,
  options,
  onChange,
  allLabel = 'Все',
}: {
  label: string;
  value: T | '';
  options: readonly { value: T; label: string }[];
  onChange: (v: T | '') => void;
  allLabel?: string;
}) {
  return (
    <div className="chips-row" role="group" aria-label={label}>
      <span className="chips-label">{label}</span>
      <div className="chips-scroll">
        <button type="button" className={`chip${value === '' ? ' on' : ''}`} onClick={() => onChange('')}>
          {allLabel}
        </button>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`chip${value === o.value ? ' on' : ''}`}
            onClick={() => onChange(value === o.value ? '' : o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder = 'Поиск…',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search">
      <span aria-hidden="true" className="search-ico">⌕</span>
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className="search-clear" aria-label="Очистить" onClick={() => onChange('')}>
          ×
        </button>
      )}
    </div>
  );
}

export function Ornament({ children }: { children?: ReactNode }) {
  return (
    <div className="ornament" aria-hidden="true">
      <span>ᚠ</span>
      <i />
      <span>{children ?? '✦'}</span>
      <i />
      <span>ᚦ</span>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}
