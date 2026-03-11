import { describe, it, expect } from 'vitest'
import { buildSuiteTree } from '@/components/TestList/buildSuiteTree'
import { makeTestResult } from '../../factories/result.factory'

/**
 * Tests for buildSuiteTree() — a pure function (no store needed).
 *
 * buildSuiteTree groups flat QaseTestResult[] into suite tree nodes,
 * prepending a header node to each suite's subRows.
 */

describe('buildSuiteTree()', () => {
  it('returns empty array for empty input', () => {
    const tree = buildSuiteTree([])
    expect(tree).toHaveLength(0)
  })

  it('groups two tests with the same suite into one suite node', () => {
    const tests = [
      makeTestResult({
        id: 'test-1',
        execution: { ...makeTestResult().execution, status: 'passed' },
        relations: { suite: { data: [{ title: 'API', public_id: null }] } },
      }),
      makeTestResult({
        id: 'test-2',
        execution: { ...makeTestResult().execution, status: 'failed' },
        relations: { suite: { data: [{ title: 'API', public_id: null }] } },
      }),
    ]

    const tree = buildSuiteTree(tests)
    expect(tree).toHaveLength(1)
    expect(tree[0].suiteTitle).toBe('API')
    expect(tree[0].totalTests).toBe(2)
  })

  it('creates separate suite nodes for tests in different suites', () => {
    const tests = [
      makeTestResult({
        id: 'test-1',
        relations: { suite: { data: [{ title: 'API', public_id: null }] } },
      }),
      makeTestResult({
        id: 'test-2',
        relations: { suite: { data: [{ title: 'UI', public_id: null }] } },
      }),
    ]

    const tree = buildSuiteTree(tests)
    expect(tree).toHaveLength(2)
    const titles = tree.map(n => n.suiteTitle)
    expect(titles).toContain('API')
    expect(titles).toContain('UI')
  })

  it('uses No Suite fallback when relations is null', () => {
    const tests = [
      makeTestResult({
        id: 'test-1',
        relations: null,
      }),
      makeTestResult({
        id: 'test-2',
        relations: null,
      }),
    ]

    const tree = buildSuiteTree(tests)
    expect(tree).toHaveLength(1)
    expect(tree[0].suiteTitle).toBe('No Suite')
  })

  it('prepends a header node as first subRow of each suite', () => {
    const tests = [
      makeTestResult({
        id: 'test-1',
        relations: { suite: { data: [{ title: 'Auth', public_id: null }] } },
      }),
    ]

    const tree = buildSuiteTree(tests)
    expect(tree).toHaveLength(1)

    const suiteNode = tree[0]
    expect(suiteNode.subRows).toBeDefined()
    expect(suiteNode.subRows!.length).toBeGreaterThan(0)

    const headerNode = suiteNode.subRows![0]
    expect(headerNode.type).toBe('header')
    expect(headerNode.id).toMatch(/::header$/)
  })

  it('counts passedCount and failedCount correctly', () => {
    const tests = [
      makeTestResult({
        id: 'pass-1',
        execution: { ...makeTestResult().execution, status: 'passed' },
        relations: { suite: { data: [{ title: 'Suite', public_id: null }] } },
      }),
      makeTestResult({
        id: 'pass-2',
        execution: { ...makeTestResult().execution, status: 'passed' },
        relations: { suite: { data: [{ title: 'Suite', public_id: null }] } },
      }),
      makeTestResult({
        id: 'fail-1',
        execution: { ...makeTestResult().execution, status: 'failed' },
        relations: { suite: { data: [{ title: 'Suite', public_id: null }] } },
      }),
    ]

    const tree = buildSuiteTree(tests)
    expect(tree).toHaveLength(1)
    expect(tree[0].passedCount).toBe(2)
    expect(tree[0].failedCount).toBe(1)
    expect(tree[0].totalTests).toBe(3)
  })

  it('counts all 7 status values correctly in aggregate', () => {
    const statuses = ['passed', 'failed', 'skipped', 'broken', 'blocked', 'invalid', 'muted'] as const
    const tests = statuses.map((status, i) =>
      makeTestResult({
        id: `test-${i}`,
        execution: { ...makeTestResult().execution, status },
        relations: { suite: { data: [{ title: 'All Statuses', public_id: null }] } },
      })
    )

    const tree = buildSuiteTree(tests)
    expect(tree).toHaveLength(1)
    const node = tree[0]
    expect(node.totalTests).toBe(7)
    expect(node.passedCount).toBe(1)
    expect(node.failedCount).toBe(1)
    expect(node.skippedCount).toBe(1)
    expect(node.brokenCount).toBe(1)
    expect(node.blockedCount).toBe(1)
    expect(node.invalidCount).toBe(1)
    expect(node.mutedCount).toBe(1)
  })

  it('includes test nodes after the header in subRows', () => {
    const tests = [
      makeTestResult({
        id: 'test-1',
        relations: { suite: { data: [{ title: 'Suite', public_id: null }] } },
      }),
      makeTestResult({
        id: 'test-2',
        relations: { suite: { data: [{ title: 'Suite', public_id: null }] } },
      }),
    ]

    const tree = buildSuiteTree(tests)
    const suiteNode = tree[0]
    // subRows = [header, test-1, test-2]
    expect(suiteNode.subRows).toHaveLength(3)
    expect(suiteNode.subRows![0].type).toBe('header')
    expect(suiteNode.subRows![1].type).toBe('test')
    expect(suiteNode.subRows![2].type).toBe('test')
  })
})
