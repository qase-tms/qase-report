# Phase 6: Attachments Viewer - Research

**Researched:** 2026-02-09
**Domain:** React image/file viewer, syntax highlighting, browser downloads
**Confidence:** HIGH

## Summary

Phase 6 requires implementing three distinct viewer capabilities: (1) image viewer with zoom for screenshots, (2) text viewer with syntax highlighting for logs, and (3) download functionality for all attachment types. The existing codebase already has basic inline image previews and supports both base64 and file path sources.

**Primary recommendation:** Use yet-another-react-lightbox for image viewing (modern, actively maintained, TypeScript native), Prism.js via prism-react-renderer for syntax highlighting (lightweight, optimal bundle size), and native browser APIs for downloads (URL.createObjectURL with proper cleanup).

**Key constraint:** Static HTML export capability (critical for Phase 7) means all features must work offline without external dependencies at runtime. Base64 content support is already implemented and must be preserved.

## Standard Stack

### Core Libraries

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| yet-another-react-lightbox | 3.x | Image lightbox with zoom | Modern, performant, TypeScript native, actively maintained, React 18+ compatible, plugin architecture |
| prism-react-renderer | 2.x | Syntax highlighting | Lightweight (~2KB core), optimal bundle size, vendored Prism, actively maintained, render-props pattern |
| Native Browser APIs | - | File downloads | Zero dependencies, universal browser support, no library needed |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| prismjs | 1.29+ | Syntax engine | Direct integration if more control needed than prism-react-renderer provides |
| @mui/material Dialog | 5.x (existing) | Text viewer modal | Already in project, use for non-image modals |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| yet-another-react-lightbox | react-image-lightbox | Older, less maintained, no TypeScript native support |
| prism-react-renderer | react-syntax-highlighter | 10x larger bundle (~500KB vs ~50KB), poorly maintained, Next.js SSG issues |
| prism-react-renderer | highlight.js | Larger bundle (~1.6MB for 34 languages), less modular |
| prism-react-renderer | shiki/react-shiki | Excellent but heavy (~700KB+ gzipped), overkill for log files |

**Installation:**
```bash
npm install yet-another-react-lightbox prism-react-renderer prismjs
```

## Architecture Patterns

### Recommended Component Structure
```
src/components/
├── AttachmentViewer/
│   ├── index.tsx                    # Main viewer orchestrator
│   ├── ImageViewer.tsx              # Lightbox wrapper
│   ├── TextViewer.tsx               # Syntax-highlighted text modal
│   ├── DownloadButton.tsx           # Reusable download component
│   └── AttachmentTypeRouter.tsx     # MIME type router
```

### Pattern 1: MIME Type-Based Viewer Router

**What:** Route attachment display based on MIME type prefix
**When to use:** When supporting multiple attachment types from a single entry point
**Example:**
```typescript
// Source: Common pattern from web search findings + existing codebase
const AttachmentViewer = ({ attachment, onClose }: Props) => {
  const isImage = attachment.mime_type?.startsWith('image/')
  const isText = attachment.mime_type?.startsWith('text/')

  if (isImage) return <ImageViewer attachment={attachment} onClose={onClose} />
  if (isText) return <TextViewer attachment={attachment} onClose={onClose} />

  // Fallback: download-only view
  return <DownloadOnlyView attachment={attachment} onClose={onClose} />
}
```

### Pattern 2: Dual-Source Image Loading

**What:** Support both base64 content and file paths for static HTML export
**When to use:** When supporting offline/exported HTML (Phase 7 requirement)
**Example:**
```typescript
// Source: Existing pattern from TestStepAttachment.tsx + yet-another-react-lightbox docs
const getImageSource = (attachment: Attachment): string => {
  // Prefer base64 for static export compatibility
  if (attachment.content) {
    return `data:${attachment.mime_type};base64,${attachment.content}`
  }
  // Fallback to file path for dev/runtime
  return attachment.file_path
}

// Usage with yet-another-react-lightbox
const slides = attachments.map(att => ({
  src: getImageSource(att),
  alt: att.file_name,
  downloadUrl: getImageSource(att),
  downloadFilename: att.file_name,
}))
```

### Pattern 3: URL.createObjectURL with useEffect Cleanup

