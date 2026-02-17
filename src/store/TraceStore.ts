import { makeAutoObservable } from 'mobx'
import type { RootStore } from './index'
import type { Attachment } from '../schemas/Attachment.schema'
import type { Step } from '../schemas/Step.schema'

/**
 * Utility function to check if an attachment is a Playwright trace file.
 *
 * A trace file is identified by:
 * 1. MIME type is 'application/zip'
 * 2. File name contains 'trace' (case-insensitive)
 */
export function isTraceAttachment(attachment: Attachment): boolean {
  return (
    attachment.mime_type === 'application/zip' &&
    attachment.file_name.toLowerCase().includes('trace')
  )
}

/**
 * Structure representing a trace file with its parent test context.
 */
export interface TraceFile {
  attachment: Attachment
  testId: string
  testTitle: string
}

/**
 * MobX store for detecting and tracking Playwright trace files.
 *
 * Scans all test results (including nested step attachments) to identify
 * trace files based on MIME type and filename patterns.
 */
export class TraceStore {
  constructor(public root: RootStore) {
    makeAutoObservable(this)
  }

  /**
   * Recursively collects trace attachments from nested steps.
   *
   * @param steps - Array of steps to scan
   * @param testId - Parent test ID
   * @param testTitle - Parent test title
   * @returns Array of trace files found in steps
   */
  private collectStepTraceAttachments(
    steps: Step[],
    testId: string,
    testTitle: string
  ): TraceFile[] {
    const traces: TraceFile[] = []

    for (const step of steps) {
      // Check attachments in current step
      if (step.execution?.attachments) {
        for (const attachment of step.execution.attachments) {
          if (isTraceAttachment(attachment)) {
            traces.push({ attachment, testId, testTitle })
          }
        }
      }

      // Recursively check nested steps
      if (step.steps && step.steps.length > 0) {
        traces.push(...this.collectStepTraceAttachments(step.steps, testId, testTitle))
      }
    }

    return traces
  }

  /**
   * Returns all trace files found across all test results.
   * Scans both top-level attachments and nested step attachments.
   */
  get traceFiles(): TraceFile[] {
    const traces: TraceFile[] = []

    // Scan all test results
    for (const [testId, result] of this.root.testResultsStore.testResults) {
      // Check top-level attachments
      for (const attachment of result.attachments) {
        if (isTraceAttachment(attachment)) {
          traces.push({
            attachment,
            testId,
            testTitle: result.title,
          })
        }
      }

      // Check attachments in nested steps
      if (result.steps && result.steps.length > 0) {
        traces.push(...this.collectStepTraceAttachments(result.steps, testId, result.title))
      }
    }

    return traces
  }

  /**
   * Returns true if any trace files are present in the current report.
   */
  get hasTraces(): boolean {
    return this.traceFiles.length > 0
  }

  /**
   * Returns the count of trace files in the current report.
   */
  get traceCount(): number {
    return this.traceFiles.length
  }
}
