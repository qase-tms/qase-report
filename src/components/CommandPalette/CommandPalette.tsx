import { useState, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { rankItem } from '@tanstack/match-sorter-utils'
import { useRootStore } from '@/store'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from '@/components/ui/command'
import { getStatusIcon } from '@/components/TestList/statusIcon'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CommandPalette = observer(({ open, onOpenChange }: CommandPaletteProps) => {
  const { testResultsStore, selectTest } = useRootStore()
  const [query, setQuery] = useState('')

  // Fuzzy filter using match-sorter-utils
  const results = useMemo(() => {
    if (!query.trim()) {
      return []
    }

    const lowerQuery = query.toLowerCase()

    // Rank each test by title match quality
    const ranked = testResultsStore.resultsList
      .map(test => ({
        test,
        rank: rankItem(test.title, lowerQuery)
      }))
      .filter(item => item.rank.passed) // Only include matches above threshold
      .sort((a, b) => b.rank.rank - a.rank.rank) // Sort by match quality
      .slice(0, 10) // Limit to 10 results
      .map(item => item.test)

    return ranked
  }, [query, testResultsStore.resultsList])

  const handleSelect = (testId: string) => {
    selectTest(testId)
    onOpenChange(false)
    setQuery('') // Reset query on selection
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search tests..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No tests found.</CommandEmpty>
        {results.map(test => (
          <CommandItem
            key={test.id}
            value={test.id}
            onSelect={() => handleSelect(test.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {getStatusIcon(test.execution.status)}
            <span className="flex-1 truncate">{test.title}</span>
            <span className="text-xs text-muted-foreground">
              {test.execution.duration >= 1000
                ? `${(test.execution.duration / 1000).toFixed(1)}s`
                : `${test.execution.duration}ms`}
            </span>
          </CommandItem>
        ))}
      </CommandList>
    </CommandDialog>
  )
})
