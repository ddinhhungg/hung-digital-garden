import { readStore, removeStore, writeStore } from './storage';

const TOKEN_KEY = 'money.token.v1';

export const tokenStore = {
  get: (): string => readStore(TOKEN_KEY) ?? '',
  set: (token: string): void => writeStore(TOKEN_KEY, token.trim()),
  clear: (): void => removeStore(TOKEN_KEY),
  has: (): boolean => (readStore(TOKEN_KEY) ?? '').length > 0,
};
