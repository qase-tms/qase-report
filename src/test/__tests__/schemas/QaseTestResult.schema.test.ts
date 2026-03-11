import { describe, it, expect } from 'vitest'
import { TestResultSchema } from '@/schemas/QaseTestResult.schema'
import { makeTestResult } from '../../factories/result.factory'

describe('TestResultSchema (QaseTestResult)', () => {
  describe('valid input', () => {
    it('accepts a valid makeTestResult() fixture without throwing', () => {
      const result = makeTestResult()
      expect(() => TestResultSchema.parse(result)).not.toThrow()
    })

    it('accepts all 7 valid execution.status values', () => {
      const statuses = ['passed', 'failed', 'skipped', 'broken', 'blocked', 'muted', 'invalid'] as const
      for (const status of statuses) {
        const result = makeTestResult({
          execution: { ...makeTestResult().execution, status },
        })
        const parsed = TestResultSchema.safeParse(result)
        expect(parsed.success, `status "${status}" should be valid`).toBe(true)
      }
    })

    it('accepts result with empty steps, attachments, params', () => {
      const result = makeTestResult({ steps: [], attachments: [], params: {} })
      expect(() => TestResultSchema.parse(result)).not.toThrow()
    })

    it('parses and returns object with correct id and signature', () => {
      const result = makeTestResult({ id: 'abc-123', signature: 'my::test::sig' })
      const parsed = TestResultSchema.parse(result)
      expect(parsed.id).toBe('abc-123')
      expect(parsed.signature).toBe('my::test::sig')
    })
  })

  describe('required field rejection', () => {
    it('rejects input missing required field "id"', () => {
      const { id, ...result } = makeTestResult()
      const parsed = TestResultSchema.safeParse(result)
      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        const paths = parsed.error.issues.map(i => i.path[0])
        expect(paths).toContain('id')
      }
    })

    it('rejects input missing required field "signature"', () => {
      const { signature, ...result } = makeTestResult()
      const parsed = TestResultSchema.safeParse(result)
      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        const paths = parsed.error.issues.map(i => i.path[0])
        expect(paths).toContain('signature')
      }
    })

    it('rejects input missing required field "execution"', () => {
      const { execution, ...result } = makeTestResult()
      const parsed = TestResultSchema.safeParse(result)
      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        const paths = parsed.error.issues.map(i => i.path[0])
        expect(paths).toContain('execution')
      }
    })
  })

  describe('enum validation', () => {
    it('rejects invalid execution.status value "unknown"', () => {
      const result = {
        ...makeTestResult(),
        execution: { ...makeTestResult().execution, status: 'unknown' },
      }
      const parsed = TestResultSchema.safeParse(result)
      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        const statusIssue = parsed.error.issues.find(i => i.path.includes('status'))
        expect(statusIssue).toBeDefined()
        expect(statusIssue?.code).toBe('invalid_value')
      }
    })

    it('rejects empty string as execution.status', () => {
      const result = {
        ...makeTestResult(),
        execution: { ...makeTestResult().execution, status: '' },
      }
      const parsed = TestResultSchema.safeParse(result)
      expect(parsed.success).toBe(false)
    })
  })
})
