# Phase 5: Step Timeline - Research

**Researched:** 2026-02-09
**Domain:** Nested hierarchical data visualization with React recursive components
**Confidence:** HIGH

## Summary

Phase 5 requires displaying nested test steps with hierarchy, status icons, duration, and attachments. The core challenge is rendering recursive tree structures efficiently while maintaining good UX for expand/collapse interactions.

React's recursive component pattern combined with MUI's Collapse component and existing project utilities provides a complete solution. The step schema already includes `parent_id` and nested `steps` arrays, making both flat-to-tree conversion and direct recursive rendering viable approaches.

**Primary recommendation:** Use recursive React components with MUI Collapse for expand/collapse, reuse existing `getStatusIcon` and duration formatting utilities, and render attachments inline with MUI icons and optional image preview.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.2.0 | Recursive component rendering | Already in use, native support for component recursion |
| MUI Collapse | 5.12.0 | Expand/collapse animation | Part of @mui/material, native transition support |
| MobX | 6.9.0 | Step expand/collapse state | Already used for state management |
| @mui/icons-material | 5.18.0 | Status/attachment icons | Already in use for status icons |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| MUI Box | 5.12.0 | Layout container | Step indentation and spacing |
| MUI Stack | 5.12.0 | Vertical step layout | Spacing between step elements |
| MUI Chip | 5.12.0 | Attachment badges | Show attachment count/type |
| MUI Typography | 5.12.0 | Step text display | Action, expected result display |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recursive components | MUI TreeView (SimpleTreeView/RichTreeView) | TreeView is overkill for linear step display, requires @mui/x-tree-view package (not installed), less control over custom layout |
| MUI Collapse | Custom CSS transitions | Collapse handles accessibility, unmounting, and animations automatically |
| Inline recursion | Flatten array with depth prop | Flattening is 3x faster for large trees (1000+ nodes), but step hierarchies are typically <50 nodes |

**Installation:**
No new packages required - all dependencies already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── TestDetails/
│       ├── index.tsx              # Main TestDetails (already exists)
│       ├── TestSteps.tsx          # New: Step timeline container
│       ├── TestStep.tsx           # New: Recursive step component
│       └── TestStepAttachment.tsx # New: Attachment display
└── utils/
    └── formatDuration.ts          # Extract existing duration logic
```

### Pattern 1: Recursive Step Component
**What:** Component that renders itself for nested children
**When to use:** For hierarchical data where depth is unknown
**Example:**
```typescript
// Source: https://blog.logrocket.com/recursive-components-react-real-world-example/
// Pattern adapted for Qase step schema

interface TestStepProps {
  step: Step
  depth: number
}

export const TestStep = observer(({ step, depth }: TestStepProps) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const hasChildren = step.steps.length > 0
  const hasAttachments = step.execution.attachments.length > 0

  return (
    <Box sx={{ ml: depth * 3 }}> {/* Indent by depth */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {hasChildren && (
          <IconButton size="small" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ExpandMore /> : <ChevronRight />}
          </IconButton>
        )}
        {getStatusIcon(step.execution.status)}
        <Typography>{step.data.action}</Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDuration(step.execution.duration)}
        </Typography>
      </Box>

      <Collapse in={isExpanded}>
        {/* Recursive call for child steps */}
        {step.steps.map((child) => (
          <TestStep key={child.id} step={child} depth={depth + 1} />
        ))}
      </Collapse>
    </Box>
  )
})
```

### Pattern 2: Duration Formatting Utility
**What:** Extract existing duration formatting logic into reusable utility
**When to use:** TestList, TestHeader, and TestStep all need duration display
**Example:**
```typescript
// Source: Existing codebase (src/store/ReportStore.ts, src/components/TestList/TestListItem.tsx)

export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}
```

### Pattern 3: Inline Attachment Display
**What:** Show attachment icon/badge inline, expand for preview
**When to use:** Steps with attachments array
**Example:**
```typescript
// Source: Allure reference implementation + MUI patterns

export const TestStepAttachment = ({ attachment }: { attachment: Attachment }) => {
  const isImage = attachment.mime_type.startsWith('image/')

  return (
    <Box sx={{ ml: 2, mt: 1 }}>
      <Chip
        icon={isImage ? <ImageIcon /> : <InsertDriveFileIcon />}
        label={attachment.file_name}
        size="small"
        onClick={() => /* open modal or expand inline */}
      />
      {isImage && (
        <Box sx={{ mt: 1, maxWidth: 400 }}>
          <img
            src={attachment.file_path}
            alt={attachment.file_name}
            style={{ maxWidth: '100%', borderRadius: 4 }}
          />
        </Box>
      )}
    </Box>
  )
}
```

### Pattern 4: Conditional Section Rendering
**What:** Only render TestSteps section if steps array has items
**When to use:** TestDetails component (existing pattern)
**Example:**
```typescript
// Source: Existing codebase (src/components/TestDetails/index.tsx)

<Stack spacing={3} divider={<Divider />}>
  <TestHeader test={selectedTest} />
  {selectedTest.execution.stacktrace && <TestError test={selectedTest} />}
  {selectedTest.steps.length > 0 && <TestSteps steps={selectedTest.steps} />}
  {Object.keys(selectedTest.params).length > 0 && <TestParams test={selectedTest} />}
