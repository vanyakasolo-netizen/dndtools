import type { ReactNode } from 'react';
import { RARITY_LABEL, RARITY_ORDER } from '../types';
import type {
  Artifact,
  Entry,
  Goods,
  MagicComponent,
  Mechanic,
  Potion,
  Riddle,
  Trap,
} from '../types';
import { potions } from '../data/potions';
import { artifacts } from '../data/artifacts';
import { components } from '../data/components';
import { mechanics } from '../data/mechanics';
import { riddles } from '../data/riddles';
import { traps } from '../data/traps';
import { goods } from '../data/goods';
import { formatPrice } from '../lib/utils';
import type { Column, FilterDef } from '../components/Reference';
import { RarityBadge } from '../components/common';

const rarityOptions = RARITY_ORDER.map((r) => ({ value: r, label: RARITY_LABEL[r] }));
const opts = (arr: readonly string[]) => arr.map((v) => ({ value: v, label: v }));
const badge = (s: ReactNode) => <span className="badge plain">{s}</span>;

export interface SectionConfig<T extends Entry = Entry> {
  id: string;
  label: string;
  short: string;
  icon: string;
  items: readonly T[];
  columns: Column<T>[];
  filters: FilterDef<T>[];
  searchText: (i: T) => string;
  copyText: (i: T) => string;
  randomLabel?: string;
  noTable?: boolean;
}

// ---------- Зелья ----------
const potionCfg: SectionConfig<Potion> = {
  id: 'potions',
  label: 'Зелья',
  short: 'Зелья',
  icon: '⚗',
  items: potions,
  columns: [
    { key: 'rarity', label: 'Редкость', badge: true, render: (p) => <RarityBadge rarity={p.rarity} /> },
    { key: 'type', label: 'Тип', badge: true, render: (p) => badge(p.type) },
    { key: 'cp', label: 'Стоимость', render: (p) => <span className="price">{formatPrice(p.cp)}</span> },
    { key: 'effect', label: 'Эффект и свойства', render: (p) => p.effect },
    { key: 'duration', label: 'Длительность', render: (p) => p.duration ?? '—' },
  ],
  filters: [
    { key: 'rarity', label: 'Редкость', options: rarityOptions, get: (p) => p.rarity },
    {
      key: 'type',
      label: 'Тип',
      options: opts(['Лечение', 'Магическая энергия', 'Усиление', 'Защита', 'Скрытность', 'Яд', 'Противоядие', 'Необычное']),
      get: (p) => p.type,
    },
  ],
  searchText: (p) => `${p.name} ${p.type} ${p.effect}`,
  copyText: (p) =>
    `${p.name} (${RARITY_LABEL[p.rarity]}, ${p.type})\nСтоимость: ${formatPrice(p.cp)}\nЭффект: ${p.effect}\nДлительность: ${p.duration ?? '—'}${p.homebrew ? '\n[домашнее правило]' : ''}`,
};

// ---------- Артефакты ----------
const artifactCfg: SectionConfig<Artifact> = {
  id: 'artifacts',
  label: 'Магические артефакты',
  short: 'Артефакты',
  icon: '✧',
  items: artifacts,
  columns: [
    { key: 'rarity', label: 'Редкость', badge: true, render: (a) => <RarityBadge rarity={a.rarity} /> },
    { key: 'category', label: 'Категория', badge: true, render: (a) => badge(a.category) },
    { key: 'itemType', label: 'Тип предмета', render: (a) => a.itemType },
    { key: 'properties', label: 'Магические свойства', render: (a) => a.properties },
    { key: 'drawback', label: 'Ограничения и побочные эффекты', render: (a) => a.drawback },
    { key: 'cp', label: 'Стоимость', render: (a) => <span className="price">{formatPrice(a.cp)}</span> },
  ],
  filters: [
    { key: 'rarity', label: 'Редкость', options: rarityOptions, get: (a) => a.rarity },
    {
      key: 'category',
      label: 'Категория',
      options: opts(['Оружие', 'Броня', 'Украшения', 'Амулеты', 'Посохи и жезлы', 'Кольца', 'Прочее']),
      get: (a) => a.category,
    },
  ],
  searchText: (a) => `${a.name} ${a.category} ${a.itemType} ${a.properties} ${a.drawback}`,
  copyText: (a) =>
    `${a.name} (${RARITY_LABEL[a.rarity]}, ${a.itemType})\nСвойства: ${a.properties}\nОграничения: ${a.drawback}\nСтоимость: ${formatPrice(a.cp)}${a.homebrew ? '\n[домашнее правило]' : ''}`,
  randomLabel: 'Случайный артефакт',
};

