import { useState } from 'react';
import type { Riddle } from '../types';
import { Reference } from '../components/Reference';
import { CopyButton, FavButton } from '../components/common';
import { riddleCopy, riddleSection as cfg } from './configs';

export function RiddleCard({ r }: { r: Riddle }) {
  const [hint, setHint] = useState(false);
  const [answer, setAnswer] = useState(false);
  return (
    <article className="card riddle">
      <header className="card-head">
        <div className="badges">
          <span className="badge plain">{r.category}</span>
          <span className={`badge diff-${r.difficulty}`}>{r.difficulty}</span>
          <span className="badge plain">{r.theme}</span>
          <span className="badge homebrew">авторская</span>
        </div>
        <div className="actions">
          <FavButton section="riddles" id={r.id} />
          <CopyButton icon text={riddleCopy(r, false)} label="Копировать текст загадки" />
        </div>
      </header>
      <p className="riddle-text">{r.text}</p>
      <div className="actions row">
        {r.hint && (
          <button type="button" className="btn ghost" onClick={() => setHint((v) => !v)}>
            {hint ? 'Скрыть подсказку' : '☼ Подсказка'}
          </button>
        )}
        <button type="button" className="btn ghost" onClick={() => setAnswer((v) => !v)}>
          {answer ? 'Скрыть ответ' : '⚿ Показать ответ'}
        </button>
      </div>
      {hint && r.hint && <p className="reveal hint">Подсказка: {r.hint}</p>}
      {answer && <p className="reveal answer">Ответ: {r.answer}</p>}
    </article>
  );
}

export function Riddles({ initialQuery }: { initialQuery?: string }) {
  return (
    <Reference<Riddle>
      section={cfg.id}
      sectionLabel={cfg.label}
      items={cfg.items}
      columns={cfg.columns}
      filters={cfg.filters}
      searchText={cfg.searchText}
      copyText={cfg.copyText}
      randomLabel={cfg.randomLabel}
      noTable
      initialQuery={initialQuery}
      // key=id: у каждой карточки своё состояние показа ответа
      renderCard={(r) => <RiddleCard key={r.id} r={r} />}
    />
  );
}
