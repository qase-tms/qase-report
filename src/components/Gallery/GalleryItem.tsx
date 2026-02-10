import { ImageListItem, ImageListItemBar, IconButton, Box } from '@mui/material'
import { OpenInNew as OpenInNewIcon, InsertDriveFile as FileIcon } from '@mui/icons-material'
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
    <ImageListItem
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        '&:hover': { opacity: 0.9 },
      }}
    >
      {isImage && blobUrl ? (
        <img
          src={blobUrl}
          alt={item.attachment.file_name}
          loading="lazy"
          style={{
            height: 200,
            objectFit: 'cover',
          }}
        />
      ) : (
        <Box
          sx={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.800',
          }}
        >
          <FileIcon sx={{ fontSize: 48, color: 'grey.500' }} />
        </Box>
      )}
      <ImageListItemBar
        title={item.attachment.file_name}
        subtitle={item.testTitle}
        actionIcon={
          <IconButton
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            aria-label="open test"
            onClick={handleNavigateToTest}
          >
            <OpenInNewIcon />
          </IconButton>
        }
        sx={{
          '& .MuiImageListItemBar-title': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }}
      />
    </ImageListItem>
  )
}
