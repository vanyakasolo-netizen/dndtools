// Общие типы данных приложения.

export type Rarity = 'common' | 'uncommon' | 'rare' | 'veryRare' | 'legendary';

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Обычная',
  uncommon: 'Необычная',
  rare: 'Редкая',
  veryRare: 'Очень редкая',
  legendary: 'Легендарная',
};

export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'veryRare', 'legendary'];

/** Любая запись справочника имеет стабильный id и признак «домашнее правило». */
export interface Entry {
  id: string;
  name: string;
  homebrew?: boolean;
}

export type PotionType =
  | 'Лечение'
  | 'Магическая энергия'
  | 'Усиление'
  | 'Защита'
  | 'Скрытность'
  | 'Яд'
  | 'Противоядие'
  | 'Необычное';

export interface Potion extends Entry {
  rarity: Rarity;
  type: PotionType;
  /** Стоимость в медных монетах (1 зм = 10 см = 100 мм) */
  cp: number;
  effect: string;
  duration?: string;
}

export type ArtifactCategory =
  | 'Оружие'
  | 'Броня'
  | 'Украшения'
  | 'Амулеты'
  | 'Посохи и жезлы'
  | 'Кольца'
  | 'Прочее';

export interface Artifact extends Entry {
  rarity: Rarity;
  category: ArtifactCategory;
  itemType: string;
  properties: string;
  drawback: string;
  cp: number;
}

export interface MagicComponent extends Entry {
  description: string;
  rarity: Rarity;
  cp: number;
  where: string;
  use: string;
}

export type EnemyType =
  | 'Нежить'
  | 'Звери'
  | 'Демоны'
  | 'Драконы'
  | 'Гуманоиды'
  | 'Конструкты'
  | 'Элементали'
  | 'Боссы';

export interface Mechanic extends Entry {
  enemyType: EnemyType;
  description: string;
  effect: string;
  example: string;
}

export type RiddleCategory =
  | 'Логические'
  | 'Магические'
  | 'Древние'
  | 'На внимательность'
  | 'Для дверей и механизмов'
  | 'Сфинксов и древних существ';

export type Difficulty = 'Лёгкая' | 'Средняя' | 'Сложная';

export interface Riddle extends Entry {
  /** Для загадок «name» — короткий заголовок, который мастер видит в списке */
  text: string;
  answer: string;
  hint?: string;
  difficulty: Difficulty;
  category: RiddleCategory;
  theme: string;
}

export type TrapType =
  | 'Механические'
  | 'Магические'
  | 'Ядовитые'
  | 'Иллюзорные'
  | 'Проклятые'
  | 'Комбинированные';

export interface Trap extends Entry {
  trapType: TrapType;
  description: string;
  detection: string;
  trigger: string;
  consequences: string;
  disarm: string;
  difficulty: Difficulty;
}

export type ItemCategory =
  | 'Снаряжение'
  | 'Инструменты'
  | 'Одежда'
  | 'Еда и напитки'
  | 'Походные принадлежности'
  | 'Освещение'
  | 'Оружие'
  | 'Броня'
  | 'Мелочи';

export interface Goods extends Entry {
  category: ItemCategory;
  cp: number;
  description: string;
}

export type SectionId =
  | 'potions'
  | 'names'
  | 'artifacts'
  | 'components'
  | 'mechanics'
  | 'riddles'
  | 'traps'
  | 'goods'
  | 'favorites';
