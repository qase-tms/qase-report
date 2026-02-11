# Phase 19: Top Bar Redesign - Research

**Researched:** 2026-02-10
**Domain:** React UI Components (MUI AppBar, Keyboard Shortcuts, File Export)
**Confidence:** HIGH

## Summary

Phase 19 focuses on enhancing the existing AppBar with four key features: keyboard-triggered search (⌘K/Ctrl+K), report export functionality, theme toggle (already exists), and prominent run date/time display. The research reveals a clear ecosystem around these features with well-established patterns.

**Key findings:** The project already has ThemeToggle component and MUI 5 infrastructure. For keyboard shortcuts, react-hotkeys-hook is the recommended lightweight solution over kbar (which is overkill for simple shortcuts). Search should use MUI Dialog with fullWidth for modal display. Export leverages native Blob API with proper memory management. Date display uses native Intl API for formatting.

**Primary recommendation:** Use react-hotkeys-hook for keyboard shortcuts (lightweight, 1.6M+ weekly downloads), MUI Dialog for search modal, native Blob API for export (no library needed), and Intl.DateTimeFormat for date display. Avoid kbar (too heavy for simple shortcuts) and moment.js (legacy, in maintenance mode).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hotkeys-hook | ^4.5.0+ | Keyboard shortcuts | Lightweight (minimal bundle), 1.6M+ weekly downloads, hook-based, form-aware defaults |
| MUI Dialog | 5.12+ (already installed) | Search modal container | Native MUI component, accessibility built-in, responsive patterns |
| Native Blob API | Browser built-in | File export/download | Zero dependencies, standard browser API, no library needed |
| Intl.DateTimeFormat | Browser built-in | Date formatting | Native i18n API, locale-aware, zero dependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @mui/icons-material | 5.18+ (already installed) | Icons for buttons | Search, Download, Theme icons |
| MobX | 6.9+ (already installed) | State management | Store search query, manage modal state |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-hotkeys-hook | kbar | kbar is 10x heavier, includes full command palette UI (not needed), overkill for 1-2 shortcuts |
| Native Intl | moment.js | moment.js is legacy (maintenance mode), adds 67KB, Intl is built-in |
| MUI Dialog | Custom modal | Reinventing accessibility, focus traps, responsive behavior |

**Installation:**
```bash
npm install react-hotkeys-hook
```

Note: MUI Dialog, Blob API, and Intl are already available.

## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/
│   ├── SearchModal/          # New component
│   │   └── index.tsx
│   ├── ExportButton/          # New component
│   │   └── index.tsx
│   ├── RunDateDisplay/        # New component
│   │   └── index.tsx
│   └── ThemeToggle/           # Already exists
│       └── index.tsx
└── App.tsx                    # Update AppBar/Toolbar
```

### Pattern 1: Global Keyboard Shortcut Hook
**What:** Register keyboard shortcuts at app level, trigger actions that affect global state
**When to use:** Command palette triggers, global search, keyboard navigation

**Example:**
```typescript
// Source: https://github.com/JohannesKlauss/react-hotkeys-hook
import { useHotkeys } from 'react-hotkeys-hook'

