// localStorage an toàn: không có hoặc bị chặn (chế độ riêng tư) thì rơi về bộ nhớ tạm.
const memory = new Map<string, string>();

export function readStore(key: string): string | null {
  try {
    if (typeof window !== 'undefined') {
      const value = window.localStorage.getItem(key);
      if (value !== null) return value;
    }
  } catch {
    /* bị chặn */
  }
  return memory.get(key) ?? null;
}

export function writeStore(key: string, value: string): void {
  memory.set(key, value);
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  } catch {
    /* chỉ còn bộ nhớ tạm */
  }
}

export function removeStore(key: string): void {
  memory.delete(key);
  try {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  } catch {
    /* bỏ qua */
  }
}
