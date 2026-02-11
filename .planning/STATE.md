# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-11)

**Core value:** Пользователь может открыть Qase Report JSON и увидеть результаты тестирования в понятном, интерактивном интерфейсе с фильтрацией, детальными шагами, вложениями и аналитикой стабильности.
**Current focus:** Phase 32 - Layout Restructure (v1.5 Qase TMS Style)

## Current Position

Phase: 32 of 36 (Layout Restructure)
Plan: 3 of 3 in current phase
Status: Completed
Last activity: 2026-02-11 — Completed 32-03: Layout Integration

Progress: [█████████████████████████████░░░░░░░] 84% (53/63 total plans)

## Performance Metrics

**By Milestone:**

| Milestone | Phases | Plans | Duration |
|-----------|--------|-------|----------|
| v1.0 MVP | 1-7 | 10 | ~2 days |
| v1.1 History & Trends | 8-12 | 13 | ~1 day |
| v1.2 Design Refresh | 13-17 | 9 | ~1 day |
| v1.3 Design Overhaul | 18-24 | 14 | ~2 days |
| v1.4 Layout Simplification | 25-29 | 5 | ~2 min |
| v1.5 Qase TMS Style | 30-36 | 9/27 | In progress |

**Recent completions:**

| Phase | Plan | Duration | Tasks | Files | Date |
|-------|------|----------|-------|-------|------|
| 27 | 01 | ~1.5 min | 2 | 3 | 2026-02-11 |
| 28 | 01 | ~2 min | 2 | 5 | 2026-02-11 |
| 29 | 01 | ~2 min | 2 | 3 | 2026-02-11 |
| 30 | 01 | ~4.6 min | 3 | 4 | 2026-02-11 |
| 30 | 02 | ~14.8 min | 3 | 6 | 2026-02-11 |
| 30 | 03 | ~2.7 min | 3 | 3 | 2026-02-11 |
| Phase 30 P05 | 653 | 3 tasks | 6 files |
| Phase 31 P01 | 73 | 3 tasks | 4 files |
| Phase 31 P02 | 81 | 3 tasks | 2 files |
| 32 | 01 | ~2 min | 2 | 3 | 2026-02-11 |
| 32 | 02 | ~2.5 min | 1 | 1 | 2026-02-11 |
| 32 | 03 | ~2.2 min | 3 | 2 | 2026-02-11 |

## Accumulated Context

### Decisions

Key decisions preserved for future reference:

**v1.5 migration strategy:**
- Complete MUI to shadcn/ui migration (no incremental coexistence) to avoid CSS conflicts
- Tailwind CSS v4 with @tailwindcss/vite plugin for 182x faster rebuilds
- Preserve MobX state management (only UI layer changes)
- TanStack Table for test list (highest complexity, separate phase)
- Virtual scrolling must continue working with 500+ tests
- Static HTML export with file:// protocol must be preserved

**Phase 30-01 (Foundation Setup):**
- Upgraded Vite from v4 to v5 to satisfy @tailwindcss/vite peer dependency
- Used @import 'tailwindcss' directive (Tailwind v4 CSS-first pattern)
- Added CSS variable fallback (--background) for post-MUI migration support
- tailwindcss() plugin placed after react() in Vite config per docs

**Phase 30-02 (shadcn/ui CLI Setup):**
- Added TypeScript path aliases (baseUrl and @/* mapping) to match Vite configuration
- Used shadcn@latest init --defaults for non-interactive setup with new-york style
- Fixed Slot.Root TypeScript error with type casting workaround
- Preserved MUI coexistence CSS during shadcn/ui initialization

**Phase 30-03 (Theme Configuration):**
- Dark theme is DEFAULT (:root) - no .dark class needed, inverted from shadcn standard
- Light theme activated by .light class on html element
- Used hsl(var(--)) pattern instead of @apply for Tailwind v4 compatibility
- FOUC script coexists with MUI script during migration period

**Phase 31-01 (Core UI Components):**
- Installed Card, Badge, Skeleton components via single CLI command with -y flag for non-interactive setup
- Badge uses CVA variant system for type-safe styling with 6 variants
- Card uses compositional API with 7 subcomponents to avoid prop explosion

**Phase 31-02 (Badge Status Variants):**
- Extended Badge component with custom test status variants (passed/failed/skipped/broken)
- Created StatusBadge wrapper component with type-safe TestStatus union type
- Dark-theme-aware colors using dark: modifier for both light and dark themes
- MobX observer compatibility confirmed via production build

**Phase 32-01 (Tab Navigation):**
- Installed shadcn/ui Tabs component via CLI
- Created TabNavigation with 5 tabs (tests, dashboard, failure-clusters, gallery, comparison)
- Controlled Tabs synced with MobX activeView state for navigation persistence
- Responsive design: icons only on mobile, labels visible on desktop

**Phase 32-02 (RunInfoSidebar Component):**
- Larger ring size (96px vs 40px) for visual prominence in sidebar
- Vertical layout with flex-col for natural sidebar width constraint
- Conditional rendering for optional fields (skipped, flaky, environment)
- Reused StatusBarPill color logic and data access patterns

**Phase 32-03 (Layout Integration):**
- CSS Grid layout with grid-rows-[auto_1fr] for header and grid-cols-[1fr_300px] for main+sidebar
- Hamburger menu completely removed, replaced with horizontal TabNavigation in MainLayout
- Run title from reportStore.runData?.title displayed in header with truncation
- StatusBarPill removed from header, moved to RunInfoSidebar
- Dashboard view simplified to show only Dashboard component (no TestList combo)
- Fixed 300px right sidebar (hidden on mobile with lg:grid-cols pattern)

**Previous milestones:**
- MobX computed properties for reactive trend data caching
- react-window virtual scrolling (~6KB)
- Dark theme by default (Playwright Smart Reporter inspiration)
- Hamburger menu navigation (v1.4)
- Modal test details (v1.4, will convert to Sheet drawer in v1.5)
- [Phase ?]: Fixed automated conversion bugs in TestListItem and TestDetails components from 30-04 refactor
- [Phase ?]: Uninstalled @mui/icons-material package after verifying zero imports remain
- [Phase 31]: Dark theme color mapping: Used dark: modifier for all variants to ensure proper colors in both themes
- [Phase 31]: StatusBadge not an observer: Component receives primitive status prop, parent should be observer
- [Phase 31]: CVA variant extension: Extended existing Badge variants rather than creating separate component

### Pending Todos

None.

### Blockers/Concerns

**v1.5 migration risks:**
- CSS injection order conflicts if MUI not fully removed before shadcn components added
- TanStack Table complexity (3-5 days estimated) may require research phase
- Virtual scrolling integration with TanStack Table needs testing
- Recharts dark mode integration requires explicit theme colors
- Static HTML export may need inline CSS adjustments

**Deferred to v1.6+:**
- Enterprise scale 2000+ tests (SCALE-01)
- Mobile responsive layout (MOB-01)

## Session Continuity

Last session: 2026-02-11T17:58:28Z
Stopped at: Completed 32-03-PLAN.md (Layout Integration) - Phase 32 Complete
Resume file: None
Next action: Begin Phase 33 (Test Table Implementation)
