import { makeAutoObservable } from 'mobx'
import type { RootStore } from './index'
import type { Attachment } from '../schemas/Attachment.schema'

/**
 * MobX store for attachment viewer state.
 * Manages which attachment is being viewed and gallery navigation.
 */
export class AttachmentViewerStore {
  currentAttachment: Attachment | null = null
  attachmentList: Attachment[] = []
  currentIndex = 0
  viewerOpen = false

  constructor(public root: RootStore) {
    makeAutoObservable(this)
  }

  /**
   * Opens the viewer for an attachment.
   * Optionally accepts related attachments for gallery navigation.
   */
  openViewer(attachment: Attachment, relatedAttachments: Attachment[] = []) {
    this.currentAttachment = attachment
    this.attachmentList = relatedAttachments.length > 0 ? relatedAttachments : [attachment]
    this.currentIndex = Math.max(0, this.attachmentList.findIndex(a => a.id === attachment.id))
    this.viewerOpen = true
  }

  /**
   * Closes the viewer and clears state.
   */
  closeViewer() {
    this.currentAttachment = null
    this.attachmentList = []
    this.currentIndex = 0
    this.viewerOpen = false
  }

  /**
   * Updates current index for gallery navigation.
   */
  setCurrentIndex(index: number) {
    this.currentIndex = index
    this.currentAttachment = this.attachmentList[index] || null
  }

  /**
   * Returns true if current attachment is an image.
   */
  get isImage(): boolean {
    return this.currentAttachment?.mime_type?.startsWith('image/') ?? false
  }

  /**
   * Returns true if current attachment is text.
   */
  get isText(): boolean {
    return this.currentAttachment?.mime_type?.startsWith('text/') ?? false
  }

  /**
   * Returns all image attachments from the list (for lightbox gallery).
   */
  get imageAttachments(): Attachment[] {
    return this.attachmentList.filter(a => a.mime_type?.startsWith('image/'))
  }
}
