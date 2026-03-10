import { describe, it, expect, vi } from 'vitest'
import { makeRun } from '../factories/run.factory'
import { makeTestResult } from '../factories/result.factory'
import { makeHistory, makeHistoricalRun } from '../factories/history.factory'
import { createTestStore } from '../utils/store'
import { renderWithProviders, screen } from '../utils/render'
import React from 'react'

describe('Test infrastructure smoke tests', () => {
  describe('makeRun()', () => {
    it('returns valid QaseRun object', () => {
      const run = makeRun()
      expect(run.stats.total).toBe(10)
      expect(run.execution.duration).toBe(60000)
    })

    it('supports partial overrides', () => {
      const run = makeRun({ title: 'Custom Run' })
      expect(run.title).toBe('Custom Run')
      expect(run.stats.total).toBe(10)
      expect(run.execution.duration).toBe(60000)
    })
  })

  describe('makeTestResult()', () => {
    it('returns valid QaseTestResult', () => {
      const result = makeTestResult()
      expect(result.id).toBe('test-001')
      expect(result.signature).toBe('suite::module::test_case')
      expect(result.execution.status).toBe('passed')
    })

    it('supports partial overrides', () => {
      const result = makeTestResult({
        execution: { ...makeTestResult().execution, status: 'failed' },
      })
      expect(result.execution.status).toBe('failed')
    })
  })

  describe('makeHistory()', () => {
    it('returns valid QaseHistory', () => {
      const history = makeHistory()
      expect(history.schema_version).toBe('1.0.0')
      expect(Array.isArray(history.runs)).toBe(true)
      expect(history.runs.length).toBe(1)
    })
  })

  describe('makeHistoricalRun()', () => {
    it('supports partial overrides', () => {
      const run = makeHistoricalRun({ run_id: 'custom-run' })
      expect(run.run_id).toBe('custom-run')
      expect(run.stats.total).toBe(10)
    })
  })

  describe('createTestStore()', () => {
    it('returns fresh RootStore', () => {
      const store = createTestStore()
      expect(store.reportStore).toBeDefined()
      expect(store.historyStore).toBeDefined()
      expect(store.historyStore.isHistoryLoaded).toBe(false)
    })

    it('stubs localStorage', () => {
      createTestStore()
      expect(vi.isMockFunction(localStorage.getItem)).toBe(true)
    })
  })

  describe('renderWithProviders()', () => {
    it('renders a simple component', () => {
      renderWithProviders(React.createElement('div', null, 'hello'))
      expect(screen.getByText('hello')).toBeDefined()
    })
  })
})
