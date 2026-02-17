/**
 * Result transformer - converts internal QaseTestResult format to Qase API v2 ResultCreate format
 */

import { QaseTestResult } from '../schemas/QaseTestResult.schema.js'
import { Step } from '../schemas/Step.schema.js'

/**
 * Qase API v2 ResultCreate interface (internal to this module)
 */
interface ResultCreate {
  title: string
  execution: {
    status: 'passed' | 'failed' | 'skipped' | 'blocked' | 'invalid'
    start_time: number
    end_time: number
    duration: number
    stacktrace?: string
    thread?: string
  }
  testops_ids?: number[]
  attachments: string[]
  steps: ResultStep[]
  params: Record<string, string>
  param_groups: string[][]
  relations: {
    suite?: {
      data: Array<{ public_id: number | null; title: string }>
    }
  }
  message?: string
  fields: Record<string, string>
  defect: boolean
  signature?: string
}

/**
 * Qase API v2 ResultStep interface
 */
interface ResultStep {
  step_type: 'text'
  data: { action: string; expected_result?: string }
  execution: {
    status: 'passed' | 'failed' | 'blocked' | 'skipped'
    attachments: string[]
  }
  steps?: ResultStep[]
}

/**
 * Map internal test status to Qase API status
 */
function mapStatus(
  status: string
): 'passed' | 'failed' | 'skipped' | 'blocked' | 'invalid' {
  switch (status) {
    case 'passed':
      return 'passed'
    case 'failed':
      return 'failed'
    case 'skipped':
      return 'skipped'
    case 'broken':
      return 'failed' // Qase API has no 'broken' status
    case 'blocked':
      return 'blocked'
    case 'invalid':
      return 'invalid'
    case 'muted':
      return 'passed' // Muted tests are treated as passed
    default:
      return 'failed' // Safe fallback
  }
}

/**
 * Map internal step status to Qase API step status
 */
function mapStepStatus(
  status: string
): 'passed' | 'failed' | 'blocked' | 'skipped' {
  switch (status) {
    case 'passed':
      return 'passed'
    case 'failed':
      return 'failed'
    case 'blocked':
      return 'blocked'
    case 'skipped':
      return 'skipped'
    case 'broken':
      return 'failed' // Qase API has no 'broken' status
    default:
      return 'failed' // Safe fallback
  }
}

/**
 * Transform a single step to Qase API v2 format (recursive)
 */
function transformStep(step: Step): ResultStep {
  const resultStep: ResultStep = {
    step_type: 'text',
    data: {
      action: step.data.action || step.step_type,
      expected_result:
        step.data.expected_result !== null && step.data.expected_result !== undefined
          ? step.data.expected_result
          : undefined,
    },
    execution: {
      status: mapStepStatus(step.execution.status),
      attachments: [], // Attachment upload out of scope
    },
  }

  // Add nested steps if they exist
  if (step.steps && step.steps.length > 0) {
    resultStep.steps = step.steps.map(transformStep)
  }

  return resultStep
}

/**
 * Transform a single test result to Qase API v2 format
 */
export function transformResult(result: QaseTestResult): ResultCreate {
  return {
    title: result.title,
    execution: {
      status: mapStatus(result.execution.status),
      start_time: result.execution.start_time,
      end_time:
        result.execution.end_time ??
        result.execution.start_time + result.execution.duration,
      duration: result.execution.duration,
      stacktrace:
        result.execution.stacktrace !== null
          ? result.execution.stacktrace
          : undefined,
      thread:
        result.execution.thread !== null ? result.execution.thread : undefined,
    },
    testops_ids:
      result.testops_ids !== null && result.testops_ids !== undefined
        ? result.testops_ids
        : undefined,
    attachments: [], // Attachment upload out of scope
    steps: result.steps.map(transformStep),
    params: result.params,
    param_groups: result.param_groups,
    relations: result.relations ?? {},
    message: result.message !== null ? result.message : undefined,
    fields: Object.fromEntries(
      Object.entries(result.fields).filter(([, v]) => v !== null)
    ) as Record<string, string>,
    defect: false, // No defect tracking in report format
    signature: result.signature,
  }
}

/**
 * Transform multiple test results to Qase API v2 format
 */
export function transformResults(results: QaseTestResult[]): ResultCreate[] {
  return results.map(transformResult)
}
