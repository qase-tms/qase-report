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
  startTime?: number
}): Promise<number> {
  const { apiToken, projectCode, title, startTime } = options
  const url = `https://api.qase.io/v1/run/${projectCode}`

  const runStartTime = startTime
    ? formatDateTime(new Date(startTime * 1000))
    : formatDateTime(new Date())

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
        start_time: runStartTime,
      }),
    })

    const responseText = await response.text()
    let data: Record<string, unknown>
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { raw: responseText }
    }

    if (!response.ok) {
      const errorMessage = data.errorMessage || data.message || response.statusText

      if (response.status === 401) {
        throw new QaseApiError('Invalid API token', 401, String(errorMessage))
      } else if (response.status === 404) {
        throw new QaseApiError(
          `Project not found: ${projectCode}`,
          404,
          String(errorMessage)
        )
      } else {
        throw new QaseApiError(
          `Qase API error: ${response.statusText}`,
          response.status,
          String(errorMessage)
        )
      }
    }

    if (!data.status || !(data.result as Record<string, unknown>)?.id) {
      throw new QaseApiError(
        'Invalid response from Qase API',
        response.status,
        'Missing run ID in response'
      )
    }

    return (data.result as Record<string, unknown>).id as number
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
  const url = `https://api.qase.io/v2/${projectCode}/run/${runId}/results`

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
      const responseText = await response.text()
      let data: Record<string, unknown>
      try {
        data = JSON.parse(responseText)
      } catch {
        data = { raw: responseText }
      }
      const errorMessage = data.errorMessage || data.message || response.statusText

      if (response.status === 401) {
        throw new QaseApiError('Invalid API token', 401, String(errorMessage))
      } else if (response.status === 404) {
        throw new QaseApiError(
          `Run not found: ${runId}`,
          404,
          String(errorMessage)
        )
      } else {
        throw new QaseApiError(
          `Qase API error: ${response.statusText}`,
          response.status,
          String(errorMessage)
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
  const url = `https://api.qase.io/v1/run/${projectCode}/${runId}/complete`

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
 * Upload attachments to Qase TMS and return a map of attachment id → hash
 *
 * Batching: max 20 files per request, max 128 MB per request
 * Skips files larger than 32 MB
 */
export async function uploadAttachments(options: {
  apiToken: string
  projectCode: string
  files: Array<{ id: string; name: string; path: string; mimeType: string }>
}): Promise<Map<string, string>> {
  const { apiToken, projectCode, files } = options
  const url = `https://api.qase.io/v1/attachment/${projectCode}`
  const idToHash = new Map<string, string>()

  const MAX_FILES_PER_BATCH = 20
  const MAX_BATCH_SIZE = 128 * 1024 * 1024 // 128 MB
  const MAX_FILE_SIZE = 32 * 1024 * 1024 // 32 MB

  // Build batches respecting file count and size limits
  const batches: Array<typeof files> = []
  let currentBatch: typeof files = []
  let currentBatchSize = 0

  for (const file of files) {
    const { readFileSync, statSync } = await import('fs')
    let fileSize: number
    try {
      fileSize = statSync(file.path).size
    } catch {
      console.warn(`Skipping attachment ${file.name}: cannot stat file`)
      continue
    }

    if (fileSize > MAX_FILE_SIZE) {
      console.warn(
        `Skipping attachment ${file.name}: file size ${(fileSize / 1024 / 1024).toFixed(1)} MB exceeds 32 MB limit`
      )
      continue
    }

    if (
      currentBatch.length >= MAX_FILES_PER_BATCH ||
      currentBatchSize + fileSize > MAX_BATCH_SIZE
    ) {
      if (currentBatch.length > 0) {
        batches.push(currentBatch)
      }
      currentBatch = []
      currentBatchSize = 0
    }

    currentBatch.push(file)
    currentBatchSize += fileSize
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch)
  }

  // Upload each batch
  for (const batch of batches) {
    const { readFileSync } = await import('fs')
    const formData = new FormData()

    for (const file of batch) {
      const fileBuffer = readFileSync(file.path)
      const blob = new Blob([fileBuffer], { type: file.mimeType })
      formData.append('file[]', blob, file.name)
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Token: apiToken,
        },
        body: formData,
      })

      const responseText = await response.text()
      let data: Record<string, unknown>
      try {
        data = JSON.parse(responseText)
      } catch {
        data = { raw: responseText }
      }

      if (!response.ok) {
        const errorMessage =
          data.errorMessage || data.message || response.statusText
        console.warn(
          `Warning: Failed to upload attachment batch: ${errorMessage}`
        )
        continue
      }

      // Map uploaded files back to their IDs by matching filenames
      const resultItems = data.result as Array<{
        hash: string
        filename: string
      }>
      if (Array.isArray(resultItems)) {
        // Build a filename→id lookup from current batch
        const nameToIds = new Map<string, string[]>()
        for (const file of batch) {
          const ids = nameToIds.get(file.name) || []
          ids.push(file.id)
          nameToIds.set(file.name, ids)
        }

        for (const item of resultItems) {
          const ids = nameToIds.get(item.filename)
          if (ids && ids.length > 0) {
            const id = ids.shift()!
            idToHash.set(id, item.hash)
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.warn(`Warning: Failed to upload attachment batch: ${message}`)
    }
  }

  return idToHash
}

/**
 * Build URL to view a run in Qase TMS web interface
 */
export function buildRunUrl(projectCode: string, runId: number): string {
  return `https://app.qase.io/run/${projectCode}/dashboard/${runId}`
}
