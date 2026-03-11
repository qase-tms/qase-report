import { describe, it, expect } from 'vitest'
import { QaseRunSchema } from '@/schemas/QaseRun.schema'
import { makeRun } from '../../factories/run.factory'

describe('QaseRunSchema', () => {
  describe('valid input', () => {
    it('accepts a valid makeRun() fixture without throwing', () => {
      const run = makeRun()
      expect(() => QaseRunSchema.parse(run)).not.toThrow()
    })

    it('accepts input with optional environment: null', () => {
      const run = makeRun({ environment: null })
      const result = QaseRunSchema.safeParse(run)
      expect(result.success).toBe(true)
    })

    it('accepts input without optional fields omitted (threads, suites, title)', () => {
      const { title, threads, suites, ...run } = makeRun()
      const result = QaseRunSchema.safeParse(run)
      expect(result.success).toBe(true)
    })

    it('parses and returns object matching input shape', () => {
      const run = makeRun({ title: 'My Suite' })
      const parsed = QaseRunSchema.parse(run)
      expect(parsed.title).toBe('My Suite')
      expect(parsed.stats.total).toBe(10)
      expect(parsed.execution.duration).toBe(60000)
    })
  })

  describe('required field rejection', () => {
    it('rejects input missing required field "execution"', () => {
      const { execution, ...run } = makeRun()
      const result = QaseRunSchema.safeParse(run)
      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(i => i.path[0])
        expect(paths).toContain('execution')
      }
    })

    it('rejects input missing required field "stats"', () => {
      const { stats, ...run } = makeRun()
      const result = QaseRunSchema.safeParse(run)
      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(i => i.path[0])
        expect(paths).toContain('stats')
      }
    })

    it('rejects input missing required field "results"', () => {
      const { results, ...run } = makeRun()
      const result = QaseRunSchema.safeParse(run)
      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(i => i.path[0])
        expect(paths).toContain('results')
      }
    })
  })

  describe('type mismatch rejection', () => {
    it('rejects input with "results" as string instead of array', () => {
      const run = { ...makeRun(), results: 'not-an-array' }
      const result = QaseRunSchema.safeParse(run)
      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues[0]
        expect(issue.code).toBe('invalid_type')
        expect(issue.path[0]).toBe('results')
      }
    })

    it('rejects input with "execution.start_time" as string instead of number', () => {
      const run = {
        ...makeRun(),
        execution: { ...makeRun().execution, start_time: 'not-a-number' },
      }
      const result = QaseRunSchema.safeParse(run)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type')
      }
    })
  })
})
