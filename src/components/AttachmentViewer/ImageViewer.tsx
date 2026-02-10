import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import type { Attachment } from '../../schemas/Attachment.schema'
import { useRootStore } from '../../store'

interface ImageViewerProps {
  attachments: Attachment[]
  initialIndex: number
  open: boolean
  onClose: () => void
  onIndexChange: (index: number) => void
}

/**
 * Image viewer with lightbox and zoom capability.
 * Uses yet-another-react-lightbox for modern TypeScript-native implementation.
 */
export const ImageViewer = ({
  attachments,
  initialIndex,
  open,
  onClose,
  onIndexChange,
}: ImageViewerProps) => {
  const { attachmentsStore } = useRootStore()

  /**
   * Helper to get image source.
   * Priority: base64 content > blob URL from store > file_path fallback
   */
  const getImageSource = (attachment: Attachment): string => {
    if (attachment.content) {
      return `data:${attachment.mime_type};base64,${attachment.content}`
    }
    const blobUrl = attachmentsStore.getAttachmentUrl(attachment.id)
    if (blobUrl) {
      return blobUrl
    }
    return attachment.file_path
  }

  const imageAttachments = attachments.filter((a) =>
    a.mime_type?.startsWith('image/')
  )

  const slides = imageAttachments.map((att) => ({
    src: getImageSource(att),
    alt: att.file_name,
  }))

  return (
    <Lightbox
      open={open}
      close={onClose}
      slides={slides}
      index={initialIndex}
      on={{ view: ({ index }) => onIndexChange(index) }}
      plugins={[Zoom]}
      zoom={{
        maxZoomPixelRatio: 3,
        scrollToZoom: true,
      }}
    />
  )
}