// ---------- Компоненты ----------
const componentCfg: SectionConfig<MagicComponent> = {
  id: 'components',
  label: 'Компоненты и материалы',
  short: 'Компоненты',
  icon: '❖',
  items: components,
  columns: [
    { key: 'rarity', label: 'Редкость', badge: true, render: (c) => <RarityBadge rarity={c.rarity} /> },
    { key: 'description', label: 'Описание', render: (c) => c.description },
    { key: 'cp', label: 'Стоимость', render: (c) => <span className="price">{formatPrice(c.cp)}</span> },
    { key: 'where', label: 'Где найти', render: (c) => c.where },
    { key: 'use', label: 'Для чего', render: (c) => c.use },
  ],
  filters: [{ key: 'rarity', label: 'Редкость', options: rarityOptions, get: (c) => c.rarity }],
  searchText: (c) => `${c.name} ${c.description} ${c.where} ${c.use}`,
  copyText: (c) =>
    `${c.name} (${RARITY_LABEL[c.rarity]})\n${c.description}\nСтоимость: ${formatPrice(c.cp)}\nГде найти: ${c.where}\nИспользование: ${c.use}`,
};

// ---------- Механики врагов ----------
const mechanicCfg: SectionConfig<Mechanic> = {
  id: 'mechanics',
  label: 'Механики врагов',
  short: 'Механики',
  icon: '☠',
  items: mechanics,
  columns: [
    { key: 'enemyType', label: 'Тип врага', badge: true, render: (m) => badge(m.enemyType) },
    { key: 'description', label: 'Описание', render: (m) => m.description },
    { key: 'effect', label: 'Игровой эффект', render: (m) => m.effect },
    { key: 'example', label: 'Пример для мастера', render: (m) => m.example },
  ],
  filters: [
    {
      key: 'enemyType',
      label: 'Тип врага',
      options: opts(['Нежить', 'Звери', 'Демоны', 'Драконы', 'Гуманоиды', 'Конструкты', 'Элементали', 'Боссы']),
      get: (m) => m.enemyType,
    },
  ],
  searchText: (m) => `${m.name} ${m.enemyType} ${m.description} ${m.effect} ${m.example}`,
  copyText: (m) =>
    `${m.name} (${m.enemyType})\n${m.description}\nЭффект: ${m.effect}\nПример: ${m.example}\n[домашнее правило]`,
  randomLabel: 'Случайная механика',
};

// ---------- Загадки ----------
export const riddleCopy = (r: Riddle, withAnswer = true) =>
  `${r.text}${r.hint && withAnswer ? `\nПодсказка: ${r.hint}` : ''}${withAnswer ? `\nОтвет: ${r.answer}` : ''}`;

const riddleCfg: SectionConfig<Riddle> = {
  id: 'riddles',
  label: 'Загадки',
  short: 'Загадки',
  icon: '?',
  items: riddles,
  columns: [],
  filters: [
    {
      key: 'category',
      label: 'Категория',
      options: opts([
        'Логические',
        'Магические',
        'Древние',
        'На внимательность',
        'Для дверей и механизмов',
        'Сфинксов и древних существ',
      ]),
      get: (r) => r.category,
    },
    { key: 'difficulty', label: 'Сложность', options: opts(['Лёгкая', 'Средняя', 'Сложная']), get: (r) => r.difficulty },
  ],
  searchText: (r) => `${r.text} ${r.category} ${r.theme} ${r.difficulty}`,
  copyText: (r) => riddleCopy(r),
  randomLabel: 'Случайная загадка',
  noTable: true,
};

