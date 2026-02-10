import { ImageList, useTheme, useMediaQuery } from '@mui/material'
import { GalleryItem } from './GalleryItem'
import type { GalleryAttachment } from '../../types/gallery'

interface GalleryGridProps {
  attachments: GalleryAttachment[]
}

export const GalleryGrid = ({ attachments }: GalleryGridProps) => {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'))

  const cols = isXs ? 1 : isSm ? 2 : isMd ? 3 : 4

  return (
    <ImageList cols={cols} gap={16}>
      {attachments.map((attachment, index) => (
        <GalleryItem key={`${attachment.attachment.id}-${index}`} item={attachment} />
      ))}
    </ImageList>
  )
}
