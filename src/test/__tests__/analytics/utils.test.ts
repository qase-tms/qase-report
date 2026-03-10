import { describe, it, expect } from 'vitest'
import { formatDuration } from '@/utils/formatDuration'
import { detectLanguage } from '@/utils/detectLanguage'
import { transformResult } from '@/cli/qase-transform'
import { makeTestResult } from '../../factories/result.factory'

/**
 * Utility function boundary tests.
 *
 * mapStatus is NOT exported from qase-transform.ts.
 * We test it indirectly via transformResult(), which calls mapStatus() internally.
 * The returned object's execution.status reflects the mapped value.
 */

describe('formatDuration()', () => {
  it('returns ms format for 0ms', () => {
    expect(formatDuration(0)).toBe('0ms')
  })

  it('returns ms format for values below 1000ms', () => {
    expect(formatDuration(999)).toBe('999ms')
    expect(formatDuration(500)).toBe('500ms')
    expect(formatDuration(1)).toBe('1ms')
  })

  it('returns seconds format at exactly 1000ms (boundary)', () => {
    expect(formatDuration(1000)).toBe('1.0s')
  })

  it('returns seconds format for values above 1000ms', () => {
    expect(formatDuration(1500)).toBe('1.5s')
    expect(formatDuration(2000)).toBe('2.0s')
    expect(formatDuration(60000)).toBe('60.0s')
  })
})

describe('detectLanguage()', () => {
  it('returns typescript for .ts files', () => {
    expect(detectLanguage('file.ts')).toBe('typescript')
  })

  it('returns javascript for .js files', () => {
    expect(detectLanguage('file.js')).toBe('javascript')
  })

  it('returns python for .py files', () => {
    expect(detectLanguage('file.py')).toBe('python')
  })

  it('returns java for .java files', () => {
    expect(detectLanguage('file.java')).toBe('java')
  })

  it('returns markup for unknown extensions', () => {
    expect(detectLanguage('file.xyz')).toBe('markup')
    expect(detectLanguage('file.rb')).toBe('markup')
  })

  it('returns markup when file has no extension', () => {
    expect(detectLanguage('Makefile')).toBe('markup')
    expect(detectLanguage('filename')).toBe('markup')
  })
})

describe('transformResult() — mapStatus (tested indirectly)', () => {
  it('maps broken -> failed', () => {
    const input = makeTestResult({
      execution: { ...makeTestResult().execution, status: 'broken' },
    })
    const result = transformResult(input)
    expect(result.execution.status).toBe('failed')
  })

  it('maps muted -> passed', () => {
    const input = makeTestResult({
      execution: { ...makeTestResult().execution, status: 'muted' },
    })
    const result = transformResult(input)
    expect(result.execution.status).toBe('passed')
  })

  it('keeps passed -> passed unchanged', () => {
    const input = makeTestResult({
      execution: { ...makeTestResult().execution, status: 'passed' },
    })
    const result = transformResult(input)
    expect(result.execution.status).toBe('passed')
  })

  it('keeps failed -> failed unchanged', () => {
    const input = makeTestResult({
      execution: { ...makeTestResult().execution, status: 'failed' },
    })
    const result = transformResult(input)
    expect(result.execution.status).toBe('failed')
  })

  it('keeps skipped -> skipped unchanged', () => {
    const input = makeTestResult({
      execution: { ...makeTestResult().execution, status: 'skipped' },
    })
    const result = transformResult(input)
    expect(result.execution.status).toBe('skipped')
  })
})
