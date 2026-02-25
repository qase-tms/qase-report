import { useState, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { ImageIcon } from 'lucide-react'
import { useRootStore } from '../../store'
import { Skeleton } from '@/components/ui/skeleton'
import { categorizeAttachment } from '../../types/gallery'
import {
  GalleryFilters,
  type CategoryFilter,
  type StatusFilter,
  type SortOption,
  type SizeOption,
  type ViewMode,
} from './GalleryFilters'
import { GalleryGrid } from './GalleryGrid'

export const Gallery = observer(() => {
  const { analyticsStore, reportStore } = useRootStore()

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [size, setSize] = useState<SizeOption>('medium')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // No report loaded
  if (!reportStore.runData) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const allAttachments = analyticsStore.galleryAttachments

  // No attachments
  if (allAttachments.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="h-6 w-6 text-primary" />
          <h5 className="text-xl font-semibold">Attachments</h5>
        </div>
        <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No attachments found in this report.
          </p>
        </div>
      </div>
    )
  }

  // Calculate counts for each category (before other filters)
  const counts = useMemo(() => ({
    all: allAttachments.length,
    screenshots: allAttachments.filter(item =>
      categorizeAttachment(item.attachment.mime_type) === 'screenshots'
    ).length,
    logs: allAttachments.filter(item =>
      categorizeAttachment(item.attachment.mime_type) === 'logs'
    ).length,
    other: allAttachments.filter(item =>
      categorizeAttachment(item.attachment.mime_type) === 'other'
    ).length,
  }), [allAttachments])

  // Filter and sort attachments
  const filteredAttachments = useMemo(() => {
    let result = [...allAttachments]

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(item => {
        const category = categorizeAttachment(item.attachment.mime_type)
        return category === categoryFilter
      })
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.testStatus === statusFilter)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item =>
        item.attachment.file_name.toLowerCase().includes(query) ||
        item.testTitle.toLowerCase().includes(query)
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.attachment.file_name.localeCompare(b.attachment.file_name)
        case 'test':
          return a.testTitle.localeCompare(b.testTitle)
        case 'status':
          const statusOrder: Record<string, number> = { failed: 0, broken: 1, blocked: 2, invalid: 3, passed: 4, skipped: 5, muted: 6 }
          return (statusOrder[a.testStatus] ?? 7) - (statusOrder[b.testStatus] ?? 7)
        default:
          return 0
      }
    })

    return result
  }, [allAttachments, categoryFilter, statusFilter, searchQuery, sortBy])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ImageIcon className="h-6 w-6 text-primary" />
          <h5 className="text-xl font-semibold">Attachments</h5>
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredAttachments.length} of {allAttachments.length} attachment{allAttachments.length !== 1 ? 's' : ''}
          {filteredAttachments.length !== allAttachments.length && ' (filtered)'}
        </p>
      </div>

      {/* Filters */}
      <GalleryFilters
        activeFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
        counts={counts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        size={size}
        onSizeChange={setSize}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Grid */}
      <GalleryGrid
        attachments={filteredAttachments}
        size={size}
        viewMode={viewMode}
      />
    </div>
  )
})
