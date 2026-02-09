import { z } from 'zod'
import { AttachmentSchema } from './Attachment.schema'

/**
 * Enum for step types in test execution.
 * - text: Narrative step description
 * - request: API request/response step
 * - assertion: Validation/assertion step
 */
const StepTypeEnum = z.enum(['text', 'request', 'assertion'])

/**
 * Enum for step execution status.
 */
const StepStatusEnum = z.enum(['passed', 'failed', 'skipped'])

/**
 * Data associated with a test step.
 */
const StepDataSchema = z.object({
  /**
   * Action performed in this step
   */
  action: z.string(),

  /**
   * Expected result for this step (nullable)
   */
  expected_result: z.string().nullable(),

  /**
   * Input data used in this step (nullable)
   */
  input_data: z.string().nullable(),
})

/**
 * Execution information for a step.
 */
const StepExecutionSchema = z.object({
  /**
   * Execution status (passed, failed, skipped)
   */
  status: StepStatusEnum,

  /**
   * Unix timestamp when step started (milliseconds)
   */
  start_time: z.number(),

  /**
   * Unix timestamp when step ended (milliseconds)
   */
  end_time: z.number(),

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
     * Type of step (text, request, assertion)
     */
    step_type: StepTypeEnum,

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
