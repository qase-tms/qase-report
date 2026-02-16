import { z } from 'zod'
import { AttachmentSchema } from './Attachment.schema.js'

/**
 * Step type - flexible to handle various step types from different reporters.
 * Common values: text, request, assertion, gherkin, action
 */
const StepTypeSchema = z.string()

/**
 * Step execution status - flexible to handle various statuses.
 * Common values: passed, failed, skipped, broken, pending
 */
const StepStatusSchema = z.string()

/**
 * Data associated with a test step.
 * All fields are optional to handle various reporter formats.
 */
const StepDataSchema = z.object({
  /**
   * Action performed in this step (optional)
   */
  action: z.string().optional(),

  /**
   * Expected result for this step (optional, nullable)
   */
  expected_result: z.string().nullable().optional(),

  /**
   * Input data used in this step (optional, nullable)
   */
  input_data: z.string().nullable().optional(),
})

/**
 * Execution information for a step.
 */
const StepExecutionSchema = z.object({
  /**
   * Execution status (passed, failed, skipped, broken, etc.)
   */
  status: StepStatusSchema,

  /**
   * Unix timestamp when step started (milliseconds)
   */
  start_time: z.number(),

  /**
   * Unix timestamp when step ended (milliseconds)
   */
  end_time: z.number().nullable(),

  /**
   * Duration in milliseconds
   */
  duration: z.number(),

  /**
   * Attachments created during this step
   */
  attachments: z.array(AttachmentSchema),
})

/**
 * Recursive schema for test steps.
 * Steps can contain nested steps, allowing hierarchical test structure.
 *
 * Uses z.lazy() to enable recursive type definition.
 */
export const StepSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    /**
     * Unique identifier for this step
     */
    id: z.string(),

    /**
     * Type of step (text, request, assertion, gherkin, etc.)
     */
    step_type: StepTypeSchema,

    /**
     * ID of parent step (nullable for top-level steps)
     */
    parent_id: z.string().nullable(),

    /**
     * Step data (action, expected result, input data)
     */
    data: StepDataSchema,

    /**
     * Execution information for this step
     */
    execution: StepExecutionSchema,

    /**
     * Nested steps (recursive array)
     */
    steps: z.array(StepSchema),
  })
)

/**
 * TypeScript type inferred from StepSchema
 */
export type Step = z.infer<typeof StepSchema>
