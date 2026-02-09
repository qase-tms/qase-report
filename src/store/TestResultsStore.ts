import { makeAutoObservable, runInAction } from 'mobx'
import type { RootStore } from './index'
import {
  TestResultSchema,
  type QaseTestResult,
} from '../schemas/QaseTestResult.schema'
import { ParserService } from '../services/ParserService'

/**
 * MobX store for managing test results collection with reactive state.
 * Tracks loading progress for multiple result files.
 */
export class TestResultsStore {
  testResults = new Map<string, QaseTestResult>()
  isLoading = false
  loadingProgress = { current: 0, total: 0 }
  error: string | null = null

  constructor(public root: RootStore) {
    makeAutoObservable(this)
  }

  /**
   * Loads and validates multiple test result files.
   * Updates progress incrementally as files are processed.
   *
   * @param files - Array of File objects containing test result JSON data
   */
  async loadResults(files: File[]): Promise<void> {
    this.isLoading = true
    this.error = null

    runInAction(() => {
      this.loadingProgress.total = files.length
      this.loadingProgress.current = 0
    })

    const parserService = new ParserService()
    const errors: string[] = []

    try {
      for (const file of files) {
        try {
          const text = await file.text()
          const validated = await parserService.parseJSON(
            text,
            TestResultSchema
          )

          runInAction(() => {
            this.testResults.set(validated.id, validated)
            this.loadingProgress.current++
          })
        } catch (error) {
          // Collect errors but continue processing other files
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
          errors.push(`${file.name}: ${errorMessage}`)

          runInAction(() => {
            this.loadingProgress.current++
          })
        }
      }

      // Set error if any files failed to load
      if (errors.length > 0) {
        runInAction(() => {
          this.error = `Failed to load ${errors.length} file(s):\n${errors.join('\n')}`
        })
      }
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  /**
   * Returns test results as an array.
   * Useful for rendering lists in UI components.
   */
  get resultsList(): QaseTestResult[] {
    return Array.from(this.testResults.values())
  }
}