</Stack>
```

### Anti-Patterns to Avoid
- **Using array index as key:** Steps have unique `id` field - always use `step.id` as React key
- **Flattening tree with parent_id references:** Step schema provides both `parent_id` AND nested `steps` array - use nested array for direct recursion
- **Rebuilding tree on every render:** Steps data is static per test - no need for array-to-tree conversion
- **Storing expand state in component for every step:** For small hierarchies (<50 steps), local component state is fine; MobX store only needed if "expand all / collapse all" feature is required

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Expand/collapse animation | Custom CSS transitions with height calculation | MUI Collapse component | Handles enter/exit transitions, accessibility (aria-expanded), unmounting, and works with Box/Stack layout |
| Duration formatting | Inline division/formatting in each component | Shared utility function | Already duplicated in 3 places (TestListItem, TestHeader, ReportStore) - extract once |
| Status icons | Switch statements per component | Existing `getStatusIcon` utility | Already implemented in `src/components/TestList/statusIcon.tsx` |
| Tree data structure conversion | Custom flat-to-tree algorithm | Direct recursive rendering of `step.steps` | Schema already provides nested array structure |
| Virtualization for large trees | Custom windowing logic | Not needed for step timelines | Test step hierarchies rarely exceed 50 nodes; if >1000 nodes needed, use react-vtree or react-arborist |

**Key insight:** Test step hierarchies are naturally small (typically 5-20 steps, rarely >50). Performance optimizations like virtualization, flattening, or memoization are premature. Focus on clear, maintainable recursive components.

## Common Pitfalls

### Pitfall 1: Infinite Recursion from Missing Base Case
**What goes wrong:** Component keeps calling itself, causing stack overflow and browser crash
**Why it happens:** No conditional check to stop recursion when `step.steps` is empty or undefined
**How to avoid:** Always check array length before recursive call: `step.steps.length > 0 && step.steps.map(...)`
**Warning signs:** "Maximum call stack size exceeded" error, browser freezing on load
**Source:** [Avoiding Infinite Recursion in React: A Guide](https://infinitejs.com/posts/avoiding-infinite-recursion-react-guide/)

### Pitfall 2: React Key Warnings with Index Keys
**What goes wrong:** Console warnings about duplicate keys, components re-rendering incorrectly, lost expand/collapse state
**Why it happens:** Using array index as key when steps can be reordered or filtered
**How to avoid:** Always use `step.id` as key prop: `step.steps.map(child => <TestStep key={child.id} ...>)`
**Warning signs:** "Warning: Each child in a list should have a unique 'key' prop", expand/collapse state resets unexpectedly
**Source:** [React Key Prop Best Practices](https://medium.com/@chanukachandrayapa/react-key-prop-best-practices-from-state-mismanagement-to-optimized-rendering-cb85c62287f6)

### Pitfall 3: Excessive Indentation at Deep Nesting
**What goes wrong:** Steps at depth 5+ are pushed off-screen or become unreadable
**Why it happens:** Multiplying depth by fixed pixel value (e.g., `ml: depth * 30`) without max limit
**How to avoid:** Use smaller multiplier (3-8px) and/or cap maximum indentation: `ml: Math.min(depth * 4, 24)`
**Warning signs:** Horizontal scrollbar appears, step text is cut off, user complaints about readability
**Source:** [MUI TreeView itemChildrenIndentation](https://mui.com/x/react-tree-view/) (default: 12px)

### Pitfall 4: Re-rendering All Steps on Single Expand/Collapse
**What goes wrong:** Entire step tree re-renders when one step is toggled
**Why it happens:** Parent component state change causes all children to re-render
**How to avoid:** Use local state in each TestStep component, not lifted state in TestSteps parent. Only lift state if "expand all" feature is needed.
**Warning signs:** Noticeable lag when expanding steps, React DevTools shows unnecessary re-renders
**Source:** [React Components and Rendering Performance](https://www.uxpin.com/studio/blog/react-components-rendering-performance/)

### Pitfall 5: Attachment Path Resolution Issues
**What goes wrong:** Images don't load, 404 errors in console
**Why it happens:** `attachment.file_path` is relative path (e.g., `"./build/qase-report/attachments/abc.png"`), but browser needs absolute URL
**How to avoid:** Use AttachmentService or URL.createObjectURL for file loading (check existing AttachmentStore implementation)
**Warning signs:** Broken image icons, console errors like "GET file:///.../undefined 404"
**Source:** Existing codebase has AttachmentService and AttachmentsStore for this purpose

## Code Examples

Verified patterns from existing codebase and official docs:

### Reusing Status Icon Utility
```typescript
// Source: src/components/TestList/statusIcon.tsx
import { getStatusIcon } from '../TestList/statusIcon'

// In TestStep component:
{getStatusIcon(step.execution.status)}
```

### Duration Formatting Reuse
```typescript
// Source: src/store/ReportStore.ts (lines 105-120)
// Extract to src/utils/formatDuration.ts:

