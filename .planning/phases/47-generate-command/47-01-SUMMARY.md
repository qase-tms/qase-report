---
phase: 47-generate-command
plan: 01
subsystem: CLI
tags: [build-config, html-generation, static-export]

dependency_graph:
  requires:
    - vite.config.ts (existing build config)
    - dist/index.html (built template)
  provides:
    - Single-file HTML build capability
    - HTML generator module with data embedding
  affects:
    - Generate command (Phase 47-02)
    - Static report generation workflow

tech_stack:
  added:
    - vite-plugin-singlefile (asset inlining)
  patterns:
    - XSS-safe JSON embedding
    - Window global data injection
    - Graceful history loading

key_files:
  created:
    - src/cli/generators/html-generator.ts (183 lines)
  modified:
    - vite.config.ts (added viteSingleFile plugin)
    - package.json (new dev dependency)

decisions: []

metrics:
  duration_seconds: 166
  tasks_completed: 2
  files_created: 1
  files_modified: 3
  commits: 2
  completion_date: 2026-02-12
---

# Phase 47 Plan 01: Single-File Build and HTML Generator Summary

**One-liner:** Vite single-file build with vite-plugin-singlefile + HTML generator module for XSS-safe data embedding in static reports.

## Overview

Configured Vite to produce self-contained HTML files with all assets inlined, and created HTML generator module to embed report data as window globals for offline viewing.

## Tasks Completed

### Task 1: Install vite-plugin-singlefile and configure Vite
**Commit:** 71230a7
**Duration:** ~50s

Installed `vite-plugin-singlefile` and added to Vite config after react/tailwindcss plugins. Plugin automatically inlines all JS/CSS assets during build.

**Key changes:**
- Added `viteSingleFile()` to plugins array in vite.config.ts
- Verified build produces single 1.2MB HTML file
- Confirmed no external .js/.css files in dist/

**Verification:**
- ✅ `npm run build` succeeds
- ✅ dist/index.html contains inlined script/style tags
- ✅ No external JS/CSS files exist in dist/

### Task 2: Create HTML generator module
**Commit:** 26c3ba5
**Duration:** ~116s

Created `src/cli/generators/html-generator.ts` with five exported functions for loading report data and generating self-contained HTML with embedded JSON.

**Key changes:**
- **escapeJsonForHtml()**: XSS-safe JSON escaping (`<` → `\u003c`, `/` → `\/`)
- **injectData()**: Inject data as `window[key] = value` before `</head>`
- **loadReportData()**: Read run.json + results/*.json files
- **loadHistoryData()**: Load history with graceful null fallback
- **generateHtmlReport()**: Main function combining template + data

**Data keys injected:**
- `__QASE_RUN_DATA__` - Run metadata
- `__QASE_RESULTS_DATA__` - Test results array
- `__QASE_HISTORY_DATA__` - History (if available)
- `__QASE_STATIC_MODE__` - Static mode flag

**Verification:**
- ✅ `npx tsc --noEmit -p tsconfig.cli.json` passes
- ✅ All 5 functions exported correctly
- ✅ Types imported with .js extensions (NodeNext compatibility)

## Technical Implementation

### Single-File Build Strategy

**Plugin order:** react() → tailwindcss() → viteSingleFile() → legacy()

The viteSingleFile plugin runs after main bundling to inline all chunks:
1. Modern build: inlines index-*.js and style-*.css
2. Legacy build: inlines index-legacy-*.js and polyfills-legacy-*.js

**Result:** Single 1.2MB HTML file (341.91 kB gzipped) with no external dependencies.

### HTML Generation Flow

```
Template (dist/index.html)
  → Load report data (run.json + results/*.json)
  → Load history (optional)
  → Inject as window globals (XSS-escaped)
  → Return self-contained HTML
```

**XSS Prevention:**
- Replace `<` with `\u003c` (prevents tag injection)
- Replace `/` with `\/` (prevents `</script>` breaking)
- Replace `>` with `\u003e` (consistency)

**History Handling:**
- Default path: `{reportPath}/qase-report-history.json`
- Graceful fallback: returns null if missing
- Optional custom path via `historyPath` parameter

## Integration Points

**Current:**
- Vite build system produces single-file output
- HTML generator ready for use by generate command

**Next (Phase 47-02):**
- Generate command will call `generateHtmlReport()`
- Output HTML to specified path or stdout
- Support --output flag for file destination

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

**Created files verification:**
```
✓ FOUND: src/cli/generators/html-generator.ts
```

**Commits verification:**
```
✓ FOUND: 71230a7
✓ FOUND: 26c3ba5
```

**Build artifacts verification:**
```
✓ dist/index.html exists and is single-file (1.2MB)
✓ No external JS/CSS files in dist/
```

All planned artifacts created and verified.
