import type { Attachment } from '../schemas/Attachment.schema'

/**
 * Category for grouping attachments in Gallery view.
 * - screenshots: Image files (image/*)
 * - logs: Text and JSON files (text/*, application/json)
 * - other: All other file types
 */
export type AttachmentCategory = 'screenshots' | 'logs' | 'other'

/**
 * Gallery attachment with test metadata for cross-test browsing.
 * Collects attachments from both test-level and step-level sources
 * with originating test context for navigation and display.
 */
export interface GalleryAttachment {
  /** Original attachment data */
  attachment: Attachment
  /** Test ID for navigation */
  testId: string
  /** Test title for display */
  testTitle: string
  /** Test execution status */
  testStatus: 'passed' | 'failed' | 'skipped' | 'broken' | 'blocked' | 'invalid' | 'muted'
  /** Source location: test-level or step-level */
  source: 'test' | 'step'
  /** Step ID if attachment is from a step (optional) */
  stepId?: string
}

/**
 * Categorizes an attachment by MIME type for Gallery filtering.
 *
 * Categorization rules:
 * - image/* -> 'screenshots'
 * - text/* or application/json -> 'logs'
 * - Everything else -> 'other'
 *
 * @param mimeType - MIME type string (e.g., "image/png")
 * @returns Category for filtering
 */
export function categorizeAttachment(mimeType: string | undefined): AttachmentCategory {
  if (!mimeType) return 'other'

  const normalized = mimeType.toLowerCase()

  if (normalized.startsWith('image/')) {
    return 'screenshots'
  }

  if (normalized.startsWith('text/') || normalized === 'application/json') {
    return 'logs'
  }

  return 'other'
}
