import type { QaseHistory, HistoricalRun } from '@/schemas/QaseHistory.schema'

/**
 * Factory for creating test HistoricalRun objects with sensible defaults.
 * Supports partial override via spread — callers spread nested objects themselves.
 */
export const makeHistoricalRun = (overrides?: Partial<HistoricalRun>): HistoricalRun => ({
  run_id: 'run-001',
  title: 'Test Run #1',
  environment: null,
  start_time: 1700000000000,
  end_time: 1700000060000,
  duration: 60000,
  stats: {
    total: 10,
    passed: 9,
    failed: 1,
    skipped: 0,
  },
  ...overrides,
})

/**
 * Factory for creating test QaseHistory objects with sensible defaults.
 * Supports partial override via spread — callers spread nested objects themselves.
 */
export const makeHistory = (overrides?: Partial<QaseHistory>): QaseHistory => ({
  schema_version: '1.0.0',
  runs: [makeHistoricalRun()],
  tests: [],
  ...overrides,
})
