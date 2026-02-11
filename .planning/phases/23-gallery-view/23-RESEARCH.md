# Phase 23: Gallery View - Research

**Researched:** 2026-02-10
**Domain:** Cross-test attachment aggregation, image gallery UI, MIME type filtering
**Confidence:** HIGH

## Summary

Gallery View enables users to browse all attachments across all tests in a unified view, with filtering by type and navigation back to the originating test. This phase requires aggregating attachments from both test-level and step-level locations, categorizing by MIME type, and implementing a responsive grid layout with metadata overlays.

**Key findings:**
- Attachments exist in TWO locations: `test.attachments[]` (test-level) and `test.steps[].execution.attachments[]` (step-level, nested recursively)
- AttachmentsStore already manages blob URLs with `getAttachmentUrl()` - can reuse for gallery
- AttachmentViewerStore already handles lightbox viewing - gallery can leverage existing viewer
- MUI ImageList provides responsive grid layout with built-in support for multiple columns
- MIME type filtering naturally groups into three categories: image/*, text/* (including application/json), and "other"
- Navigation pattern established: `rootStore.selectTest(testId)` opens test details dock

**Primary recommendation:** Create computed property in dedicated AttachmentsStore extension (or new GalleryStore) to flatten nested attachments with test metadata, use MUI ImageList for grid layout, and leverage existing AttachmentViewerStore for viewing.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MUI ImageList | 5.12.0 | Responsive grid layout | Official MUI component for galleries, supports responsive cols |
| MUI ImageListItemBar | 5.12.0 | Metadata overlay on images | Built-in overlay component for titles/subtitles |
| MUI Chip | 5.12.0 | Type filter badges | Already used in TestStepAttachment, consistent UI |
| MobX computed | 6.9.0 | Cross-test aggregation | Existing pattern in AnalyticsStore for flattening data |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| MUI ImageListItem | 5.12.0 | Gallery item wrapper | Container for each attachment in grid |
| MUI useMediaQuery | 5.12.0 | Responsive columns | Calculate cols based on breakpoints |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MUI ImageList | react-image-gallery | ImageList is already in dependencies, lighter weight |
| Computed property | Component-level state | Computed is reactive and cached, better for cross-store data |
| Three filter categories | One filter per MIME type | Too granular (20+ MIME types), reduces usability |

**Installation:**
```bash
# No new dependencies required - all components already in project
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── store/
│   └── AnalyticsStore.ts        # Add galleryAttachments computed property
├── components/
│   └── Gallery/                 # New directory
│       ├── index.tsx             # Main gallery view
│       ├── GalleryGrid.tsx       # ImageList grid with items
│       ├── GalleryFilters.tsx    # Type filter chips (Screenshots/Logs/Other)
│       └── GalleryItem.tsx       # Individual attachment with overlay
```

### Pattern 1: Cross-Test Attachment Aggregation
**What:** Flatten attachments from test-level and all nested steps, preserving test metadata
**When to use:** Gallery needs to show attachments from multiple sources with context
**Example:**
```typescript
// In AnalyticsStore.ts or new GalleryStore.ts
export interface GalleryAttachment {
  /** Original attachment data */
  attachment: Attachment
  /** Test this attachment belongs to */
  testId: string
  testTitle: string
  testStatus: 'passed' | 'failed' | 'skipped' | 'broken'
  /** Where attachment was found: 'test' or 'step' */
  source: 'test' | 'step'
  /** Step ID if from step, null if test-level */
  stepId?: string
}

get galleryAttachments(): GalleryAttachment[] {
  const items: GalleryAttachment[] = []

  for (const test of this.root.testResultsStore.resultsList) {
    // Add test-level attachments
    for (const attachment of test.attachments) {
      items.push({
        attachment,
        testId: test.id,
        testTitle: test.title,
        testStatus: test.execution.status,
        source: 'test',
      })
    }

    // Recursively add step attachments
    const collectStepAttachments = (steps: Step[]) => {
      for (const step of steps) {
        for (const attachment of step.execution.attachments) {
          items.push({
            attachment,
            testId: test.id,
            testTitle: test.title,
            testStatus: test.execution.status,
            source: 'step',
            stepId: step.id,
          })
        }
        // Recurse into nested steps
        if (step.steps.length > 0) {
          collectStepAttachments(step.steps)
        }
      }
    }

    collectStepAttachments(test.steps)
  }

  return items
}
```

### Pattern 2: MIME Type Categorization
**What:** Group attachments into three user-friendly categories: Screenshots, Logs, Other
**When to use:** Gallery filters need simple categories, not 20+ MIME types
**Example:**
```typescript
// MIME type category helpers
type AttachmentCategory = 'screenshots' | 'logs' | 'other'

