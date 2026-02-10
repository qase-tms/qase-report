import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Box, Typography, Paper } from '@mui/material'
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          color: 'text.secondary',
        }}
      >
        No report loaded
      </Box>
    )
  }

  const allAttachments = analyticsStore.galleryAttachments

  // No attachments
  if (allAttachments.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Gallery
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No attachments found in this report.
          </Typography>
        </Paper>
      </Box>
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Gallery
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {filteredAttachments.length} attachment{filteredAttachments.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      <GalleryFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />
      <GalleryGrid attachments={filteredAttachments} />
    </Box>
  )
})
