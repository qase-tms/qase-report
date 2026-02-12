#!/usr/bin/env node
import { program } from 'commander'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { registerOpenCommand } from './commands/open.js'

// Get version from package.json dynamically
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageJsonPath = join(__dirname, '..', '..', 'package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

program
  .name('qase-report')
  .description('Visualize Qase test reports in an interactive UI')
  .version(packageJson.version, '-v, --version', 'Output the current version')
  .showHelpAfterError()

// Register commands
registerOpenCommand(program)

program
  .command('generate <path>')
  .description('Generate static HTML report (coming soon)')
  .action((path: string) => {
    console.log(`Command 'generate' coming soon. Path provided: ${path}`)
  })

program.parse(process.argv)

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
