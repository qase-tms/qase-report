---
phase: 08-history-infrastructure
plan: 02
subsystem: stores
tags: [mobx, state-management, history, localStorage, persistence]
dependency-graph:
  requires: [QaseHistorySchema, QaseHistory, HistoricalRun, HistoricalTestRunData]
  provides: [HistoryStore]
  affects: [RootStore, AnalyticsStore, FileLoaderService]
tech-stack:
  added: []
  patterns: [MobX makeAutoObservable, localStorage persistence, tiered loading]
key-files:
  created:
    - src/store/HistoryStore.ts
  modified:
    - src/store/index.tsx
key-decisions:
  - "100-run limit for memory management (research shows diminishing returns after 30-50 runs)"
  - "2MB size warning threshold for localStorage (browser limit is ~5MB)"
  - "Duplicate run detection by run_id to prevent appending same run twice"
  - "Error message extraction from stacktrace first line for flakiness detection"
metrics:
  duration: 2m 2s
  completed: 2026-02-10
---

# Phase 8 Plan 2: HistoryStore with Tiered Loading Summary

MobX store for history data management with localStorage persistence and memory-efficient tiered loading.

## What Was Built

Created `src/store/HistoryStore.ts` (303 lines) providing:

1. **Observable Properties:**
   - `history: QaseHistory | null` - Full history data, nullable before load
   - `isHistoryLoaded: boolean` - Tracking state for load status
   - `historyError: string | null` - Validation or loading error message

2. **Actions:**
   - `loadHistoryFile(file: File)` - Loads and validates test-history.json with Zod schema
   - `saveToLocalStorage()` - Persists history with quota error handling and size warnings
   - `loadFromLocalStorage()` - Restores history on initialization, clears corrupted data
   - `clearHistory()` - Clears all history data and localStorage
   - `addCurrentRun(run, testResults)` - Appends current run with signature-based test tracking

3. **Computed Properties:**
   - `recentRuns` - Last 10 runs (most recent first)
   - `totalRuns` - Total number of runs in history
   - `getTestHistory(signature)` - Per-test historical data for tiered loading

4. **Memory Management:**
   - MAX_RUNS = 100 (removes oldest when exceeded)
   - SIZE_WARNING_THRESHOLD = 2MB (console.warn when exceeded)
   - Automatic cleanup of orphaned test entries when runs are removed

Updated `src/store/index.tsx` to integrate HistoryStore:
- Import HistoryStore
- Add `historyStore: HistoryStore` property
- Instantiate in constructor

## Verification Results

| Check | Result |
|-------|--------|
| TypeScript compilation | PASS |
| HistoryStore exported | PASS |
| loadHistoryFile method | PASS |
| saveToLocalStorage method | PASS |
| addCurrentRun method | PASS |
| Min 120 lines requirement | PASS (303 lines) |
| historyStore property in RootStore | PASS |
| HistoryStore instantiation | PASS |
| key_link index.tsx -> HistoryStore.ts | PASS |
| key_link HistoryStore -> QaseHistory.schema.ts | PASS |

## Key Design Decisions

1. **100-Run Limit**: Research shows diminishing returns after 30-50 runs for statistical analysis. 100 runs provides comprehensive history while preventing memory issues.

2. **2MB Size Warning**: localStorage has ~5MB limit per domain. Warning at 2MB gives users time to act before hitting hard limit.

3. **Duplicate Run Detection**: Checks if run_id already exists before appending to prevent duplicate entries when reloading same report.

4. **Error Message Extraction**: Extracts first line of stacktrace for future flakiness detection (consistent errors vs random failures).

5. **Tiered Loading Ready**: Schema separates run summaries from per-test data, enabling `getTestHistory()` for on-demand detail loading.

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Commit | Message | Files |
|--------|---------|-------|
| d36bba9 | feat(08-02): add HistoryStore with tiered loading and localStorage | src/store/HistoryStore.ts |
| 60f9c66 | feat(08-02): integrate HistoryStore into RootStore | src/store/index.tsx |

## Self-Check: PASSED

- [x] File exists: src/store/HistoryStore.ts
- [x] File exists: src/store/index.tsx (modified)
- [x] Commit exists: d36bba9
- [x] Commit exists: 60f9c66
- [x] All verification checks passed
