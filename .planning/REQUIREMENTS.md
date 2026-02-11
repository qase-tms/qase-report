# Requirements: Qase Report v1.5

**Defined:** 2026-02-11
**Core Value:** Пользователь может открыть Qase Report JSON и увидеть результаты тестирования в интерфейсе стиля Qase TMS

## v1.5 Requirements

Requirements for Qase TMS style redesign with shadcn/ui migration.

### Foundation

- [ ] **FOUND-01**: Tailwind CSS v4 установлен и настроен с Vite plugin
- [ ] **FOUND-02**: shadcn/ui CLI инициализирован с path aliases
- [ ] **FOUND-03**: Dark theme настроен через Tailwind CSS variables
- [ ] **FOUND-04**: MUI и Emotion полностью удалены из проекта
- [ ] **FOUND-05**: lucide-react заменяет @mui/icons-material

### Layout

- [ ] **LAYOUT-01**: Tab-based navigation заменяет hamburger menu (Test cases, Overview, Failure Clusters, Gallery, Comparison)
- [ ] **LAYOUT-02**: Right sidebar отображает completion rate ring и run metadata (всегда видимый)
- [ ] **LAYOUT-03**: Test details открываются в Sheet drawer справа (вместо modal)
- [ ] **LAYOUT-04**: Nested tabs внутри drawer (Execution, Info, Run History, Retries)
- [ ] **LAYOUT-05**: Top bar содержит заголовок run и action buttons

### Data Display

- [ ] **DATA-01**: Test list отображается как Data Table (TanStack) с колонками ID, Status, Title, Duration
- [ ] **DATA-02**: Table поддерживает сортировку по всем колонкам
- [ ] **DATA-03**: Status отображается через Badge компонент с цветовыми вариантами
- [ ] **DATA-04**: Suite hierarchy отображается как expandable rows с Progress bar
- [ ] **DATA-05**: Progress bar показывает pass/fail сегменты (multi-color)
- [ ] **DATA-06**: Completion rate ring в sidebar показывает общий pass rate (Radial Chart)
- [ ] **DATA-07**: Loading skeletons отображаются при загрузке данных

### Interaction

- [ ] **INT-01**: Command palette (⌘K) для поиска тестов с fuzzy matching
- [ ] **INT-02**: Row actions dropdown для каждого теста (view details, view history)
- [ ] **INT-03**: Suite collapse/expand с сохранением состояния

### Migration

- [ ] **MIG-01**: Все существующие views мигрированы на shadcn/ui компоненты
- [ ] **MIG-02**: Virtual scrolling сохранён для больших test lists (react-window)
- [ ] **MIG-03**: Recharts интегрирован с Tailwind темой
- [ ] **MIG-04**: Static HTML export продолжает работать с file:// protocol

## v1.4 Requirements (Completed)

All v1.4 Layout Simplification requirements completed 2026-02-11.

### Navigation
- [x] **NAV-01** through **NAV-03**: Hamburger menu navigation — Phase 25

### Status Bar
- [x] **STAT-01** through **STAT-03**: Pass rate donut and run info in top bar — Phase 26

### Test Details
- [x] **DET-01** through **DET-03**: Modal test details — Phase 27

### Layout
- [x] **LAY-01** through **LAY-03**: Sidebar removal, filters in test list — Phase 28

### Cleanup
- [x] **CLN-01**, **CLN-02**: Statistics consolidation — Phase 29

## Future Requirements (v1.6+)

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Interaction

- **INT-04**: Column visibility toggle (show/hide columns)
- **INT-05**: Context menu на right-click для тестов
- **INT-06**: Keyboard shortcuts для навигации
- **INT-07**: Sticky table headers при скролле

### Polish

- **POLISH-01**: Empty states с illustrations
- **POLISH-02**: ScrollArea для consistent scrollbars
- **POLISH-03**: Collapsible filters panel

### Scale

- **SCALE-01**: Enterprise scale (2000+ tests)
- **MOB-01**: Mobile responsive layout

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Incremental MUI→shadcn migration | Research показал — полная замена необходима (CSS conflicts) |
| Real-time filtering | Performance issues с 1000+ тестами, используем debounced search |
| Infinite scroll | Конфликтует с virtual scrolling, users теряют позицию |
| Inline editing | Report read-only, не применимо |
| Drag-and-drop reordering | Test order = execution order |
| Mobile responsive | Deferred to v1.6+ |
| AI-анализ ошибок | Out of scope |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 30 | Pending |
| FOUND-02 | Phase 30 | Pending |
| FOUND-03 | Phase 30 | Pending |
| FOUND-04 | Phase 30 | Pending |
| FOUND-05 | Phase 30 | Pending |
| LAYOUT-01 | Phase 32 | Pending |
| LAYOUT-02 | Phase 32 | Pending |
| LAYOUT-03 | Phase 33 | Pending |
| LAYOUT-04 | Phase 33 | Pending |
| LAYOUT-05 | Phase 32 | Pending |
| DATA-01 | Phase 34 | Pending |
| DATA-02 | Phase 34 | Pending |
| DATA-03 | Phase 31 | Pending |
| DATA-04 | Phase 35 | Pending |
| DATA-05 | Phase 35 | Pending |
| DATA-06 | Phase 36 | Pending |
| DATA-07 | Phase 31 | Pending |
| INT-01 | Phase 34 | Pending |
| INT-02 | Phase 34 | Pending |
| INT-03 | Phase 35 | Pending |
| MIG-01 | Phase 36 | Pending |
| MIG-02 | Phase 34 | Pending |
| MIG-03 | Phase 36 | Pending |
| MIG-04 | Phase 36 | Pending |

**Coverage:**
- v1.5 requirements: 24 total
- Mapped to phases: 24 (100% ✓)
- Unmapped: 0

**Phase coverage:**
- Phase 30 (Foundation Setup): 5 requirements
- Phase 31 (Core UI Components): 2 requirements
- Phase 32 (Layout Restructure): 3 requirements
- Phase 33 (Test Details Drawer): 2 requirements
- Phase 34 (TanStack Table Migration): 5 requirements
- Phase 35 (Suite Hierarchy & Progress): 3 requirements
- Phase 36 (Views Migration & Polish): 4 requirements

---
*Requirements defined: 2026-02-11*
*Last updated: 2026-02-11 after roadmap creation*
