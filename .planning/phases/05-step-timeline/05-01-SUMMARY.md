---
phase: 05-step-timeline
plan: 01
subsystem: test-details
tags: [ui, components, visualization, steps, timeline, attachments]
completed: 2026-02-09
duration_minutes: 2

dependencies:
  requires:
    - "04-01 (TestDetails sidebar component)"
    - "Step.schema.ts (recursive step structure)"
    - "Attachment.schema.ts (attachment data types)"
  provides:
    - "formatDuration utility (shared duration formatting)"
    - "TestSteps container component"
    - "TestStep recursive component with expand/collapse"
    - "TestStepAttachment with image preview support"
  affects:
    - "TestDetails (added conditional steps section)"

tech_stack:
  added: []
  patterns:
    - "Recursive component rendering for nested steps"
    - "useState for expand/collapse state"
    - "Collapse component for smooth transitions"
    - "Shared utility function extraction"
    - "Base64 image inline preview"
    - "Error handling for broken images"

key_files:
  created:
    - src/utils/formatDuration.ts
    - src/components/TestDetails/TestSteps.tsx
    - src/components/TestDetails/TestStep.tsx
    - src/components/TestDetails/TestStepAttachment.tsx
  modified:
    - src/components/TestDetails/index.tsx

decisions:
  - title: "Extract formatDuration to shared utility"
    rationale: "Avoid duplication between TestHeader and TestStep components"
    alternatives: ["Duplicate logic in each component"]
    impact: "Consistent formatting, easier maintenance"

  - title: "Cap step indentation at 24px"
    rationale: "Prevent excessive horizontal space usage for deeply nested steps"
    alternatives: ["Unlimited indentation", "Fixed indentation per level"]
    impact: "Better UX for deep step hierarchies"

  - title: "Steps start expanded by default"
    rationale: "Maximize visibility of step details on first view"
    alternatives: ["Start collapsed", "Expand only first level"]
    impact: "Immediate visibility of full execution flow"

  - title: "Support both base64 and file path for images"
    rationale: "Handle different reporter output formats flexibly"
    alternatives: ["Only base64", "Only file paths"]
    impact: "Works with various report structures"

  - title: "Add explicit type annotations for map callbacks"
    rationale: "TypeScript couldn't infer types from recursive Step schema"
    alternatives: ["Use type assertions", "Modify Step schema"]
    impact: "Build passes without strictness compromises"

metrics:
  tasks_completed: 2
  files_created: 4
  files_modified: 2
  commits: 2
  lines_added: 163
  build_status: passed
  dev_server: verified
---

# Phase 5 Plan 1: Step Timeline Implementation Summary

**One-liner:** Recursive step timeline with visual hierarchy, status icons, formatted duration, expand/collapse, and inline image attachment previews

## Objective Achieved

Implemented a complete step timeline visualization system that displays nested test steps with visual hierarchy, execution status, duration formatting, and attachment handling. Users can now see the full execution breakdown of each test in the TestDetails sidebar.

## Tasks Completed

### Task 1: Create formatDuration utility and recursive TestStep components
**Status:** ✅ Complete
**Commit:** b11eece

Created the foundation for step visualization:
- **formatDuration utility** - Extracted shared duration formatting logic (>1000ms → seconds, <1000ms → milliseconds)
- **TestSteps container** - Manages top-level step list with section heading
- **TestStep recursive component** - Self-referencing component with:
  - Visual indentation based on depth (capped at 24px)
  - Expand/collapse toggle for steps with children
  - Status icon integration (reusing getStatusIcon from TestList)
  - Formatted duration display
  - Preparation for attachment rendering

**Files created:**
- `src/utils/formatDuration.ts` (310 bytes)
- `src/components/TestDetails/TestSteps.tsx` (465 bytes)
- `src/components/TestDetails/TestStep.tsx` (2,253 bytes)

### Task 2: Create TestStepAttachment and integrate TestSteps into TestDetails
**Status:** ✅ Complete
**Commit:** 2359d22

Completed the step timeline feature:
- **TestStepAttachment component** - Displays attachment information with:
  - File chips with appropriate icons (ImageIcon for images, FileIcon for others)
  - Inline image preview for base64-encoded content
  - Inline image preview for external file paths
  - Error handling to hide broken images
  - Proper indentation (ml: 4) from parent step
- **TestDetails integration** - Added conditional TestSteps section to sidebar
- **Type safety fixes** - Added explicit type annotations for Attachment and Step in map callbacks

**Files created:**
- `src/components/TestDetails/TestStepAttachment.tsx` (1,487 bytes)

**Files modified:**
- `src/components/TestDetails/index.tsx` - Added TestSteps import and conditional render
- `src/components/TestDetails/TestStep.tsx` - Added Attachment type import and explicit annotations

## Verification Results

### Build Verification
✅ `npm run build` passed with no TypeScript errors or warnings

### Dev Server Verification
✅ `npm run dev` started successfully on http://localhost:5174/

### Component Structure Verification
✅ All files created and properly linked:
- formatDuration utility exports function
- TestSteps imports and renders TestStep components
- TestStep recursively renders itself and TestStepAttachment
- TestStepAttachment handles both base64 and file path images
- TestDetails conditionally renders TestSteps section

