import { makeAutoObservable } from 'mobx'
import type { RootStore } from './index'

/**
 * MobX store for managing attachment blob URLs with reactive state.
 * CRITICAL: Call cleanup() to prevent memory leaks from blob URLs.
 */
export class AttachmentsStore {
  private attachmentUrls = new Map<string, string>()

  constructor(public root: RootStore) {
    makeAutoObservable(this)
  }

  /**
   * Registers an attachment file and creates a blob URL.
   * Extracts UUID from filename format: "{uuid}-filename.ext"
   *
   * @param file - File object for the attachment
   * @returns Blob URL for the attachment
   */
  registerAttachment(file: File): string {
    // Extract UUID from filename (format: "{uuid}-filename.ext")
    const id = file.name.split('-')[0]
    const url = URL.createObjectURL(file)

    this.attachmentUrls.set(id, url)
    return url
  }

  /**
   * Gets blob URL for an attachment by its ID.
   *
   * @param id - Attachment UUID
   * @returns Blob URL or undefined if not registered
   */
  getAttachmentUrl(id: string): string | undefined {
    return this.attachmentUrls.get(id)
  }

  /**
   * Revokes all blob URLs and clears the registry.
   * CRITICAL: Must be called to prevent memory leaks.
   * Use in React component cleanup (useEffect return function).
   */
  cleanup(): void {
    for (const url of this.attachmentUrls.values()) {
      URL.revokeObjectURL(url)
    }
    this.attachmentUrls.clear()
  }
}
