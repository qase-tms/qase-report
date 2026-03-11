import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { RootStoreContext, RootStore } from '@/store'
import { ThemeProvider } from '@/components/ThemeProvider'
import { createTestStore } from './store'

export * from '@testing-library/react'

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  store?: RootStore
}

/**
 * Custom RTL render that wraps the component in ThemeProvider and RootStoreContext.
 * Returns the RTL result extended with the store instance used during rendering.
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  { store, ...renderOptions }: RenderWithProvidersOptions = {}
) => {
  const testStore = store ?? createTestStore()

  const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <RootStoreContext.Provider value={testStore}>
      <ThemeProvider defaultTheme='dark'>{children}</ThemeProvider>
    </RootStoreContext.Provider>
  )

  const renderResult = render(ui, { wrapper: Wrapper, ...renderOptions })

  return { store: testStore, ...renderResult }
}
