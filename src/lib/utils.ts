// Небольшие вспомогательные функции.

/** Настоящее случайное целое [0, n) на основе crypto, с запасным вариантом Math.random. */
export function randInt(n: number): number {
  if (n <= 1) return 0;
  try {
    const buf = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / n) * n; // убираем смещение остатка от деления
    let x: number;
    do {
      crypto.getRandomValues(buf);
      x = buf[0];
    } while (x >= limit);
    return x % n;
  } catch {
    return Math.floor(Math.random() * n);
  }
}

export function pick<T>(arr: readonly T[]): T {
  return arr[randInt(arr.length)];
}

/** Случайный элемент, отличный от предыдущего (если есть выбор). */
export function pickDifferent<T extends { id: string }>(arr: readonly T[], prevId?: string): T {
  if (arr.length <= 1) return arr[0];
  let item: T;
  do {
    item = arr[randInt(arr.length)];
  } while (item.id === prevId);
  return item;
}

/** Стабильный короткий id из префикса и названия (id не меняется, пока не переименована запись). */
export function makeId(prefix: string, name: string): string {
  let h = 5381;
  for (let i = 0; i < name.length; i++) h = ((h << 5) + h + name.charCodeAt(i)) | 0;
  return `${prefix}-${(h >>> 0).toString(36)}`;
}

/** Цена в монетах: 1 зм = 10 см = 100 мм. Хранится в медных (мм). */
export function formatPrice(cp: number): string {
  if (cp <= 0) return '—';
  const gp = Math.floor(cp / 100);
  const sp = Math.floor((cp % 100) / 10);
  const c = cp % 10;
  const parts: string[] = [];
  if (gp) parts.push(`${gp.toLocaleString('ru-RU')} зм`);
  if (sp) parts.push(`${sp} см`);
  if (c) parts.push(`${c} мм`);
  return parts.join(' ');
}

/** Нормализация для поиска: регистр, ё=е. */
export function norm(s: string): string {
  return s.toLowerCase().replace(/ё/g, 'е');
}

export function matches(haystack: string, query: string): boolean {
  const q = norm(query.trim());
  if (!q) return true;
  const h = norm(haystack);
  return q.split(/\s+/).every((word) => h.includes(word));
}

/** Копирование в буфер: современный API + запасной вариант для http и старых браузеров. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* падаем на запасной вариант */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
