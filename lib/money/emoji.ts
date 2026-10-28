// Biểu tượng nhỏ (emoji) để dễ phân loại bằng mắt. Không cần ảnh hay font thêm.
const has = (text: string, words: string[]) => words.some(w => text.includes(w));
const norm = (v: string | null | undefined) => (v ?? '').toLowerCase();

const CATEGORY: Record<string, string> = {
  'ăn uống': '🍜', 'nhà ở': '🏠', 'di chuyển': '🛵', 'học tập': '📚', 'mua sắm': '🛍️',
  'sức khoẻ': '💊', 'sức khỏe': '💊', 'giải trí': '🎮', 'gia đình': '👨‍👩‍👧', 'quà tặng': '🎁',
  'lương chính': '💰', 'lương': '💰', 'thu nhập khác': '✨', 'khác': '🧾',
  'nợ/trả góp': '💳', 'chưa phân loại': '🧾', 'đầu tư': '📈', 'du lịch': '✈️',
};
export const categoryEmoji = (name: string | null | undefined) => CATEGORY[norm(name)] ?? '🏷️';

const GROUP: Record<string, string> = {
  'tiền mặt': '💵', 'ngân hàng': '🏦', 'ví điện tử': '📱', 'tiết kiệm': '🐷',
  'đầu tư': '📈', 'thẻ tín dụng': '💳',
};
export const groupEmoji = (name: string) => GROUP[norm(name)] ?? '💼';

export function fundEmoji(name: string): string {
  const n = norm(name);
  if (has(n, ['nhà', 'thuê'])) return '🏠';
  if (has(n, ['du lịch', 'chuyến đi'])) return '✈️';
  if (has(n, ['cuối năm', 'tết'])) return '🎉';
  if (has(n, ['khẩn cấp', 'dự phòng'])) return '🛟';
  if (has(n, ['quà', 'mua đồ'])) return '🎁';
  if (has(n, ['thiết bị', 'laptop', 'điện thoại'])) return '💻';
  if (has(n, ['nghỉ việc', 'backup'])) return '🧳';
  if (has(n, ['học', 'khoá'])) return '📚';
  return '🎯';
}

export function itemEmoji(label: string): string {
  const n = norm(label);
  if (has(n, ['lương'])) return '💰';
  if (has(n, ['nhà'])) return '🏠';
  if (has(n, ['claude', 'ai ', 'gpt'])) return '🤖';
  if (has(n, ['xe', 'xăng'])) return '🛵';
  if (has(n, ['mạng', '5g', 'wifi', 'data'])) return '📶';
  if (has(n, ['pay later', 'paylater', 'thẻ', 'trả góp'])) return '💳';
  if (has(n, ['ăn', 'cơm', 'cafe', 'cà phê'])) return '🍜';
  return '📌';
}