// ---------- Ловушки ----------
const trapCfg: SectionConfig<Trap> = {
  id: 'traps',
  label: 'Ловушки',
  short: 'Ловушки',
  icon: '⚠',
  items: traps,
  columns: [
    { key: 'trapType', label: 'Тип', badge: true, render: (t) => badge(t.trapType) },
    { key: 'difficulty', label: 'Сложность', badge: true, render: (t) => badge(t.difficulty) },
    { key: 'description', label: 'Описание', render: (t) => t.description },
    { key: 'detection', label: 'Обнаружение', render: (t) => t.detection },
    { key: 'trigger', label: 'Срабатывание', render: (t) => t.trigger },
    { key: 'consequences', label: 'Последствия', render: (t) => t.consequences },
    { key: 'disarm', label: 'Обезвреживание', render: (t) => t.disarm },
  ],
  filters: [
    {
      key: 'trapType',
      label: 'Тип',
      options: opts(['Механические', 'Магические', 'Ядовитые', 'Иллюзорные', 'Проклятые', 'Комбинированные']),
      get: (t) => t.trapType,
    },
    { key: 'difficulty', label: 'Сложность', options: opts(['Лёгкая', 'Средняя', 'Сложная']), get: (t) => t.difficulty },
  ],
  searchText: (t) => `${t.name} ${t.trapType} ${t.description} ${t.detection} ${t.trigger} ${t.consequences} ${t.disarm}`,
  copyText: (t) =>
    `${t.name} (${t.trapType}, ${t.difficulty})\n${t.description}\nОбнаружение: ${t.detection}\nСрабатывание: ${t.trigger}\nПоследствия: ${t.consequences}\nОбезвреживание: ${t.disarm}\n[домашнее правило]`,
  randomLabel: 'Случайная ловушка',
};

// ---------- Предметы ----------
const goodsCfg: SectionConfig<Goods> = {
  id: 'goods',
  label: 'Предметы и торговля',
  short: 'Торговля',
  icon: '⚖',
  items: goods,
  columns: [
    { key: 'category', label: 'Категория', badge: true, render: (g) => badge(g.category) },
    { key: 'cp', label: 'Стоимость', render: (g) => <span className="price">{formatPrice(g.cp)}</span> },
    { key: 'description', label: 'Описание', render: (g) => g.description },
  ],
  filters: [
    {
      key: 'category',
      label: 'Категория',
      options: opts([
        'Снаряжение',
        'Инструменты',
        'Одежда',
        'Еда и напитки',
        'Походные принадлежности',
        'Освещение',
        'Оружие',
        'Броня',
        'Мелочи',
      ]),
      get: (g) => g.category,
    },
  ],
  searchText: (g) => `${g.name} ${g.category} ${g.description}`,
  copyText: (g) => `${g.name} — ${formatPrice(g.cp)} (${g.category}). ${g.description}`,
};

export const potionSection = potionCfg;
export const artifactSection = artifactCfg;
export const componentSection = componentCfg;
export const mechanicSection = mechanicCfg;
export const riddleSection = riddleCfg;
export const trapSection = trapCfg;
export const goodsSection = goodsCfg;

/** Все справочные разделы (без генератора имён) — для общего поиска и избранного. */
export const allConfigs: SectionConfig<any>[] = [
  potionCfg,
  artifactCfg,
  componentCfg,
  mechanicCfg,
  riddleCfg,
  trapCfg,
  goodsCfg,
];

export function findEntry(sectionId: string, id: string): { cfg: SectionConfig<any>; item: Entry } | null {
  const cfg = allConfigs.find((c) => c.id === sectionId);
  if (!cfg) return null;
  const item = cfg.items.find((i) => i.id === id);
  return item ? { cfg, item } : null;
}
