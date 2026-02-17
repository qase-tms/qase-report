/**
 * Qase API client for interacting with Qase TMS API.
 * Handles run creation, result submission, and run completion.
 */

/**
 * Custom error class for Qase API errors
 */
export class QaseApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public qaseMessage: string
  ) {
    super(message)
    this.name = 'QaseApiError'
  }
}

/**
 * Format Date object as "YYYY-MM-DD HH:mm:ss" in UTC
 */
function formatDateTime(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Create a new test run in Qase TMS
 * @returns Run ID
 */
export async function createQaseRun(options: {
  apiToken: string
  projectCode: string
  title: string
}): Promise<number> {
  const { apiToken, projectCode, title } = options
  const url = `https://api.qase.io/v1/project/${projectCode}/run`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Token: apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        is_autotest: true,
        start_time: formatDateTime(new Date()),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.errorMessage || data.message || response.statusText

      if (response.status === 401) {
        throw new QaseApiError('Invalid API token', 401, errorMessage)
      } else if (response.status === 404) {
        throw new QaseApiError(
          `Project not found: ${projectCode}`,
          404,
          errorMessage
        )
      } else {
        throw new QaseApiError(
          `Qase API error: ${response.statusText}`,
          response.status,
          errorMessage
        )
      }
    }

    if (!data.status || !data.result?.id) {
      throw new QaseApiError(
        'Invalid response from Qase API',
        response.status,
        'Missing run ID in response'
      )
    }

    return data.result.id
  } catch (err) {
    if (err instanceof QaseApiError) {
      throw err
    }

    // Network or other error
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw new QaseApiError(`Network error: ${message}`, 0, message)
  }
}

/**
 * Send test results to a Qase run
 */
export async function sendQaseResults(options: {
  apiToken: string
  projectCode: string
  runId: number
  results: unknown[]
}): Promise<void> {
  const { apiToken, projectCode, runId, results } = options
  const url = `https://api.qase.io/v2/project/${projectCode}/run/${runId}/result`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Token: apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ results }),
    })

    if (!response.ok) {
      const data = await response.json()
      const errorMessage = data.errorMessage || data.message || response.statusText

      if (response.status === 401) {
        throw new QaseApiError('Invalid API token', 401, errorMessage)
      } else if (response.status === 404) {
        throw new QaseApiError(
          `Run not found: ${runId}`,
          404,
          errorMessage
        )
      } else {
        throw new QaseApiError(
          `Qase API error: ${response.statusText}`,
          response.status,
          errorMessage
        )
      }
    }
  } catch (err) {
    if (err instanceof QaseApiError) {
      throw err
    }

    // Network or other error
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw new QaseApiError(`Network error: ${message}`, 0, message)
  }
}

/**
 * Mark a test run as complete in Qase TMS
 */
export async function completeQaseRun(options: {
  apiToken: string
  projectCode: string
  runId: number
}): Promise<void> {
  const { apiToken, projectCode, runId } = options
  const url = `https://api.qase.io/v1/project/${projectCode}/run/${runId}/complete`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Token: apiToken,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const data = await response.json()
      const errorMessage = data.errorMessage || data.message || response.statusText

      if (response.status === 401) {
        throw new QaseApiError('Invalid API token', 401, errorMessage)
      } else if (response.status === 404) {
        throw new QaseApiError(
          `Run not found: ${runId}`,
          404,
          errorMessage
        )
      } else {
        throw new QaseApiError(
          `Qase API error: ${response.statusText}`,
          response.status,
          errorMessage
        )
      }
    }
  } catch (err) {
    if (err instanceof QaseApiError) {
      throw err
    }

    // Network or other error
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw new QaseApiError(`Network error: ${message}`, 0, message)
  }
}

/**
 * Build URL to view a run in Qase TMS web interface
 */
export function buildRunUrl(projectCode: string, runId: number): string {
  return `https://app.qase.io/run/${projectCode}/dashboard/${runId}`
}
