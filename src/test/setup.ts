import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup DOM between tests to prevent state leaking
afterEach(() => {
  cleanup()
})
