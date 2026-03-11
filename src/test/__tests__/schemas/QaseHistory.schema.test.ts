import { describe, it, expect } from 'vitest'
import { QaseHistorySchema } from '@/schemas/QaseHistory.schema'
import { makeHistory, makeHistoricalRun } from '../../factories/history.factory'

describe('QaseHistorySchema', () => {
  describe('valid input', () => {
    it('accepts a valid makeHistory() fixture without throwing', () => {
      const history = makeHistory()
      expect(() => QaseHistorySchema.parse(history)).not.toThrow()
    })

    it('accepts valid nested HistoricalTestResult with runs array', () => {
      const history = makeHistory({
        tests: [
          {
            signature: 'suite::test_name',
            title: 'Test Name',
            runs: [
              {
                run_id: 'run-001',
                status: 'passed',
                duration: 500,
                start_time: 1700000000000,
                error_message: null,
              },
            ],
          },
        ],
      })
      const result = QaseHistorySchema.safeParse(history)
      expect(result.success).toBe(true)
    })

    it('accepts history with multiple runs', () => {
      const history = makeHistory({
        runs: [makeHistoricalRun({ run_id: 'run-001' }), makeHistoricalRun({ run_id: 'run-002' })],
      })
      const result = QaseHistorySchema.safeParse(history)
      expect(result.success).toBe(true)
    })
  })

  describe('default value', () => {
    it('applies default schema_version "1.0.0" when field is omitted', () => {
      const { schema_version, ...history } = makeHistory()
      const result = QaseHistorySchema.parse(history)
      expect(result.schema_version).toBe('1.0.0')
    })

    it('preserves explicit schema_version when provided', () => {
      const history = makeHistory({ schema_version: '2.0.0' })
      const result = QaseHistorySchema.parse(history)
      expect(result.schema_version).toBe('2.0.0')
    })
  })

  describe('required field rejection', () => {
    it('rejects input missing required "runs" array', () => {
      const { runs, ...history } = makeHistory()
      const result = QaseHistorySchema.safeParse(history)
      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(i => i.path[0])
        expect(paths).toContain('runs')
      }
    })

    it('rejects input missing required "tests" array', () => {
      const { tests, ...history } = makeHistory()
      const result = QaseHistorySchema.safeParse(history)
      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(i => i.path[0])
        expect(paths).toContain('tests')
      }
    })

    it('rejects input with "runs" as non-array', () => {
      const history = { ...makeHistory(), runs: 'not-an-array' }
      const result = QaseHistorySchema.safeParse(history)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type')
        expect(result.error.issues[0].path[0]).toBe('runs')
      }
    })
  })
})
