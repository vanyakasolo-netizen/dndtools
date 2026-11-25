import { useState } from 'react';
import { cultures } from '../data/names';
import type { Culture } from '../data/names';
import { pick, randInt } from '../lib/utils';
import { useLocalStorage } from '../lib/storage';
import { CopyButton, Empty, SaveButton } from '../components/common';

type Gender = 'male' | 'female' | 'neutral';
type Mode = 'first' | 'surname' | 'full';

const GENDERS: { id: Gender; label: string }[] = [
  { id: 'male', label: 'Мужской' },
  { id: 'female', label: 'Женский' },
  { id: 'neutral', label: 'Нейтральный' },
];

const MODES: { id: Mode; label: string }[] = [
  { id: 'first', label: 'Имя' },
  { id: 'surname', label: 'Фамилия' },
  { id: 'full', label: 'Полное имя' },
];

const COUNTS = [1, 3, 5, 10];

function makeSurname(c: Culture): string {
  const parts = c.surnameParts;
  // Если есть части — примерно в половине случаев собираем новое сочетание, иначе берём готовое
  if (parts && randInt(2) === 0) {
    const a = pick(parts.first);
    const b = pick(parts.second);
    const raw = `${a}${parts.joiner}${b}`;
    return parts.joiner === '' ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw;
  }
  return pick(c.surnames);
}

export function generate(c: Culture, gender: Gender, mode: Mode, count: number): string[] {
  const out = new Set<string>();
  const pool = c[gender];
  // Защита от зацикливания: ограничиваем число попыток
  let guard = 0;
  while (out.size < count && guard++ < count * 40) {
    const first = pick(pool);
    const sur = makeSurname(c);
    out.add(mode === 'first' ? first : mode === 'surname' ? sur : `${first} ${sur}`);
  }
  return [...out];
}

export function Names() {
  const [cultureId, setCultureId] = useLocalStorage('names.culture', cultures[0].id);
  const [gender, setGender] = useLocalStorage<Gender>('names.gender', 'male');
  const [mode, setMode] = useLocalStorage<Mode>('names.mode', 'full');
  const [count, setCount] = useLocalStorage('names.count', 5);
  const culture = cultures.find((c) => c.id === cultureId) ?? cultures[0];
  const [result, setResult] = useState<string[]>([]);

  const run = () => setResult(generate(culture, gender, mode, count));

  const label = (c: Culture) => c.label;
  const poolSize = culture[gender].length;

  return (
    <section className="section">
      <div className="panel">
        <h2 className="panel-title">Раса или культура</h2>
        <div className="grid-chips">
          {cultures.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`chip big${c.id === culture.id ? ' on' : ''}`}
              onClick={() => setCultureId(c.id)}
            >
              <span aria-hidden="true">{c.icon}</span> {label(c)}
            </button>
          ))}
        </div>

        <h2 className="panel-title">Пол</h2>
        <div className="seg wide" role="group" aria-label="Пол">
          {GENDERS.map((g) => (
            <button key={g.id} type="button" className={gender === g.id ? 'on' : ''} onClick={() => setGender(g.id)}>
              {g.label}
            </button>
          ))}
        </div>

        <h2 className="panel-title">Что создать</h2>
        <div className="seg wide" role="group" aria-label="Режим">
          {MODES.map((m) => (
            <button key={m.id} type="button" className={mode === m.id ? 'on' : ''} onClick={() => setMode(m.id)}>
              {m.id === 'surname' ? culture.surnameLabel : m.label}
            </button>
          ))}
        </div>

        <h2 className="panel-title">Сколько</h2>
        <div className="seg wide" role="group" aria-label="Количество">
          {COUNTS.map((n) => (
            <button key={n} type="button" className={count === n ? 'on' : ''} onClick={() => setCount(n)}>
              {n}
            </button>
          ))}
        </div>

        <button type="button" className="btn primary wide big-btn" onClick={run}>
          ⚄ {result.length ? 'Сгенерировать заново' : 'Сгенерировать'}
        </button>
        <p className="foot-note">
          В базе: {poolSize} имён ({GENDERS.find((g) => g.id === gender)?.label.toLowerCase()}), {culture.surnames.length}+ вариантов фамилий
          {culture.surnameParts ? ' и составные фамилии' : ''}.
        </p>
      </div>

      {result.length === 0 ? (
        <Empty>Выберите настройки и нажмите «Сгенерировать».</Empty>
      ) : (
        <div className="panel result">
          <div className="random-head">
            <span>{culture.label}</span>
            <div className="actions">
              <CopyButton text={result.join('\n')} label="Копировать все" />
              <SaveButton section="Имена" title={result[0]} text={result.join(', ')} />
            </div>
          </div>
          <ul className="name-list">
            {result.map((n) => (
              <li key={n}>
                <span>{n}</span>
                <CopyButton icon text={n} label={`Копировать «${n}»`} />
              </li>
            ))}
          </ul>
          <button type="button" className="btn ghost wide" onClick={run}>
            ↻ Ещё раз
          </button>
        </div>
      )}
    </section>
  );
}
