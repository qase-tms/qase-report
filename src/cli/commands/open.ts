import { Command } from 'commander'
import { existsSync, accessSync, constants } from 'fs'
import { join, resolve } from 'path'
import open from 'open'

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
    .action(async (path: string, options: { port: string; open: boolean }) => {
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

      // Dynamic import to avoid bundling issues
      const { createServer, startServer, setupGracefulShutdown } = await import(
        '../server.js'
      )

      // Create and start server
      const app = createServer({ reportPath: resolvedPath, port })

      console.log(`Serving report from ${resolvedPath}`)

      try {
        const { server, port: actualPort } = await startServer(app, port)
        const url = `http://localhost:${actualPort}`

        console.log(`Open ${url} in your browser`)

        // Setup graceful shutdown
        setupGracefulShutdown(server)

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
    })
}
