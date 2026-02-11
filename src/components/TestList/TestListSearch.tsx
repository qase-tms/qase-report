import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'

export const TestListSearch = observer(() => {
  const { testResultsStore } = useRootStore()
  const [localQuery, setLocalQuery] = useState('')

  // Debounce: only update store after 300ms of no typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      testResultsStore.setSearchQuery(localQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [localQuery, testResultsStore])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        className="w-full pl-9 pr-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        placeholder="Search tests..."
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
      />
    </div>
  )
})
