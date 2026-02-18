import { z } from 'zod'

/**
 * Execution timing information for the test run.
 */
const RunExecutionSchema = z.object({
  /**
   * Unix timestamp when run started (milliseconds)
   */
  start_time: z.number(),

  /**
   * Unix timestamp when run ended (milliseconds)
   */
  end_time: z.number().nullable(),

  /**
   * Total duration of the run in milliseconds
   */
  duration: z.number(),

  /**
   * Cumulative duration of all test executions in milliseconds
   */
  cumulative_duration: z.number(),
})

/**
 * Statistical summary of test run results.
 */
const RunStatsSchema = z.object({
  /**
   * Total number of tests
   */
  total: z.number(),

  /**
   * Number of passed tests
   */
  passed: z.number(),

  /**
   * Number of failed tests
   */
  failed: z.number(),

  /**
   * Number of skipped tests
   */
  skipped: z.number(),

  /**
   * Number of broken tests
   */
  broken: z.number().optional(),

  /**
   * Number of blocked tests
   */
  blocked: z.number().optional(),

  /**
   * Number of invalid tests
   */
  invalid: z.number().optional(),

  /**
   * Number of muted tests
   */
  muted: z.number().optional(),
})

/**
 * Summary information for individual test results.
 */
const ResultSummarySchema = z.object({
  /**
   * Test result ID (matches filename in results/ directory)
   */
  id: z.string(),

  /**
   * Test title
   */
  title: z.string(),

  /**
   * Test execution status
   */
  status: z.string(),

  /**
   * Test duration in milliseconds
   */
  duration: z.number(),

  /**
   * Thread where test ran (nullable)
   */
  thread: z.string().nullable(),
})

/**
 * Host system information where tests were executed.
 * Fields vary depending on the reporter (Python vs JavaScript).
 */
const HostDataSchema = z
  .object({
    node: z.string().optional(),
    system: z.string().optional(),
    release: z.string().optional(),
    version: z.string().optional(),
    machine: z.string().optional(),
    arch: z.string().optional(),
    machineName: z.string().optional(),
    python: z.string().optional(),
    pip: z.string().optional(),
    npm: z.string().optional(),
    framework: z.string().optional(),
    reporter: z.string().optional(),
    commons: z.string().optional(),
    apiClientV1: z.string().optional(),
    apiClientV2: z.string().optional(),
  })
  .passthrough()

/**
 * Schema for run.json file.
 * Contains metadata about the test run, summary statistics,
 * and references to individual test results.
 */
export const QaseRunSchema = z.object({
  /**
   * Run title (optional - may not be present in all formats)
   */
  title: z.string().optional(),

  /**
   * Environment where tests ran (optional, nullable)
   */
  environment: z.string().nullable().optional(),

  /**
   * Execution timing information
   */
  execution: RunExecutionSchema,

  /**
   * Statistical summary of results
   */
  stats: RunStatsSchema,

  /**
   * Array of test result summaries
   */
  results: z.array(ResultSummarySchema),

  /**
   * List of threads used for execution
   */
  threads: z.array(z.string()).optional(),

  /**
   * List of test suites in this run
   */
  suites: z.array(z.string()).optional(),

  /**
   * Host system information
   */
  host_data: HostDataSchema.optional(),
})

/**
 * TypeScript type inferred from QaseRunSchema
 */
export type QaseRun = z.infer<typeof QaseRunSchema>
