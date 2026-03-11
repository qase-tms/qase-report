import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../utils/render'
import { StatusBadge } from '@/components/StatusBadge'

describe('StatusBadge', () => {
  it.each([
    ['passed', 'Passed'],
    ['failed', 'Failed'],
    ['skipped', 'Skipped'],
    ['broken', 'Broken'],
    ['blocked', 'Blocked'],
    ['invalid', 'Invalid'],
    ['muted', 'Muted'],
  ])('renders status %s with label "%s" and correct data-variant', (status, expectedLabel) => {
    renderWithProviders(<StatusBadge status={status as any} />)

    const badge = screen.getByText(expectedLabel)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('data-variant', status)
  })

  it('passes className to the badge element', () => {
    renderWithProviders(<StatusBadge status="passed" className="extra-class" />)

    const badge = screen.getByText('Passed')
    expect(badge).toHaveClass('extra-class')
  })
})
