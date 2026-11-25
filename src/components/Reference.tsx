import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Entry } from '../types';
import { matches, pickDifferent, plural } from '../lib/utils';
import { useStore } from '../lib/storage';
import { Chips, CopyButton, Empty, FavButton, HomebrewMark, SaveButton, SearchBox } from './common';

export interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
  /** Показывать колонку как заголовок карточки */
  title?: boolean;
  /** Краткая колонка: на карточке показывается в строке бейджей */
  badge?: boolean;
}

export interface FilterDef<T> {
  key: string;
  label: string;
  options: readonly { value: string; label: string }[];
  get: (item: T) => string;
}

interface Props<T extends Entry> {
  section: string;
  sectionLabel: string;
  items: readonly T[];
  columns: Column<T>[];
  filters?: FilterDef<T>[];
  searchText: (item: T) => string;
  copyText: (item: T) => string;
  /** Кнопка «Случайный …»: подпись */
  randomLabel?: string;
  /** Нестандартная карточка (например, загадка со скрытым ответом) */
  renderCard?: (item: T) => ReactNode;
  noTable?: boolean;
  initialQuery?: string;
}

export function Reference<T extends Entry>({
  section,
  sectionLabel,
  items,
  columns,
  filters = [],
  searchText,
  copyText,
  randomLabel,
  renderCard,
  noTable,
  initialQuery = '',
}: Props<T>) {
  const { settings, setSettings } = useStore();
  const [query, setQuery] = useState(initialQuery);
  const [sel, setSel] = useState<Record<string, string>>({});
  const [random, setRandom] = useState<T | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const filtered = useMemo(
    () =>
      items.filter((it) => {
        for (const f of filters) {
          const v = sel[f.key];
          if (v && f.get(it) !== v) return false;
        }
        return matches(searchText(it), query);
      }),
    [items, filters, sel, query, searchText]
  );

  const view = noTable ? 'cards' : settings.view;

  const roll = () => {
    const pool = filtered.length ? filtered : items;
    setRandom(pickDifferent(pool, random?.id));
  };

  const hasFilter = query.trim() !== '' || Object.values(sel).some(Boolean);
  const reset = () => {
    setQuery('');
    setSel({});
  };

  return (
    <section className="section">
      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder={`Поиск: ${sectionLabel.toLowerCase()}`} />
        {filters.map((f) => (
          <Chips
            key={f.key}
            label={f.label}
            value={sel[f.key] ?? ''}
            options={f.options}
            onChange={(v) => setSel((s) => ({ ...s, [f.key]: v }))}
          />
        ))}
        <div className="toolbar-row">
          <span className="counter" aria-live="polite">
            Найдено: <b>{filtered.length}</b> из {items.length}
          </span>
          {hasFilter && (
            <button type="button" className="link-btn" onClick={reset}>
              Сбросить
            </button>
          )}
          {!noTable && (
            <div className="seg" role="group" aria-label="Вид">
              <button
                type="button"
                className={view === 'cards' ? 'on' : ''}
                onClick={() => setSettings({ view: 'cards' })}
              >
                Карточки
              </button>
              <button
                type="button"
                className={view === 'table' ? 'on' : ''}
                onClick={() => setSettings({ view: 'table' })}
              >
                Таблица
              </button>
            </div>
          )}
        </div>
        {randomLabel && (
          <button type="button" className="btn primary wide" onClick={roll}>
            ⚄ {randomLabel}
          </button>
        )}
      </div>

      {random && (
        <div className="random-panel">
          <div className="random-head">
            <span>Выпало</span>
            <div className="actions">
              <button type="button" className="btn ghost" onClick={roll}>
                ↻ Ещё раз
              </button>
              <button type="button" className="icon-btn" aria-label="Закрыть" onClick={() => setRandom(null)}>
                ×
              </button>
            </div>
          </div>
          <div key={random.id}>
            {renderCard ? renderCard(random) : <Card item={random} columns={columns} section={section} copy={copyText(random)} />}
          </div>
          <div className="actions row">
            <CopyButton text={copyText(random)} label="Копировать всё" />
            <SaveButton section={sectionLabel} title={random.name} text={copyText(random)} />
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <Empty>Ничего не найдено. Измените запрос или сбросьте фильтры.</Empty>
      ) : view === 'table' ? (
        <div className="table-wrap" tabIndex={0} aria-label="Таблица, прокручивается по горизонтали">
          <table>
            <thead>
              <tr>
                <th className="sticky-col">Название</th>
                {columns
                  .filter((c) => !c.title)
                  .map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                <th aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id}>
                  <td className="sticky-col">
                    <b>{it.name}</b> {it.homebrew && <HomebrewMark />}
                  </td>
                  {columns
                    .filter((c) => !c.title)
                    .map((c) => (
                      <td key={c.key}>{c.render(it)}</td>
                    ))}
                  <td className="cell-actions">
                    <FavButton section={section} id={it.id} />
                    <CopyButton icon text={copyText(it)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="cards">
          {filtered.map((it) =>
            renderCard ? (
              <div key={it.id}>{renderCard(it)}</div>
            ) : (
              <Card key={it.id} item={it} columns={columns} section={section} copy={copyText(it)} />
            )
          )}
        </div>
      )}
      <p className="foot-note">
        {filtered.length} {plural(filtered.length, 'запись', 'записи', 'записей')} · данные хранятся в приложении
      </p>
    </section>
  );
}

export function Card<T extends Entry>({
  item,
  columns,
  section,
  copy,
}: {
  item: T;
  columns: Column<T>[];
  section: string;
  copy: string;
}) {
  const badges = columns.filter((c) => c.badge);
  const rows = columns.filter((c) => !c.badge && !c.title);
  return (
    <article className="card">
      <header className="card-head">
        <h3>{item.name}</h3>
        <div className="actions">
          <FavButton section={section} id={item.id} />
          <CopyButton icon text={copy} label="Копировать запись" />
        </div>
      </header>
      {(badges.length > 0 || item.homebrew) && (
        <div className="badges">
          {badges.map((c) => (
            <span key={c.key} className="badge-wrap">
              {c.render(item)}
            </span>
          ))}
          {item.homebrew && <HomebrewMark />}
        </div>
      )}
      <dl>
        {rows.map((c) => (
          <div key={c.key} className="row">
            <dt>{c.label}</dt>
            <dd>{c.render(item)}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
