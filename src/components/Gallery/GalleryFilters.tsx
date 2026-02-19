import { Search, LayoutGrid, List } from 'lucide-react'
import { cn } from '../../lib/utils'

export type CategoryFilter = 'all' | 'screenshots' | 'logs' | 'other'
export type StatusFilter = 'all' | 'passed' | 'failed'
export type SortOption = 'name' | 'test' | 'status'
export type SizeOption = 'small' | 'medium' | 'large'
export type ViewMode = 'grid' | 'grouped'

interface GalleryFiltersProps {
  activeFilter: CategoryFilter
  onFilterChange: (filter: CategoryFilter) => void
  counts: {
    all: number
    screenshots: number
    logs: number
    other: number
  }
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (status: StatusFilter) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  size: SizeOption
  onSizeChange: (size: SizeOption) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export const GalleryFilters = ({
  activeFilter,
  onFilterChange,
  counts,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  size,
  onSizeChange,
  viewMode,
  onViewModeChange,
}: GalleryFiltersProps) => {
  const categoryFilters = [
    { value: 'all' as const, label: 'All', count: counts.all },
    { value: 'screenshots' as const, label: 'Screenshots', count: counts.screenshots },
    { value: 'logs' as const, label: 'Logs', count: counts.logs },
    { value: 'other' as const, label: 'Other', count: counts.other },
  ]

  const selectClassName = 'h-9 px-3 rounded-md border border-[var(--palette-charcoal-50)] bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <div className="space-y-4 mb-6">
      {/* Search and controls row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-[var(--palette-charcoal-50)] bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Right-side controls grouped together */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
            className={selectClassName}
          >
            <option value="all">All statuses</option>
            <option value="passed">Passed only</option>
            <option value="failed">Failed only</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className={selectClassName}
          >
            <option value="name">Sort: Name</option>
            <option value="test">Sort: Test</option>
            <option value="status">Sort: Status</option>
          </select>

          {/* Size */}
          <select
            value={size}
            onChange={(e) => onSizeChange(e.target.value as SizeOption)}
            className={selectClassName}
          >
            <option value="small">Size: Small</option>
            <option value="medium">Size: Medium</option>
            <option value="large">Size: Large</option>
          </select>

          {/* View mode toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('grouped')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'grouped'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
              aria-label="Grouped view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {categoryFilters.map(filter => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              activeFilter === filter.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {filter.label}
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full',
              activeFilter === filter.value
                ? 'bg-primary-foreground/20'
                : 'bg-background'
            )}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
