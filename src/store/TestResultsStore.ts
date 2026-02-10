import { makeAutoObservable, runInAction } from 'mobx'
import type { RootStore } from './index'
import {
  TestResultSchema,
  type QaseTestResult,
} from '../schemas/QaseTestResult.schema'
import { ParserService } from '../services/ParserService'
import type { StabilityGrade } from '../types/stability'

/**
 * MobX store for managing test results collection with reactive state.
 * Tracks loading progress for multiple result files.
 */
export class TestResultsStore {
  testResults = new Map<string, QaseTestResult>()
  isLoading = false
  loadingProgress = { current: 0, total: 0 }
  error: string | null = null

  // Filtering and search state
  searchQuery = ''
  statusFilters = new Set<string>()
  stabilityGradeFilters = new Set<StabilityGrade>()

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

  /**
   * Returns filtered test results based on search query and status filters.
   * Combines both status filtering and text search.
   */
  get filteredResults(): QaseTestResult[] {
    let results = this.resultsList

    // Filter by status if any filters are active
    if (this.statusFilters.size > 0) {
      results = results.filter((test) =>
        this.statusFilters.has(test.execution.status)
      )
    }

    // Filter by search query if provided
    const query = this.searchQuery.trim()
    if (query) {
      const lowerQuery = query.toLowerCase()
      results = results.filter((test) =>
        test.title.toLowerCase().includes(lowerQuery)
      )
    }

    // Filter by stability grade if any grade filters are active
    if (this.stabilityGradeFilters.size > 0) {
      results = results.filter((test) => {
        // Skip tests without signature (can't calculate stability)
        if (!test.signature) {
          return false
        }

        // Get stability score for this test
        const stabilityResult = this.root.analyticsStore.getStabilityScore(test.signature)

        // Include test if its grade matches any selected filter
        return this.stabilityGradeFilters.has(stabilityResult.grade)
      })
    }

    return results
  }

  /**
   * Returns count of active filters (status filters + search query).
   */
  get activeFilterCount(): number {
    return this.statusFilters.size + this.stabilityGradeFilters.size + (this.searchQuery.trim() ? 1 : 0)
  }

  /**
   * Sets the search query for filtering tests by title.
   */
  setSearchQuery = (query: string) => {
    this.searchQuery = query
  }

  /**
   * Toggles a status filter on/off.
   * If status is in the set, removes it; otherwise adds it.
   */
  toggleStatusFilter = (status: string) => {
    if (this.statusFilters.has(status)) {
      this.statusFilters.delete(status)
    } else {
      this.statusFilters.add(status)
    }
  }

  /**
   * Toggles a stability grade filter on/off.
   * If grade is in the set, removes it; otherwise adds it.
   */
  toggleStabilityGradeFilter = (grade: StabilityGrade) => {
    if (this.stabilityGradeFilters.has(grade)) {
      this.stabilityGradeFilters.delete(grade)
    } else {
      this.stabilityGradeFilters.add(grade)
    }
  }

  /**
   * Clears all filters (search query and status filters).
   */
  clearFilters = () => {
    this.searchQuery = ''
    this.statusFilters.clear()
    this.stabilityGradeFilters.clear()
  }
}
