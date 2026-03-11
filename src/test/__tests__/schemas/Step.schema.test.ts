import { describe, it, expect } from 'vitest'
import { StepSchema } from '@/schemas/Step.schema'

/** Build a minimal valid step object with optional nesting */
const makeStep = (overrides: Record<string, unknown> = {}) => ({
  id: 'step-001',
  step_type: 'text',
  data: {
    action: 'Click login button',
    expected_result: null,
    input_data: null,
  },
  execution: {
    status: 'passed',
    start_time: 1700000000000,
    end_time: 1700000000500,
    duration: 500,
    attachments: [],
  },
  steps: [],
  ...overrides,
})

describe('StepSchema', () => {
  describe('valid flat step', () => {
    it('accepts a valid flat step with steps: []', () => {
      const step = makeStep()
      expect(() => StepSchema.parse(step)).not.toThrow()
    })

    it('accepts step with all common step_type values', () => {
      const stepTypes = ['text', 'request', 'assertion', 'gherkin', 'action']
      for (const step_type of stepTypes) {
        const step = makeStep({ step_type })
        const result = StepSchema.safeParse(step)
        expect(result.success, `step_type "${step_type}" should be valid`).toBe(true)
      }
    })

    it('accepts step with optional parent_id as null', () => {
      const step = makeStep({ parent_id: null })
      expect(StepSchema.safeParse(step).success).toBe(true)
    })
  })

  describe('recursive nesting', () => {
    it('validates nested steps (parent containing one child step)', () => {
      const childStep = makeStep({ id: 'step-002' })
      const parentStep = makeStep({ id: 'step-001', steps: [childStep] })
      const result = StepSchema.safeParse(parentStep)
      expect(result.success).toBe(true)
    })

    it('validates 2+ levels of nesting (grandchild steps)', () => {
      const grandchild = makeStep({ id: 'step-003' })
      const child = makeStep({ id: 'step-002', steps: [grandchild] })
      const parent = makeStep({ id: 'step-001', steps: [child] })
      const result = StepSchema.safeParse(parent)
      expect(result.success).toBe(true)
    })

    it('validates 3 levels deep nesting (great-grandchild)', () => {
      const greatGrandchild = makeStep({ id: 'step-004' })
      const grandchild = makeStep({ id: 'step-003', steps: [greatGrandchild] })
      const child = makeStep({ id: 'step-002', steps: [grandchild] })
      const parent = makeStep({ id: 'step-001', steps: [child] })
      const result = StepSchema.safeParse(parent)
      expect(result.success).toBe(true)
    })

    it('validates multiple children in steps array', () => {
      const child1 = makeStep({ id: 'step-002' })
      const child2 = makeStep({ id: 'step-003' })
      const parent = makeStep({ id: 'step-001', steps: [child1, child2] })
      const result = StepSchema.safeParse(parent)
      expect(result.success).toBe(true)
    })
  })

  describe('required field rejection', () => {
    it('rejects step missing required "execution" field', () => {
      const { execution, ...step } = makeStep()
      const result = StepSchema.safeParse(step)
      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(i => i.path[0])
        expect(paths).toContain('execution')
      }
    })

    it('rejects step missing required "id" field', () => {
      const { id, ...step } = makeStep()
      const result = StepSchema.safeParse(step)
      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(i => i.path[0])
        expect(paths).toContain('id')
      }
    })

    it('rejects step with "steps" as non-array', () => {
      const step = makeStep({ steps: 'not-an-array' })
      const result = StepSchema.safeParse(step)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type')
      }
    })
  })
})