### Must-Have Verification

| Must-Have | Status | Evidence |
|-----------|--------|----------|
| User can see nested test steps with visual hierarchy | ✅ | TestStep implements recursive rendering with depth-based indentation |
| Each step shows status icon and duration | ✅ | getStatusIcon integration + formatDuration utility |
| Steps with attachments show inline preview or links | ✅ | TestStepAttachment with image preview support |
| User can expand/collapse nested step groups | ✅ | useState + Collapse component with toggle IconButton |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added explicit type annotations for TypeScript inference**
- **Found during:** Task 2 verification (build phase)
- **Issue:** TypeScript compiler couldn't infer Attachment and Step types from map callbacks due to recursive schema definition
- **Fix:** Added explicit type annotations: `(attachment: Attachment)` and `(childStep: Step)`, plus imported Attachment type
- **Files modified:** `src/components/TestDetails/TestStep.tsx`
- **Commit:** 2359d22 (included in Task 2)
- **Rationale:** TypeScript's inference limitations with recursive z.lazy() schemas require explicit help. This is a correctness requirement (Rule 1 - code doesn't compile without it).

## Technical Implementation Details

### Duration Formatting
Extracted from TestHeader.tsx to shared utility:
```typescript
export const formatDuration = (ms: number): string => {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`
  }
  return `${ms}ms`
}
```

### Recursive Step Rendering
TestStep component renders itself recursively:
```typescript
{hasChildren &&
  step.steps.map((childStep: Step) => (
    <TestStep key={childStep.id} step={childStep} depth={depth + 1} />
  ))}
```

Key implementation details:
- Uses step.id as React key (not array index) for stability
- Caps indentation at 24px: `ml: Math.min(depth * 3, 24)`
- Starts expanded (isExpanded = true) for immediate visibility
- Shows empty Box spacer when no children for consistent alignment

### Attachment Handling
TestStepAttachment supports multiple formats:
- **Base64 images:** `data:${mime_type};base64,${content}`
- **External paths:** Direct src attribute
- **Error handling:** onError sets imageError state to hide broken images
- **Non-images:** Display as file chip only

### Integration Pattern
TestDetails conditionally renders steps:
```typescript
{selectedTest.steps && selectedTest.steps.length > 0 && (
  <TestSteps steps={selectedTest.steps} />
)}
```
Uses explicit `.length > 0` check to avoid rendering "0" (project pattern from Phase 4).

## Key Learnings

1. **Recursive schemas require type hints** - z.lazy() schemas lose type inference in callback contexts
2. **Visual hierarchy caps prevent UX issues** - Deep nesting without limits breaks layout
3. **Flexible attachment handling future-proofs** - Supporting both base64 and paths handles various reporters
4. **Component extraction improves readability** - TestStepAttachment separation keeps TestStep focused

## Success Criteria Met

- ✅ Step timeline displays nested step hierarchy with visual indentation
- ✅ Each step shows status icon (reusing getStatusIcon) and formatted duration
- ✅ Steps with attachments show inline chips with file type icons
- ✅ Image attachments show thumbnail preview when possible
- ✅ User can expand/collapse nested step groups
- ✅ TestDetails integrates TestSteps section conditionally
- ✅ No TypeScript errors, build passes

## Impact

**User Experience:**
- Users can now see complete test execution breakdown
- Visual hierarchy makes it easy to understand step relationships
- Inline image previews provide immediate context
- Expand/collapse keeps UI manageable for complex tests

**Code Quality:**
- Shared formatDuration utility eliminates duplication
- Recursive component pattern is clean and maintainable
- Type safety maintained throughout
- Follows established project patterns (MUI, MobX observer, conditional rendering)

**Integration:**
- Seamlessly integrated into existing TestDetails sidebar
- Reuses statusIcon utility for consistency
- Respects project's conditional rendering conventions
- Ready for Phase 6 (Export functionality)

## Next Steps

Phase 5 Plan 1 is complete. Ready to proceed to Phase 6 (Export functionality) or handle additional step timeline enhancements if needed.

## Self-Check

Verifying all claimed artifacts exist and commits are valid:

**Files:**
```bash
[ -f "src/utils/formatDuration.ts" ] && echo "✅ formatDuration.ts"
[ -f "src/components/TestDetails/TestSteps.tsx" ] && echo "✅ TestSteps.tsx"
[ -f "src/components/TestDetails/TestStep.tsx" ] && echo "✅ TestStep.tsx"
[ -f "src/components/TestDetails/TestStepAttachment.tsx" ] && echo "✅ TestStepAttachment.tsx"
```

**Commits:**
```bash
git log --oneline --all | grep -q "b11eece" && echo "✅ b11eece (Task 1)"
git log --oneline --all | grep -q "2359d22" && echo "✅ 2359d22 (Task 2)"
```

Running self-check...

**Results:**
```
✅ formatDuration.ts
✅ TestSteps.tsx
✅ TestStep.tsx
✅ TestStepAttachment.tsx
✅ b11eece (Task 1)
✅ 2359d22 (Task 2)
```

## Self-Check: PASSED

All claimed files exist and all commits are present in git history.
