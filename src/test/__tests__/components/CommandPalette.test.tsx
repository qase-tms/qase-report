import { screen, act, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { runInAction } from 'mobx'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../utils/render'
import { CommandPalette } from '@/components/CommandPalette/CommandPalette'
import { makeTestResult } from '../../factories/result.factory'

// jsdom does not implement ResizeObserver — required by cmdk's CommandList
beforeAll(() => {
  global.ResizeObserver = class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  } as unknown as typeof ResizeObserver
})

describe('CommandPalette', () => {
  it('renders search input when open=true', () => {
    renderWithProviders(<CommandPalette open={true} onOpenChange={vi.fn()} />)
    // CommandDialog uses Radix Dialog portal — renders into document.body
    // RTL screen queries all of document.body by default
    expect(screen.getByPlaceholderText('Search tests...')).toBeInTheDocument()
  })

  it('does not render content when open=false', () => {
    renderWithProviders(<CommandPalette open={false} onOpenChange={vi.fn()} />)
    expect(
      screen.queryByPlaceholderText('Search tests...')
    ).not.toBeInTheDocument()
  })

  it('shows "No tests found." for empty query results', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CommandPalette open={true} onOpenChange={vi.fn()} />)
    // No test results in store
    const input = screen.getByPlaceholderText('Search tests...')
    await user.type(input, 'nonexistent')
    expect(screen.getByText('No tests found.')).toBeInTheDocument()
  })

  it('filters results by query text', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0, delay: null })
    const { store } = renderWithProviders(
      <CommandPalette open={true} onOpenChange={vi.fn()} />
    )
    act(() => {
      runInAction(() => {
        store.testResultsStore.testResults.set(
          't1',
          makeTestResult({ id: 't1', title: 'Login test' })
        )
        store.testResultsStore.testResults.set(
          't2',
          makeTestResult({ id: 't2', title: 'Logout test' })
        )
        store.testResultsStore.testResults.set(
          't3',
          makeTestResult({ id: 't3', title: 'Payment test' })
        )
      })
    })
    const input = screen.getByPlaceholderText('Search tests...')
    await user.clear(input)
    await user.type(input, 'Login')
    expect(screen.getByText('Login test')).toBeInTheDocument()
    expect(screen.queryByText('Payment test')).not.toBeInTheDocument()
  })

  it('calls onOpenChange(false) and selectTest when item is selected', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0, delay: null })
    const onOpenChange = vi.fn()
    const { store } = renderWithProviders(
      <CommandPalette open={true} onOpenChange={onOpenChange} />
    )
    act(() => {
      runInAction(() => {
        store.testResultsStore.testResults.set(
          't1',
          makeTestResult({ id: 't1', title: 'Login test' })
        )
      })
    })
    const input = screen.getByPlaceholderText('Search tests...')
    await user.clear(input)
    await user.type(input, 'Login')
    // Wait for cmdk to render the filtered item
    const item = await screen.findByText('Login test')
    await user.click(item)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(store.selectedTestId).toBe('t1')
  })
})
