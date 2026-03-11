import { screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderWithProviders } from '../../utils/render'
import { TestListSearch } from '@/components/TestList/TestListSearch'

describe('TestListSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders search input with placeholder', () => {
    renderWithProviders(<TestListSearch />)

    expect(screen.getByPlaceholderText('Search tests...')).toBeInTheDocument()
  })

  it('does not update store before debounce fires', () => {
    const { store } = renderWithProviders(<TestListSearch />)

    const input = screen.getByPlaceholderText('Search tests...')
    fireEvent.change(input, { target: { value: 'login' } })

    expect(store.testResultsStore.searchQuery).toBe('')
  })

  it('updates store searchQuery after 300ms debounce', () => {
    const { store } = renderWithProviders(<TestListSearch />)

    const input = screen.getByPlaceholderText('Search tests...')
    fireEvent.change(input, { target: { value: 'login' } })
    vi.advanceTimersByTime(300)

    expect(store.testResultsStore.searchQuery).toBe('login')
  })

  it('clears searchQuery when input is cleared', () => {
    const { store } = renderWithProviders(<TestListSearch />)

    const input = screen.getByPlaceholderText('Search tests...')
    fireEvent.change(input, { target: { value: 'login' } })
    vi.advanceTimersByTime(300)

    expect(store.testResultsStore.searchQuery).toBe('login')

    fireEvent.change(input, { target: { value: '' } })
    vi.advanceTimersByTime(300)

    expect(store.testResultsStore.searchQuery).toBe('')
  })
})
