// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { vol } from 'memfs'
import request from 'supertest'

// Mock 'fs' (not 'node:fs') — server.ts imports from 'fs' without node: prefix
vi.mock('fs', async () => {
  const memfs = await vi.importActual('memfs')
  return { default: (memfs as typeof import('memfs')).fs, ...(memfs as typeof import('memfs')).fs }
})

// Mock html-generator to avoid real template file reads (module scope load issue)
vi.mock('@/cli/generators/html-generator', () => ({
  generateHtmlReport: vi.fn().mockReturnValue('<html>mock report</html>'),
}))

// Mock qase-api to prevent real HTTP calls
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

// Mock qase-transform — use real implementation (pass-through)
vi.mock('@/cli/qase-transform', async importOriginal => {
  return importOriginal()
})

import { createServer } from '@/cli/server'
import {
  createQaseRun,
  sendQaseResults,
  completeQaseRun,
} from '@/cli/qase-api'
import { makeRun } from '../../factories/run.factory'
import { makeTestResult } from '../../factories/result.factory'

describe('POST /api/send-to-qase', () => {
  beforeEach(() => {
    vol.reset()
    vi.mocked(createQaseRun).mockClear()
    vi.mocked(createQaseRun).mockResolvedValue(42)
    vi.mocked(sendQaseResults).mockClear()
    vi.mocked(sendQaseResults).mockResolvedValue(undefined)
    vi.mocked(completeQaseRun).mockClear()
    vi.mocked(completeQaseRun).mockResolvedValue(undefined)
  })

  describe('Request body validation', () => {
    it('returns 400 when project_code is missing', async () => {
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app)
        .post('/api/send-to-qase')
        .send({ token: 'tok', title: 'Run' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Missing required fields')
    })

    it('returns 400 when token is missing', async () => {
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app)
        .post('/api/send-to-qase')
        .send({ project_code: 'DEMO', title: 'Run' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Missing required fields')
    })

    it('returns 400 when title is missing', async () => {
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app)
        .post('/api/send-to-qase')
        .send({ project_code: 'DEMO', token: 'tok' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Missing required fields')
    })

    it('returns 400 when body is empty', async () => {
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app)
        .post('/api/send-to-qase')
        .send({})

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Missing required fields')
    })
  })

  describe('Results validation', () => {
    it('returns 400 when no results directory exists', async () => {
      // Only run.json, no results/ directory
      vol.fromJSON({
        '/fake/report/run.json': JSON.stringify(makeRun()),
      })
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app)
        .post('/api/send-to-qase')
        .send({ project_code: 'DEMO', token: 'tok', title: 'My Run' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('No test results')
    })

    it('returns 400 when results directory has only invalid JSON files', async () => {
      vol.fromJSON({
        '/fake/report/run.json': JSON.stringify(makeRun()),
        '/fake/report/results/bad.json': 'not json at all',
      })
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app)
        .post('/api/send-to-qase')
        .send({ project_code: 'DEMO', token: 'tok', title: 'My Run' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('No test results')
    })

    it('returns 400 when all results fail schema validation', async () => {
      // JSON that parses but fails TestResultSchema validation
      vol.fromJSON({
        '/fake/report/run.json': JSON.stringify(makeRun()),
        '/fake/report/results/invalid.json': JSON.stringify({ title: 'no required fields' }),
      })
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app)
        .post('/api/send-to-qase')
        .send({ project_code: 'DEMO', token: 'tok', title: 'My Run' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('No test results')
    })
  })

  describe('Successful send', () => {
    it('returns 200 with success data when results are valid', async () => {
      vol.fromJSON({
        '/fake/report/run.json': JSON.stringify(makeRun()),
        '/fake/report/results/r1.json': JSON.stringify(makeTestResult()),
      })
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app)
        .post('/api/send-to-qase')
        .send({ project_code: 'DEMO', token: 'tok123', title: 'My Run' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.run_id).toBe(42)
      expect(res.body.results_count).toBe(1)
    })

    it('calls createQaseRun with correct arguments', async () => {
      vol.fromJSON({
        '/fake/report/run.json': JSON.stringify(makeRun()),
        '/fake/report/results/r1.json': JSON.stringify(makeTestResult()),
      })
      const app = createServer({ reportPath: '/fake/report' })
      await request(app)
        .post('/api/send-to-qase')
        .send({ project_code: 'DEMO', token: 'tok123', title: 'My Run' })

      expect(createQaseRun).toHaveBeenCalledWith(
        expect.objectContaining({
          projectCode: 'DEMO',
          title: 'My Run',
          apiToken: 'tok123',
        })
      )
    })

    it('calls sendQaseResults once with results', async () => {
      vol.fromJSON({
        '/fake/report/run.json': JSON.stringify(makeRun()),
        '/fake/report/results/r1.json': JSON.stringify(makeTestResult()),
      })
      const app = createServer({ reportPath: '/fake/report' })
      await request(app)
        .post('/api/send-to-qase')
        .send({ project_code: 'DEMO', token: 'tok123', title: 'My Run' })

      expect(sendQaseResults).toHaveBeenCalledOnce()
      expect(sendQaseResults).toHaveBeenCalledWith(
        expect.objectContaining({
          apiToken: 'tok123',
          projectCode: 'DEMO',
          runId: 42,
        })
      )
    })

    it('calls completeQaseRun once', async () => {
      vol.fromJSON({
        '/fake/report/run.json': JSON.stringify(makeRun()),
        '/fake/report/results/r1.json': JSON.stringify(makeTestResult()),
      })
      const app = createServer({ reportPath: '/fake/report' })
      await request(app)
        .post('/api/send-to-qase')
        .send({ project_code: 'DEMO', token: 'tok123', title: 'My Run' })

      expect(completeQaseRun).toHaveBeenCalledOnce()
      expect(completeQaseRun).toHaveBeenCalledWith(
        expect.objectContaining({
          apiToken: 'tok123',
          projectCode: 'DEMO',
          runId: 42,
        })
      )
    })

    it('processes multiple result files', async () => {
      vol.fromJSON({
        '/fake/report/run.json': JSON.stringify(makeRun()),
        '/fake/report/results/r1.json': JSON.stringify(makeTestResult({ id: 'test-001' })),
        '/fake/report/results/r2.json': JSON.stringify(makeTestResult({ id: 'test-002', title: 'Second Test' })),
      })
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app)
        .post('/api/send-to-qase')
        .send({ project_code: 'DEMO', token: 'tok123', title: 'My Run' })

      expect(res.status).toBe(200)
      expect(res.body.results_count).toBe(2)
    })
  })

  describe('Qase API error handling', () => {
    it('maps QaseApiError with statusCode 401 to HTTP 401', async () => {
      const { QaseApiError } = await import('@/cli/qase-api')
      vi.mocked(createQaseRun).mockRejectedValueOnce(
        new QaseApiError('Unauthorized', 401, 'Invalid token')
      )
      vol.fromJSON({
        '/fake/report/run.json': JSON.stringify(makeRun()),
        '/fake/report/results/r1.json': JSON.stringify(makeTestResult()),
      })
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app)
        .post('/api/send-to-qase')
        .send({ project_code: 'DEMO', token: 'bad-token', title: 'My Run' })

      expect(res.status).toBe(401)
      expect(res.body.error).toBe('Qase API error')
      expect(res.body.message).toBe('Invalid token')
    })

    it('maps QaseApiError with statusCode 0 to HTTP 502', async () => {
      const { QaseApiError } = await import('@/cli/qase-api')
      vi.mocked(createQaseRun).mockRejectedValueOnce(
        new QaseApiError('Network', 0, 'Connection refused')
      )
      vol.fromJSON({
        '/fake/report/run.json': JSON.stringify(makeRun()),
        '/fake/report/results/r1.json': JSON.stringify(makeTestResult()),
      })
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app)
        .post('/api/send-to-qase')
        .send({ project_code: 'DEMO', token: 'tok', title: 'My Run' })

      expect(res.status).toBe(502)
      expect(res.body.error).toBe('Qase API error')
      expect(res.body.message).toBe('Connection refused')
    })

    it('maps generic Error to HTTP 500', async () => {
      vi.mocked(createQaseRun).mockRejectedValueOnce(new Error('unexpected failure'))
      vol.fromJSON({
        '/fake/report/run.json': JSON.stringify(makeRun()),
        '/fake/report/results/r1.json': JSON.stringify(makeTestResult()),
      })
      const app = createServer({ reportPath: '/fake/report' })
      const res = await request(app)
        .post('/api/send-to-qase')
        .send({ project_code: 'DEMO', token: 'tok', title: 'My Run' })

      expect(res.status).toBe(500)
      expect(res.body.error).toBe('Internal server error')
    })
  })
})
