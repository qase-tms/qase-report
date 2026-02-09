import { makeAutoObservable, runInAction } from 'mobx'
import type { RootStore } from './index'
import { QaseRunSchema, type QaseRun } from '../schemas/QaseRun.schema'
import { ParserService } from '../services/ParserService'

/**
 * MobX store for managing run.json data with reactive state.
 * Provides loading states and computed values for UI consumption.
 */
export class ReportStore {
  runData: QaseRun | null = null
  isLoading = false
  error: string | null = null

  constructor(public root: RootStore) {
    makeAutoObservable(this)
  }

  /**
   * Loads and validates run.json file.
   * Updates observable state with loading status and errors.
   *
   * @param file - File object containing run.json data
   */
  async loadRun(file: File): Promise<void> {
    this.isLoading = true
    this.error = null

    try {
      const parserService = new ParserService()
      const text = await file.text()
      const validated = await parserService.parseJSON(text, QaseRunSchema)

      runInAction(() => {
        this.runData = validated
      })
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : 'Failed to load run data'
      })
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  /**
   * Total number of tests in the run.
   * Returns 0 if no run data loaded.
   */
  get totalTests(): number {
    return this.runData?.stats.total || 0
  }

  /**
   * Pass rate percentage (0-100).
   * Returns 0 if no run data or no tests.
   */
  get passRate(): number {
    if (!this.runData || this.runData.stats.total === 0) {
      return 0
    }
    return (this.runData.stats.passed / this.runData.stats.total) * 100
  }
}
