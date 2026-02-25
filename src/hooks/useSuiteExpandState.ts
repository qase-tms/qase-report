import { useState, useEffect } from 'react'

const STORAGE_KEY = 'qase-report-expanded-suites'

export const useSuiteExpandState = () => {
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(() => {
    // SSR-safe: check for window before accessing sessionStorage
    if (typeof window === 'undefined') {
      return new Set()
    }

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      // If parsing fails, return empty Set (all collapsed)
      return new Set()
    }
  })

  useEffect(() => {
    // Persist to sessionStorage on change
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...expandedSuites]))
    }
  }, [expandedSuites])

  const toggleSuite = (suiteTitle: string) => {
    setExpandedSuites((prev) => {
      const next = new Set(prev)
      if (next.has(suiteTitle)) {
        next.delete(suiteTitle)
      } else {
        next.add(suiteTitle)
      }
      return next
    })
  }

  return { expandedSuites, toggleSuite }
}
