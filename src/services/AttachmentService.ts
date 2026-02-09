/**
 * Service for managing attachment blob URLs.
 *
 * Creates and manages blob URLs for attachment files, providing
 * memory-safe URL lifecycle management with cleanup to prevent leaks.
 *
 * CRITICAL: Always call cleanup() when attachments are no longer needed
 * (e.g., on component unmount or when loading new report) to prevent
 * memory leaks from unreleased blob URLs.
 */
export class AttachmentService {
  /**
   * Map of attachment ID to blob URL.
   * Private to enforce cleanup through public methods.
   */
  private blobUrls: Map<string, string> = new Map()

  /**
   * Creates a blob URL for an attachment file and stores it.
   *
   * The blob URL allows the browser to display the file content
   * without accessing the original file path (which is blocked by
   * browser security).
   *
   * @param id - Unique identifier for the attachment
   * @param file - File object to create blob URL from
   * @returns Blob URL that can be used in img src, video src, etc.
   *
   * @example
   * const url = attachmentService.registerAttachment('abc-123', imageFile)
   * // url can be used: <img src={url} />
   */
  registerAttachment(id: string, file: File): string {
    const url = URL.createObjectURL(file)
    this.blobUrls.set(id, url)
    return url
  }

  /**
   * Retrieves the blob URL for a previously registered attachment.
   *
   * @param id - Attachment identifier
   * @returns Blob URL if attachment was registered, undefined otherwise
   */
  getAttachmentUrl(id: string): string | undefined {
    return this.blobUrls.get(id)
  }

  /**
   * Revokes all blob URLs and clears the registry.
   *
   * CRITICAL: Call this method when attachments are no longer needed to
   * prevent memory leaks. Blob URLs persist in memory until explicitly
   * revoked or the page unloads.
   *
   * @example
   * // In React component
   * useEffect(() => {
   *   return () => {
   *     attachmentService.cleanup() // Cleanup on unmount
   *   }
   * }, [])
   */
  cleanup(): void {
    // Revoke all blob URLs to free memory
    this.blobUrls.forEach((url) => URL.revokeObjectURL(url))
    // Clear the map
    this.blobUrls.clear()
  }
}
