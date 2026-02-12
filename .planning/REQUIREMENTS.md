# Requirements: Qase Report v1.6

**Defined:** 2026-02-12
**Core Value:** Пользователь может открыть Qase Report JSON и увидеть результаты тестирования в понятном, интерактивном интерфейсе с фильтрацией, детальными шагами, вложениями и аналитикой стабильности.

## v1.6 Requirements

Requirements for v1.6 Qase TMS Design Polish. Приближение дизайна к Qase TMS.

### Test List Columns

- [ ] **LIST-01**: User sees test ID column with gear icon prefix
- [ ] **LIST-02**: User sees STATUS column with colored badge (Passed/Failed/Skipped/Broken)
- [ ] **LIST-03**: User sees TITLE column with test name
- [ ] **LIST-04**: User sees DURATION column with clock icon and time
- [ ] **LIST-05**: User sees column headers (ID, STATUS, TITLE, DURATION) in suite rows

### Progress Bars

- [ ] **PROG-01**: User sees thin horizontal progress bar on suite rows
- [ ] **PROG-02**: Progress bar shows green segment for passed tests
- [ ] **PROG-03**: Progress bar shows red segment for failed tests
- [ ] **PROG-04**: Duration displays left of progress bar with clock icon

### Sidebar

- [ ] **SIDE-01**: User sees "Status" field with icon (Passed/Failed)
- [ ] **SIDE-02**: User sees "Started at" field with calendar icon and datetime
- [ ] **SIDE-03**: User sees "Total Time" field with clock icon
- [ ] **SIDE-04**: User sees "Finished at" field with calendar icon and datetime
- [ ] **SIDE-05**: User sees larger completion ring with percentage and "X of Y" text

### Timeline View

- [ ] **TIME-01**: User can access Timeline tab in navigation
- [ ] **TIME-02**: Timeline shows test execution over time (visualization TBD)

## Future Requirements

Deferred to future releases.

### Mobile & Scale

- **MOB-01**: Mobile responsive layout
- **SCALE-01**: Enterprise scale (2000+ tests)

### Enhanced Interaction

- **INT-04**: Column visibility toggle (show/hide columns)
- **INT-05**: Context menu на right-click для тестов
- **INT-06**: Keyboard shortcuts для навигации

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Checkboxes + bulk actions | Not prioritized for v1.6, focus on visual style |
| MEMBER column | Qase Report Format doesn't have user assignment data |
| AI error analysis | Requires external API integration |
| Real-time reporting | Low priority, complex implementation |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LIST-01 | Phase 37 | ✓ Done |
| LIST-02 | Phase 37 | ✓ Done |
| LIST-03 | Phase 37 | ✓ Done |
| LIST-04 | Phase 37 | ✓ Done |
| LIST-05 | Phase 37 | ✓ Done |
| PROG-01 | Phase 38 | ✓ Done |
| PROG-02 | Phase 38 | ✓ Done |
| PROG-03 | Phase 38 | ✓ Done |
| PROG-04 | Phase 38 | ✓ Done |
| SIDE-01 | Phase 39 | Pending |
| SIDE-02 | Phase 39 | Pending |
| SIDE-03 | Phase 39 | Pending |
| SIDE-04 | Phase 39 | Pending |
| SIDE-05 | Phase 39 | Pending |
| TIME-01 | Phase 40 | Pending |
| TIME-02 | Phase 40 | Pending |

**Coverage:**
- v1.6 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 (100% coverage)

---
*Requirements defined: 2026-02-12*
*Last updated: 2026-02-12 after roadmap creation*
