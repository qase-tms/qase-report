import { vi } from 'vitest'
import { RootStore } from '@/store'

/**
 * Creates a fresh RootStore instance for testing.
 * CRITICAL: Stubs localStorage BEFORE constructing RootStore —
 * HistoryStore.constructor() calls loadFromLocalStorage() immediately.
 */
export const createTestStore = (): RootStore => {
  const localStorageMock = {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn().mockReturnValue(null),
    get length() {
      return 0
    },
  }

  vi.stubGlobal('localStorage', localStorageMock)

  return new RootStore()
}
