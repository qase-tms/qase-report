import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname } from 'path'
import type {
  QaseHistory,
  HistoricalRun,
  HistoricalTestRunData,
} from '../schemas/QaseHistory.schema.js'
import type { QaseRun } from '../schemas/QaseRun.schema.js'
import type { QaseTestResult } from '../schemas/QaseTestResult.schema.js'

/**
 * Maximum number of runs to store in history file.
 * Per requirements HIST-04.
 */
const MAX_HISTORY_RUNS = 30

/**
 * Default filename for history file.
 */
export const DEFAULT_HISTORY_FILENAME = 'qase-report-history.json'

/**
 * Loads history data from file.
 * Returns null if file doesn't exist (not an error).
 * Returns null and logs warning if JSON parse fails (corrupted file).
 *
 * @param historyPath - Path to history file
 * @returns Parsed history data or null
 */
export function loadHistory(historyPath: string): QaseHistory | null {
  try {
    if (!existsSync(historyPath)) {
      return null
    }

    const data = readFileSync(historyPath, 'utf-8')
    const parsed = JSON.parse(data) as QaseHistory
    return parsed
  } catch (error) {
    console.warn(
      `Warning: Failed to load history from ${historyPath}:`,
      error instanceof Error ? error.message : error
    )
    return null
  }
}

/**
 * Saves history data to file.
 * Creates parent directory if needed.
 *
 * @param historyPath - Path to history file
 * @param history - History data to save
 */
export function saveHistory(historyPath: string, history: QaseHistory): void {
  const dir = dirname(historyPath)

  // Create parent directory if needed
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf-8')
}

/**
 * Adds current run to history file.
 * Creates new history if file doesn't exist.
 * Enforces MAX_HISTORY_RUNS limit by removing oldest runs.
 * Skips if run already exists (idempotent).
 *
 * @param options - Configuration object
 * @param options.historyPath - Path to history file
 * @param options.run - Current run metadata
 * @param options.results - Array of test results
 */
export function addRunToHistory(options: {
  historyPath: string
  run: QaseRun
  results: QaseTestResult[]
}): void {
  const { historyPath, run, results } = options

  // Load existing history or create new
  let history = loadHistory(historyPath)
  if (!history) {
    history = {
      schema_version: '1.0.0',
      runs: [],
      tests: [],
    }
  }

  // Generate runId from timestamp
  const runId = run.execution.start_time
    ? new Date(run.execution.start_time).getTime().toString()
    : Date.now().toString()

  // Check for duplicate and skip if exists
  if (history.runs.some((r) => r.run_id === runId)) {
    return
  }

  // Create HistoricalRun object
  const historicalRun: HistoricalRun = {
    run_id: runId,
    title: run.title ?? null,
    environment: run.environment ?? null,
    start_time: run.execution.start_time
      ? new Date(run.execution.start_time).getTime()
      : Date.now(),
    end_time: run.execution.end_time
      ? new Date(run.execution.end_time).getTime()
      : Date.now(),
    duration: run.execution.duration,
    stats: {
      total: run.stats.total,
      passed: run.stats.passed,
      failed: run.stats.failed,
      skipped: run.stats.skipped,
      blocked: run.stats.blocked,
      invalid: run.stats.invalid,
      muted: run.stats.muted,
    },
  }

  // Add run to history
  history.runs.push(historicalRun)

  // Update per-test history
  for (const testResult of results) {
    const signature = testResult.signature
    if (!signature) continue

    // Find or create test entry
    let testEntry = history.tests.find((t) => t.signature === signature)
    if (!testEntry) {
      testEntry = {
        signature,
        title: testResult.title,
        runs: [],
      }
      history.tests.push(testEntry)
    }

    // Extract first line of error message for flakiness detection
    let errorMessage: string | null = null
    if (testResult.execution.stacktrace) {
      const firstLine = testResult.execution.stacktrace.split('\n')[0]
      errorMessage = firstLine?.trim() || null
    }

    // Add run data for this test
    const testRunData: HistoricalTestRunData = {
      run_id: runId,
      status: testResult.execution.status as
        | 'passed'
        | 'failed'
        | 'skipped'
        | 'broken',
      duration: testResult.execution.duration,
      start_time: testResult.execution.start_time
        ? new Date(testResult.execution.start_time).getTime()
        : Date.now(),
      error_message: errorMessage,
    }

    testEntry.runs.push(testRunData)
  }

  // Enforce MAX_HISTORY_RUNS limit
  while (history.runs.length > MAX_HISTORY_RUNS) {
    const oldestRun = history.runs.shift()
    if (oldestRun) {
      // Remove run data from per-test history
      for (const testEntry of history.tests) {
        testEntry.runs = testEntry.runs.filter(
          (r) => r.run_id !== oldestRun.run_id
        )
      }
      // Remove tests with no remaining run data (orphaned tests)
      history.tests = history.tests.filter((t) => t.runs.length > 0)
    }
  }

  // Save updated history
  saveHistory(historyPath, history)
}
