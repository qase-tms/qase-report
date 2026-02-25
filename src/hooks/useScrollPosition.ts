import { useEffect, useLayoutEffect, RefObject } from 'react'

export const useScrollPosition = (key: string, elementRef: RefObject<HTMLElement | null>) => {
  // Restore on mount (useLayoutEffect prevents flash)
  useLayoutEffect(() => {
    const element = elementRef.current
    if (!element) return

    const savedPosition = sessionStorage.getItem(`scroll-${key}`)
    if (savedPosition) {
      element.scrollTop = parseInt(savedPosition, 10)
    }
  }, [key, elementRef])

  // Save on scroll (debounced) and unmount
  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    let timeoutId: ReturnType<typeof setTimeout>
    const handleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        sessionStorage.setItem(`scroll-${key}`, element.scrollTop.toString())
      }, 100)
    }

    element.addEventListener('scroll', handleScroll)
    return () => {
      clearTimeout(timeoutId)
      element.removeEventListener('scroll', handleScroll)
      sessionStorage.setItem(`scroll-${key}`, element.scrollTop.toString())
    }
  }, [key, elementRef])
}
