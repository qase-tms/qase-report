import type { QaseTestResult } from '@/schemas/QaseTestResult.schema'

/**
 * Factory for creating test QaseTestResult objects with sensible defaults.
 * Supports partial override via spread — callers spread nested objects themselves.
 */
export const makeTestResult = (overrides?: Partial<QaseTestResult>): QaseTestResult => ({
  id: 'test-001',
  title: 'Sample Test Case',
  signature: 'suite::module::test_case',
  muted: false,
  execution: {
    status: 'passed',
    start_time: 1700000000000,
    end_time: 1700000001000,
    duration: 1000,
    stacktrace: null,
    thread: 'main',
  },
  message: null,
  relations: {
    suite: {
      data: [{ title: 'Default Suite', public_id: null }],
    },
  },
  steps: [],
  attachments: [],
  params: {},
  param_groups: [],
  fields: {},
  testops_ids: null,
  ...overrides,
})
