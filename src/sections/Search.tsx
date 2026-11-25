import { useMemo, useState } from 'react';
import { allConfigs } from './configs';
import { matches, plural } from '../lib/utils';
import { CopyButton, Empty, FavButton, SearchBox } from '../components/common';

interface Props {
  onOpen: (sectionId: string, query: string) => void;
}

export function GlobalSearch({ onOpen }: Props) {
  const [query, setQuery] = useState('');
  const q = query.trim();

  const groups = useMemo(() => {
    if (q.length < 2) return [];
    return allConfigs
      .map((cfg) => ({ cfg, hits: cfg.items.filter((i) => matches(cfg.searchText(i), q)) }))
      .filter((g) => g.hits.length > 0);
  }, [q]);

  const total = groups.reduce((n, g) => n + g.hits.length, 0);

  return (
    <section className="section">
      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Поиск по всей книге" />
        <p className="counter">
          {q.length < 2 ? (
            'Введите минимум 2 символа: ищем по зельям, артефактам, компонентам, механикам, загадкам, ловушкам и предметам.'
          ) : (
            <>
              Найдено: <b>{total}</b> {plural(total, 'запись', 'записи', 'записей')}
            </>
          )}
        </p>
      </div>
      {q.length >= 2 && total === 0 && <Empty>Ничего не найдено.</Empty>}
      {groups.map(({ cfg, hits }) => (
        <div key={cfg.id} className="group">
          <h2 className="group-title">
            <span aria-hidden="true">{cfg.icon}</span> {cfg.label} <small>{hits.length}</small>
          </h2>
          <ul className="hit-list">
            {hits.slice(0, 20).map((i) => (
              <li key={i.id} className="hit">
                <button type="button" className="hit-main" onClick={() => onOpen(cfg.id, q)}>
                  <b>{i.name}</b>
                  <span>{cfg.id === 'riddles' ? i.text : snippet(cfg.copyText(i), i.name)}</span>
                </button>
                <FavButton section={cfg.id} id={i.id} />
                <CopyButton icon text={cfg.id === 'riddles' ? i.text : cfg.copyText(i)} />
              </li>
            ))}
          </ul>
          {hits.length > 20 && (
            <button type="button" className="link-btn" onClick={() => onOpen(cfg.id, q)}>
              Показать все {hits.length} в разделе →
            </button>
          )}
        </div>
      ))}
    </section>
  );
}

function snippet(full: string, name: string): string {
  const rest = full.split('\n').slice(1).join(' ').replace(name, '').trim();
  return rest.length > 110 ? rest.slice(0, 110) + '…' : rest;
}
