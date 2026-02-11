import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

/**
 * Tree node representing either a suite or a test in the hierarchical table.
 * Used by TanStack Table's expanding rows feature.
 */
export type TreeNode = {
  /** Unique identifier - suite path or test ID */
  id: string

  /** Row type discriminator */
  type: 'suite' | 'test'

  // Suite properties (only when type === 'suite')
  /** Array of parent suite titles (e.g., ['API', 'Users', 'Authentication']) */
  suitePath?: string[]

  /** Last suite title in path (e.g., 'Authentication') */
  suiteTitle?: string

  /** Total number of tests in this suite */
  totalTests?: number

  /** Number of passed tests */
  passedCount?: number

  /** Number of failed tests */
  failedCount?: number

  /** Number of skipped tests */
  skippedCount?: number

  /** Number of broken tests */
  brokenCount?: number

  /** Sum of all test durations in milliseconds */
  totalDuration?: number

  // Test properties (only when type === 'test')
  /** Original test data */
  testData?: QaseTestResult

  // TanStack Table requirement
  /** Children nodes (tests for suite, empty for test) */
  subRows?: TreeNode[]
}

/**
 * Transform flat array of test results into hierarchical tree structure.
 * Groups tests by suite path, creating parent suite nodes with aggregate statistics.
 *
 * Algorithm: O(n) single pass through tests
 * - Creates suite nodes on-demand using Map for fast lookup
 * - Aggregates counts and duration as tests are processed
 * - Returns array of suite nodes with tests as subRows
 *
 * @param tests - Flat array of test results
 * @returns Tree structure with suites as parents and tests as children
 */
export function buildSuiteTree(tests: QaseTestResult[]): TreeNode[] {
  const suiteMap = new Map<string, TreeNode>()

  for (const test of tests) {
    // Extract suite path from relations or use fallback
    const suitePath =
      test.relations?.suite?.data.map((s) => s.title) || ['No Suite']
    const suiteKey = suitePath.join(' > ')

    // Get or create suite node
    let suiteNode = suiteMap.get(suiteKey)
    if (!suiteNode) {
      suiteNode = {
        id: suiteKey,
        type: 'suite',
        suitePath,
        suiteTitle: suitePath[suitePath.length - 1],
        totalTests: 0,
        passedCount: 0,
        failedCount: 0,
        skippedCount: 0,
        brokenCount: 0,
        totalDuration: 0,
        subRows: [],
      }
      suiteMap.set(suiteKey, suiteNode)
    }

    // Increment aggregate counts
    suiteNode.totalTests!++
    const status = test.execution.status
    if (status === 'passed') suiteNode.passedCount!++
    else if (status === 'failed') suiteNode.failedCount!++
    else if (status === 'skipped') suiteNode.skippedCount!++
    else if (status === 'broken') suiteNode.brokenCount!++

    // Add test duration to suite total
    suiteNode.totalDuration! += test.execution.duration

    // Create test node and add to suite's subRows
    const testNode: TreeNode = {
      id: test.id,
      type: 'test',
      testData: test,
      subRows: [],
    }
    suiteNode.subRows!.push(testNode)
  }

  return Array.from(suiteMap.values())
}
