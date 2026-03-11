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

// Force playwright-core to be unresolvable for all tests in this file.
// server.ts calls createRequire(import.meta.url) inside createServer() body,
// then uses require.resolve('playwright-core/package.json') in a try/catch.
// By mocking 'module', we make createRequire return a require whose resolve() always
// throws — simulating an environment where playwright-core is not installed.
vi.mock('module', async importOriginal => {
  const actual = await importOriginal<typeof import('module')>()
  return {
    ...actual,
    createRequire: () => {
      const req = (id: string) => {
        throw new Error(`Cannot find module '${id}'`)
      }
      req.resolve = (id: string) => {
        throw new Error(`Cannot find module '${id}'`)
      }
      req.resolve.paths = (_id: string) => null
      req.main = undefined
      req.extensions = {} as NodeJS.RequireExtensions
      req.cache = {} as NodeJS.Dict<NodeJS.Module>
      return req as unknown as NodeRequire
    },
  }
})

import { createServer } from '@/cli/server'

describe('GET /api/trace-viewer-available — SERV-04', () => {
  beforeEach(() => {
    vol.reset()
  })

  it('returns 200 with { available: false } when playwright-core cannot be resolved', async () => {
    // With 'module' mocked, createRequire returns a require whose resolve() throws.
    // The try/catch in the /api/trace-viewer-available handler catches the error
    // and returns { available: false }.
    const app = createServer({ reportPath: '/fake/report' })
    const res = await request(app).get('/api/trace-viewer-available')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ available: false })
  })

  it('response body has an "available" property of type boolean', async () => {
    // Shape contract: regardless of playwright state, the response is always
    // { available: boolean } — never a different structure.
    const app = createServer({ reportPath: '/fake/report' })
    const res = await request(app).get('/api/trace-viewer-available')
    expect(res.status).toBe(200)
    expect(typeof res.body.available).toBe('boolean')
  })
})

describe('Trace viewer static route — SERV-04', () => {
  beforeEach(() => {
    vol.reset()
  })

  it('does not serve playwright trace viewer static files when playwright-core is unavailable', async () => {
    // When playwright-core cannot be resolved, the try/catch in createServer() skips
    // the express.static('/trace-viewer') route registration entirely.
    // A request to /trace-viewer/index.html falls through to the SPA handler.
    // The SPA handler returns 404 (dist/index.html not present in memfs).
    // The critical assertion: we do NOT get trace viewer content — the route is unregistered.
    const app = createServer({ reportPath: '/fake/report' })
    const res = await request(app).get('/trace-viewer/index.html')

    // The SPA fallback (serveIndex) is called — it tries to read dist/index.html.
    // Since memfs has no dist/index.html, it returns 404 with the React app not found error.
    // This confirms the /trace-viewer static middleware was NOT registered.
    expect(res.status).toBe(404)
    // Should NOT be serving trace viewer HTML — the error comes from the SPA handler
    expect(res.body.error).toBe('React app not found')
  })

  it('returns 404 for /trace-viewer/ root path when playwright is unavailable', async () => {
    // Same as above for the root of the trace viewer path
    const app = createServer({ reportPath: '/fake/report' })
    const res = await request(app).get('/trace-viewer/')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('React app not found')
  })
})
