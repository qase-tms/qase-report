import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { ImageViewer } from './ImageViewer'
import { TextViewer } from './TextViewer'

/**
 * Main attachment viewer component.
 * Routes to appropriate viewer based on MIME type.
 * Renders at app level, controlled by AttachmentViewerStore.
 */
export const AttachmentViewer = observer(() => {
  const { attachmentViewerStore } = useRootStore()
  const {
    viewerOpen,
    currentAttachment,
    attachmentList,
    currentIndex,
    isImage,
    isText,
  } = attachmentViewerStore

  if (!viewerOpen || !currentAttachment) return null

  // Route to appropriate viewer based on MIME type
  if (isImage) {
    return (
      <ImageViewer
        attachments={attachmentList}
        initialIndex={currentIndex}
        open={viewerOpen}
        onClose={() => attachmentViewerStore.closeViewer()}
        onIndexChange={(index) => attachmentViewerStore.setCurrentIndex(index)}
      />
    )
  }

  if (isText) {
    return (
      <TextViewer
        attachment={currentAttachment}
        open={viewerOpen}
        onClose={() => attachmentViewerStore.closeViewer()}
      />
    )
  }

  // For unsupported types, close viewer (download handled separately)
  attachmentViewerStore.closeViewer()
  return null
})
