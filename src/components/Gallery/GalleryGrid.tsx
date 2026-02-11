import { GalleryItem } from './GalleryItem'
import type { GalleryAttachment } from '../../types/gallery'

interface GalleryGridProps {
  attachments: GalleryAttachment[]
}

export const GalleryGrid = ({ attachments }: GalleryGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {attachments.map((attachment, index) => (
        <GalleryItem key={`${attachment.attachment.id}-${index}`} item={attachment} />
      ))}
    </div>
  )
}
