import { readFileSync, existsSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'
import type { QaseRun } from '../../schemas/QaseRun.schema.js'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema.js'
import type { QaseHistory } from '../../schemas/QaseHistory.schema.js'

// Strip UTF-8 BOM that some tools (e.g. .NET reporters) prepend to JSON files
const stripBom = (s: string) => s.replace(/^\uFEFF/, '')

/**
 * Options for generating HTML report
 */
export interface GenerateOptions {
  /**
   * Path to report directory containing run.json and results/
   */
  reportPath: string

  /**
   * Optional path to history JSON file
   * Defaults to reportPath/qase-report-history.json
   */
  historyPath?: string

  /**
   * Optional path to HTML template file
   * Defaults to dist/index.html
   */
  templatePath?: string
}

/**
 * Report data structure combining run and results
 */
export interface ReportData {
  run: QaseRun
  results: QaseTestResult[]
}

/**
 * Escape JSON string for safe embedding in HTML.
 * Prevents XSS by replacing characters that could break out of script context.
 *
 * @param json - JSON string to escape
 * @returns XSS-safe JSON string
 */
export function escapeJsonForHtml(json: string): string {
  return json
    .replace(/</g, '\\u003c') // Prevent tag injection
    .replace(/>/g, '\\u003e') // Consistency
    .replace(/\//g, '\\/') // Prevent </script> breaking
}

/**
 * Inject data into HTML as window global variable.
 *
 * @param html - HTML template string
 * @param dataKey - Global variable name (e.g., "__QASE_RUN_DATA__")
 * @param data - Data to embed
 * @returns Modified HTML with injected data
 */
export function injectData(html: string, dataKey: string, data: unknown): string {
  const json = JSON.stringify(data)
  const escaped = escapeJsonForHtml(json)
  const script = `<script>window.${dataKey}=${escaped};</script>`

  // Inject before closing </head> tag
  return html.replace('</head>', `${script}\n</head>`)
}

/**
 * Load report data from filesystem.
 *
 * @param reportPath - Path to report directory
 * @returns Report data with run and results
 * @throws If run.json is missing or invalid
 */
export function loadReportData(reportPath: string): ReportData {
  const runJsonPath = join(reportPath, 'run.json')

  // Read run.json
  if (!existsSync(runJsonPath)) {
    throw new Error(`run.json not found at ${runJsonPath}`)
  }

  const run = JSON.parse(stripBom(readFileSync(runJsonPath, 'utf-8'))) as QaseRun

  // Read all *.json files from results/ directory
  const resultsDir = join(reportPath, 'results')
  const results: QaseTestResult[] = []

  if (existsSync(resultsDir)) {
    const resultFiles = readdirSync(resultsDir).filter((file) =>
      file.endsWith('.json')
    )

    for (const file of resultFiles) {
      const resultPath = join(resultsDir, file)
      const resultData = JSON.parse(
        stripBom(readFileSync(resultPath, 'utf-8'))
      ) as QaseTestResult
      results.push(resultData)
    }
  }

  return { run, results }
}

/**
 * Load history data from filesystem.
 * Returns null if file doesn't exist (graceful handling).
 *
 * @param reportPath - Path to report directory
 * @param historyPath - Optional custom history file path
 * @returns History data or null if not available
 */
export function loadHistoryData(
  reportPath: string,
  historyPath?: string
): QaseHistory | null {
  // Default path: reportPath/qase-report-history.json
  const path = historyPath || join(reportPath, 'qase-report-history.json')

  if (!existsSync(path)) {
    return null
  }

  try {
    return JSON.parse(stripBom(readFileSync(path, 'utf-8'))) as QaseHistory
  } catch (error) {
    console.warn(
      `Warning: Failed to load history from ${path}:`,
      error instanceof Error ? error.message : error
    )
    return null
  }
}

/**
 * Generate self-contained HTML report with embedded data.
 *
 * @param options - Generation options
 * @returns HTML string with embedded report data
 * @throws If template or report data cannot be loaded
 */
export function generateHtmlReport(options: GenerateOptions): string {
  const { reportPath, historyPath, templatePath } = options

  // Resolve report path
  const resolvedReportPath = resolve(reportPath)

  // Default template path: ../../../dist/index.html relative to this file
  const defaultTemplatePath = fileURLToPath(
    new URL('../../../dist/index.html', import.meta.url)
  )
  const resolvedTemplatePath = templatePath
    ? resolve(templatePath)
    : defaultTemplatePath

  // Load template HTML
  if (!existsSync(resolvedTemplatePath)) {
    throw new Error(`HTML template not found at ${resolvedTemplatePath}`)
  }

  let html = readFileSync(resolvedTemplatePath, 'utf-8')

  // Load report data
  const { run, results } = loadReportData(resolvedReportPath)

  // Load history (optional)
  const history = loadHistoryData(resolvedReportPath, historyPath)

  // Inject data into HTML
  html = injectData(html, '__QASE_RUN_DATA__', run)
  html = injectData(html, '__QASE_RESULTS_DATA__', results)

  if (history !== null) {
    html = injectData(html, '__QASE_HISTORY_DATA__', history)
  }

  // Set static mode flag
  html = injectData(html, '__QASE_STATIC_MODE__', true)

  return html
}
