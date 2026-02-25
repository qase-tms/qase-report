import { Command } from 'commander'
import { existsSync, accessSync, constants, mkdirSync, writeFileSync, statSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { generateHtmlReport } from '../generators/html-generator.js'

/**
 * Formats file size in human-readable format (B, KB, MB)
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Registers the 'generate' command for creating standalone HTML reports.
 *
 * @param program - Commander program instance
 */
export function registerGenerateCommand(program: Command): void {
  program
    .command('generate <path>')
    .description('Generate standalone HTML report')
    .option('-o, --output <file>', 'Output file path', 'report.html')
    .option(
      '-H, --history <path>',
      'History file path (default: ./qase-report-history.json in results folder)'
    )
    .action(
      async (
        path: string,
        options: { output: string; history?: string }
      ) => {
      // 1. Resolve input path
      const resolvedPath = resolve(path)

      // 2. Validate path exists
      if (!existsSync(resolvedPath)) {
        console.error(`Error: Path does not exist: ${resolvedPath}`)
        process.exit(1)
      }

      // 3. Validate run.json exists
      const runJsonPath = join(resolvedPath, 'run.json')
      try {
        accessSync(runJsonPath, constants.R_OK)
      } catch {
        console.error(`Error: run.json not found at ${runJsonPath}`)
        process.exit(1)
      }

      // 4. Resolve output path (default: "report.html" in cwd)
      const outputPath = resolve(options.output)

      // 5. Create parent directories for output
      const outputDir = dirname(outputPath)
      mkdirSync(outputDir, { recursive: true })

      // 6. Generate HTML report
      try {
        console.log(`Generating report from ${resolvedPath}`)

        const historyPath = options.history ? resolve(options.history) : undefined

        const html = generateHtmlReport({
          reportPath: resolvedPath,
          historyPath,
        })

        // 7. Write result to output path
        writeFileSync(outputPath, html, 'utf-8')

        // 8. Log success message with file size
        const stats = statSync(outputPath)
        const fileSize = formatFileSize(stats.size)

        console.log(`\nReport generated successfully!`)
        console.log(`File: ${outputPath}`)
        console.log(`Size: ${fileSize}`)
      } catch (error) {
        console.error(
          `Error: Failed to write report: ${error instanceof Error ? error.message : error}`
        )
        process.exit(1)
      }
    }
    )
}
