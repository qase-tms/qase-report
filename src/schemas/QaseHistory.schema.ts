import { z } from 'zod'

/**
 * Enum for test execution status in historical data.
 * Matches TestStatusEnum from QaseTestResult.schema.ts
 */
const TestStatusEnum = z.enum(['passed', 'failed', 'skipped', 'broken', 'blocked', 'invalid', 'muted'])

/**
 * Statistical summary of test run results.
 * Simplified version for historical data storage.
 */
const HistoricalRunStatsSchema = z.object({
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
   * Number of blocked tests (optional)
   */
  blocked: z.number().optional(),

  /**
   * Number of invalid tests (optional)
   */
  invalid: z.number().optional(),

  /**
   * Number of muted tests (optional)
   */
  muted: z.number().optional(),
})

/**
 * Summary data for each historical test run.
 * Contains run-level metadata and statistics for tiered loading.
 */
export const HistoricalRunSchema = z.object({
  /**
   * Unique identifier for this run (can be timestamp or UUID)
   */
  run_id: z.string(),

  /**
   * Run title (optional, nullable)
   */
  title: z.string().nullable().optional(),

  /**
   * Environment where tests ran (optional, nullable)
   */
  environment: z.string().nullable().optional(),

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
   * Statistical summary of run results
   */
  stats: HistoricalRunStatsSchema,
})

/**
 * Per-test run data for historical tracking.
 * Contains status and timing for a single test execution in a specific run.
 */
export const HistoricalTestRunDataSchema = z.object({
  /**
   * Reference to HistoricalRunSchema.run_id
   */
  run_id: z.string(),

  /**
   * Test execution status
   */
  status: TestStatusEnum,

  /**
   * Test duration in milliseconds
   */
  duration: z.number(),

  /**
   * Unix timestamp when test started (milliseconds)
   */
  start_time: z.number(),

  /**
   * First line of error message or stacktrace (nullable).
   * Used for flakiness detection - consistent errors vs random failures.
   */
  error_message: z.string().nullable(),
})

/**
 * Per-test historical summary across runs.
 * Uses signature-based identity for stable tracking across runs.
 */
export const HistoricalTestResultSchema = z.object({
  /**
   * Test signature (stable identifier, not run-specific UUID).
   * Matches signature field from QaseTestResult.
   */
  signature: z.string(),

  /**
   * Test case title
   */
  title: z.string(),

  /**
   * Array of run data for this test.
   * Each entry represents one execution of this test in a historical run.
   */
  runs: z.array(HistoricalTestRunDataSchema),
})

/**
 * Root schema for test-history.json file.
 * Contains versioned history data with run summaries and per-test results.
 *
 * Schema versioning uses SchemaVer format (MODEL-REVISION-ADDITION):
 * - MODEL: Breaking changes requiring migration
 * - REVISION: Backward-compatible additions
 * - ADDITION: Minor fixes or metadata updates
 */
export const QaseHistorySchema = z.object({
  /**
   * Schema version for future migration support.
   * Format: SchemaVer (MODEL-REVISION-ADDITION), e.g., "1.0.0"
   */
  schema_version: z.string().default('1.0.0'),

  /**
   * Array of historical run summaries.
   * Contains high-level metadata and stats for tiered loading.
   */
  runs: z.array(HistoricalRunSchema),

  /**
   * Array of per-test historical results.
   * Contains detailed run history for each test by signature.
   */
  tests: z.array(HistoricalTestResultSchema),
})

/**
 * TypeScript type for QaseHistory root object
 */
export type QaseHistory = z.infer<typeof QaseHistorySchema>

/**
 * TypeScript type for historical run summary
 */
export type HistoricalRun = z.infer<typeof HistoricalRunSchema>

/**
 * TypeScript type for per-test historical result
 */
export type HistoricalTestResult = z.infer<typeof HistoricalTestResultSchema>

/**
 * TypeScript type for per-test run data
 */
export type HistoricalTestRunData = z.infer<typeof HistoricalTestRunDataSchema>