**What:** Create blob URLs for downloads, revoke in cleanup function
**When to use:** When downloading base64 content or handling large files
**Example:**
```typescript
// Source: MDN + React best practices from web search
const useDownloadUrl = (attachment: Attachment | null) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!attachment?.content) {
      setBlobUrl(null)
      return
    }

    // Decode base64 to binary
    const binary = atob(attachment.content)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    // Create blob and URL
    const blob = new Blob([bytes], { type: attachment.mime_type })
    const url = URL.createObjectURL(blob)
    setBlobUrl(url)

    // Cleanup function
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [attachment])

  return blobUrl
}
```

### Pattern 4: MobX State for Viewer Control

**What:** Store current attachment and viewer state in MobX store
**When to use:** When viewer needs to be triggered from multiple locations (test details, test steps)
**Example:**
```typescript
// Source: MobX patterns + project architecture
class AttachmentStore {
  currentAttachment: Attachment | null = null
  viewerOpen = false

  constructor() {
    makeAutoObservable(this)
  }

  openViewer(attachment: Attachment) {
    this.currentAttachment = attachment
    this.viewerOpen = true
  }

  closeViewer() {
    this.currentAttachment = null
    this.viewerOpen = false
  }
}

// In component
const AttachmentChip = observer(({ attachment }: Props) => {
  const { attachmentStore } = useRootStore()

  return (
    <Chip
      onClick={() => attachmentStore.openViewer(attachment)}
      label={attachment.file_name}
    />
  )
})
```

### Pattern 5: Language Detection for Syntax Highlighting

**What:** Map file extensions to Prism language identifiers
**When to use:** When highlighting log files without explicit language metadata
**Example:**
```typescript
// Source: Prism.js docs + common patterns
const detectLanguage = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase()

  const languageMap: Record<string, string> = {
    'log': 'log',
    'txt': 'markup',
    'json': 'json',
    'xml': 'xml',
    'html': 'markup',
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'java': 'java',
    'sh': 'bash',
  }

  return languageMap[ext || ''] || 'markup' // Default to markup for plain text
}
```

### Anti-Patterns to Avoid

- **Don't use inline styles for syntax highlighting in production** - Use Prism themes via CSS imports for consistency and performance
- **Don't create blob URLs without cleanup** - Always revoke in useEffect cleanup to prevent memory leaks
- **Don't hand-roll image zoom** - Complex touch/pinch gestures are error-prone, use proven library
- **Don't load all Prism languages upfront** - Import only needed languages to minimize bundle size
- **Don't assume MIME types are accurate** - Fall back to file extension detection for syntax highlighting

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image zoom/pan | Custom transform logic with touch handlers | yet-another-react-lightbox with Zoom plugin | Touch gestures (pinch, pan, double-tap) have platform-specific quirks; keyboard navigation (arrows, Esc) requires accessibility; preloading logic for galleries is complex |
| Syntax highlighting | Regex-based tokenization | Prism.js / prism-react-renderer | Language grammars are complex (nested contexts, multi-line patterns); edge cases in escaping/strings cause bugs; 200+ languages already supported |
| File downloads | Manual link creation and cleanup | Browser download APIs with blob URLs | Browser compatibility issues (Safari quirks); memory management (revoke timing); MIME type detection edge cases |
| Lightbox keyboard nav | Custom event listeners | yet-another-react-lightbox | Focus trap logic for accessibility; Esc/Arrow key conflicts with page; screen reader announcements |

**Key insight:** All three features (zoom, highlighting, downloads) appear simple but have significant edge cases. Yet-another-react-lightbox handles 10+ browser-specific issues, Prism handles 200+ language grammars, and proper blob URL management prevents memory leaks that only appear in production.

## Common Pitfalls

### Pitfall 1: Memory Leaks from Unreleased Blob URLs

**What goes wrong:** Creating blob URLs with URL.createObjectURL() but never calling URL.revokeObjectURL() causes memory to accumulate as users view attachments, eventually degrading performance or crashing the browser.

**Why it happens:** Developers forget blob URLs persist until explicitly revoked or window unloads. Each unreleased URL keeps binary data in memory.

**How to avoid:** Always create blob URLs inside useEffect and return cleanup function that revokes the URL. Use custom hook to encapsulate pattern.

**Warning signs:** Memory usage increases when opening/closing viewers repeatedly; browser DevTools Memory Profiler shows growing heap.

### Pitfall 2: Large Bundle Size from Full Syntax Highlighting Libraries

**What goes wrong:** Importing react-syntax-highlighter or full Prism builds adds 500KB-2.5MB to bundle, dramatically increasing page load time.

