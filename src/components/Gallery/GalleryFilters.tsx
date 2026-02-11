import { cn } from '../../lib/utils'

interface GalleryFiltersProps {
  activeFilter: 'all' | 'screenshots' | 'logs' | 'other'
  onFilterChange: (filter: 'all' | 'screenshots' | 'logs' | 'other') => void
  counts: {
    all: number
    screenshots: number
    logs: number
    other: number
  }
}

export const GalleryFilters = ({
  activeFilter,
  onFilterChange,
  counts,
}: GalleryFiltersProps) => {
  const filters = [
    { value: 'all' as const, label: `All (${counts.all})` },
    { value: 'screenshots' as const, label: `Screenshots (${counts.screenshots})` },
    { value: 'logs' as const, label: `Logs (${counts.logs})` },
    { value: 'other' as const, label: `Other (${counts.other})` },
  ]

  return (
    <div className="flex gap-2 flex-wrap mb-4">
      {filters.map(filter => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
            activeFilter === filter.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
