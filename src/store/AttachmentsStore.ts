import { makeAutoObservable } from 'mobx'
import type { RootStore } from './index'
import { ApiDataService } from '../services/ApiDataService'

/**
 * MobX store for managing attachment blob URLs with reactive state.
 * CRITICAL: Call cleanup() to prevent memory leaks from blob URLs.
 *
 * Supports two modes:
 * - File mode: Uses browser blob URLs from File API
 * - Server mode: Uses API URLs from CLI server
 */
export class AttachmentsStore {
  private attachmentUrls = new Map<string, string>()
  // Maps attachment ID to filename for server mode
  private attachmentFilenames = new Map<string, string>()

  constructor(public root: RootStore) {
    makeAutoObservable(this)
  }

  /**
   * Registers an attachment file and creates a blob URL.
   * Extracts UUID from filename format: "{uuid}-filename.ext"
   * UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (5 segments)
   *
   * @param file - File object for the attachment
   * @returns Blob URL for the attachment
   */
  registerAttachment(file: File): string {
    // Extract full UUID from filename (format: "{uuid}-filename.ext")
    // UUID has 5 segments: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const parts = file.name.split('-')
    const id = parts.slice(0, 5).join('-')
    const url = URL.createObjectURL(file)

    this.attachmentUrls.set(id, url)
    return url
  }

  /**
   * Registers an attachment filename for server mode.
   * In server mode, attachments are served via API instead of blob URLs.
   *
   * @param id - Attachment UUID
   * @param filename - Filename on the server (from file_path)
   */
  registerAttachmentFilename(id: string, filename: string): void {
    this.attachmentFilenames.set(id, filename)
  }

  /**
   * Gets URL for an attachment by its ID.
   * In server mode (attachmentsBasePath set), returns API URL.
   * In file mode, returns blob URL from File API.
   *
   * @param id - Attachment UUID
   * @returns URL or undefined if not registered
   */
  getAttachmentUrl(id: string): string | undefined {
    // Server mode: use API URLs
    if (this.root.attachmentsBasePath) {
      const filename = this.attachmentFilenames.get(id)
      if (filename) {
        const apiService = new ApiDataService()
        return apiService.getAttachmentUrl(filename)
      }
      return undefined
    }

    // File mode: use blob URLs
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
    this.attachmentFilenames.clear()
  }
}
