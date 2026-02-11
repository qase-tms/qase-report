---
phase: 08-history-infrastructure
plan: 01
subsystem: schemas
tags: [zod, validation, history, typescript, versioning]
dependency-graph:
  requires: []
  provides: [QaseHistorySchema, QaseHistory, HistoricalRun, HistoricalTestResult, HistoricalTestRunData]
  affects: [HistoryStore, FileLoaderService]
tech-stack:
  added: []
  patterns: [Zod schema validation, SchemaVer versioning, signature-based test identity]
key-files:
  created:
    - src/schemas/QaseHistory.schema.ts
  modified: []
key-decisions:
  - "Used SchemaVer format (MODEL-REVISION-ADDITION) for schema_version field"
  - "Signature-based test identity (not UUID) for stable tracking across runs"
  - "Included error_message field for future flakiness detection"
  - "Tiered schema design: runs for summaries, tests for detailed per-test history"
metrics:
  duration: 1m 7s
  completed: 2026-02-10
---

# Phase 8 Plan 1: History Schema with Versioning Summary

Zod schema for test-history.json with SchemaVer versioning and signature-based test identity for stable tracking across runs.

## What Was Built

Created `src/schemas/QaseHistory.schema.ts` (193 lines) providing:

1. **QaseHistorySchema** - Root schema for test-history.json
   - `schema_version`: String field with "1.0.0" default (SchemaVer format)
   - `runs`: Array of historical run summaries
   - `tests`: Array of per-test historical results

2. **HistoricalRunSchema** - Run-level summary data
   - `run_id`: Unique identifier (timestamp or UUID)
   - `title`, `environment`: Optional metadata
   - `start_time`, `end_time`, `duration`: Timing data
   - `stats`: Aggregated run statistics (total, passed, failed, skipped, etc.)

3. **HistoricalTestResultSchema** - Per-test history across runs
   - `signature`: Stable test identifier (matches QaseTestResult.signature)
   - `title`: Test name
   - `runs`: Array of per-run execution data

4. **HistoricalTestRunDataSchema** - Single test execution in a run
   - `run_id`: Reference to parent run
   - `status`: Test status enum (passed/failed/skipped/broken)
   - `duration`, `start_time`: Timing data
   - `error_message`: First line of error (nullable) for flakiness detection

5. **TypeScript Types** - Exported types via z.infer:
   - `QaseHistory`, `HistoricalRun`, `HistoricalTestResult`, `HistoricalTestRunData`

## Verification Results

| Check | Result |
|-------|--------|
| TypeScript compilation | PASS |
| QaseHistorySchema exported | PASS |
| QaseHistory type exported | PASS |
| HistoricalRun type exported | PASS |
| HistoricalTestResult type exported | PASS |
| schema_version field present | PASS |
| error_message field present | PASS |
| Min 80 lines requirement | PASS (193 lines) |

## Key Design Decisions

1. **SchemaVer Versioning**: Using MODEL-REVISION-ADDITION format (e.g., "1.0.0") enables future migrations without breaking compatibility.

2. **Signature-Based Identity**: Tests are tracked by `signature` field (stable across runs) rather than run-specific UUIDs, enabling consistent history tracking.

3. **Tiered Loading Support**: Schema separates run summaries (`runs`) from detailed per-test data (`tests`), enabling efficient loading strategies.

4. **Flakiness Detection Ready**: `error_message` field stores first line of stacktrace for comparing error consistency vs random failures.

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Commit | Message | Files |
|--------|---------|-------|
| 1f2e82e | feat(08-01): add QaseHistory schema with versioning | src/schemas/QaseHistory.schema.ts |

## Self-Check: PASSED

- [x] File exists: src/schemas/QaseHistory.schema.ts
- [x] Commit exists: 1f2e82e
- [x] All verification checks passed
