import express, { Application, Request, Response, NextFunction } from 'express'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { Server } from 'http'
import { createRequire } from 'module'
import archiver from 'archiver'
import { generateHtmlReport } from './generators/html-generator.js'

// Get package root directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageRoot = resolve(__dirname, '..', '..')

export interface ServerOptions {
  reportPath: string
  port?: number
  historyPath?: string
}

export interface ReportData {
  run: Record<string, unknown>
  results: Record<string, unknown>[]
  attachmentsPath: string
}

/**
 * Create Express application configured to serve the React app and report API
 */
export function createServer(options: ServerOptions): Application {
  const { reportPath, port = 3000, historyPath } = options
  const resolvedReportPath = resolve(reportPath)
  const distPath = join(packageRoot, 'dist')

  const app = express()

  // Store port for later use
  app.set('port', port)

  // Store history path for API endpoint
  app.set('historyPath', historyPath)

  // API endpoint: GET /api/report
  app.get('/api/report', (req: Request, res: Response, next: NextFunction) => {
    try {
      // Read run.json
      const runJsonPath = join(resolvedReportPath, 'run.json')
      if (!existsSync(runJsonPath)) {
        res.status(404).json({
          error: 'Report not found',
          message: `run.json not found at ${runJsonPath}`,
        })
        return
      }

      const runData = JSON.parse(readFileSync(runJsonPath, 'utf-8'))

      // Read all results from results/ directory
      const resultsDir = join(resolvedReportPath, 'results')
      const results: Record<string, unknown>[] = []

      if (existsSync(resultsDir)) {
        const resultFiles = readdirSync(resultsDir).filter((f) =>
          f.endsWith('.json')
        )
        for (const file of resultFiles) {
          try {
            const filePath = join(resultsDir, file)
            const resultData = JSON.parse(readFileSync(filePath, 'utf-8'))
            results.push(resultData)
          } catch (err) {
            console.warn(`Warning: Failed to parse ${file}:`, err)
          }
        }
      }

      // Return combined report data
      const response: ReportData = {
        run: runData,
        results,
        attachmentsPath: '/api/attachments',
      }

      res.json(response)
    } catch (err) {
      console.error('Error reading report:', err)
      res.status(500).json({
        error: 'Internal server error',
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  })

  // API endpoint: GET /api/history
  app.get('/api/history', (req: Request, res: Response, next: NextFunction) => {
    try {
      const historyPath = app.get('historyPath') as string | undefined

      if (!historyPath || !existsSync(historyPath)) {
        // Return empty history structure if no history file
        res.json({
          schema_version: '1.0.0',
          runs: [],
          tests: [],
        })
        return
      }

      const historyData = JSON.parse(readFileSync(historyPath, 'utf-8'))
      res.json(historyData)
    } catch (err) {
      console.error('Error reading history:', err)
      // Return empty history on error (non-critical)
      res.json({
        schema_version: '1.0.0',
        runs: [],
        tests: [],
      })
    }
  })

  // Attachments endpoint: GET /api/attachments/:filename
  app.get(
    '/api/attachments/:filename',
    (req: Request<{ filename: string }>, res: Response, next: NextFunction) => {
      const { filename } = req.params
      const attachmentsDir = join(resolvedReportPath, 'attachments')
      const filePath = join(attachmentsDir, filename)

      // Security check: ensure resolved path is within attachments directory
      const resolvedFilePath = resolve(filePath)
      const resolvedAttachmentsDir = resolve(attachmentsDir)

      if (!resolvedFilePath.startsWith(resolvedAttachmentsDir)) {
        res.status(400).json({ error: 'Invalid filename' })
        return
      }

      if (!existsSync(resolvedFilePath)) {
        res.status(404).json({ error: 'Attachment not found' })
        return
      }

      res.sendFile(resolvedFilePath)
    }
  )

  // Trace viewer: serve playwright-core trace viewer static files
  // This enables viewing Playwright traces in an iframe
  const require = createRequire(import.meta.url)
  try {
    const playwrightCorePath = dirname(require.resolve('playwright-core/package.json'))
    const traceViewerPath = join(playwrightCorePath, 'lib', 'vite', 'traceViewer')

    if (existsSync(traceViewerPath)) {
      app.use('/trace-viewer', express.static(traceViewerPath))
    }
  } catch {
    // playwright-core not installed - trace viewer endpoint won't be available
    // This is expected when installed without optional dependencies
    console.warn('playwright-core not found - trace viewer will not be available')
  }

  // API endpoint: check if trace viewer is available
  app.get('/api/trace-viewer-available', (req: Request, res: Response) => {
    try {
      const playwrightCorePath = dirname(require.resolve('playwright-core/package.json'))
      const traceViewerPath = join(playwrightCorePath, 'lib', 'vite', 'traceViewer')
      res.json({ available: existsSync(traceViewerPath) })
    } catch {
      res.json({ available: false })
    }
  })

  // ─── Download API Endpoints ───────────────────────────────────────────

  // Download endpoint: GET /api/download/html
  // Returns self-contained HTML report as file download
  app.get(
    '/api/download/html',
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const historyPath = app.get('historyPath') as string | undefined
        const html = generateHtmlReport({
          reportPath: resolvedReportPath,
          historyPath,
        })

        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="qase-report.html"'
        )
        res.send(html)
      } catch (err) {
        console.error('Error generating HTML report:', err)
        res.status(500).json({
          error: 'Failed to generate HTML report',
          message: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }
  )

  // Download endpoint: GET /api/download/history
  // Returns history JSON as file download, or 404 if missing
  app.get(
    '/api/download/history',
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const storedHistoryPath = app.get('historyPath') as string | undefined
        const resolvedHistoryPath =
          storedHistoryPath || join(resolvedReportPath, 'qase-report-history.json')

        if (!existsSync(resolvedHistoryPath)) {
          res.status(404).json({ error: 'History file not found' })
          return
        }

        const historyData = readFileSync(resolvedHistoryPath, 'utf-8')
        res.setHeader('Content-Type', 'application/json')
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="qase-report-history.json"'
        )
        res.send(historyData)
      } catch (err) {
        console.error('Error reading history file:', err)
        res.status(500).json({
          error: 'Failed to read history file',
          message: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }
  )

  // Download endpoint: GET /api/download/zip
  // Returns ZIP archive of the full report directory
  app.get(
    '/api/download/zip',
    (req: Request, res: Response, next: NextFunction) => {
      try {
        // Check run.json exists (required for a valid report)
        const runJsonPath = join(resolvedReportPath, 'run.json')
        if (!existsSync(runJsonPath)) {
          res.status(404).json({
            error: 'Report not found',
            message: `run.json not found at ${runJsonPath}`,
          })
          return
        }

        res.setHeader('Content-Type', 'application/zip')
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="qase-report.zip"'
        )

        const archive = archiver('zip', { zlib: { level: 6 } })

        archive.on('error', (err) => {
          console.error('Archive error:', err)
          if (!res.headersSent) {
            res.status(500).json({
              error: 'Failed to create ZIP archive',
              message: err.message,
            })
          } else {
            res.destroy()
          }
        })

        archive.on('warning', (err) => {
          console.warn('Archive warning:', err.message)
        })

        archive.pipe(res)

        // Add run.json
        archive.file(runJsonPath, { name: 'run.json' })

        // Add results/ directory if it exists
        const resultsDir = join(resolvedReportPath, 'results')
        if (existsSync(resultsDir)) {
          archive.directory(resultsDir, 'results')
        }

        // Add attachments/ directory if it exists
        const attachmentsDir = join(resolvedReportPath, 'attachments')
        if (existsSync(attachmentsDir)) {
          archive.directory(attachmentsDir, 'attachments')
        }

        archive.finalize()
      } catch (err) {
        console.error('Error creating ZIP archive:', err)
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Failed to create ZIP archive',
            message: err instanceof Error ? err.message : 'Unknown error',
          })
        }
      }
    }
  )

  // Static file serving for React app (exclude index.html - handled separately)
  app.use(
    express.static(distPath, {
      index: false, // Don't serve index.html automatically
    })
  )

  // Serve index.html with server mode flag injection
  // Handles both root path and SPA fallback for client-side routing
  const serveIndex = (req: Request, res: Response) => {
    const indexPath = join(distPath, 'index.html')
    if (existsSync(indexPath)) {
      // Read index.html and inject server mode flag
      let html = readFileSync(indexPath, 'utf-8')
      const serverModeScript =
        '<script>window.__QASE_SERVER_MODE__=true;</script>'

      // Inject before closing head tag
      html = html.replace('</head>', `${serverModeScript}</head>`)

      res.type('html').send(html)
    } else {
      res.status(404).json({
        error: 'React app not found',
        message: 'Run `npm run build` first to build the React application',
      })
    }
  }

  // Root path
  app.get('/', serveIndex)

  // SPA fallback: serve index.html for all non-API routes
  // Express 5 requires named catch-all parameter instead of '*'
  app.get('/{*splat}', serveIndex)

  return app
}

/**
 * Start the Express server on the specified port
 * @returns Promise that resolves to the HTTP server instance when listening
 */
export function startServer(
  app: Application,
  port?: number
): Promise<{ server: Server; port: number }> {
  const serverPort = port ?? (app.get('port') as number) ?? 3000

  return new Promise((resolve, reject) => {
    const server = app.listen(serverPort, () => {
      console.log(`Server running at http://localhost:${serverPort}`)
      resolve({ server, port: serverPort })
    })

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Error: Port ${serverPort} is already in use`)
      }
      reject(err)
    })
  })
}

/**
 * Setup graceful shutdown handlers for the server
 */
export function setupGracefulShutdown(server: Server): void {
  const shutdown = (signal: string) => {
    console.log(`\nReceived ${signal}, shutting down gracefully...`)
    server.close((err) => {
      if (err) {
        console.error('Error during shutdown:', err)
        process.exit(1)
      }
      console.log('Server stopped')
      process.exit(0)
    })

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout')
      process.exit(1)
    }, 10000)
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}
