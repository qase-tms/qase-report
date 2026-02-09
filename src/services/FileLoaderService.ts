/**
 * Service for loading and organizing files from browser File API.
 * Handles directory selection via webkitdirectory attribute and
 * categorizes files into run metadata, test results, and attachments.
 */
export class FileLoaderService {
  /**
   * Loads and categorizes files from a qase-report directory.
   *
   * Expected structure:
   * - run.json: Test run metadata
   * - results/*.json: Individual test result files
   * - attachments/*: Media and artifact files
   *
   * @param files - FileList from input element with webkitdirectory
   * @returns Categorized files object
   */
  async loadReportDirectory(files: FileList): Promise<{
    runFile: File | null
    resultFiles: File[]
    attachmentFiles: File[]
  }> {
    const fileArray = Array.from(files)

    // Filter files by their relative path structure
    const runFile =
      fileArray.find((f) => f.webkitRelativePath.endsWith('run.json')) || null

    const resultFiles = fileArray.filter(
      (f) =>
        f.webkitRelativePath.includes('/results/') && f.name.endsWith('.json')
    )

    const attachmentFiles = fileArray.filter((f) =>
      f.webkitRelativePath.includes('/attachments/')
    )

    return {
      runFile,
      resultFiles,
      attachmentFiles,
    }
  }

  /**
   * Reads file contents as text using modern File API.
   *
   * Uses the promise-based File.text() method instead of
   * legacy FileReader event-based API.
   *
   * @param file - File object to read
   * @returns Promise resolving to file contents as string
   */
  async readAsText(file: File): Promise<string> {
    return await file.text()
  }
}
