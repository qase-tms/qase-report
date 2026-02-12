import { makeAutoObservable, runInAction } from 'mobx'
import { createContext, FC, PropsWithChildren, useContext } from 'react'
import { ReportStore } from './ReportStore'
import { TestResultsStore } from './TestResultsStore'
import { AttachmentsStore } from './AttachmentsStore'
import { AttachmentViewerStore } from './AttachmentViewerStore'
import { HistoryStore } from './HistoryStore'
import { AnalyticsStore } from './AnalyticsStore'
import { FileLoaderService } from '../services/FileLoaderService'
import { ApiDataService, fetchHistory } from '../services/ApiDataService'
import { QaseRunSchema } from '../schemas/QaseRun.schema'
import { TestResultSchema } from '../schemas/QaseTestResult.schema'
import type { QaseTestResult } from '../schemas/QaseTestResult.schema'

export class RootStore {
  reportStore: ReportStore
  testResultsStore: TestResultsStore
  attachmentsStore: AttachmentsStore
  attachmentViewerStore: AttachmentViewerStore
  historyStore: HistoryStore
  analyticsStore: AnalyticsStore

  selectedTestId: string | null = null

  // Navigation state
  activeView: 'dashboard' | 'tests' | 'analytics' | 'failure-clusters' | 'gallery' | 'comparison' | 'timeline' = 'tests'

  // Server mode state
  attachmentsBasePath: string | null = null
  isApiLoading = false
  apiError: string | null = null

  constructor() {
    this.reportStore = new ReportStore(this)
    this.testResultsStore = new TestResultsStore(this)
    this.attachmentsStore = new AttachmentsStore(this)
    this.attachmentViewerStore = new AttachmentViewerStore(this)
    this.historyStore = new HistoryStore(this)
    this.analyticsStore = new AnalyticsStore(this)
    makeAutoObservable(this)
  }

  /**
   * Sets the active view (dashboard, tests, analytics, failure-clusters, gallery, comparison, or timeline).
   */
  setActiveView = (view: 'dashboard' | 'tests' | 'analytics' | 'failure-clusters' | 'gallery' | 'comparison' | 'timeline') => {
    this.activeView = view
  }

  /**
   * Selects a test by ID for viewing details.
   */
  selectTest = (testId: string) => {
    this.selectedTestId = testId
  }

  /**
   * Clears the selected test.
   */
  clearSelection = () => {
    this.selectedTestId = null
  }

  /**
   * Returns the currently selected test result, or null if none selected.
   */
  get selectedTest(): QaseTestResult | null {
    if (this.selectedTestId === null) {
      return null
    }
    return this.testResultsStore.testResults.get(this.selectedTestId) || null
  }

  /**
   * Coordinates loading of a complete report directory.
   * Loads run.json, test results, history file, and registers attachments.
   *
   * @param files - FileList from input element with webkitdirectory
   */
  loadReport = async (files: FileList): Promise<void> => {
    const fileLoader = new FileLoaderService()
    const { runFile, historyFile, resultFiles, attachmentFiles } =
      await fileLoader.loadReportDirectory(files)

    if (!runFile) {
      throw new Error('run.json not found in selected directory')
    }

    await this.reportStore.loadRun(runFile)

    // Load history file if present
    if (historyFile) {
      try {
        await this.historyStore.loadHistoryFile(historyFile)
      } catch (error) {
        console.error('Failed to load history file:', error)
        // Continue loading report even if history fails
      }
    }

    await this.testResultsStore.loadResults(resultFiles)

    for (const file of attachmentFiles) {
      this.attachmentsStore.registerAttachment(file)
    }

    // Add current run to history after all loading completes
    if (this.historyStore.isHistoryLoaded && this.reportStore.runData) {
      this.historyStore.addCurrentRun(
        this.reportStore.runData,
        this.testResultsStore.testResults
      )
    }
  }

  /**
   * Loads report data from the server API.
   * Used when running via `qase-report open` command.
   */
  loadFromApi = async (): Promise<void> => {
    this.isApiLoading = true
    this.apiError = null

    try {
      const apiService = new ApiDataService()
      const response = await apiService.fetchReport()

      // Validate run data with schema
      const validatedRun = QaseRunSchema.parse(response.run)

      // Validate each test result
      const validatedResults: QaseTestResult[] = []
      for (const result of response.results) {
        try {
          const validatedResult = TestResultSchema.parse(result)
          validatedResults.push(validatedResult)
        } catch (error) {
          console.warn('Failed to validate test result:', error)
        }
      }

      runInAction(() => {
        // Populate report store
        this.reportStore.runData = validatedRun

        // Populate test results store
        this.testResultsStore.testResults.clear()
        for (const result of validatedResults) {
          this.testResultsStore.testResults.set(result.id, result)

          // Register attachment filenames for server mode
          for (const attachment of result.attachments) {
            // Extract filename from file_path (e.g., "./attachments/abc-123.png" -> "abc-123.png")
            const filename = attachment.file_path.split('/').pop() || attachment.id
            this.attachmentsStore.registerAttachmentFilename(attachment.id, filename)
          }

          // Also register attachments from steps
          const registerStepAttachments = (
            steps: typeof result.steps
          ): void => {
            for (const step of steps) {
              if (step.attachments) {
                for (const attachment of step.attachments) {
                  const filename =
                    attachment.file_path.split('/').pop() || attachment.id
                  this.attachmentsStore.registerAttachmentFilename(
                    attachment.id,
                    filename
                  )
                }
              }
              if (step.steps) {
                registerStepAttachments(step.steps)
              }
            }
          }
          registerStepAttachments(result.steps)
        }

        // Store attachments base path for API URLs
        this.attachmentsBasePath = response.attachmentsPath
      })

      // Load history if available
      try {
        const historyData = await fetchHistory()
        if (historyData) {
          runInAction(() => {
            this.historyStore.history = historyData
            this.historyStore.isHistoryLoaded = true
          })
        }
      } catch (historyError) {
        // History loading is optional, just log warning
        console.warn('Could not load history:', historyError)
      }
    } catch (error) {
      runInAction(() => {
        this.apiError =
          error instanceof Error ? error.message : 'Failed to load report from API'
      })
      throw error
    } finally {
      runInAction(() => {
        this.isApiLoading = false
      })
    }
  }
}

const rootStore = new RootStore()

export interface ChildStore {
  root?: RootStore
  parent?: ChildStore
}

export const RootStoreContext = createContext(rootStore)

export const RootStoreProvider: FC<PropsWithChildren> = ({ children }) => (
  <RootStoreContext.Provider value={rootStore}>
    {' '}
    {children}
  </RootStoreContext.Provider>
)

export const useRootStore = () => useContext(RootStoreContext)
