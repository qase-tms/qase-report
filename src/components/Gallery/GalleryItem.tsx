import { ExternalLink, FileText, FileJson, FileCode, File, Image } from 'lucide-react'
import { useRootStore } from '../../store'
import type { GalleryAttachment } from '../../types/gallery'
import type { SizeOption } from './GalleryFilters'
import { Badge } from '@/components/ui/badge'
import { cn } from '../../lib/utils'

interface GalleryItemProps {
  item: GalleryAttachment
  size: SizeOption
}

const sizeConfig = {
  small: { height: 'h-[120px]', iconSize: 'h-8 w-8' },
  medium: { height: 'h-[180px]', iconSize: 'h-10 w-10' },
  large: { height: 'h-[240px]', iconSize: 'h-12 w-12' },
}

/**
 * Get appropriate icon for file type
 */
const getFileIcon = (mimeType: string | undefined, className: string) => {
  if (!mimeType) return <File className={className} />

  if (mimeType.startsWith('image/')) return <Image className={className} />
  if (mimeType === 'application/json') return <FileJson className={className} />
  if (mimeType.startsWith('text/')) return <FileText className={className} />
  if (mimeType.includes('javascript') || mimeType.includes('xml')) return <FileCode className={className} />

  return <File className={className} />
}

/**
 * Format file size to human readable
 */
const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const GalleryItem = ({ item, size }: GalleryItemProps) => {
  const { attachmentViewerStore, attachmentsStore, selectTest } = useRootStore()

  const blobUrl = attachmentsStore.getAttachmentUrl(item.attachment.id)
  const isImage = item.attachment.mime_type?.startsWith('image/')
  const config = sizeConfig[size]

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
      className={cn(
        'relative cursor-pointer rounded-lg border bg-card shadow-sm overflow-hidden',
        'transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
        'group'
      )}
    >
      {/* Status badge */}
      <div className="absolute top-2 left-2 z-10">
        <Badge variant={item.testStatus} className="text-xs capitalize">
          {item.testStatus}
        </Badge>
      </div>

      {/* Source badge */}
      <div className="absolute top-2 right-2 z-10">
        <span className="text-xs px-1.5 py-0.5 rounded bg-black/50 text-white">
          {item.source === 'test' ? 'Test' : 'Step'}
        </span>
      </div>

      {/* Preview area */}
      {isImage && blobUrl ? (
        <img
          src={blobUrl}
          alt={item.attachment.file_name}
          loading="lazy"
          className={cn(config.height, 'w-full object-cover')}
        />
      ) : (
        <div className={cn(
          config.height,
          'flex items-center justify-center bg-muted'
        )}>
          {getFileIcon(item.attachment.mime_type, cn(config.iconSize, 'text-muted-foreground'))}
        </div>
      )}

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-8">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium overflow-hidden text-ellipsis whitespace-nowrap">
              {item.attachment.file_name}
            </p>
            <p className="text-xs text-white/70 overflow-hidden text-ellipsis whitespace-nowrap">
              {item.testTitle}
            </p>
            {item.attachment.size && (
              <p className="text-xs text-white/50 mt-0.5">
                {formatFileSize(item.attachment.size)}
              </p>
            )}
          </div>
          <button
            onClick={handleNavigateToTest}
            className="text-white/70 hover:text-white transition-colors flex-shrink-0 p-1 rounded hover:bg-white/10"
            aria-label="Go to test"
            title="Go to test"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
