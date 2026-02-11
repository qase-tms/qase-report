# Phase 4: Test Details View - Research

**Researched:** 2026-02-09
**Domain:** React detail view component with MUI layouts and MobX state management
**Confidence:** HIGH

## Summary

Phase 4 requires building a test details view that displays complete information about a selected test: name, status, duration, error messages with stacktrace, test parameters, and custom fields. The test is selected via TestListItem in Phase 3, with selectedTestId and selectedTest already implemented in RootStore.

The standard approach uses MUI Stack/Box for vertical layout with Divider separators, Typography with monospace font for code display, and observer component pattern for reactivity. The Sidebar component from Phase 3 provides the container. Primary challenges are safely rendering null/undefined data (error messages, stacktrace, params, custom fields), formatting stacktraces with proper line breaks, and providing clear visual hierarchy for different information sections.

**Primary recommendation:** Use MUI Stack with dividers for section separation, Box for key-value pair display, Typography with fontFamily="monospace" for code/stacktrace, and observer wrapper for automatic updates when selectedTest changes.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @mui/material | ^5.12.0 | UI layout (Stack, Box, Typography, Divider, IconButton) | Already in project, provides flexible layout components with consistent spacing |
| @mui/icons-material | ^5.18.0 | Back/close button icon | Already in project, used for status icons in Phase 3 |
| mobx | ^6.9.0 | selectedTest computed getter | Already in project, provides reactive null-safe data access |
| mobx-react-lite | ^3.4.3 | observer HOC for detail component | Already in project, automatic re-render when selection changes |
| react | ^18.2.0 | Component framework | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | - | All needs met by existing stack | Duration formatting already established in Phase 2, no additional libraries needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MUI Stack for layout | Manual Box + flexbox | Stack provides built-in spacing, dividers, and responsive direction props |
| Typography for code display | Third-party syntax highlighter (react-syntax-highlighter) | Adds bundle size; stacktrace is plain text, no syntax highlighting needed |
| Sidebar component | Modal/Dialog | Sidebar already implemented and used, provides better spatial context for detail navigation |
| Manual key-value rendering | MUI Table or DataGrid | Table is overkill for 2-10 items; Box with flex layout is simpler and more readable |

**Installation:**
No additional packages required - all dependencies already present in package.json.

## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/
│   ├── TestDetails/           # New detail view components
│   │   ├── index.tsx          # Main container (observer, renders in Sidebar)
│   │   ├── TestHeader.tsx     # Name, status icon, duration
│   │   ├── TestError.tsx      # Error message + stacktrace (conditional)
│   │   ├── TestParams.tsx     # Parameters display (conditional)
│   │   └── TestFields.tsx     # Custom fields display (conditional)
│   ├── Sidebar/               # Existing from Phase 3
│   │   └── index.tsx          # Container for TestDetails
└── store/
    └── index.tsx              # selectedTest getter already exists (line 47-52)
```

### Pattern 1: MUI Stack with Dividers for Section Layout
**What:** Stack component arranges children vertically with consistent spacing and optional dividers between sections
**When to use:** Detail views with multiple distinct sections (header, error, params, fields)
**Example:**
```typescript
// Source: https://mui.com/material-ui/react-stack/
import { Stack, Divider } from '@mui/material'

<Stack spacing={3} divider={<Divider />}>
  <TestHeader />
  {test.execution.stacktrace && <TestError />}
  {Object.keys(test.params).length > 0 && <TestParams />}
  {Object.keys(test.fields).length > 0 && <TestFields />}
</Stack>
```

### Pattern 2: Observer Component with Computed Getter
**What:** Wrap detail component with observer() to track selectedTest computed value and re-render on changes
**When to use:** Any component displaying data from MobX stores, especially computed getters
**Example:**
```typescript
// Source: https://mobx.js.org/react-integration.html
// Pattern already established in MainLayout/index.tsx and TestList/index.tsx
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'

