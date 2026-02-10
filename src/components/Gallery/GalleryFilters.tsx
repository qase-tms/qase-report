import { Box, Chip } from '@mui/material'

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
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
      {filters.map(filter => (
        <Chip
          key={filter.value}
          label={filter.label}
          color={activeFilter === filter.value ? 'primary' : 'default'}
          onClick={() => onFilterChange(filter.value)}
          size="small"
        />
      ))}
    </Box>
  )
}
