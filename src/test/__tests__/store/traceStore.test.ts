import { describe, it, expect, beforeEach } from 'vitest'
import { runInAction } from 'mobx'
import type { RootStore } from '@/store'
import { isTraceAttachment } from '@/store/TraceStore'
import type { Attachment } from '@/schemas/Attachment.schema'
import { createTestStore } from '../../utils/store'
import { makeTestResult } from '../../factories/result.factory'

describe('isTraceAttachment (pure function)', () => {
  it('returns true for application/zip with "trace" in filename', () => {
    const attachment: Attachment = {
      id: 'a1',
      file_path: './trace.zip',
      file_name: 'trace.zip',
      mime_type: 'application/zip',
    }
    expect(isTraceAttachment(attachment)).toBe(true)
  })

  it('returns true for case-insensitive "TRACE" in filename', () => {
    const attachment: Attachment = {
      id: 'a2',
      file_path: './TRACE-output.zip',
      file_name: 'TRACE-output.zip',
      mime_type: 'application/zip',
    }
    expect(isTraceAttachment(attachment)).toBe(true)
  })

  it('returns true when "trace" is embedded in filename', () => {
    const attachment: Attachment = {
      id: 'a3',
      file_path: './my-trace-file.zip',
      file_name: 'my-trace-file.zip',
      mime_type: 'application/zip',
    }
    expect(isTraceAttachment(attachment)).toBe(true)
  })

  it('returns false for wrong mime_type even with "trace" in filename', () => {
    const attachment: Attachment = {
      id: 'a4',
      file_path: './trace.png',
      file_name: 'trace.png',
      mime_type: 'image/png',
    }
    expect(isTraceAttachment(attachment)).toBe(false)
  })

  it('returns false for application/zip without "trace" in filename', () => {
    const attachment: Attachment = {
      id: 'a5',
      file_path: './archive.zip',
      file_name: 'archive.zip',
      mime_type: 'application/zip',
    }
    expect(isTraceAttachment(attachment)).toBe(false)
  })
})

describe('TraceStore computed properties', () => {
  let store: RootStore

  beforeEach(() => {
    store = createTestStore()
  })

  it('traceFiles returns empty array when no test results loaded (zero-trace)', () => {
    expect(store.traceStore.traceFiles).toEqual([])
  })

  it('hasTraces returns false when no test results loaded', () => {
    expect(store.traceStore.hasTraces).toBe(false)
  })

  it('traceCount returns 0 when no test results loaded', () => {
    expect(store.traceStore.traceCount).toBe(0)
  })

  it('traceFiles discovers trace in top-level attachments', () => {
    runInAction(() => {
      store.testResultsStore.testResults.set(
        't1',
        makeTestResult({
          id: 't1',
          title: 'Test with trace',
          attachments: [
            {
              id: 'a1',
              file_path: './trace.zip',
              file_name: 'trace.zip',
              mime_type: 'application/zip',
            } as Attachment,
          ],
        })
      )
    })

    expect(store.traceStore.traceFiles).toHaveLength(1)
    expect(store.traceStore.traceFiles[0].testId).toBe('t1')
    expect(store.traceStore.traceFiles[0].testTitle).toBe('Test with trace')
    expect(store.traceStore.hasTraces).toBe(true)
    expect(store.traceStore.traceCount).toBe(1)
  })

  it('traceFiles discovers trace in nested step attachments', () => {
    runInAction(() => {
      store.testResultsStore.testResults.set(
        't2',
        makeTestResult({
          id: 't2',
          title: 'Test with step trace',
          steps: [
            {
              id: 's1',
              step_type: 'action',
              data: { action: 'step1' },
              execution: {
                status: 'passed',
                start_time: 1700000000000,
                end_time: 1700000001000,
                duration: 1000,
                attachments: [
                  {
                    id: 'a2',
                    file_path: './trace2.zip',
                    file_name: 'trace2.zip',
                    mime_type: 'application/zip',
                  } as Attachment,
                ],
              },
              steps: [],
            },
          ],
        })
      )
    })

    expect(store.traceStore.traceFiles).toHaveLength(1)
    expect(store.traceStore.traceFiles[0].testId).toBe('t2')
    expect(store.traceStore.hasTraces).toBe(true)
  })

  it('traceFiles returns multiple traces across different test results', () => {
    runInAction(() => {
      store.testResultsStore.testResults.set(
        'ta',
        makeTestResult({
          id: 'ta',
          attachments: [
            {
              id: 'aa1',
              file_path: './trace-a.zip',
              file_name: 'trace-a.zip',
              mime_type: 'application/zip',
            } as Attachment,
          ],
        })
      )
      store.testResultsStore.testResults.set(
        'tb',
        makeTestResult({
          id: 'tb',
          attachments: [
            {
              id: 'ab1',
              file_path: './trace-b.zip',
              file_name: 'trace-b.zip',
              mime_type: 'application/zip',
            } as Attachment,
          ],
        })
      )
    })

    expect(store.traceStore.traceCount).toBe(2)
  })

  it('traceFiles returns empty array for non-trace attachments', () => {
    runInAction(() => {
      store.testResultsStore.testResults.set(
        'ts',
        makeTestResult({
          id: 'ts',
          attachments: [
            {
              id: 'as1',
              file_path: './screenshot.png',
              file_name: 'screenshot.png',
              mime_type: 'image/png',
            } as Attachment,
          ],
        })
      )
    })

    expect(store.traceStore.traceFiles).toEqual([])
    expect(store.traceStore.hasTraces).toBe(false)
  })
})
