import type { QaseRun } from '@/schemas/QaseRun.schema'

/**
 * Factory for creating test QaseRun objects with sensible defaults.
 * Supports partial override via spread — callers spread nested objects themselves.
 */
export const makeRun = (overrides?: Partial<QaseRun>): QaseRun => ({
  title: 'Test Run',
  environment: null,
  execution: {
    start_time: 1700000000000,
    end_time: 1700000060000,
    duration: 60000,
    cumulative_duration: 120000,
  },
  stats: {
    total: 10,
    passed: 8,
    failed: 1,
    skipped: 1,
  },
  results: [],
  threads: [],
  suites: [],
  ...overrides,
})
