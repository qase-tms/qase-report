import { ExternalLink, FileText } from 'lucide-react'
import { useRootStore } from '../../store'
import type { GalleryAttachment } from '../../types/gallery'

interface GalleryItemProps {
  item: GalleryAttachment
}

export const GalleryItem = ({ item }: GalleryItemProps) => {
  const { attachmentViewerStore, attachmentsStore, selectTest } = useRootStore()

  const blobUrl = attachmentsStore.getAttachmentUrl(item.attachment.id)
  const isImage = item.attachment.mime_type?.startsWith('image/')

  const handleClick = () => {
    attachmentViewerStore.openViewer(item.attachment)
  }

  const handleNavigateToTest = (e: React.MouseEvent) => {
    e.stopPropagation()
    selectTest(item.testId)
  }

  return (
    <div
      onClick={handleClick}
      className="relative cursor-pointer hover:opacity-90 transition-opacity"
    >
      {isImage && blobUrl ? (
        <img
          src={blobUrl}
          alt={item.attachment.file_name}
          loading="lazy"
          className="h-[200px] w-full object-cover"
        />
      ) : (
        <div className="h-[200px] flex items-center justify-center bg-gray-800">
          <FileText className="h-12 w-12 text-gray-500" />
        </div>
      )}

      {/* Image list item bar overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white overflow-hidden text-ellipsis whitespace-nowrap">
              {item.attachment.file_name}
            </p>
            <p className="text-xs text-white/70 overflow-hidden text-ellipsis whitespace-nowrap">
              {item.testTitle}
            </p>
          </div>
          <button
            onClick={handleNavigateToTest}
            className="text-white/70 hover:text-white transition-colors flex-shrink-0"
            aria-label="open test"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