export const TestDetails = observer(() => {
  const { selectedTest, clearSelection } = useRootStore()

  // Early return for null state
  if (!selectedTest) {
    return <Typography>Select a test to view details</Typography>
  }

  // Component automatically re-renders when selectedTestId changes
  return (
    <Stack spacing={3}>
      {/* Detail sections */}
    </Stack>
  )
})
```

### Pattern 3: Conditional Section Rendering with Null Safety
**What:** Render sections only when data exists, using optional chaining and explicit null checks
**When to use:** All optional/nullable fields (stacktrace, params, custom fields)
**Example:**
```typescript
// Source: https://react.dev/learn/conditional-rendering
// Pattern: Check data exists before rendering section

{/* Error section - only for failed/broken tests with stacktrace */}
{test.execution.stacktrace && (
  <Box>
    <Typography variant="h6">Error Details</Typography>
    <Typography variant="body2">{test.message}</Typography>
    <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
      {test.execution.stacktrace}
    </Typography>
  </Box>
)}

{/* Parameters - only if params object has keys */}
{Object.keys(test.params).length > 0 && (
  <Box>
    <Typography variant="h6">Parameters</Typography>
    {Object.entries(test.params).map(([key, value]) => (
      <Box key={key} sx={{ display: 'flex', gap: 1 }}>
        <Typography variant="body2" fontWeight="bold">{key}:</Typography>
        <Typography variant="body2">{value}</Typography>
      </Box>
    ))}
  </Box>
)}
```

### Pattern 4: Key-Value Pair Display with Box Flexbox
**What:** Use Box with display: flex to create inline key-value pairs without table overhead
**When to use:** Small sets of metadata (params, custom fields) where table structure is unnecessary
**Example:**
```typescript
// Source: https://webtips.dev/display-key-value-pairs-in-react
import { Box, Typography } from '@mui/material'

{Object.entries(test.params).map(([key, value]) => (
  <Box
    key={key}
    sx={{
      display: 'flex',
      gap: 1,
      py: 0.5
    }}
  >
    <Typography variant="body2" fontWeight="600" sx={{ minWidth: 120 }}>
      {key}:
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {value}
    </Typography>
  </Box>
))}
```

### Pattern 5: Monospace Typography for Code Display
**What:** Use Typography with fontFamily="monospace" and component="pre" for stacktrace and code blocks
**When to use:** Displaying stacktraces, error messages, or any text requiring fixed-width font
**Example:**
```typescript
// Source: https://mui.com/material-ui/react-typography/
// Source: https://github.com/mui/material-ui/issues/22951
import { Typography, Box } from '@mui/material'

<Box sx={{
  bgcolor: 'grey.100',
  p: 2,
  borderRadius: 1,
  overflow: 'auto',
  maxHeight: 400
}}>
  <Typography
    component="pre"
    sx={{
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      margin: 0
    }}
  >
    {test.execution.stacktrace}
  </Typography>
</Box>
```

### Pattern 6: Duration Formatting (Reuse from Phase 2)
**What:** Format milliseconds to human-readable duration, already implemented in ReportStore pattern
**When to use:** Displaying test.execution.duration
**Example:**
```typescript
// Source: Phase 2 RESEARCH.md pattern (already used in TestListItem.tsx lines 14-18)
const duration = test.execution.duration
const durationText = duration >= 1000
  ? `${(duration / 1000).toFixed(1)}s`
  : `${duration}ms`
```

### Pattern 7: Status Icon with Semantic Colors (Reuse from Phase 3)
**What:** Use getStatusIcon() utility and MUI semantic colors for visual status indication
**When to use:** Test header section to show status prominently
**Example:**
```typescript
// Source: src/components/TestList/statusIcon.tsx (already implemented)
import { getStatusIcon } from '../TestList/statusIcon'
import { Box, Typography } from '@mui/material'

<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  {getStatusIcon(test.execution.status)}
  <Typography variant="h5">{test.title}</Typography>
