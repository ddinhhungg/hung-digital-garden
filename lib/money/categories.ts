import type { Summary } from './types';

export const stripMarks = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();

type Categories = Summary['meta']['categories'];

/** Gợi ý danh mục từ một đoạn chữ (tên khoản, ghi chú) bằng các từ khoá trong tab Danh mục. */
export function matchCategory(categories: Categories, type: 'Thu' | 'Chi', text: string): string {
  const haystack = stripMarks(text);
  if (!haystack.trim()) return '';
  return categories.find(c => c.type === type && c.hints.some(h => haystack.includes(stripMarks(h))))?.name ?? '';
}

export const dateIsValid = (d: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;
