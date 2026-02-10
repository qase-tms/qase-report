import { makeAutoObservable } from 'mobx'
import { createContext, FC, PropsWithChildren, useContext } from 'react'
import { ReportStore } from './ReportStore'
import { TestResultsStore } from './TestResultsStore'
import { AttachmentsStore } from './AttachmentsStore'
import { AttachmentViewerStore } from './AttachmentViewerStore'
import { HistoryStore } from './HistoryStore'
import { FileLoaderService } from '../services/FileLoaderService'
import type { QaseTestResult } from '../schemas/QaseTestResult.schema'

export class RootStore {
  reportStore: ReportStore
  testResultsStore: TestResultsStore
  attachmentsStore: AttachmentsStore
  attachmentViewerStore: AttachmentViewerStore
  historyStore: HistoryStore

  isDockOpen = false
  selectedTestId: string | null = null

  constructor() {
    this.reportStore = new ReportStore(this)
    this.testResultsStore = new TestResultsStore(this)
    this.attachmentsStore = new AttachmentsStore(this)
    this.attachmentViewerStore = new AttachmentViewerStore(this)
    this.historyStore = new HistoryStore(this)
    makeAutoObservable(this)
  }

  openDock = () => (this.isDockOpen = true)
  closeDock = () => {
    console.log('Fire!')
    this.isDockOpen = false
  }

  /**
   * Selects a test by ID for viewing details.
   * Also opens the dock to display the test details.
   */
  selectTest = (testId: string) => {
    this.selectedTestId = testId
    this.openDock()
  }

  /**
   * Clears the selected test and closes the dock.
   */
  clearSelection = () => {
    this.selectedTestId = null
    this.closeDock()
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
   * Loads run.json, test results, and registers attachments.
   *
   * @param files - FileList from input element with webkitdirectory
   */
  loadReport = async (files: FileList): Promise<void> => {
    const fileLoader = new FileLoaderService()
    const { runFile, resultFiles, attachmentFiles } =
      await fileLoader.loadReportDirectory(files)

    if (!runFile) {
      throw new Error('run.json not found in selected directory')
    }

    await this.reportStore.loadRun(runFile)
    await this.testResultsStore.loadResults(resultFiles)

    for (const file of attachmentFiles) {
      this.attachmentsStore.registerAttachment(file)
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
