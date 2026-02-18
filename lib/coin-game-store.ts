/**
 * In-memory fallback for coin game state when Redis is unavailable.
 * Keys: coinGame.user.{userId}.start, coinGame.user.{userId}.game
 */

const store = new Map<string, string>();

export function coinStoreGet(key: string): string | null {
  return store.get(key) ?? null;
}

export function coinStoreSet(key: string, value: string): void {
  store.set(key, value);
}

export function coinStoreDel(key: string): void {
  store.delete(key);
}

export function getCoinGameStart(userId: number): Promise<string | null> {
  return Promise.resolve(coinStoreGet(`coinGame.user.${userId}.start`));
}

export function setCoinGameStart(userId: number, value: string): Promise<void> {
  coinStoreSet(`coinGame.user.${userId}.start`, value);
  return Promise.resolve();
}

export function getCoinGame(userId: number): Promise<string | null> {
  return Promise.resolve(coinStoreGet(`coinGame.user.${userId}.game`));
}

export function setCoinGame(userId: number, value: string): Promise<void> {
  coinStoreSet(`coinGame.user.${userId}.game`, value);
  return Promise.resolve();
}

export function delCoinGame(userId: number): Promise<void> {
  coinStoreDel(`coinGame.user.${userId}.game`);
  coinStoreSet(`coinGame.user.${userId}.start`, '0');
  return Promise.resolve();
}

