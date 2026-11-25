import { useEffect, useRef, useState } from 'react';
import { StoreProvider, ToastProvider, useStore } from './lib/storage';
import { Reference } from './components/Reference';
import { Ornament } from './components/common';
import {
  artifactSection,
  componentSection,
  goodsSection,
  mechanicSection,
  potionSection,
  trapSection,
} from './sections/configs';
import type { SectionConfig } from './sections/configs';
import type { Entry } from './types';
import { Names } from './sections/Names';
import { Riddles } from './sections/Riddles';
import { GlobalSearch } from './sections/Search';
import { Favorites } from './sections/Favorites';

interface Tab {
  id: string;
  label: string;
  icon: string;
  title: string;
}

const TABS: Tab[] = [
  { id: 'potions', label: 'Зелья', icon: '⚗', title: 'Зелья' },
  { id: 'names', label: 'Имена', icon: '✎', title: 'Генератор имён' },
  { id: 'artifacts', label: 'Артефакты', icon: '✧', title: 'Магические артефакты' },
  { id: 'components', label: 'Компоненты', icon: '❖', title: 'Компоненты и материалы' },
  { id: 'mechanics', label: 'Механики', icon: '☠', title: 'Механики врагов' },
  { id: 'riddles', label: 'Загадки', icon: '?', title: 'Загадки' },
  { id: 'traps', label: 'Ловушки', icon: '⚠', title: 'Ловушки' },
  { id: 'goods', label: 'Торговля', icon: '⚖', title: 'Предметы и торговля' },
  { id: 'search', label: 'Поиск', icon: '⌕', title: 'Поиск по книге' },
  { id: 'favorites', label: 'Избранное', icon: '★', title: 'Избранное' },
];

const REFERENCE: Record<string, SectionConfig<any>> = {
  potions: potionSection,
  artifacts: artifactSection,
  components: componentSection,
  mechanics: mechanicSection,
  traps: trapSection,
  goods: goodsSection,
};

function Shell() {
  const { settings, setSettings } = useStore();
  const initial = TABS.some((t) => t.id === settings.lastTab) ? settings.lastTab : 'potions';
  const [tab, setTab] = useState(initial);
  const [jump, setJump] = useState<{ query: string; n: number }>({ query: '', n: 0 });
  const mainRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const go = (id: string, query = '') => {
    setTab(id);
    setJump((j) => ({ query, n: j.n + 1 }));
    setSettings({ lastTab: id });
    window.scrollTo({ top: 0 });
  };

  // Активная вкладка всегда видна в нижней панели
  useEffect(() => {
    const el = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    el?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [tab]);

  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  const cfg = REFERENCE[tab];

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">⚔</span>
          <div>
            <h1>Книга мастера</h1>
            <p>D&amp;D Toolkit</p>
          </div>
        </div>
        <h2 className="page-title">{current.title}</h2>
      </header>

      <main ref={mainRef} className="app-main" id="main">
        {tab === 'names' && <Names />}
        {tab === 'riddles' && <Riddles key={jump.n} initialQuery={jump.query} />}
        {tab === 'search' && <GlobalSearch onOpen={go} />}
        {tab === 'favorites' && <Favorites />}
        {cfg && (
          <Reference<Entry>
            key={`${tab}-${jump.n}`}
            section={cfg.id}
            sectionLabel={cfg.label}
            items={cfg.items}
            columns={cfg.columns}
            filters={cfg.filters}
            searchText={cfg.searchText}
            copyText={cfg.copyText}
            randomLabel={cfg.randomLabel}
            noTable={cfg.noTable}
            initialQuery={jump.query}
          />
        )}
        <Ornament />
        <p className="legal">
          Материалы собственные; цены ориентированы на 5e (1 зм = 10 см = 100 мм). Записи с пометкой «дом. правило» —
          авторские механики, не из официальных книг.
        </p>
      </main>

      <nav ref={navRef} className="bottom-nav" aria-label="Разделы">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={t.id === tab ? 'on' : ''}
            aria-current={t.id === tab ? 'page' : undefined}
            onClick={() => go(t.id)}
          >
            <span className="nav-ico" aria-hidden="true">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </StoreProvider>
  );
}