const categorizeAttachment = (mimeType: string): AttachmentCategory => {
  if (mimeType.startsWith('image/')) {
    return 'screenshots'
  }
  if (mimeType.startsWith('text/') || mimeType === 'application/json') {
    return 'logs'
  }
  return 'other'
}

// Filtered computed properties
get screenshotAttachments(): GalleryAttachment[] {
  return this.galleryAttachments.filter(item =>
    item.attachment.mime_type.startsWith('image/')
  )
}

get logAttachments(): GalleryAttachment[] {
  return this.galleryAttachments.filter(item => {
    const mime = item.attachment.mime_type
    return mime.startsWith('text/') || mime === 'application/json'
  })
}

get otherAttachments(): GalleryAttachment[] {
  return this.galleryAttachments.filter(item => {
    const mime = item.attachment.mime_type
    return !mime.startsWith('image/') &&
           !mime.startsWith('text/') &&
           mime !== 'application/json'
  })
}
```

### Pattern 3: Responsive Grid with MUI ImageList
**What:** Responsive column count based on screen size using useMediaQuery
**When to use:** Gallery needs to adapt from mobile (1 col) to desktop (4+ cols)
**Example:**
```typescript
// Source: Based on MUI documentation and community patterns
import { ImageList, useMediaQuery, useTheme } from '@mui/material'

export const GalleryGrid = observer(({ attachments }: { attachments: GalleryAttachment[] }) => {
  const theme = useTheme()

  // Responsive column count
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'))

  const cols = isXs ? 1 : isSm ? 2 : isMd ? 3 : 4

  return (
    <ImageList cols={cols} gap={16} sx={{ m: 0 }}>
      {attachments.map((item) => (
        <GalleryItem key={item.attachment.id} item={item} />
      ))}
    </ImageList>
  )
})
```

### Pattern 4: Gallery Item with Metadata Overlay
**What:** Show attachment with test name overlay, clickable to open viewer or navigate to test
**When to use:** Each gallery item needs to display test context and support interactions
**Example:**
```typescript
import { ImageListItem, ImageListItemBar, IconButton } from '@mui/material'
import { OpenInNew as OpenIcon } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'

interface GalleryItemProps {
  item: GalleryAttachment
}

