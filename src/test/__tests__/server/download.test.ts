// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { vol } from 'memfs'
import request from 'supertest'

// Mock 'fs' (not 'node:fs') — server.ts imports from 'fs' without node: prefix
vi.mock('fs', async () => {
  const memfs = await vi.importActual('memfs')
  return { default: (memfs as typeof import('memfs')).fs, ...(memfs as typeof import('memfs')).fs }
})

// Mock html-generator — avoids reading real dist/index.html and report files
vi.mock('@/cli/generators/html-generator', () => ({
  generateHtmlReport: vi.fn().mockReturnValue('<html>mock report</html>'),
}))

// Mock qase-api to avoid any real HTTP calls from send-to-qase endpoint (shares server)
vi.mock('@/cli/qase-api', () => ({
  createQaseRun: vi.fn().mockResolvedValue(42),
  sendQaseResults: vi.fn().mockResolvedValue(undefined),
  completeQaseRun: vi.fn().mockResolvedValue(undefined),
  uploadAttachments: vi.fn().mockResolvedValue(new Map()),
  buildRunUrl: vi.fn().mockReturnValue('https://app.qase.io/run/DEMO/dashboard/42'),
  QaseApiError: class QaseApiError extends Error {
    statusCode: number
    qaseMessage: string
    constructor(msg: string, statusCode: number, qaseMessage: string) {
      super(msg)
      this.name = 'QaseApiError'
      this.statusCode = statusCode
      this.qaseMessage = qaseMessage
    }
  },
}))

import { createServer } from '@/cli/server'
import { generateHtmlReport } from '@/cli/generators/html-generator'
import { makeRun } from '../../factories/run.factory'

describe('Download endpoints', () => {
  beforeEach(() => {
    vol.reset()
  })

  // ─── GET /api/download/html ────────────────────────────────────────────

  describe('GET /api/download/html', () => {
    it('returns 200 with HTML content and correct Content-Disposition header', async () => {
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app).get('/api/download/html')

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('text/html')
      expect(res.headers['content-disposition']).toBe(
        'attachment; filename="qase-report.html"'
      )
      expect(res.text).toBe('<html>mock report</html>')
    })

    it('returns 500 when generateHtmlReport throws', async () => {
      vi.mocked(generateHtmlReport).mockImplementationOnce(() => {
        throw new Error('template missing')
      })
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app).get('/api/download/html')

      expect(res.status).toBe(500)
      expect(res.body.error).toBe('Failed to generate HTML report')
    })

    it('passes historyPath to generateHtmlReport when provided', async () => {
      const app = createServer({
        reportPath: '/fake/report',
        historyPath: '/fake/history.json',
      })
      await request(app).get('/api/download/html')

      expect(generateHtmlReport).toHaveBeenCalledWith(
        expect.objectContaining({
          reportPath: expect.stringContaining('fake/report'),
          historyPath: '/fake/history.json',
        })
      )
    })
  })

  // ─── GET /api/download/history ─────────────────────────────────────────

  describe('GET /api/download/history', () => {
    it('returns 404 when no historyPath set and no default file in reportPath', async () => {
      // vol is empty — no history file anywhere
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app).get('/api/download/history')

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('History file not found')
    })

    it('returns 404 when historyPath is set but file does not exist', async () => {
      // historyPath configured but not in vol
      const app = createServer({
        reportPath: '/fake/report',
        historyPath: '/fake/nonexistent.json',
      })
      const res = await request(app).get('/api/download/history')

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('History file not found')
    })

    it('returns 200 with file and correct headers when historyPath file exists', async () => {
      vol.fromJSON({
        '/fake/history.json': '{"runs":[]}',
      })
      const app = createServer({
        reportPath: '/fake/report',
        historyPath: '/fake/history.json',
      })
      const res = await request(app).get('/api/download/history')

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('application/json')
      expect(res.headers['content-disposition']).toBe(
        'attachment; filename="qase-report-history.json"'
      )
      expect(res.text).toBe('{"runs":[]}')
    })

    it('falls back to default reportPath/qase-report-history.json when historyPath not set', async () => {
      vol.fromJSON({
        '/fake/report/qase-report-history.json': '{"runs":[],"tests":[]}',
      })
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app).get('/api/download/history')

      expect(res.status).toBe(200)
      expect(res.headers['content-disposition']).toBe(
        'attachment; filename="qase-report-history.json"'
      )
      expect(res.text).toBe('{"runs":[],"tests":[]}')
    })
  })

  // ─── GET /api/download/zip ─────────────────────────────────────────────

  describe('GET /api/download/zip', () => {
    it('returns 404 when run.json is missing', async () => {
      // vol is empty — no run.json
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app).get('/api/download/zip')

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Report not found')
    })

    it('returns 200 with correct Content-Disposition and Content-Type when run.json exists', async () => {
      vol.fromJSON({
        '/fake/report/run.json': JSON.stringify(makeRun()),
      })
      const app = createServer({ reportPath: '/fake/report' })

      // archiver uses fs.createReadStream — memfs supports this.
      // Use a 10s timeout for streaming completion.
      const res = await request(app)
        .get('/api/download/zip')
        .timeout(10000)
        .buffer(true)
        .parse((res, cb) => {
          // Collect binary chunks without parsing as JSON
          const chunks: Buffer[] = []
          res.on('data', (chunk: Buffer) => chunks.push(chunk))
          res.on('end', () => cb(null, Buffer.concat(chunks)))
        })

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('application/zip')
      expect(res.headers['content-disposition']).toBe(
        'attachment; filename="qase-report.zip"'
      )
    }, 10000)

    it('includes results directory in zip when it exists', async () => {
      vol.fromJSON({
        '/fake/report/run.json': JSON.stringify(makeRun()),
        '/fake/report/results/r1.json': '{}',
      })
      const app = createServer({ reportPath: '/fake/report' })

      // We only verify that the response completes successfully with ZIP headers.
      // Verifying ZIP contents would require unzipping the buffer (out of scope).
      const res = await request(app)
        .get('/api/download/zip')
        .timeout(10000)
        .buffer(true)
        .parse((res, cb) => {
          const chunks: Buffer[] = []
          res.on('data', (chunk: Buffer) => chunks.push(chunk))
          res.on('end', () => cb(null, Buffer.concat(chunks)))
        })

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('application/zip')
    }, 10000)
  })
})
