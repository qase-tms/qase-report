import { Command } from 'commander'
import { existsSync, accessSync, constants, readFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import open from 'open'
import { addRunToHistory } from '../history.js'
import type { QaseRun } from '../../schemas/QaseRun.schema.js'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema.js'

// Strip UTF-8 BOM that some tools (e.g. .NET reporters) prepend to JSON files
const stripBom = (s: string) => s.replace(/^\uFEFF/, '')

/**
 * Registers the 'open' command for serving reports in browser.
 *
 * @param program - Commander program instance
 */
export function registerOpenCommand(program: Command): void {
  program
    .command('open <path>')
    .description('Serve report in browser')
    .option('-p, --port <number>', 'Port number', '3000')
    .option('--no-open', 'Disable automatic browser opening')
    .option(
      '-H, --history <path>',
      'History file path (default: ./qase-report-history.json in results folder)'
    )
    .action(
      async (
        path: string,
        options: { port: string; open: boolean; history?: string }
      ) => {
      const resolvedPath = resolve(path)
      const runJsonPath = join(resolvedPath, 'run.json')

      // Validate path exists
      if (!existsSync(resolvedPath)) {
        console.error(`Error: Path does not exist: ${resolvedPath}`)
        process.exit(1)
      }

      // Validate run.json exists
      try {
        accessSync(runJsonPath, constants.R_OK)
      } catch {
        console.error(`Error: run.json not found at ${runJsonPath}`)
        console.error('Please provide a valid qase-report results directory.')
        process.exit(1)
      }

      // Parse port
      const port = parseInt(options.port, 10)
      if (isNaN(port) || port < 1 || port > 65535) {
        console.error(`Error: Invalid port number: ${options.port}`)
        process.exit(1)
      }

      // Determine history path
      const historyPath = options.history
        ? resolve(options.history)
        : join(resolvedPath, 'qase-report-history.json')

      // Dynamic import to avoid bundling issues
      const { createServer, startServer, setupGracefulShutdown } = await import(
        '../server.js'
      )

      // Create and start server
      const app = createServer({ reportPath: resolvedPath, port, historyPath })

      console.log(`Serving report from ${resolvedPath}`)

      try {
        const { server, port: actualPort } = await startServer(app, port)
        const url = `http://localhost:${actualPort}`

        console.log(`Open ${url} in your browser`)

        // Setup graceful shutdown
        setupGracefulShutdown(server)

        // Save run to history
        try {
          // Read run.json
          const runData = JSON.parse(
            stripBom(readFileSync(runJsonPath, 'utf-8'))
          ) as QaseRun

          // Read all results from results/ directory
          const resultsDir = join(resolvedPath, 'results')
          const results: QaseTestResult[] = []

          if (existsSync(resultsDir)) {
            const resultFiles = readdirSync(resultsDir).filter((file) =>
              file.endsWith('.json')
            )

            for (const file of resultFiles) {
              const resultPath = join(resultsDir, file)
              const resultData = JSON.parse(
                stripBom(readFileSync(resultPath, 'utf-8'))
              ) as QaseTestResult
              results.push(resultData)
            }
          }

          // Add to history
          addRunToHistory({ historyPath, run: runData, results })

          console.log(`History saved to ${historyPath}`)
        } catch (error) {
          console.warn(
            'Warning: Failed to save history:',
            error instanceof Error ? error.message : error
          )
        }

        // Open browser if --no-open was not specified
        if (options.open) {
          await open(url)
        }
      } catch (error) {
        if (
          error instanceof Error &&
          (error as NodeJS.ErrnoException).code === 'EADDRINUSE'
        ) {
          console.error(`Error: Port ${port} is already in use`)
        } else {
          console.error('Failed to start server:', error)
        }
        process.exit(1)
      }
    }
    )
}
