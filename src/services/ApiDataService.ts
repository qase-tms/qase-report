/**
 * API response type for report data.
 * Matches the structure returned by /api/report endpoint.
 */
export interface ApiReportResponse {
  run: unknown // Will be validated by schema
  results: unknown[]
  attachmentsPath: string
}

/**
 * Service for fetching report data from the CLI server API.
 * Used when running the app via `qase-report open` command.
 */
export class ApiDataService {
  private baseUrl: string

  /**
   * @param baseUrl - Base URL for API requests (default: window.location.origin)
   */
  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ?? (typeof window !== 'undefined' ? window.location.origin : '')
  }

  /**
   * Fetches the complete report data from the server API.
   *
   * @returns Promise resolving to report data (run, results, attachmentsPath)
   * @throws Error if request fails or response is not ok
   */
  async fetchReport(): Promise<ApiReportResponse> {
    const response = await fetch(`${this.baseUrl}/api/report`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `Failed to fetch report: ${response.status}`
      )
    }

    return response.json()
  }

  /**
   * Gets the full URL for an attachment file.
   *
   * @param filename - Attachment filename
   * @returns Full URL to the attachment endpoint
   */
  getAttachmentUrl(filename: string): string {
    return `${this.baseUrl}/api/attachments/${encodeURIComponent(filename)}`
  }
}

/**
 * Detects if the app is running in server mode (via CLI open command).
 *
 * Server mode is detected by:
 * - Global flag `window.__QASE_SERVER_MODE__` set by server
 * - URL query parameter `?server=true` for testing
 *
 * @returns true if running via CLI server, false for static file mode
 */
export function isServerMode(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  // Check for global flag (set by server-injected script)
  if (
    (window as Window & { __QASE_SERVER_MODE__?: boolean }).__QASE_SERVER_MODE__
  ) {
    return true
  }

  // Check for URL parameter (useful for testing)
  const params = new URLSearchParams(window.location.search)
  return params.get('server') === 'true'
}
