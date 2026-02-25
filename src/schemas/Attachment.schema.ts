import { z } from 'zod'

/**
 * Schema for attachment files referenced in test results and steps.
 * Attachments can be screenshots, videos, logs, or other files
 * generated during test execution.
 */
export const AttachmentSchema = z
  .object({
    /**
     * Unique identifier for the attachment
     */
    id: z.string(),

    /**
     * Original filename (e.g., "screenshot.png").
     * Optional — derived from file_path when not provided by reporter.
     */
    file_name: z.string().optional(),

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
  .transform(att => ({
    ...att,
    file_name: att.file_name ?? att.file_path.split('/').pop() ?? 'unknown',
  }))

/**
 * TypeScript type inferred from AttachmentSchema
 */
export type Attachment = z.output<typeof AttachmentSchema>