export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}
```

### MUI Collapse with Nested Content
```typescript
// Source: https://mui.com/material-ui/react-accordion/ and https://mui.com/material-ui/api/collapse/

import { Collapse, Box, IconButton } from '@mui/material'
import { ExpandMore, ChevronRight } from '@mui/icons-material'

const [expanded, setExpanded] = useState(true)

<Box>
  <IconButton onClick={() => setExpanded(!expanded)}>
    {expanded ? <ExpandMore /> : <ChevronRight />}
  </IconButton>

  <Collapse in={expanded}>
    {/* Nested content */}
  </Collapse>
</Box>
```

### Observer Pattern for Reactive Components
```typescript
// Source: Existing codebase pattern (src/components/TestDetails/index.tsx)

import { observer } from 'mobx-react-lite'

export const TestSteps = observer(({ steps }: { steps: Step[] }) => {
  return (
    <Box>
      {steps.map(step => (
        <TestStep key={step.id} step={step} depth={0} />
      ))}
    </Box>
  )
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| MUI TreeView v4 | MUI TreeView X (SimpleTreeView/RichTreeView) | 2023-2024 | New API requires separate @mui/x-tree-view package, better virtualization support |
| Index-based keys | Stable ID-based keys | React 18+ emphasis | Better reconciliation, fewer re-renders |
| Class components with recursion | Functional components with hooks | React 16.8+ (2019) | Cleaner recursive patterns with useState |
| Inline styles | sx prop | MUI v5 (2021) | Better theme integration, type safety |

**Deprecated/outdated:**
- TreeView from @mui/material: Moved to @mui/x-tree-view in MUI v5
- Using indexes as keys: React docs strongly discourage unless list is static and never reordered

## Open Questions

1. **Should expand/collapse state persist across test selection?**
   - What we know: MobX store could track expanded steps by test ID + step ID
   - What's unclear: Is this behavior expected by users? Allure resets on navigation
   - Recommendation: Start with local component state (simpler), add persistence if users request it

2. **How to handle steps without actions (empty data.action)?**
   - What we know: Schema allows optional `data.action`, `data.expected_result`, `data.input_data`
   - What's unclear: Real-world Qase report examples needed to see actual data patterns
   - Recommendation: Display step.id or "Step N" as fallback if action is empty

3. **Should attachments at test level (selectedTest.attachments) also appear in timeline?**
   - What we know: Test-level attachments exist separately from step-level attachments
   - What's unclear: UX expectation - show them at top, bottom, or in separate section?
   - Recommendation: Keep Phase 5 focused on step timeline with step attachments; defer test-level attachments to Phase 6 (Attachments Viewer)

4. **Is inline image preview sufficient, or do we need lightbox/modal?**
   - What we know: Allure uses modal for full-size image view
   - What's unclear: Is inline thumbnail + click-to-expand acceptable for MVP?
   - Recommendation: Start with inline thumbnail (max 400px), add modal/lightbox if users need full-screen view

## Sources

### Primary (HIGH confidence)
- Existing codebase: `/src/schemas/Step.schema.ts`, `/src/schemas/Attachment.schema.ts`, `/src/components/TestList/statusIcon.tsx`, `/src/store/ReportStore.ts`
- MUI Documentation: [Collapse API](https://mui.com/material-ui/api/collapse/), [Stack component](https://mui.com/material-ui/react-stack/), [Material Icons](https://mui.com/material-ui/material-icons/)
- React Official Docs: [Lists and Keys](https://legacy.reactjs.org/docs/lists-and-keys.html)

### Secondary (MEDIUM confidence)
- [Recursive Components in React: A Real-World Example](https://blog.logrocket.com/recursive-components-react-real-world-example/) - Verified pattern matches React best practices
- [MUI Collapse Component Guide](https://blogs.purecode.ai/blogs/mui-collapse) - Verified against official MUI docs
- [React Key Prop Best Practices](https://medium.com/@chanukachandrayapa/react-key-prop-best-practices-from-state-mismanagement-to-optimized-rendering-cb85c62287f6) - Cross-referenced with React docs
- [Build Tree Array from Flat Array](https://www.geeksforgeeks.org/javascript/build-tree-array-from-flat-array-in-javascript/) - Algorithm verified but NOT needed (schema provides nested structure)
- [React Performance for Large Trees](https://www.syncfusion.com/blogs/post/render-large-datasets-in-react) - Virtualization guidance for 1000+ nodes (not applicable for typical step counts)

### Tertiary (LOW confidence)
- [Test Report Visualization Best Practices](https://daily.dev/blog/test-execution-report-guide-7-best-practices) - General guidance, not React-specific
- [Avoiding Infinite Recursion in React](https://infinitejs.com/posts/avoiding-infinite-recursion-react-guide/) - Pattern verified but examples are generic

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages already installed and in use
- Architecture: HIGH - Recursive component pattern is well-established, codebase already uses similar patterns
- Pitfalls: HIGH - Base case, keys, indentation, and attachment paths are known React/MUI issues with verified solutions

**Research date:** 2026-02-09
**Valid until:** 2026-03-09 (30 days - stable technologies)