</Box>
```

### Pattern 8: Back/Close Button for Navigation
**What:** IconButton with close icon in detail header to clear selection and return to list
**When to use:** Detail views in Sidebar/Drawer components for navigation control
**Example:**
```typescript
// Source: https://mui.com/material-ui/react-button/
import { IconButton, Box, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <Typography variant="h6">Test Details</Typography>
  <IconButton onClick={clearSelection} aria-label="close details">
    <CloseIcon />
  </IconButton>
</Box>
```

### Anti-Patterns to Avoid
- **Accessing nested properties without null checks:** Always use optional chaining for test.message, test.execution.stacktrace, test.relations - they can be null
- **Rendering empty sections:** Don't render "Parameters" heading if params object is empty - use conditional rendering
- **Not wrapping in observer():** TestDetails must be observer or it won't update when selectedTest changes
- **Using table for small key-value lists:** Box flexbox is simpler and more maintainable for 2-10 items
- **Breaking stacktrace formatting:** Use component="pre" and whiteSpace="pre-wrap" to preserve line breaks and indentation
- **Hardcoding Sidebar visibility:** Use RootStore.isDockOpen and openDock/closeDock for consistent state management

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Vertical layout with spacing | Custom divs with margin CSS | MUI Stack with spacing prop | Handles responsive spacing, built-in divider support, consistent with theme |
| Monospace text rendering | Custom font-face + CSS classes | Typography fontFamily="monospace" | Uses MUI theme's monospace stack, consistent styling across app |
| Key-value pair table | Custom table or grid system | Box with display: flex | Simpler for small datasets, more flexible, better mobile responsive |
| Back button navigation | Custom button + state logic | IconButton + clearSelection from RootStore | Consistent with existing patterns, centralized state management |
| Status color mapping | Manual color switch statements | Reuse getStatusIcon() from Phase 3 | Already implemented with semantic MUI colors, maintains consistency |

**Key insight:** MUI Stack and Box provide flexible layout primitives that eliminate the need for custom CSS grid/flexbox wrappers. Reusing Phase 3 patterns (observer, statusIcon, duration formatting) maintains consistency and reduces code duplication.

## Common Pitfalls

### Pitfall 1: Accessing Nullable Properties Without Checks
**What goes wrong:** Runtime errors "Cannot read property 'X' of null" when accessing test.message, test.execution.stacktrace, or test.fields
**Why it happens:** QaseTestResult schema marks these as nullable - they don't always exist
**How to avoid:** Use optional chaining (?.) and explicit null checks before rendering sections
**Warning signs:** Console errors about null properties, app crashes when viewing certain tests
**Example:**
```typescript
// BAD
<Typography>{test.message}</Typography>
<Typography>{test.execution.stacktrace}</Typography>

// GOOD
{test.message && <Typography>{test.message}</Typography>}
{test.execution.stacktrace && (
  <Typography component="pre">{test.execution.stacktrace}</Typography>
)}
```

### Pitfall 2: Not Using observer() on Detail Component
**What goes wrong:** Detail view shows stale data, doesn't update when different test is selected
**Why it happens:** MobX requires observer() to track computed getter dependencies (selectedTest)
**How to avoid:** Wrap TestDetails component with observer() at export
**Warning signs:** Clicking different test in list doesn't update detail view, manual refresh needed
**Example:**
```typescript
// BAD
export const TestDetails = () => {
  const { selectedTest } = useRootStore()
  return <div>{selectedTest?.title}</div>
}

// GOOD (see MainLayout/index.tsx line 9 for pattern)
export const TestDetails = observer(() => {
  const { selectedTest } = useRootStore()
  return <div>{selectedTest?.title}</div>
})
```

### Pitfall 3: Breaking Stacktrace Formatting
**What goes wrong:** Stacktrace displays as single line or loses indentation
**Why it happens:** Default Typography doesn't preserve whitespace and line breaks
**How to avoid:** Use component="pre" and whiteSpace: 'pre-wrap' in sx prop
**Warning signs:** Stacktrace appears on one line, indentation collapsed, hard to read
**Example:**
```typescript
// BAD
<Typography>{test.execution.stacktrace}</Typography>

// GOOD
<Typography
  component="pre"
  sx={{
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    fontSize: '0.875rem'
  }}
>
  {test.execution.stacktrace}
</Typography>
```

### Pitfall 4: Rendering Empty Sections
**What goes wrong:** Sections show headings with no content (e.g., "Parameters" heading but no parameters)
**Why it happens:** Not checking if params/fields objects have keys before rendering section
**How to avoid:** Use Object.keys(test.params).length > 0 before rendering parameter section
**Warning signs:** Empty sections with just headings, poor UX, wasted vertical space
**Example:**
```typescript
// BAD
<Box>
  <Typography variant="h6">Parameters</Typography>
  {Object.entries(test.params).map(...)}
</Box>

// GOOD
{Object.keys(test.params).length > 0 && (
  <Box>
    <Typography variant="h6">Parameters</Typography>
    {Object.entries(test.params).map(...)}
  </Box>
)}
```

### Pitfall 5: Forgetting null in Object.entries
**What goes wrong:** Runtime error when custom field value is null (fields schema allows null values)
**Why it happens:** QaseTestResult.fields type is Record<string, string | null>, values can be null
**How to avoid:** Use nullish coalescing or explicit null check when rendering field values
**Warning signs:** Errors when rendering specific tests with null custom field values
**Example:**
```typescript
// BAD
{Object.entries(test.fields).map(([key, value]) => (
  <Typography key={key}>{key}: {value}</Typography>
))}

// GOOD
{Object.entries(test.fields).map(([key, value]) => (
  <Typography key={key}>{key}: {value ?? 'N/A'}</Typography>
))}
```

### Pitfall 6: Using && with Numeric Zero
**What goes wrong:** If test.params is empty object {}, Object.keys().length returns 0, and 0 && <Component> renders "0" in UI
**Why it happens:** In JavaScript, 0 is falsy but React renders 0 as text
**How to avoid:** Use explicit comparison > 0 instead of truthy check
**Warning signs:** Seeing "0" rendered in UI instead of nothing
**Source:** https://react.dev/learn/conditional-rendering (caveat section)
**Example:**
```typescript
// BAD (renders "0" if no params)
{Object.keys(test.params).length && <ParamsSection />}

// GOOD
{Object.keys(test.params).length > 0 && <ParamsSection />}
```

### Pitfall 7: Not Handling Long Stacktraces
**What goes wrong:** Very long stacktraces overflow container, make page unscrollable
**Why it happens:** No maxHeight constraint on stacktrace display box
**How to avoid:** Set maxHeight and overflow: 'auto' on stacktrace container
**Warning signs:** Detail view becomes extremely long, hard to navigate to other sections
**Example:**
```typescript
// BAD
<Typography component="pre">{test.execution.stacktrace}</Typography>

// GOOD
<Box sx={{ maxHeight: 400, overflow: 'auto', bgcolor: 'grey.100', p: 2 }}>
  <Typography component="pre">{test.execution.stacktrace}</Typography>
</Box>
```

### Pitfall 8: Over-Nesting observer Components
**What goes wrong:** Every child component (TestHeader, TestError, etc.) wrapped with observer causes performance overhead
**Why it happens:** Misunderstanding MobX best practices - observers should be granular but not excessive for small components
**How to avoid:** For this phase, wrap only TestDetails container with observer. Child components can be plain React components receiving props
**Warning signs:** Excessive re-renders, performance degradation, complex debugging
**Source:** https://mobx.js.org/react-optimizations.html
**Note:** If child components become large or complex, consider extracting them to observer components for granular updates

## Code Examples

Verified patterns from official sources and existing project:

### TestDetails Container with Observer
```typescript
// Source: https://mobx.js.org/react-integration.html + project pattern
import { observer } from 'mobx-react-lite'
import { Stack, Divider, Typography, IconButton, Box } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useRootStore } from '../../store'

