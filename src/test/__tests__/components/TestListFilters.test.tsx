import { screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../utils/render'
import { TestListFilters } from '@/components/TestList/TestListFilters'

describe('TestListFilters', () => {
  it('renders all 7 status buttons', () => {
    renderWithProviders(<TestListFilters />)

    expect(screen.getByRole('button', { name: 'Passed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Failed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Broken' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Skipped' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Blocked' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Invalid' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Muted' })).toBeInTheDocument()
  })

  it('toggles status filter on click', () => {
    const { store } = renderWithProviders(<TestListFilters />)

    const failedBtn = screen.getByRole('button', { name: 'Failed' })
    fireEvent.click(failedBtn)

    expect(store.testResultsStore.statusFilters.has('failed')).toBe(true)
  })

  it('toggles filter off on second click', () => {
    const { store } = renderWithProviders(<TestListFilters />)

    const failedBtn = screen.getByRole('button', { name: 'Failed' })
    fireEvent.click(failedBtn)
    fireEvent.click(failedBtn)

    expect(store.testResultsStore.statusFilters.has('failed')).toBe(false)
  })

  it('allows multiple filters to be active simultaneously', () => {
    const { store } = renderWithProviders(<TestListFilters />)

    const failedBtn = screen.getByRole('button', { name: 'Failed' })
    const brokenBtn = screen.getByRole('button', { name: 'Broken' })
    fireEvent.click(failedBtn)
    fireEvent.click(brokenBtn)

    expect(store.testResultsStore.statusFilters.has('failed')).toBe(true)
    expect(store.testResultsStore.statusFilters.has('broken')).toBe(true)
  })
})
