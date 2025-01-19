// app/src/utils/cache.js
import SHA256 from 'crypto-js/sha256';

class CacheManager {
  constructor(options = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.ttl || 10 * 60 * 1000;
    this.cleanupInterval = options.cleanupInterval || 60 * 1000;
    this.isDev = import.meta.env.DEV;
    this.startCleanupInterval();
  }

  log(action, data) {
    if (this.isDev) {
      console.log(
        `%cCache ${action}:`,
        'color: #2196F3; font-weight: bold',
        data
      );
    }
  }

  generateKey(config) {
    const keyData = {
      method: config.method?.toLowerCase(),
      url: config.url,
      params: config.params || null,
      data: config.data || null,
      token: localStorage.getItem('token'),
    };

    const key = SHA256(
      Object.entries(keyData)
        .filter(([, value]) => value !== null)
        .map(
          ([key, value]) =>
            `${key}:${typeof value === 'object' ? JSON.stringify(value) : value}`
        )
        .join('|')
    ).toString();

    // this.log('Key Generated', { config, key });
    return key;
  }

  set(key, value, ttl = this.defaultTTL) {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
      this.log('Evicted', { key: oldestKey });
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
    this.log('Set', { key, value, ttl });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) {
      // this.log('Miss', { key });
      return null;
    }

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      this.log('Expired', { key });
      return null;
    }

    this.log(
      'Hit'
      // { key, value: cached.value }
    );
    return cached.value;
  }

  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.log('Cleared', { entriesCleared: size });
  }

  clearByPattern(pattern) {
    let cleared = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    this.log('Pattern Clear', { pattern, entriesCleared: cleared });
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      this.log('Cleanup', { entriesRemoved: cleaned });
    }
  }

  startCleanupInterval() {
    this.log('Started', {
      maxSize: this.maxSize,
      ttl: this.defaultTTL,
      cleanupInterval: this.cleanupInterval,
    });
    this.cleanupTimer = setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  stopCleanupInterval() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.log('Stopped', null);
    }
  }
}

export default CacheManager;
