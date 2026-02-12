import express, { Application, Request, Response, NextFunction } from 'express'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { Server } from 'http'

// Get package root directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageRoot = resolve(__dirname, '..', '..')

export interface ServerOptions {
  reportPath: string
  port?: number
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
  const { reportPath, port = 3000 } = options
  const resolvedReportPath = resolve(reportPath)
  const distPath = join(packageRoot, 'dist')

  const app = express()

  // Store port for later use
  app.set('port', port)

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
