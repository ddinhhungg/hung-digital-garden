import { readStore, removeStore, writeStore } from './storage';
import { sha256Hex } from './sha256';
import type { MoneyLock } from './types';

const PIN_KEY = 'money.pin.v1';

function randomSalt(): string {
  const bytes = new Uint8Array(12);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// PIN chỉ để che số khi người khác cầm máy, không phải bảo mật thật.
export function createMoneyLock(): MoneyLock {
  return {
    isSet: () => (readStore(PIN_KEY) ?? '').includes(':'),
    verify: (pin) => {
      const stored = readStore(PIN_KEY);
      if (!stored || !/^\d{4,6}$/.test(pin)) return false;
      const [salt, hash] = stored.split(':');
      return sha256Hex(`${salt}:${pin}`) === hash;
    },
    set: (pin) => {
      if (!/^\d{4,6}$/.test(pin)) return;
      const salt = randomSalt();
      writeStore(PIN_KEY, `${salt}:${sha256Hex(`${salt}:${pin}`)}`);
    },
    clear: () => removeStore(PIN_KEY),
  };
}