export const TestDetails = observer(() => {
  const { selectedTest, clearSelection } = useRootStore()

  if (!selectedTest) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        Select a test to view details
      </Typography>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with close button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Test Details</Typography>
        <IconButton onClick={clearSelection} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Sections with dividers */}
      <Stack spacing={3} divider={<Divider />}>
        <TestHeader test={selectedTest} />
        {selectedTest.execution.stacktrace && <TestError test={selectedTest} />}
        {Object.keys(selectedTest.params).length > 0 && <TestParams test={selectedTest} />}
        {Object.keys(selectedTest.fields).length > 0 && <TestFields test={selectedTest} />}
      </Stack>
    </Box>
  )
})
```

### TestHeader Component
```typescript
// Source: Combining Phase 3 statusIcon pattern with MUI Stack
import { Stack, Box, Typography } from '@mui/material'
import { getStatusIcon } from '../TestList/statusIcon'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

interface TestHeaderProps {
  test: QaseTestResult
}

export const TestHeader = ({ test }: TestHeaderProps) => {
  // Duration formatting from Phase 3 TestListItem.tsx
  const duration = test.execution.duration
  const durationText = duration >= 1000
    ? `${(duration / 1000).toFixed(1)}s`
    : `${duration}ms`

  return (
    <Stack spacing={1}>
      {/* Title with status icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {getStatusIcon(test.execution.status)}
        <Typography variant="h6">{test.title}</Typography>
      </Box>

      {/* Metadata row */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Status: {test.execution.status}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Duration: {durationText}
        </Typography>
      </Box>
    </Stack>
  )
}
```

### TestError Component with Stacktrace
```typescript
// Source: https://mui.com/material-ui/react-typography/ + monospace pattern
import { Box, Typography } from '@mui/material'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

interface TestErrorProps {
  test: QaseTestResult
}

export const TestError = ({ test }: TestErrorProps) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Error Details
      </Typography>

      {/* Error message */}
      {test.message && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {test.message}
        </Typography>
      )}

      {/* Stacktrace */}
      {test.execution.stacktrace && (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Stack Trace:
          </Typography>
          <Box
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              maxHeight: 400,
              overflow: 'auto'
            }}
          >
            <Typography
              component="pre"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                margin: 0
              }}
            >
              {test.execution.stacktrace}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  )
}
```

### TestParams Component with Key-Value Display
```typescript
// Source: https://webtips.dev/display-key-value-pairs-in-react
import { Box, Typography } from '@mui/material'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

