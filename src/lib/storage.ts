// Утилиты для работы с localStorage с безопасной сериализацией

const PREFIX = "plugmarket_"

export function ls_get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch (_e) {
    return fallback
  }
}

export function ls_set<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (_e) {
    console.warn("localStorage write failed", _e)
  }
}

export function ls_remove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch (_e) {
    console.warn("localStorage remove failed", _e)
  }
}

export function ls_clear_all(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k))
  } catch (_e) {
    console.warn("localStorage clear failed", _e)
  }
}