import { useStore } from '../lib/storage';
import { Card } from '../components/Reference';
import { CopyButton, Empty } from '../components/common';
import { findEntry } from './configs';
import { RiddleCard } from './Riddles';
import type { Riddle } from '../types';

export function Favorites() {
  const { favorites, saved, removeSaved, clearSaved } = useStore();

  const entries = favorites
    .map((key) => {
      const [section, ...rest] = key.split(':');
      return findEntry(section, rest.join(':'));
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  return (
    <section className="section">
      <h2 className="group-title">★ Избранные записи <small>{entries.length}</small></h2>
      {entries.length === 0 ? (
        <Empty>Пока пусто. Нажмите ☆ на любой карточке, чтобы закрепить её здесь.</Empty>
      ) : (
        <div className="cards">
          {entries.map(({ cfg, item }) =>
            cfg.id === 'riddles' ? (
              <RiddleCard key={`${cfg.id}:${item.id}`} r={item as Riddle} />
            ) : (
              <div key={`${cfg.id}:${item.id}`}>
                <div className="fav-source">{cfg.label}</div>
                <Card item={item} columns={cfg.columns} section={cfg.id} copy={cfg.copyText(item)} />
              </div>
            )
          )}
        </div>
      )}

      <h2 className="group-title">⚑ Сохранённые результаты <small>{saved.length}</small></h2>
      {saved.length === 0 ? (
        <Empty>Здесь появятся имена и случайные результаты, которые вы сохраните кнопкой «Сохранить».</Empty>
      ) : (
        <>
          <ul className="saved-list">
            {saved.map((s) => (
              <li key={s.id} className="card saved">
                <header className="card-head">
                  <div>
                    <div className="fav-source">{s.section}</div>
                    <h3>{s.title}</h3>
                  </div>
                  <div className="actions">
                    <CopyButton icon text={s.text} />
                    <button type="button" className="icon-btn" aria-label="Удалить" onClick={() => removeSaved(s.id)}>
                      ×
                    </button>
                  </div>
                </header>
                <p className="saved-text">{s.text}</p>
                <time className="saved-time">{new Date(s.ts).toLocaleString('ru-RU')}</time>
              </li>
            ))}
          </ul>
          <button type="button" className="btn ghost wide" onClick={() => window.confirm('Удалить все сохранённые результаты?') && clearSaved()}>
            Очистить сохранённые
          </button>
        </>
      )}
    </section>
  );
}