interface TestParamsProps {
  test: QaseTestResult
}

export const TestParams = ({ test }: TestParamsProps) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Parameters
      </Typography>
      <Stack spacing={0.5}>
        {Object.entries(test.params).map(([key, value]) => (
          <Box
            key={key}
            sx={{
              display: 'flex',
              gap: 1,
              py: 0.5
            }}
          >
            <Typography variant="body2" fontWeight="600" sx={{ minWidth: 120 }}>
              {key}:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {value}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
```

### TestFields Component with Null Handling
```typescript
// Source: Pattern combining MUI layout with null-safe rendering
import { Box, Typography, Stack } from '@mui/material'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

interface TestFieldsProps {
  test: QaseTestResult
}

export const TestFields = ({ test }: TestFieldsProps) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Custom Fields
      </Typography>
      <Stack spacing={0.5}>
        {Object.entries(test.fields).map(([key, value]) => (
          <Box
            key={key}
            sx={{
              display: 'flex',
              gap: 1,
              py: 0.5
            }}
          >
            <Typography variant="body2" fontWeight="600" sx={{ minWidth: 120 }}>
              {key}:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {value ?? 'N/A'}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
```

### Integration with Sidebar (MainLayout)
```typescript
// Source: Existing MainLayout pattern extended for Phase 4
// Update src/layout/MainLayout/index.tsx to render TestDetails in Sidebar

import { TestDetails } from '../../components/TestDetails'

export const MainLayout = observer(() => {
  const { isDockOpen, closeDock, selectedTest } = useRootStore()

  return (
    <>
      {/* Existing layout */}
      <Sidebar isOpen={isDockOpen} onClose={closeDock}>
        <TestDetails />
      </Sidebar>
    </>
  )
})

// Pattern: selectTest() from TestList already opens dock (Phase 3)
// Pattern: closeDock() called from TestDetails close button clears selection
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Modal for detail views | Drawer/Sidebar for detail panels | UX pattern shift ~2018-2020 | Drawer provides better spatial context, doesn't block background content |
| Table for key-value pairs | Flex/Grid layouts for metadata | Responsive design era ~2015+ | Flex layouts are simpler, more mobile-friendly, easier to customize |
| Syntax highlighting libraries | Plain monospace for stacktraces | Modern browsers ~2020+ | Stacktraces are plain text, syntax highlighting adds unnecessary bundle size |
| Manual null checking | Optional chaining (?.) | TypeScript 3.7+ (2019) | Already using TS 5.9.3, optional chaining is standard and safer |
| Class components with MobX | Functional + mobx-react-lite | mobx-react-lite v3 (2020) | Already using this pattern throughout project |

**Deprecated/outdated:**
- Using Table component for small metadata lists - Box flexbox is simpler for 2-10 items
- Separate theme.breakpoints.down() media queries - MUI responsive props handle this automatically
- Manual font stacks for monospace - Use theme.typography.fontFamilyMonospace or direct "monospace" string

## Open Questions

1. **Should stacktrace be collapsible/expandable?**
   - What we know: Stacktraces can be very long (50+ lines), take up significant vertical space
   - What's unclear: User preference for always-visible vs expandable accordion
   - Recommendation: Start with fixed maxHeight + scroll (simpler), add accordion in later phase if users request it

2. **How to display empty custom fields?**
   - What we know: fields schema allows null values (Record<string, string | null>)
   - What's unclear: Display strategy for null vs missing keys (show "N/A", hide field, show empty string)
   - Recommendation: Show "N/A" for null values (better UX than hiding), consistent with Phase 2 pattern

3. **Should test parameters be syntax-highlighted?**
   - What we know: params are string key-value pairs (Record<string, string>), values might contain JSON
   - What's unclear: Frequency of complex param values requiring highlighting
   - Recommendation: Start with plain text display, defer syntax highlighting to Phase 6 (attachments) if needed

4. **Navigation when no test selected?**
   - What we know: selectedTestId starts as null, selectedTest getter returns null
   - What's unclear: Should Sidebar auto-open when test selected, auto-close when cleared?
   - Recommendation: Reuse existing isDockOpen pattern - selectTest() opens dock (Phase 3), clearSelection() closes it for consistency

5. **How to handle muted tests?**
   - What we know: QaseTestResult.muted boolean indicates if failures are ignored
   - What's unclear: Should muted status be displayed prominently in detail view?
   - Recommendation: Display muted badge in TestHeader if true, helps explain why failed test might be "acceptable"

## Sources

### Primary (HIGH confidence)
- MUI Stack Component - https://mui.com/material-ui/react-stack/
- MUI Box Component - https://mui.com/material-ui/react-box/
- MUI Typography - https://mui.com/material-ui/react-typography/
- MUI Divider - https://mui.com/material-ui/react-divider/
- MobX React Integration - https://mobx.js.org/react-integration.html
- MobX Computed Values - https://mobx.js.org/computeds.html
- React Conditional Rendering - https://react.dev/learn/conditional-rendering
- Project codebase: src/store/index.tsx (selectedTest getter), src/schemas/QaseTestResult.schema.ts

### Secondary (MEDIUM confidence)
- MUI Card Component - https://mui.com/material-ui/react-card/
- MUI Drawer Navigation - https://mui.com/material-ui/react-drawer/
- MobX React Optimizations - https://mobx.js.org/react-optimizations.html
- React Key-Value Display - https://webtips.dev/display-key-value-pairs-in-react
- Phase 2 RESEARCH.md - Duration formatting patterns
- Phase 3 components - statusIcon.tsx, TestListItem.tsx patterns

### Tertiary (LOW confidence - community examples)
- Monospace font in MUI - https://github.com/mui/material-ui/issues/22951
- MUI Typography custom styling - https://muhimasri.com/blogs/mui-typography/

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, official MUI/MobX docs verified
- Architecture: HIGH - Patterns established in Phase 2 and 3, reusing existing components (Sidebar, observer, statusIcon)
- Pitfalls: HIGH - Null handling documented in React and MobX official docs, conditional rendering caveats well-known
- Code examples: HIGH - Derived from official MUI/MobX docs, existing project patterns, and QaseTestResult schema

**Research date:** 2026-02-09
**Valid until:** ~30 days (MUI/MobX are stable, no breaking changes expected)

**Notes:**
- No CONTEXT.md exists for this phase, full freedom in approach
- selectedTest computed getter already implemented in RootStore (lines 47-52)
- Sidebar component from Phase 3 provides container
- Duration formatting pattern from Phase 2, status icons from Phase 3 can be reused
- QaseTestResult schema defines all data structures (nullable fields, params/fields types)