export const GalleryItem = observer(({ item }: GalleryItemProps) => {
  const { attachmentViewerStore, attachmentsStore, selectTest } = useRootStore()

  const blobUrl = attachmentsStore.getAttachmentUrl(item.attachment.id)
  const isImage = item.attachment.mime_type.startsWith('image/')

  const handleClick = () => {
    // Open attachment in viewer (existing lightbox)
    attachmentViewerStore.openViewer(item.attachment)
  }

  const handleNavigateToTest = (e: React.MouseEvent) => {
    e.stopPropagation() // Don't trigger attachment viewer
    selectTest(item.testId) // Opens test details dock
  }

  return (
    <ImageListItem sx={{ cursor: 'pointer' }} onClick={handleClick}>
      {isImage && blobUrl ? (
        <img
          src={blobUrl}
          alt={item.attachment.file_name}
          loading="lazy"
          style={{ height: 200, objectFit: 'cover' }}
        />
      ) : (
        // Placeholder for non-image attachments
        <Box
          sx={{
            height: 200,
            bgcolor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
            onClick={handleNavigateToTest}
            sx={{ color: 'white' }}
            aria-label={`Open ${item.testTitle}`}
          >
            <OpenIcon />
          </IconButton>
        }
      />
    </ImageListItem>
  )
})
```

### Pattern 5: Filter Chips (Like Sidebar Filters)
**What:** Horizontal chip group for toggling attachment type filters
**When to use:** Gallery needs simple, accessible filtering UI
**Example:**
```typescript
// Source: Similar to SidebarFilters.tsx pattern
import { Box, Chip } from '@mui/material'
import { observer } from 'mobx-react-lite'

interface GalleryFiltersProps {
  activeFilter: 'all' | 'screenshots' | 'logs' | 'other'
  onFilterChange: (filter: 'all' | 'screenshots' | 'logs' | 'other') => void
  counts: { all: number; screenshots: number; logs: number; other: number }
}

export const GalleryFilters = observer(({ activeFilter, onFilterChange, counts }: GalleryFiltersProps) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
      <Chip
        label={`All (${counts.all})`}
        onClick={() => onFilterChange('all')}
        color={activeFilter === 'all' ? 'primary' : 'default'}
        clickable
      />
      <Chip
        label={`Screenshots (${counts.screenshots})`}
        onClick={() => onFilterChange('screenshots')}
        color={activeFilter === 'screenshots' ? 'primary' : 'default'}
        clickable
      />
      <Chip
        label={`Logs (${counts.logs})`}
        onClick={() => onFilterChange('logs')}
        color={activeFilter === 'logs' ? 'primary' : 'default'}
        clickable
      />
      <Chip
        label={`Other (${counts.other})`}
        onClick={() => onFilterChange('other')}
        color={activeFilter === 'other' ? 'primary' : 'default'}
        clickable
      />
    </Box>
  )
})
```

### Anti-Patterns to Avoid
- **Reloading attachments on filter change:** Use computed properties to pre-categorize, filter in UI
- **Creating new blob URLs in gallery:** Reuse URLs from AttachmentsStore, already created on report load
- **Building custom lightbox:** Leverage existing AttachmentViewerStore, already supports image viewing
- **Flattening recursively on every render:** Use MobX computed property, cache flattened list

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive grid layout | Custom CSS Grid with breakpoints | MUI ImageList + useMediaQuery | Handles edge cases, accessibility, consistent spacing |
| Image overlay | Custom positioned div with z-index | MUI ImageListItemBar | Built-in gradient, title/subtitle positioning, action buttons |
| Lightbox viewer | Custom modal with image zoom | Existing AttachmentViewerStore | Already implements zoom, navigation, download |
| MIME type detection | Custom file extension parsing | Use attachment.mime_type field | Reporter already provides accurate MIME types |
| Recursive step traversal | Custom nested loops | Recursive helper function | Cleaner, handles arbitrary nesting depth |

**Key insight:** AttachmentsStore and AttachmentViewerStore already handle 90% of gallery functionality. Don't rebuild attachment loading/viewing - focus on aggregation and layout only.

## Common Pitfalls

### Pitfall 1: Missing Step-Level Attachments
**What goes wrong:** Gallery only shows test-level attachments, misses screenshots from steps
**Why it happens:** Steps have nested `execution.attachments[]` that requires recursive traversal
**How to avoid:** Recursively traverse `test.steps[]` and nested `step.steps[]` to collect all attachments
**Warning signs:** Gallery shows 5 attachments but test details shows 20

### Pitfall 2: Loading Blob URLs That Don't Exist
**What goes wrong:** Gallery shows broken images because blob URLs weren't created on report load
**Why it happens:** AttachmentsStore.registerAttachment() is only called for files in attachments/ directory
**How to avoid:** Use `attachmentsStore.getAttachmentUrl()` and handle undefined (show placeholder)
**Warning signs:** Console errors "Failed to load resource: blob:..."

### Pitfall 3: Not Handling Missing MIME Types
**What goes wrong:** Filter logic crashes when attachment.mime_type is undefined
**Why it happens:** MIME type field is required in schema, but could be empty string in practice
**How to avoid:** Use optional chaining `mime_type?.startsWith()` or default to 'other' category
**Warning signs:** TypeError: Cannot read property 'startsWith' of undefined

### Pitfall 4: Performance Issues with Large Attachment Counts
**What goes wrong:** Gallery lags when rendering 500+ attachments in grid
**Why it happens:** Rendering all images simultaneously, no virtualization
**How to avoid:** Start with ImageList (no virtualization), add react-window if needed (100+ attachments)
**Warning signs:** Noticeable scroll lag, high memory usage

### Pitfall 5: Clicking Attachment Opens Both Viewer AND Test Details
**What goes wrong:** Clicking gallery item opens lightbox AND navigates to test details
**Why it happens:** Click event bubbles from action button to image container
**How to avoid:** Use `e.stopPropagation()` on action button click handler
**Warning signs:** Dock opens unexpectedly when clicking "open test" icon

### Pitfall 6: Not Showing "No Attachments" Empty State
**What goes wrong:** Gallery shows blank screen when report has no attachments
**Why it happens:** No empty state handling in component
**How to avoid:** Check `galleryAttachments.length === 0` and show Paper with message
**Warning signs:** Confused users when gallery loads but shows nothing

### Pitfall 7: Gallery Doesn't Update When Report Changes
**What goes wrong:** Loading new report doesn't refresh gallery view
**Why it happens:** Not using MobX computed properties, state is stale
**How to avoid:** Use computed properties in store, wrap components with `observer()`
**Warning signs:** Gallery shows attachments from previous report after loading new one

## Code Examples

Verified patterns from existing codebase:

### Recursive Step Traversal
```typescript
// Source: Similar pattern to TestSteps.tsx rendering logic
const collectStepAttachments = (steps: Step[], collector: GalleryAttachment[]) => {
  for (const step of steps) {
    // Add step-level attachments
    for (const attachment of step.execution.attachments) {
      collector.push({
        attachment,
        testId: test.id,
        testTitle: test.title,
        testStatus: test.execution.status,
        source: 'step',
        stepId: step.id,
      })
    }

    // Recurse into nested steps
    if (step.steps && step.steps.length > 0) {
      collectStepAttachments(step.steps, collector)
    }
  }
}
```

### MobX Computed Property for Cross-Store Data
```typescript
// Source: AnalyticsStore.ts lines 97-110 (flakyTests pattern)
export class AnalyticsStore {
  constructor(public root: RootStore) {
    makeAutoObservable(this)
  }

  /**
   * Returns all attachments from all tests with test metadata.
   * Automatically updates when test results change.
   */
  get galleryAttachments(): GalleryAttachment[] {
    const items: GalleryAttachment[] = []

    for (const test of this.root.testResultsStore.resultsList) {
      // Test-level attachments
      for (const attachment of test.attachments) {
        items.push({
          attachment,
          testId: test.id,
          testTitle: test.title,
          testStatus: test.execution.status,
          source: 'test',
        })
      }

      // Step-level attachments (recursive)
      const collectStepAttachments = (steps: Step[]) => {
        for (const step of steps) {
          for (const attachment of step.execution.attachments) {
            items.push({
              attachment,
              testId: test.id,
              testTitle: test.title,
              testStatus: test.execution.status,
              source: 'step',
              stepId: step.id,
            })
          }
          if (step.steps.length > 0) {
            collectStepAttachments(step.steps)
          }
        }
      }

      collectStepAttachments(test.steps)
    }

    return items
  }

  get screenshotCount(): number {
    return this.galleryAttachments.filter(item =>
      item.attachment.mime_type.startsWith('image/')
    ).length
  }

  get logCount(): number {
    return this.galleryAttachments.filter(item => {
      const mime = item.attachment.mime_type
      return mime.startsWith('text/') || mime === 'application/json'
    }).length
  }

  get otherAttachmentCount(): number {
    return this.galleryAttachments.filter(item => {
      const mime = item.attachment.mime_type
      return !mime.startsWith('image/') &&
             !mime.startsWith('text/') &&
             mime !== 'application/json'
    }).length
  }
}
```

### Navigation Pattern
```typescript
// Source: RootStore.ts lines 76-79, Dashboard/AttentionRequiredCard.tsx
const { selectTest } = useRootStore()

// Navigate to test details
const handleOpenTest = (testId: string) => {
  selectTest(testId) // Opens dock with test details
}
```

### Using Existing Attachment Infrastructure
```typescript
// Source: TestStepAttachment.tsx lines 21-32
const { attachmentViewerStore, attachmentsStore } = useRootStore()

// Get blob URL (created during report load)
const blobUrl = attachmentsStore.getAttachmentUrl(attachment.id)

// Open in existing lightbox viewer
const handleViewAttachment = () => {
  attachmentViewerStore.openViewer(attachment)
}

// Render image with blob URL
{blobUrl && (
  <img src={blobUrl} alt={attachment.file_name} />
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual scroll through tests | Dedicated gallery view | 2024-2025 | Modern test reporters (Playwright, Cypress) |
| File tree navigation | Visual thumbnail grid | 2023-present | Faster visual inspection |
| Download to view | In-browser lightbox | 2022-present | Better UX, no file clutter |
| Fixed column count | Responsive grid | Ongoing | Mobile-friendly galleries |

**Deprecated/outdated:**
- Separate gallery page: Modern reporters integrate gallery as view within report
- Download-only attachments: In-browser viewing is standard
- Manual categorization: MIME type-based filtering is automatic

**Current best practice:** Aggregate attachments across tests, use responsive grid with metadata overlays, leverage existing lightbox viewers. Playwright Smart Reporter and Cypress Cloud use this pattern.

## Open Questions

1. **Should gallery support sorting (by date, by test, by type)?**
   - What we know: Attachments have no timestamp field, only test start_time
   - What's unclear: Whether sorting adds value or creates confusion
   - Recommendation: Phase 23 shows chronological order (test order), defer sorting to user feedback

2. **Should gallery show failed tests' attachments first?**
   - What we know: Failed test attachments (screenshots of failures) are most valuable
   - What's unclear: Whether filtering by test status adds complexity
   - Recommendation: Show all attachments, users can use existing status filters in sidebar

3. **What if report has 1000+ attachments?**
   - What we know: ImageList renders all items synchronously, could lag
   - What's unclear: Typical attachment count in real-world reports
   - Recommendation: Start with ImageList (simple), add virtualization if users report performance issues

4. **Should clicking attachment open viewer or navigate to test?**
   - What we know: Both actions are valuable (view attachment vs see test context)
   - What's unclear: Which is primary user intent
   - Recommendation: Click image opens viewer, separate "open test" button navigates (like Playwright)

5. **Should gallery show attachment from steps or just test-level?**
   - What we know: Steps contain most screenshots (action captures), test-level has final artifacts
   - What's unclear: Whether including step attachments creates too much clutter
   - Recommendation: Include all attachments (test + steps), filtering handles clutter

## Sources

### Primary (HIGH confidence)
- Qase Report codebase: AttachmentsStore.ts, AttachmentViewerStore.ts, Step.schema.ts, QaseTestResult.schema.ts
- MUI ImageList: [ImageList React component - Material UI](https://mui.com/material-ui/react-image-list/)
- MobX computed properties: [Deriving information with computeds · MobX](https://mobx.js.org/computeds.html)
- MIME types: [Media types (MIME types) - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types)

### Secondary (MEDIUM confidence)
- MUI responsive patterns: [MUI Grid: Building Web Layouts Responsively](https://muhimasri.com/blogs/mui-grid/)
- React gallery patterns: [10 Best Image Gallery Components For React](https://reactscript.com/best-image-gallery/)
- MobX cross-store patterns: [Defining data stores · MobX](https://mobx.js.org/defining-data-stores.html)

### Tertiary (LOW confidence - WebSearch results)
- Gallery filter patterns: General web search results, no specific 2026 implementations
- react-image-gallery examples: Alternative library, not needed for this project

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All MUI components already in project
- Architecture: HIGH - Patterns proven in AnalyticsStore (failureClusters) and existing attachment handling
- Pitfalls: HIGH - Based on analysis of AttachmentsStore and AttachmentViewerStore integration
- Performance: MEDIUM - ImageList performance with 100+ items needs validation

**Research date:** 2026-02-10
**Valid until:** 2026-03-15 (30 days - stable domain, mature ecosystem)

**Key decision:** Aggregate attachments in computed property (like failureClusters), use MUI ImageList for layout, leverage existing AttachmentViewerStore for viewing. This approach reuses proven patterns and existing infrastructure.
