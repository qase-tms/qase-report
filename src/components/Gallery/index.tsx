import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { categorizeAttachment } from '../../types/gallery'
import { GalleryFilters } from './GalleryFilters'
import { GalleryGrid } from './GalleryGrid'

export const Gallery = observer(() => {
  const { analyticsStore, reportStore } = useRootStore()
  const [activeFilter, setActiveFilter] = useState<'all' | 'screenshots' | 'logs' | 'other'>('all')

  // No report loaded
  if (!reportStore.runData) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-muted-foreground">
        No report loaded
      </div>
    )
  }

  const allAttachments = analyticsStore.galleryAttachments

  // No attachments
  if (allAttachments.length === 0) {
    return (
      <div className="p-6">
        <h5 className="text-xl font-semibold mb-4">
          Gallery
        </h5>
        <div className="bg-card rounded-lg border shadow-sm p-6 text-center">
          <p className="text-muted-foreground">
            No attachments found in this report.
          </p>
        </div>
      </div>
    )
  }

  // Filter attachments based on activeFilter
  const filteredAttachments = activeFilter === 'all'
    ? allAttachments
    : allAttachments.filter(item => {
        const category = categorizeAttachment(item.attachment.mime_type)
        return category === activeFilter
      })

  // Calculate counts for each category
  const counts = {
    all: allAttachments.length,
    screenshots: allAttachments.filter(item => categorizeAttachment(item.attachment.mime_type) === 'screenshots').length,
    logs: allAttachments.filter(item => categorizeAttachment(item.attachment.mime_type) === 'logs').length,
    other: allAttachments.filter(item => categorizeAttachment(item.attachment.mime_type) === 'other').length,
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h5 className="text-xl font-semibold mb-2">
          Gallery
        </h5>
        <p className="text-sm text-muted-foreground">
          {filteredAttachments.length} attachment{filteredAttachments.length !== 1 ? 's' : ''}
        </p>
      </div>
      <GalleryFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />
      <GalleryGrid attachments={filteredAttachments} />
    </div>
  )
})
