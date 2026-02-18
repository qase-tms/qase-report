import { z } from 'zod'

/**
 * Schema for attachment files referenced in test results and steps.
 * Attachments can be screenshots, videos, logs, or other files
 * generated during test execution.
 */
export const AttachmentSchema = z.object({
  /**
   * Unique identifier for the attachment
   */
  id: z.string(),

  /**
   * Original filename (e.g., "screenshot.png")
   */
  file_name: z.string(),

  /**
   * Relative path to the attachment file
   * (e.g., "./build/qase-report/attachments/abc-123.png")
   */
  file_path: z.string(),

  /**
   * MIME type of the attachment (e.g., "image/png", "video/mp4")
   */
  mime_type: z.string().optional(),

  /**
   * File size in bytes (optional)
   */
  size: z.number().optional(),

  /**
   * Base64-encoded content for inline attachments (optional, nullable)
   */
  content: z.string().nullable().optional(),

  /**
   * Whether this is a temporary attachment (optional)
   */
  temporary: z.boolean().optional(),
})

/**
 * TypeScript type inferred from AttachmentSchema
 */
export type Attachment = z.infer<typeof AttachmentSchema>
