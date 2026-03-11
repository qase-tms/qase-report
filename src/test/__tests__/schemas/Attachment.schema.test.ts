import { describe, it, expect } from 'vitest'
import { AttachmentSchema } from '@/schemas/Attachment.schema'
import type { Attachment } from '@/schemas/Attachment.schema'

describe('AttachmentSchema', () => {
  describe('transform: file_name derivation', () => {
    it('derives file_name from file_path when file_name is absent', () => {
      const result = AttachmentSchema.parse({
        id: 'att-001',
        file_path: './attachments/screenshot.png',
      })
      expect(result.file_name).toBe('screenshot.png')
    })

    it('derives file_name from deeply nested file_path', () => {
      const result = AttachmentSchema.parse({
        id: 'att-002',
        file_path: './build/qase-report/attachments/abc-123.png',
      })
      expect(result.file_name).toBe('abc-123.png')
    })

    it('derives file_name from plain filename (no directory)', () => {
      const result = AttachmentSchema.parse({
        id: 'att-003',
        file_path: 'screenshot.png',
      })
      expect(result.file_name).toBe('screenshot.png')
    })

    it('preserves explicit file_name over file_path derivation', () => {
      const result = AttachmentSchema.parse({
        id: 'att-004',
        file_path: './attachments/abc-123.png',
        file_name: 'my-screenshot.png',
      })
      expect(result.file_name).toBe('my-screenshot.png')
    })

    it('output type always has file_name as string (never undefined)', () => {
      const result: Attachment = AttachmentSchema.parse({
        id: 'att-005',
        file_path: './attachments/log.txt',
      })
      expect(typeof result.file_name).toBe('string')
    })
  })

  describe('required field rejection', () => {
    it('rejects input missing required "id" field', () => {
      const result = AttachmentSchema.safeParse({
        file_path: './attachments/screenshot.png',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(i => i.path[0])
        expect(paths).toContain('id')
      }
    })

    it('rejects input missing required "file_path" field', () => {
      const result = AttachmentSchema.safeParse({
        id: 'att-006',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(i => i.path[0])
        expect(paths).toContain('file_path')
      }
    })
  })

  describe('optional fields', () => {
    it('accepts input with optional mime_type and size', () => {
      const result = AttachmentSchema.safeParse({
        id: 'att-007',
        file_path: './attachments/video.mp4',
        mime_type: 'video/mp4',
        size: 1024000,
      })
      expect(result.success).toBe(true)
    })

    it('accepts input with content as null', () => {
      const result = AttachmentSchema.safeParse({
        id: 'att-008',
        file_path: './attachments/screenshot.png',
        content: null,
      })
      expect(result.success).toBe(true)
    })
  })
})
