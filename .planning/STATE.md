# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-10)

**Core value:** Пользователь может открыть Qase Report JSON и увидеть результаты тестирования в понятном, интерактивном интерфейсе с фильтрацией, детальными шагами и вложениями.
**Current focus:** Phase 12 - Stability Scoring (v1.1 milestone)

## Current Position

Phase: 12 of 12 (Stability Scoring)
Plan: 1 of 3 complete
Status: Phase 12 in progress - stability scoring algorithm implemented
Last activity: 2026-02-10 — Phase 12 Plan 01 executed (stability scoring types and AnalyticsStore methods)

Progress: [████████████░░░░] 92% (11 of 12 phases complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 12 (v1.0 MVP)
- Average duration: Not tracked (v1.0 pre-GSD)
- Total execution time: ~2 days (v1.0 MVP)

**By Phase:**

| Phase | Plans | Duration | Status |
|-------|-------|----------|--------|
| 1-7 (v1.0) | 12 | ~2 days | Complete |
| 8 (History Infrastructure) | 3/3 | ~8m | Complete |
| 9 (Trend Visualization) | 3/3 | ~7m | Complete |
| 10 (Flakiness Detection) | 2/2 | ~6m | Complete |
| 11 (Regression Alerts) | 2/2 | ~6m | Complete |

**Recent Executions:**

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 09 | 01 | 2m 1s | 2 | 2 |
| 09 | 02 | 2m 55s | 3 | 4 |
| 09 | 03 | ~2m | 4 | 3 |
| 10 | 01 | 2m 33s | 3 | 2 |
| 10 | 02 | ~3m | 3 | 2 |
| 11 | 01 | 1m 51s | 3 | 2 |
| 11 | 02 | ~4m | 3 | 2 |
| 12 | 01 | 3m 25s | 3 | 2 |

## Accumulated Context

### Decisions

Recent decisions affecting v1.1 work:

- **v1.1 Milestone Start**: Focus on analytics features (history, trends, flakiness, regressions, stability scoring)
- **Phase Numbering**: Continue from Phase 8 (v1.0 ended at Phase 7)
- **Depth**: Standard (5-8 phases, 3-5 plans each) for v1.1
- **Research Complete**: Comprehensive research summary available (recharts, simple-statistics, date-fns stack validated)
- **SchemaVer Versioning (08-01)**: Using MODEL-REVISION-ADDITION format for history schema version field
- **Signature-Based Identity (08-01)**: Tests tracked by signature, not UUID, for stable history across runs
- **100-Run Limit (08-02)**: HistoryStore limits to 100 runs for memory management (research shows diminishing returns after 30-50)
- **2MB Size Warning (08-02)**: localStorage persistence warns at 2MB threshold before hitting 5MB browser limit

See PROJECT.md Key Decisions table for full history.
- [Phase 09]: Computed properties for trend caching - MobX automatically optimizes recomputation
- [Phase 09]: Single TrendDataPoint dataset for both pass rate and duration trends
- [Phase 09]: Recharts v2.15 for stability, single passRate line for clarity, custom tooltips with full stats
- [Phase 09-03]: MUI Lab Timeline for HistoryTimeline component, color-coded status (green/red/yellow), show timeline even with single run
- [Phase 10-01]: 80% error consistency threshold - balances between real bugs and flaky tests
- [Phase 10-01]: 20% transition rate threshold for flaky classification - 1 in 5 runs indicates instability
- [Phase 10-01]: 5-run minimum for flakiness detection - prevents false positives from insufficient data
- [Phase 10-02]: Replace memo() with observer() in TestListItem for MobX reactivity
- [Phase 10-02]: Hide badges when insufficient_data (< 5 runs) for clean UI
- [Phase 10-02]: Color-coded chips (warning/success/error) for immediate status recognition
- [Phase 11-01]: 2-sigma threshold (mean + 2*stddev) balances between false positives and catching real regressions
- [Phase 11-01]: Compare latest run against historical mean (excluding current) to detect if current run is outlier
- [Phase 11-01]: stdDev > 0 check prevents false positives when all durations are identical
- [Phase 11-01]: AlertItem unified interface for all alert types (flakiness, regression, new_failure)
- [Phase 11-02]: AlertsPanel navigation callback pattern - onAlertClick(testSignature) for loose coupling
- [Phase 11-02]: 10-alert display limit with overflow indicator for clean dashboard UI
- [Phase 11-02]: Type-specific UI mapping (getAlertIcon/getAlertBadge) for extensible alert rendering
- [Phase 12-01]: MIN_RUNS_STABILITY=10 (vs flakiness MIN_RUNS=5) for multi-factor statistical validity
- [Phase 12-01]: Weighted formula: passRate*0.5 + (100-flakiness)*0.3 + (100-CV)*0.2 balances correctness and reliability
- [Phase 12-01]: CV capped at 100% prevents extreme variance from infinitely penalizing score
- [Phase 12-01]: Grade thresholds: A+=95, A=90, B=80, C=70, D=60, F=<60 for standard academic scale

### Pending Todos

None yet.

### Blockers/Concerns

**From Research:**
- ~~**Recharts MUI theming**: Integration approach needs validation during Phase 9 (may need custom theming vs @latticejs/mui-recharts wrapper)~~ — RESOLVED: Direct theme.palette access works well, no wrapper needed
- **Flakiness false positives**: Algorithm needs real-world tuning in Phase 10 (track precision/recall metrics)
- **History retention limits**: Optimal run count varies by use case (monitor in Phase 8, make configurable later)

## Session Continuity

Last session: 2026-02-10
Stopped at: Completed 12-01-PLAN.md (stability scoring algorithm)
Resume file: None
Next action: Execute 12-02-PLAN.md (Stability UI) or 12-03-PLAN.md (Grade Badges)
