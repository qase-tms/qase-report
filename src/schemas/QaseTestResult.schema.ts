import { z } from 'zod'
import { AttachmentSchema } from './Attachment.schema.js'
import { StepSchema } from './Step.schema.js'

/**
 * Enum for test execution status.
 * - passed: Test completed successfully
 * - failed: Test failed with assertion errors
 * - skipped: Test was skipped
 * - broken: Test encountered errors preventing execution
 * - blocked: Test blocked by external dependency
 * - invalid: Test has invalid configuration
 * - muted: Test failures are muted/ignored
 */
const TestStatusEnum = z.enum(['passed', 'failed', 'skipped', 'broken', 'blocked', 'invalid', 'muted'])

/**
 * Execution information for a test result.
 */
const TestExecutionSchema = z.object({
  /**
   * Test execution status
   */
  status: TestStatusEnum,

  /**
   * Unix timestamp when test started (milliseconds)
   */
  start_time: z.number(),

  /**
   * Unix timestamp when test ended (milliseconds)
   */
  end_time: z.number(),

  /**
   * Duration in milliseconds
   */
  duration: z.number(),

  /**
   * Stack trace if test failed (nullable)
   */
  stacktrace: z.string().nullable(),

  /**
   * Thread identifier where test ran (nullable)
   */
  thread: z.string().nullable(),
})

/**
 * Relations metadata for test result.
 * Contains suite hierarchy information.
 */
const TestRelationsSchema = z
  .object({
    suite: z.object({
      data: z.array(
        z.object({
          /**
           * Suite title
           */
          title: z.string(),

          /**
           * Public ID from Qase TMS (nullable)
           */
          public_id: z.number().nullable(),
        })
      ),
    }),
  })
  .nullable()

/**
 * Schema for individual test result file (results/{uuid}.json).
 * Contains complete test execution data including steps, attachments,
 * parameters, and metadata.
 */
export const TestResultSchema = z.object({
  /**
   * Unique identifier for this test result
   */
  id: z.string(),

  /**
   * Test case title
   */
  title: z.string(),

  /**
   * Test signature (unique identifier for test case)
   */
  signature: z.string(),

  /**
   * Whether test failures are muted/ignored
   */
  muted: z.boolean(),

  /**
   * Execution information (status, timing, stack trace)
   */
  execution: TestExecutionSchema,

  /**
   * Test result message (nullable)
   */
  message: z.string().nullable(),

  /**
   * Relations to suite hierarchy (nullable)
   */
  relations: TestRelationsSchema,

  /**
   * Array of test steps (can be nested)
   */
  steps: z.array(StepSchema),

  /**
   * Attachments for this test
   */
  attachments: z.array(AttachmentSchema),

  /**
   * Test parameters (key-value pairs)
   */
  params: z.record(z.string(), z.string()),

  /**
   * Parameter groups for parameterized tests
   */
  param_groups: z.array(z.array(z.string())),

  /**
   * Custom fields (key-value pairs, values can be null)
   */
  fields: z.record(z.string(), z.string().nullable()),

  /**
   * Qase TMS test case IDs (optional, nullable)
   */
  testops_ids: z.array(z.number()).nullable().optional(),
})

/**
 * TypeScript type inferred from TestResultSchema
 */
export type QaseTestResult = z.infer<typeof TestResultSchema>