**Why it happens:** Default imports include all 200+ language grammars and styles. Developers don't realize light builds exist.

**How to avoid:** Use prism-react-renderer (vendored subset) or Prism.js with babel-plugin-prismjs to include only needed languages. Import language files dynamically if supporting many formats.

**Warning signs:** Bundle size exceeds 200KB gzipped; Lighthouse performance score drops; slow initial page load on 3G.

### Pitfall 3: Line Number Misalignment with Wrapped Text

**What goes wrong:** When combining line numbers with text wrapping in syntax highlighters, line numbers don't align properly with wrapped content. Long lines show one line number but span multiple visual lines.

**Why it happens:** CSS display: flex conflicts between line numbers and wrapped text. Known issue in react-syntax-highlighter (#376, #435).

**How to avoid:** Either show line numbers WITHOUT wrapping (overflow-x: auto) OR wrap without line numbers. Don't combine both. For log files, wrapping is usually more important than line numbers.

**Warning signs:** Line numbers "float" or misalign when resizing window; GitHub issues mention wrapLongLines + showLineNumbers together.

### Pitfall 4: Broken Images in Static HTML Export

**What goes wrong:** Image viewer works in dev but images don't load in exported static HTML because file paths are relative or external.

**Why it happens:** Lightbox libraries default to URL-based image sources. File paths break when HTML is moved or opened from file://.

**How to avoid:** Prioritize base64 content over file paths in getImageSource(). Ensure export process (Phase 7) embeds all images as base64. Test exported HTML by opening directly in browser (file:// protocol).

**Warning signs:** Images work on dev server but not in exported HTML; browser console shows "Failed to load resource" errors.

### Pitfall 5: Missing Accessibility (Keyboard Navigation, Screen Readers)

**What goes wrong:** Custom viewers are mouse-only, breaking accessibility for keyboard users and screen readers.

**Why it happens:** Developers test with mouse/trackpad only. Forget arrow keys, Esc, focus management, ARIA labels.

**How to avoid:** Use libraries with built-in accessibility (yet-another-react-lightbox supports keyboard nav). Test with keyboard only (Tab, Arrow, Esc, Enter). Add ARIA labels to download buttons and viewer containers.

**Warning signs:** Can't close viewer with Esc key; can't navigate images with arrows; screen reader announces "blank" instead of image names.

### Pitfall 6: Prism.js Language Not Auto-Detected

**What goes wrong:** Expecting Prism to auto-detect language from code content, but it requires explicit language specification.

**Why it happens:** Prism doesn't have built-in auto-detection (unlike Highlight.js). Developers assume it's automatic.

**How to avoid:** Build language detection from file extension (see Pattern 5). Map common extensions (.log, .json, .txt) to Prism language names. Provide default fallback ('markup' for plain text).

**Warning signs:** All code blocks render without syntax highlighting; Prism theme loads but no colors appear.

## Code Examples

Verified patterns from official sources and best practices:

### Image Viewer with yet-another-react-lightbox

```typescript
// Source: https://yet-another-react-lightbox.com/ + https://yet-another-react-lightbox.com/plugins
import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import Download from "yet-another-react-lightbox/plugins/download"
import "yet-another-react-lightbox/styles.css"
import type { Attachment } from '../../schemas/Attachment.schema'

interface ImageViewerProps {
  attachments: Attachment[]
  initialIndex: number
  open: boolean
  onClose: () => void
}

export const ImageViewer = ({ attachments, initialIndex, open, onClose }: ImageViewerProps) => {
  const slides = attachments
    .filter(att => att.mime_type?.startsWith('image/'))
    .map(att => ({
      src: att.content
        ? `data:${att.mime_type};base64,${att.content}`
        : att.file_path,
      alt: att.file_name,
      downloadUrl: att.content
        ? `data:${att.mime_type};base64,${att.content}`
        : att.file_path,
      downloadFilename: att.file_name,
    }))

  return (
    <Lightbox
      open={open}
      close={onClose}
      slides={slides}
      index={initialIndex}
      plugins={[Zoom, Download]}
      zoom={{
        maxZoomPixelRatio: 3,
        scrollToZoom: true,
      }}
    />
  )
}
```

### Text Viewer with Syntax Highlighting

```typescript
// Source: https://github.com/FormidableLabs/prism-react-renderer + MUI Dialog patterns
import { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
import { Highlight, themes } from 'prism-react-renderer'
import type { Attachment } from '../../schemas/Attachment.schema'

const detectLanguage = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    'log': 'log', 'txt': 'markup', 'json': 'json',
    'xml': 'xml', 'html': 'markup', 'js': 'javascript',
  }
  return languageMap[ext || ''] || 'markup'
}

interface TextViewerProps {
  attachment: Attachment
  open: boolean
  onClose: () => void
}

export const TextViewer = ({ attachment, open, onClose }: TextViewerProps) => {
  const [content, setContent] = useState<string>('')

  useEffect(() => {
    if (!attachment.content) return

    // Decode base64 content
    try {
      const decoded = atob(attachment.content)
      setContent(decoded)
    } catch (error) {
      console.error('Failed to decode attachment content:', error)
      setContent('Error: Failed to decode content')
    }
  }, [attachment])

  const language = detectLanguage(attachment.file_name)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{attachment.file_name}</DialogTitle>
      <DialogContent>
        <Highlight theme={themes.github} code={content} language={language}>
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre style={{
              ...style,
              padding: 16,
              borderRadius: 4,
              overflow: 'auto',
              maxHeight: '70vh',
            }}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
```

### Download Button with Proper Cleanup

```typescript
// Source: MDN URL.createObjectURL docs + React cleanup patterns
import { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import { Download as DownloadIcon } from '@mui/icons-material'
import type { Attachment } from '../../schemas/Attachment.schema'

interface DownloadButtonProps {
  attachment: Attachment
  variant?: 'text' | 'outlined' | 'contained'
}

export const DownloadButton = ({ attachment, variant = 'outlined' }: DownloadButtonProps) => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!attachment.content) {
      // Use file path directly if no base64 content
      setDownloadUrl(attachment.file_path)
      return
    }

    // Create blob from base64 content
    try {
      const binary = atob(attachment.content)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }

      const blob = new Blob([bytes], { type: attachment.mime_type })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)

      // Cleanup function
      return () => {
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to create download URL:', error)
    }
  }, [attachment])

  if (!downloadUrl) return null

  return (
    <Button
      variant={variant}
      startIcon={<DownloadIcon />}
      component="a"
      href={downloadUrl}
      download={attachment.file_name}
    >
      Download
    </Button>
  )
}
```

### MobX Store for Viewer State

```typescript
// Source: MobX patterns + project store/index.tsx structure
import { makeAutoObservable } from 'mobx'
import type { Attachment } from '../schemas/Attachment.schema'

export class AttachmentStore {
  currentAttachment: Attachment | null = null
  attachmentList: Attachment[] = []
  currentIndex = 0
  viewerOpen = false

  constructor() {
    makeAutoObservable(this)
  }

  openViewer(attachment: Attachment, relatedAttachments: Attachment[] = []) {
    this.currentAttachment = attachment
    this.attachmentList = relatedAttachments.length > 0 ? relatedAttachments : [attachment]
    this.currentIndex = relatedAttachments.indexOf(attachment)
    this.viewerOpen = true
  }

  closeViewer() {
    this.currentAttachment = null
    this.attachmentList = []
    this.currentIndex = 0
    this.viewerOpen = false
  }
}

// Add to RootStore
export class RootStore {
  attachmentStore: AttachmentStore

  constructor() {
    this.attachmentStore = new AttachmentStore()
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-image-lightbox | yet-another-react-lightbox | 2022-2023 | TypeScript native, better plugin system, actively maintained |
| react-syntax-highlighter full build | prism-react-renderer or light builds | 2024-2025 | 90% smaller bundle size (50KB vs 500KB) |
| Manual blob URL management | useEffect cleanup pattern | 2020+ (React Hooks) | Prevents memory leaks automatically |
| Highlight.js for React | Prism.js with React wrapper | 2023-2024 | Lighter weight, more modular (2KB vs 1.6MB) |
| Ignoring accessibility | Built-in keyboard nav + ARIA | 2023+ (WCAG focus) | Required for compliance, better UX |

**Deprecated/outdated:**
- **react-image-lightbox**: Still works but no longer maintained, lacks TypeScript native support
- **simple-react-lightbox**: Archived, use yet-another-react-lightbox instead
- **react-syntax-highlighter default import**: Use light builds or prism-react-renderer for bundle size
- **Mounted flags for async cleanup**: Use AbortController for fetch requests instead of `isMounted` pattern

## Open Questions

1. **What file types beyond images and text will appear in attachments?**
   - What we know: Schema supports any MIME type, mentions videos in attachment comments
   - What's unclear: Will Phase 6 need video playback or just download? Will PDFs appear?
   - Recommendation: Implement image + text + download-only for Phase 6. Defer video/PDF viewers to future phases if needed. Download button works for all types.

2. **Should syntax highlighting support theme switching (light/dark)?**
   - What we know: MUI theme already in project (App.tsx ThemeProvider)
   - What's unclear: User requirement for theme toggle not mentioned in requirements
   - Recommendation: Use single theme (Prism 'github' theme) for Phase 6. Add theme switching in Phase 8 (Polish) if requested.

3. **Should lightbox support gallery navigation across all test step attachments?**
   - What we know: Attachments accessible from test details and steps (requirement ATCH-03)
   - What's unclear: Should clicking image in step 2 show only step 2 images, or all test images?
   - Recommendation: Show all test images in gallery (pass full attachment list to lightbox). Users can navigate with arrows. Matches common lightbox UX.

4. **What's the maximum expected attachment size?**
   - What we know: Base64 encoding increases size by ~33%; browser blob URLs recommended for >50MB
   - What's unclear: Will test attachments be 10KB, 10MB, or 100MB+ in practice?
   - Recommendation: Implement blob URL approach (handles any size). If performance issues arise, add size threshold warning in Phase 8.

## Sources

### Primary (HIGH confidence)
- [Yet Another React Lightbox - Official Docs](https://yet-another-react-lightbox.com/) - Features, plugins, TypeScript support verified
- [Yet Another React Lightbox - npm](https://www.npmjs.com/package/yet-another-react-lightbox) - Version, React compatibility, install command
- [Yet Another React Lightbox - Download Plugin](https://yet-another-react-lightbox.com/plugins/download) - Download button implementation
- [Yet Another React Lightbox - Zoom Plugin](https://yet-another-react-lightbox.com/plugins/zoom) - Zoom capabilities
- [prism-react-renderer - GitHub](https://github.com/FormidableLabs/prism-react-renderer) - Maintenance status, React integration
- [prism-react-renderer - npm](https://www.npmjs.com/package/prism-react-renderer) - Installation, version info
- [Prism.js - Official Site](https://prismjs.com/) - Language support, plugins, core features
- [MDN - URL.revokeObjectURL()](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static) - Official cleanup API docs

### Secondary (MEDIUM confidence)
- [The best code highlighting libraries for React | Front End Engineering](https://www.frontendeng.dev/blog/2-best-code-highlighting-libraries-for-react) - Comparison of react-syntax-highlighter, Prism, Highlight.js
- [Prism.js vs Highlight.js bundle size benchmark](https://www.peterbe.com/plog/benchmark-compare-highlight.js-vs-prism) - Performance comparison
- [React Accessibility Best Practices - BrowserStack](https://www.browserstack.com/guide/react-accessibility) - Keyboard navigation, ARIA guidelines
- [Understanding Memory Leaks in React | Medium](https://medium.com/@ignatovich.dm/understanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be) - Cleanup patterns, useEffect best practices
- [Comparing top React lightbox libraries - LogRocket](https://blog.logrocket.com/comparing-the-top-3-react-lightbox-libraries/) - Library comparison, use cases
- [JavaScript How to Download Base64 File - Complete Guide](https://copyprogramming.com/howto/javascript-how-to-download-base64-file-using-javascript) - Blob URL vs data URI approaches
- [MobX State Management in React - Nearform](https://nearform.com/insights/mobx-state-management-in-react/) - MobX patterns, 2026 status

### Tertiary (LOW confidence - flagged for validation)
- GitHub issues about react-syntax-highlighter line wrapping bugs (#376, #435) - Known issues, needs verification if using that library
- Prism.js language auto-detection (Issue #1313) - Confirms no built-in auto-detect, requires manual mapping

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via npm, official docs, and recent maintenance status
- Architecture: HIGH - Patterns based on official examples, MUI docs, existing codebase structure
- Pitfalls: MEDIUM-HIGH - Based on real GitHub issues, blog posts, and MDN warnings; some extrapolated from common patterns

**Research date:** 2026-02-09
**Valid until:** ~30 days (2026-03-09) - Libraries are stable/mature, but check for security updates before implementation
