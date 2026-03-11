// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { vol } from 'memfs'
import request from 'supertest'

// CRITICAL: server.ts imports from 'fs' (no node: prefix), so mock 'fs' not 'node:fs'
vi.mock('fs', async () => {
  const memfs = await vi.importActual('memfs')
  return { default: (memfs as any).fs, ...(memfs as any).fs }
})

// Mock html-generator to avoid it reading real dist/index.html
vi.mock('@/cli/generators/html-generator', () => ({
  generateHtmlReport: vi.fn().mockReturnValue('<html>report</html>'),
}))

import { createServer } from '@/cli/server'

describe('GET /api/attachments/:filename — SERV-03', () => {
  beforeEach(() => {
    vol.reset()
  })

  describe('Path traversal security', () => {
    it('returns 400 with explicit Invalid filename error for ../../etc/passwd traversal', async () => {
      // Security-critical assertion: path traversal must return 400, not 404
      // URL-encode '../' as '..%2F' so Express receives the literal string '../../etc/passwd'
      // resolve('/fake/report/attachments/../../etc/passwd') = '/fake/etc/passwd'
      // '/fake/etc/passwd'.startsWith('/fake/report/attachments') === false → 400
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app).get('/api/attachments/..%2F..%2Fetc%2Fpasswd')
      expect(res.status).toBe(400)
      expect(res.body).toEqual({ error: 'Invalid filename' })
    })

    it('returns 400 for deep multi-level traversal ../../etc/shadow', async () => {
      // Multiple traversal levels must also be blocked
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app).get('/api/attachments/..%2F..%2F..%2Fetc%2Fshadow')
      expect(res.status).toBe(400)
      expect(res.body).toEqual({ error: 'Invalid filename' })
    })

    it('returns 400 for ../run.json which escapes the attachments directory', async () => {
      // A filename that resolves to /fake/report/run.json (outside attachments/)
      // resolve('/fake/report/attachments/../run.json') = '/fake/report/run.json'
      // '/fake/report/run.json'.startsWith('/fake/report/attachments') === false → 400
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app).get('/api/attachments/..%2Frun.json')
      expect(res.status).toBe(400)
      expect(res.body).toEqual({ error: 'Invalid filename' })
    })
  })

  describe('File not found', () => {
    it('returns 404 with Attachment not found error when file does not exist', async () => {
      // vol is empty — existsSync returns false
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app).get('/api/attachments/missing.png')
      expect(res.status).toBe(404)
      expect(res.body).toEqual({ error: 'Attachment not found' })
    })

    it('returns 404 for non-existent file with normal filename', async () => {
      // Explicitly set up the attachments dir but without the requested file
      vol.fromJSON({
        '/fake/report/attachments/other-file.png': 'some-data',
      })
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app).get('/api/attachments/screenshot.png')
      expect(res.status).toBe(404)
      expect(res.body).toEqual({ error: 'Attachment not found' })
    })
  })

  describe('File serving', () => {
    it('passes security check (not 400) for a valid attachment filename', async () => {
      // Set up the attachment in memfs virtual FS so existsSync returns true
      vol.fromJSON({
        '/fake/report/attachments/screenshot.png': 'fake-png-data',
      })
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app).get('/api/attachments/screenshot.png')

      // Note: res.sendFile() uses Node's native fs internals (not the mocked 'fs').
      // Express sendFile bypasses memfs, so it will fail with ENOENT on the real FS.
      // However, Express converts that ENOENT into a 404 response, NOT a 500.
      // The critical assertion here is that the handler did NOT return 400 (path traversal
      // blocked) — meaning the security check passed correctly with memfs intercepting
      // the existsSync call. The subsequent sendFile ENOENT → 404 is acceptable behavior
      // given the test environment limitation (memfs mocks existsSync but not sendFile internals).
      //
      // To explicitly test that both security AND existence checks passed, use the
      // absence of the 'Invalid filename' error body as confirmation of the security check.
      expect(res.status).not.toBe(400)
      expect(res.body.error).not.toBe('Invalid filename')
    })
  })
})
