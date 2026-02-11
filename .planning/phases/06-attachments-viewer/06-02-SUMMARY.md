---
phase: 06-attachments-viewer
plan: 02
subsystem: attachment-viewer
tags: [ui-components, lightbox, syntax-highlighting, viewer]
dependency_graph:
  requires:
    - AttachmentViewerStore (06-01)
    - Lightbox library (06-01)
    - Syntax highlighter (06-01)
    - TestStepAttachment component (05-01)
    - MainLayout (existing)
  provides:
    - ImageViewer with zoom capability
    - TextViewer with syntax highlighting
    - DownloadButton with memory cleanup
    - AttachmentViewer orchestrator
    - Clickable attachments in test steps
  affects:
    - TestStepAttachment (added click handlers and download button)
    - MainLayout (renders AttachmentViewer globally)
tech_stack:
  added: []
  patterns:
    - MIME type routing in orchestrator
    - Blob URL creation with cleanup in useEffect
    - Prism language detection from file extensions
    - Lightbox gallery navigation
    - Observer pattern for store integration
key_files:
  created:
    - src/components/AttachmentViewer/index.tsx
    - src/components/AttachmentViewer/ImageViewer.tsx
    - src/components/AttachmentViewer/TextViewer.tsx
    - src/components/AttachmentViewer/DownloadButton.tsx
  modified:
    - src/components/TestDetails/TestStepAttachment.tsx
    - src/layout/MainLayout/index.tsx
decisions:
  - choice: "Blob URL with cleanup in useEffect return"
    rationale: "Prevents memory leaks by revoking object URLs when component unmounts"
  - choice: "Render AttachmentViewer at app level (after Grid)"
    rationale: "Ensures viewer overlays entire app, controlled by global store state"
  - choice: "Make both chip and image thumbnail clickable"
    rationale: "Provides multiple interaction points for better UX"
  - choice: "Show DownloadButton for all attachment types"
    rationale: "Allows downloading even for non-viewable formats"
  - choice: "File extension mapping for Prism languages"
    rationale: "Provides syntax highlighting for common file types (log, json, xml, py, etc.)"
metrics:
  duration_seconds: 122
  tasks_completed: 2
  files_created: 4
  files_modified: 2
  commits: 2
  completed_at: "2026-02-09T18:03:51Z"
---

# Phase 06 Plan 02: Attachments Viewer UI Summary

**One-liner:** Created ImageViewer, TextViewer, and DownloadButton components with AttachmentViewer orchestrator integrated into app for viewing screenshots with zoom and text files with syntax highlighting.

## Tasks Completed

| # | Task Name | Commit | Files |
|---|-----------|--------|-------|
| 1 | Create viewer components | f467d79 | ImageViewer.tsx, TextViewer.tsx, DownloadButton.tsx |
| 2 | Create orchestrator and integrate | 56f89ec | index.tsx, TestStepAttachment.tsx, MainLayout/index.tsx |

## Implementation Details

### ImageViewer Component

**Features:**
- Uses yet-another-react-lightbox for modern lightbox experience
- Zoom plugin with 3x max zoom and scroll-to-zoom
- Supports both base64 content and file paths
- Gallery navigation with multiple images
- Helper function `getImageSource` prefers base64 for static export

**Integration:**
- Receives attachments array, initial index, open state from store
- Calls `onIndexChange` to sync store when user navigates
- Filters to image attachments only

### TextViewer Component

**Features:**
- MUI Dialog with syntax-highlighted content
- prism-react-renderer with GitHub theme
- Language detection from file extensions (log, json, xml, py, ts, etc.)
- Base64 decode with error handling
- Fixed maxHeight 70vh with scroll
- Integrated DownloadButton in DialogActions

**Language Support:**
- log, txt → markup
- json → json
- xml, html → xml/markup
- js, ts, py, java, sh → respective languages
- yml, yaml → yaml
- Fallback to markup for unknown extensions

### DownloadButton Component

**Features:**
- Creates blob URLs from base64 content
- Falls back to file_path if no base64 content
- useEffect with cleanup (URL.revokeObjectURL) to prevent memory leaks
- Returns null if URL creation fails
- Configurable variant (text, outlined, contained)
- MUI Download icon

**Memory Management:**
- Critical cleanup in useEffect return function
- Revokes object URL when component unmounts or attachment changes

### AttachmentViewer Orchestrator

**Routing logic:**
- Checks `viewerOpen` and `currentAttachment` from store
- Routes to ImageViewer if `isImage` computed getter is true
- Routes to TextViewer if `isText` computed getter is true
- Closes viewer for unsupported MIME types
- Passes callbacks to sync store state (onClose, onIndexChange)

**Observer pattern:**
- Wraps with `observer()` from mobx-react-lite
- Reactively re-renders when store state changes

### TestStepAttachment Integration

**Changes:**
- Added `useRootStore` hook to access `attachmentViewerStore`
- Chip becomes clickable for viewable types (image/text)
- Added cursor pointer style for clickable elements
- Image thumbnails now clickable to open viewer
- Added DownloadButton with text variant for all attachments
- Detects `isViewable` based on MIME type

**Click handlers:**
- Chip: `onClick={() => attachmentViewerStore.openViewer(attachment)}`
- Image thumbnails: wrapped in clickable Box with same onClick

### MainLayout Integration

**Changes:**
- Imported AttachmentViewer component
- Wrapped Grid in fragment (`<>...</>`)
- Rendered `<AttachmentViewer />` after Grid container
- Ensures viewer renders at app level (above all other content)

**Positioning:**
- AttachmentViewer controlled by store state
- Lightbox and Dialog handle their own z-index and overlay

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] `npm run build` passes with no TypeScript errors
- [x] ImageViewer component created with zoom capability
- [x] TextViewer component created with syntax highlighting
- [x] DownloadButton component created with cleanup logic
- [x] AttachmentViewer orchestrator created with MIME routing
- [x] TestStepAttachment updated with click handlers
- [x] MainLayout renders AttachmentViewer globally
- [x] grep confirms "AttachmentViewer" in MainLayout (import and render)
- [x] grep confirms "attachmentViewerStore" usage in TestStepAttachment

## User Experience

**Image viewing:**
1. User clicks image chip or thumbnail in test step
2. Lightbox opens with zoom capability (scroll or pinch)
3. User can navigate multiple images if available
4. User can close with X or ESC key

**Text viewing:**
1. User clicks text file chip in test step
2. Dialog opens with syntax-highlighted content
3. Language detected from file extension
4. User can download or close

**Download:**
- Download button available on all attachments
- Text variant in chip area (less prominent)
- Outlined variant in text viewer dialog
- Creates blob URL with proper MIME type
- Cleans up memory on unmount

## Next Steps

Phase 06 complete! Phase 07 (Static Export) will:
- Generate standalone HTML with all data embedded
- Ensure base64 attachments work without external files
- Add export button to UI

## Self-Check: PASSED

**Created files verification:**
```bash
FOUND: src/components/AttachmentViewer/index.tsx
FOUND: src/components/AttachmentViewer/ImageViewer.tsx
FOUND: src/components/AttachmentViewer/TextViewer.tsx
FOUND: src/components/AttachmentViewer/DownloadButton.tsx
```

**Modified files verification:**
```bash
FOUND: src/components/TestDetails/TestStepAttachment.tsx (attachmentViewerStore usage)
FOUND: src/layout/MainLayout/index.tsx (AttachmentViewer import and render)
```

**Commits verification:**
```bash
FOUND: f467d79 (feat: create viewer components)
FOUND: 56f89ec (feat: integrate viewer orchestrator)
```

All deliverables confirmed on disk and in git history.
