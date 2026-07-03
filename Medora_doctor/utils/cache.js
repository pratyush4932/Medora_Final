const cacheStore = new Map();

export const cache = {
  set: (key, value, ttlMs = 5 * 60 * 1000) => {
    const expiresAt = Date.now() + ttlMs;
    cacheStore.set(key, { value, expiresAt });
  },

  get: (key) => {
    const entry = cacheStore.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      cacheStore.delete(key);
      return null;
    }
    
    return entry.value;
  },

  delete: (key) => {
    cacheStore.delete(key);
  },

  clear: () => {
    cacheStore.clear();
  }
};
