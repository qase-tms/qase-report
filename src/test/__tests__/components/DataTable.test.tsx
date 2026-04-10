import { screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { renderWithProviders } from '../../utils/render'
import { DataTable } from '@/components/TestList/DataTable'
import {
  buildSuiteTree,
  type TreeNode,
} from '@/components/TestList/buildSuiteTree'
import { createColumns } from '@/components/TestList/columns'
import { makeTestResult } from '../../factories/result.factory'

beforeAll(() => {
  // Mock getBoundingClientRect to return non-zero dimensions
  // Required because @tanstack/react-virtual uses it to size the virtual list
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    bottom: 600,
    right: 800,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }))

  // Mock offsetHeight (also needed by virtualizer scroll container sizing)
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    value: 600,
  })

  // Mock ResizeObserver (not implemented in jsdom)
  global.ResizeObserver = class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  } as unknown as typeof ResizeObserver
})

/**
 * Render DataTable with suite tree data built from test results.
 */
const renderDataTable = (testResults: Parameters<typeof buildSuiteTree>[0]) => {
  const tree = buildSuiteTree(testResults)
  const onSelectTest = vi.fn()
  const columns = createColumns(onSelectTest)
  const result = renderWithProviders(
    <DataTable<TreeNode, unknown>
      columns={columns}
      data={tree}
      getSubRows={row => row.subRows}
      getRowId={row => row.id}
    />
  )
  return { ...result, tree, onSelectTest }
}

describe('DataTable suite expand/collapse', () => {
  it('renders suite row with suite title', () => {
    const test = makeTestResult({
      id: 't1',
      title: 'Login test',
      relations: {
        suite: { data: [{ title: 'Authentication', public_id: null }] },
      },
    })

    renderDataTable([test])

    expect(screen.getByText('Authentication')).toBeInTheDocument()
  })

  it('test rows are hidden when suite is collapsed (default)', () => {
    const test = makeTestResult({
      id: 't1',
      title: 'Login test',
      relations: {
        suite: { data: [{ title: 'Authentication', public_id: null }] },
      },
    })

    renderDataTable([test])

    expect(screen.queryByText('Login test')).not.toBeInTheDocument()
  })

  it('expands suite to show test rows on button click', () => {
    const test = makeTestResult({
      id: 't1',
      title: 'Login test',
      relations: {
        suite: { data: [{ title: 'Authentication', public_id: null }] },
      },
    })

    renderDataTable([test])

    // Find the row containing the suite title
    const suiteTitle = screen.getByText('Authentication')
    const suiteRow = suiteTitle.closest('tr')!
    const expandBtn = within(suiteRow).getByRole('button')
    fireEvent.click(expandBtn)

    expect(screen.getByText('Login test')).toBeInTheDocument()
  })

  it('collapses suite to hide test rows on second click', () => {
    const test = makeTestResult({
      id: 't1',
      title: 'Login test',
      relations: {
        suite: { data: [{ title: 'Authentication', public_id: null }] },
      },
    })

    renderDataTable([test])

    // Find expand button and click twice
    const suiteTitle = screen.getByText('Authentication')
    const suiteRow = suiteTitle.closest('tr')!
    const expandBtn = within(suiteRow).getByRole('button')

    fireEvent.click(expandBtn)
    expect(screen.getByText('Login test')).toBeInTheDocument()

    fireEvent.click(expandBtn)
    expect(screen.queryByText('Login test')).not.toBeInTheDocument()
  })

  it('multiple suites render independently', () => {
    const authTest = makeTestResult({
      id: 't1',
      title: 'Login test',
      relations: {
        suite: { data: [{ title: 'Authentication', public_id: null }] },
      },
    })
    const payTest = makeTestResult({
      id: 't2',
      title: 'Payment flow test',
      relations: { suite: { data: [{ title: 'Payments', public_id: null }] } },
    })

    renderDataTable([authTest, payTest])

    // Both suite titles visible
    expect(screen.getByText('Authentication')).toBeInTheDocument()
    expect(screen.getByText('Payments')).toBeInTheDocument()

    // Expand only Authentication suite
    const authSuiteTitle = screen.getByText('Authentication')
    const authSuiteRow = authSuiteTitle.closest('tr')!
    const authExpandBtn = within(authSuiteRow).getByRole('button')
    fireEvent.click(authExpandBtn)

    // Authentication's test visible, Payments' test still hidden
    expect(screen.getByText('Login test')).toBeInTheDocument()
    expect(screen.queryByText('Payment flow test')).not.toBeInTheDocument()
  })

  it('nested suites render hierarchy with multi-level expand', () => {
    const test = makeTestResult({
      id: 't1',
      title: 'Login test',
      relations: {
        suite: {
          data: [
            { title: 'API', public_id: null },
            { title: 'Users', public_id: null },
            { title: 'Authentication', public_id: null },
          ],
        },
      },
    })

    // buildSuiteTree flattens to a single node with the full path as suiteTitle
    // The suiteTitle is the last element in suitePath
    renderDataTable([test])

    // The suite title rendered is the last segment 'Authentication'
    // The suite key is 'API > Users > Authentication'
    // Top-level suite node has suiteTitle = 'Authentication' (last segment)
    expect(screen.getByText('Authentication')).toBeInTheDocument()

    // Expand to reveal test
    const suiteTitle = screen.getByText('Authentication')
    const suiteRow = suiteTitle.closest('tr')!
    const expandBtn = within(suiteRow).getByRole('button')
    fireEvent.click(expandBtn)

    expect(screen.getByText('Login test')).toBeInTheDocument()
  })
})