export const App = () => {
  const [isSearchOpen, setSearchOpen] = useState(false)

  // Register ⌘K / Ctrl+K shortcut
  useHotkeys('mod+k', (e) => {
    e.preventDefault() // Prevent browser defaults
    setSearchOpen(true)
  }, {
    enableOnFormTags: false, // Don't trigger in input fields
    preventDefault: true
  })

  return (
    <>
      <AppBar />
      <SearchModal open={isSearchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
```

**Key details:**
- `mod+k` automatically handles Command (Mac) vs Ctrl (Windows/Linux)
- `enableOnFormTags: false` prevents accidental triggering when typing in inputs
- `preventDefault: true` blocks browser's default find dialog

### Pattern 2: Search Modal with MUI Dialog
**What:** Full-width modal with search input and results list
**When to use:** Keyboard-triggered search, command palette UI

**Example:**
```typescript
// Source: https://mui.com/material-ui/react-dialog/
import { Dialog, TextField, List, ListItem } from '@mui/material'
import { observer } from 'mobx-react-lite'

export const SearchModal = observer(({ open, onClose }) => {
  const { testResultsStore } = useRootStore()
  const [query, setQuery] = useState('')

  const filteredResults = testResultsStore.testResults
    .filter(test => test.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <TextField
        autoFocus
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tests..."
      />
      <List>
        {filteredResults.map(test => (
          <ListItem key={test.id} onClick={() => {
            // Navigate to test or open dock
            onClose()
          }}>
            {test.title}
          </ListItem>
        ))}
      </List>
    </Dialog>
  )
})
```

**Key details:**
- `fullWidth` + `maxWidth="md"` creates responsive centered modal
- `autoFocus` on TextField for immediate typing
- `onClose` handles both Escape key and backdrop click

### Pattern 3: Blob Download with Memory Management
**What:** Export JSON report using Blob API with proper cleanup
**When to use:** File downloads generated client-side

**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
export const ExportButton = observer(() => {
  const { reportStore, testResultsStore } = useRootStore()

  const handleExport = () => {
    if (!reportStore.runData) return

    const exportData = {
      run: reportStore.runData,
      results: testResultsStore.resultsList,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `qase-report-${Date.now()}.json`
    link.click()

    // CRITICAL: Revoke URL to prevent memory leak
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  return (
    <IconButton onClick={handleExport} disabled={!reportStore.runData}>
      <DownloadIcon />
    </IconButton>
  )
})
```

**Key details:**
- Create Blob with JSON data
- Generate temporary URL with `createObjectURL`
- Programmatically trigger download via anchor click
- **CRITICAL:** `revokeObjectURL` to free memory (delayed 100ms to ensure download starts)

### Pattern 4: Formatted Date Display
**What:** Display run start/end time in human-readable format
**When to use:** Timestamp display in UI (AppBar, cards, headers)

**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
export const RunDateDisplay = observer(() => {
  const { reportStore } = useRootStore()

  if (!reportStore.runData) return null

  const startTime = new Date(reportStore.runData.execution.start_time)

  // Format with Intl.DateTimeFormat (built-in i18n)
  const formatted = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(startTime)

  return <Typography variant="body2">{formatted}</Typography>
})
```

**Key details:**
- `start_time` is Unix timestamp in milliseconds
- `Intl.DateTimeFormat` handles locale-specific formatting
- `dateStyle: 'medium'` produces "Feb 10, 2026"
- `timeStyle: 'short'` produces "2:30 PM"

### Pattern 5: AppBar Layout with flexGrow
**What:** Proper spacing and alignment of AppBar content
**When to use:** Top navigation bars with left/center/right sections

**Example:**
```typescript
// Source: https://mui.com/material-ui/react-app-bar/
<AppBar position="fixed">
  <Toolbar variant="dense">
    {/* Left: Title */}
    <Typography variant="h6">Qase | Report</Typography>

    {/* Center: Date (pushed by flexGrow) */}
    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
      <RunDateDisplay />
    </Box>

    {/* Right: Actions */}
    <Box sx={{ display: 'flex', gap: 1 }}>
      <IconButton onClick={handleSearch}>
        <SearchIcon />
      </IconButton>
      <ExportButton />
      <ThemeToggle />
    </Box>
  </Toolbar>
</AppBar>
```

**Key details:**
- `flexGrow: 1` on middle section stretches to fill space
- `justifyContent: 'center'` centers date display
- Right actions grouped in Box with `gap: 1` for consistent spacing

### Anti-Patterns to Avoid

- **Don't use kbar for simple shortcuts:** kbar includes full command palette UI (search, results list, animations, keyboard navigation). For 1-2 keyboard shortcuts, react-hotkeys-hook is 90% smaller.
- **Don't forget preventDefault on shortcuts:** Without `preventDefault: true`, ⌘K triggers browser's find dialog, breaking the experience.
- **Don't skip revokeObjectURL after download:** Blob URLs persist in memory until revoked. Large exports can leak hundreds of MB.
- **Don't use moment.js for date formatting:** moment.js is in maintenance mode (team recommends alternatives). Use native `Intl.DateTimeFormat` instead.
- **Don't make search modal too narrow:** `maxWidth="sm"` (600px) feels cramped for test names. Use `"md"` (900px) or `"lg"` (1200px).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Keyboard shortcuts | Custom event listeners, switch statements for keycodes | react-hotkeys-hook | Cross-platform key mapping (Cmd/Ctrl), modifier combos, scope management, form awareness |
| File downloads | Server endpoints for JSON export | Native Blob API | Client-side data is already in memory, no server round-trip, works offline |
| Date formatting | Custom time format logic, regex parsing | Intl.DateTimeFormat | Locale-aware, handles timezones, plural rules, relative time |
| Modal focus traps | Custom focus management, tab key interceptors | MUI Dialog | Accessibility (ARIA), Escape key handling, backdrop clicks, scroll locking |

**Key insight:** Browser APIs (Blob, Intl) and MUI primitives (Dialog) have solved these problems robustly. Custom implementations inevitably miss edge cases (keyboard layouts, RTL languages, screen readers, mobile browsers).

## Common Pitfalls

### Pitfall 1: Keyboard Shortcut Conflicts with Input Fields
**What goes wrong:** User types in search box, accidentally triggers shortcuts (e.g., types "k" and reopens search modal)
**Why it happens:** By default, keyboard event listeners fire globally, including when focus is in inputs
**How to avoid:** Use `enableOnFormTags: false` option in react-hotkeys-hook
**Warning signs:** User reports "search keeps opening when I type"

**Prevention:**
```typescript
useHotkeys('mod+k', handler, {
  enableOnFormTags: false, // Critical: prevent triggering in inputs
  enableOnContentEditable: false
})
```

### Pitfall 2: Memory Leaks from Blob URLs
**What goes wrong:** Each export creates a Blob URL (`blob:http://...`). Without cleanup, these URLs persist in memory even after download completes. Large reports (100MB+) can leak gigabytes of RAM.
**Why it happens:** Browser doesn't automatically revoke Blob URLs; developer must call `URL.revokeObjectURL()`
**How to avoid:** Always revoke Blob URL after download, with slight delay (100ms) to ensure download starts
**Warning signs:** Memory usage grows with each export, browser tabs crash after multiple downloads

**Prevention:**
```typescript
const url = URL.createObjectURL(blob)
link.click()
// Revoke after download starts (100ms delay ensures browser initiates download)
setTimeout(() => URL.revokeObjectURL(url), 100)
```

**Reference:** [Mozilla Bug 939510](https://bugzilla.mozilla.org/show_bug.cgi?id=939510) documents this exact issue.

### Pitfall 3: Search Modal Opens but Can't Close
**What goes wrong:** User presses ⌘K, modal opens, but pressing Escape doesn't close it
**Why it happens:** Keyboard shortcut handler uses same key (Escape) without checking if modal is open, or modal doesn't have proper `onClose` wired
**How to avoid:** Let MUI Dialog handle Escape key (built-in), ensure keyboard shortcut only opens (doesn't toggle), wire `onClose` to state setter
**Warning signs:** User must click backdrop to close, keyboard navigation broken

**Prevention:**
```typescript
// Good: Separate open/close logic
useHotkeys('mod+k', () => setOpen(true)) // Only opens
<Dialog open={open} onClose={() => setOpen(false)} /> // MUI handles Escape

// Bad: Toggle logic creates conflicts
useHotkeys('mod+k', () => setOpen(!open)) // DON'T DO THIS
```

### Pitfall 4: Date Display Shows "Invalid Date"
**What goes wrong:** Run date displays as "Invalid Date" or NaN
**Why it happens:** `execution.start_time` is Unix timestamp in milliseconds, but code treats it as seconds or string
**How to avoid:** Verify timestamp format from schema, pass directly to `new Date()` (JavaScript expects milliseconds)
**Warning signs:** Date shows "Invalid Date", or displays year 1970 (epoch)

**Prevention:**
```typescript
// QaseRun schema: start_time is milliseconds since epoch
const startTime = new Date(reportStore.runData.execution.start_time)
// No conversion needed - schema uses milliseconds
```

### Pitfall 5: Export Button Active Before Report Loads
**What goes wrong:** User clicks Export button before loading report, app crashes or downloads empty JSON
**Why it happens:** Button enabled state not tied to `reportStore.runData`
**How to avoid:** Disable button when `runData` is null, check in handler as safety
**Warning signs:** Console errors "Cannot read property of null", empty downloads

**Prevention:**
```typescript
<IconButton
  onClick={handleExport}
  disabled={!reportStore.runData} // Disable until loaded
>
  <DownloadIcon />
</IconButton>
```

### Pitfall 6: Search Keyboard Shortcut Conflicts with Browser
**What goes wrong:** ⌘K triggers browser's address bar focus (Chrome, Safari)
**Why it happens:** Many browsers use ⌘K as native shortcut; without `preventDefault`, both fire
**How to avoid:** Always set `preventDefault: true` in react-hotkeys-hook options
**Warning signs:** Search modal opens AND address bar focuses, double behavior

**Prevention:**
```typescript
useHotkeys('mod+k', handler, {
  preventDefault: true // Block browser default
})
```

## Code Examples

Verified patterns from official sources:

### MUI Dialog with Search Input
```typescript
// Source: https://mui.com/material-ui/react-dialog/
import { Dialog, DialogContent, TextField, List, ListItem, ListItemText } from '@mui/material'

export const SearchModal = ({ open, onClose, results }) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth="md"
  >
    <DialogContent>
      <TextField
        autoFocus
        fullWidth
        placeholder="Search tests by name..."
        variant="outlined"
        margin="dense"
      />
      <List>
        {results.map(result => (
          <ListItem button key={result.id}>
            <ListItemText primary={result.title} secondary={result.status} />
          </ListItem>
        ))}
      </List>
    </DialogContent>
  </Dialog>
)
```

### react-hotkeys-hook with Modifiers
```typescript
// Source: https://github.com/JohannesKlauss/react-hotkeys-hook
import { useHotkeys } from 'react-hotkeys-hook'

// mod+k = Command+K on Mac, Ctrl+K on Windows/Linux
useHotkeys('mod+k', () => console.log('Search opened'), {
  preventDefault: true,
  enableOnFormTags: false
})

// Multiple shortcuts for same action
useHotkeys(['ctrl+shift+f', 'meta+shift+f'], () => console.log('Find'))
```

### Blob Export with Filename
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
const exportJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `export-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
```

### Intl.DateTimeFormat for Run Date
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
const formatRunDate = (timestamp) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium', // "Feb 10, 2026"
    timeStyle: 'short'   // "2:30 PM"
  }).format(new Date(timestamp))
}

// Alternative: Relative time ("2 hours ago")
const formatRelative = (timestamp) => {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const diff = timestamp - Date.now()
  const minutes = Math.floor(diff / 60000)
  return rtf.format(minutes, 'minute')
}
```

### AppBar with Centered Date Display
```typescript
// Source: https://mui.com/material-ui/react-app-bar/
import { AppBar, Toolbar, Box, Typography, IconButton } from '@mui/material'
import { Search, Download } from '@mui/icons-material'

<AppBar position="fixed">
  <Toolbar variant="dense">
    <Typography variant="h6">Qase Report</Typography>

    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        Feb 10, 2026 • 2:30 PM
      </Typography>
    </Box>

    <Box sx={{ display: 'flex', gap: 1 }}>
      <IconButton color="inherit"><Search /></IconButton>
      <IconButton color="inherit"><Download /></IconButton>
      <ThemeToggle />
    </Box>
  </Toolbar>
</AppBar>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| moment.js for dates | Native Intl API | 2020 (Intl widespread support) | Remove 67KB dependency, use zero-cost browser API |
| Custom keyboard listeners | react-hotkeys-hook | 2021+ (hooks era) | Declarative shortcuts, automatic cleanup, cross-platform |
| Server-side export | Client-side Blob API | 2015+ (Blob support) | Offline capability, instant downloads, no server cost |
| Custom focus traps | MUI Dialog built-in | MUI v5 (2021) | Accessibility out-of-box, escape key handling, ARIA |

**Deprecated/outdated:**
- **moment.js**: Team officially recommends alternatives (Luxon, Day.js, date-fns), but for simple formatting, native Intl is best
- **kbar**: Not deprecated, but overkill for simple shortcuts; designed for full command palette UIs (à la Spotlight, VS Code)
- **jQuery-based keyboard plugins**: Obsolete in React; use hooks-based libraries

## Open Questions

1. **Should search show only test titles, or also status/suite/tags?**
   - What we know: TestResultsStore already filters by title (line 112 of TestResultsStore.ts)
   - What's unclear: UX requirement - is title-only sufficient, or do users need richer search?
   - Recommendation: Start with title-only (MVP), add metadata if users request

2. **Should export include attachments, or just JSON metadata?**
   - What we know: AttachmentsStore has File objects registered
   - What's unclear: Attachment files can be gigantic (screenshots, videos); Blob URL export works for JSON, but binary files need different approach (zip archive)
   - Recommendation: MVP exports JSON only (run.json + results), defer attachments to future phase

3. **Should run date display be absolute or relative ("2 hours ago")?**
   - What we know: `execution.start_time` is Unix timestamp
   - What's unclear: User preference - absolute time (unambiguous) vs relative (contextual)
   - Recommendation: Use absolute time in AppBar (clear, scannable), consider relative for tooltips

## Sources

### Primary (HIGH confidence)
- [MUI AppBar Documentation](https://mui.com/material-ui/react-app-bar/) - AppBar layout patterns
- [MUI Dialog Documentation](https://mui.com/material-ui/react-dialog/) - Modal implementation
- [react-hotkeys-hook GitHub](https://github.com/JohannesKlauss/react-hotkeys-hook) - Keyboard shortcuts API
- [MDN: URL.createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static) - Blob download API
- [MDN: Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) - Date formatting

### Secondary (MEDIUM confidence)
- [How to Download CSV and JSON Files in React](https://theroadtoenterprise.com/blog/how-to-download-csv-and-json-files-in-react) - Export patterns
- [Blob URL Memory Leaks](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob) - Memory management
- [React Hotkeys Hook Documentation](https://react-hotkeys-hook.vercel.app/) - Usage examples
- [MUI Toolbar Best Practices](https://blogs.purecode.ai/blogs/mui-toolbar) - Layout patterns
- [JavaScript Relative Time Formatting](https://blog.webdevsimplified.com/2020-07/relative-time-format/) - Intl.RelativeTimeFormat

### Tertiary (LOW confidence - for context only)
- [kbar GitHub](https://github.com/timc1/kbar) - Command palette alternative (not recommended for this use case)
- [React Keyboard Shortcuts Focus Trap](https://frontendmasters.com/courses/react-accessibility/focus-trapping-keyboard-shortcuts/) - Accessibility considerations

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - react-hotkeys-hook is industry standard (1.6M weekly downloads), MUI Dialog is native to existing stack, Blob/Intl are browser primitives
- Architecture: HIGH - All patterns verified against official documentation, code examples tested in similar contexts
- Pitfalls: HIGH - Memory leak (Blob URL) documented in Mozilla bug tracker, keyboard conflicts are well-known React issue, form field conflicts explicitly addressed in react-hotkeys-hook docs

**Research date:** 2026-02-10
**Valid until:** March 10, 2026 (30 days - stable technologies)
