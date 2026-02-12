# Milestones

## v1.0 MVP

**Shipped:** 2026-02-10
**Phases:** 1-7 (7 phases, 10 plans)

**Delivered:** Interactive web visualization for Qase Report JSON files with dashboard, test list, filtering, details view, step timeline, attachments viewer, and static HTML export.

**Key accomplishments:**
1. Zod schemas for Qase Report Format validation
2. MobX stores with reactive state management
3. Dashboard with statistics and run/host info
4. Test list with filtering, search, and suite grouping
5. Test details with error display and custom fields
6. Step timeline with nested hierarchy
7. Attachment viewer with lightbox and syntax highlighting
8. Static HTML export working with file:// protocol

**Stats:**
- Files: 53 changed
- LOC: 2,572 TypeScript/TSX
- Timeline: 2 days

**Archive:** `.planning/milestones/v1.0-ROADMAP.md`, `.planning/milestones/v1.0-REQUIREMENTS.md`

## v1.1 History & Trends

**Shipped:** 2026-02-10
**Phases:** 8-12 (5 phases, 13 plans)

**Delivered:** Analytics features for test history tracking with trend visualization, flakiness detection, performance regression alerts, and stability scoring.

**Key accomplishments:**
1. History infrastructure with Zod schema and localStorage persistence
2. Trend charts (pass rate & duration) with Recharts
3. History timeline with color-coded status indicators
4. Multi-factor flakiness detection (status transitions + error consistency)
5. Performance regression alerts with 2-sigma outlier detection
6. Stability scoring (A+ to F grades) with weighted formula
7. Test health widget on dashboard with grade distribution

**Stats:**
- Phases: 5
- Plans: 13
- LOC: ~4,700 TypeScript/TSX (was 2,572 at v1.0)
- Timeline: 1 day

**Archive:** `.planning/milestones/v1.1-ROADMAP.md`, `.planning/milestones/v1.1-REQUIREMENTS.md`

## v1.2 Design Refresh

**Shipped:** 2026-02-10
**Phases:** 13-17 (5 phases, 9 plans)

**Delivered:** Modern, user-friendly design with theme system, Bento Grid layout, sidebar navigation, micro-visualizations, microinteractions, and performance optimization for 500+ tests.

**Key accomplishments:**
1. Theme system with light/dark/system modes and FOWT prevention
2. Sidebar navigation with collapsible state and persistence
3. Bento Grid dashboard with CSS Grid layout
4. Sparkline and progress ring micro-visualizations
5. Fade-in animations and hover effects with reduced motion support
6. Collapsible test suites with ARIA accessibility
7. Virtual scrolling with react-window for 500+ tests

**Stats:**
- Phases: 5
- Plans: 9
- LOC: ~5,200 TypeScript/TSX (was 4,700 at v1.1)
- Timeline: 1 day

**Archive:** `.planning/milestones/v1.2-ROADMAP.md`, `.planning/milestones/v1.2-REQUIREMENTS.md`

## v1.3 Design Overhaul

**Shipped:** 2026-02-11
**Phases:** 18-24 (7 phases, 11 plans)

**Delivered:** Full redesign inspired by Playwright Smart Reporter with dark theme by default, command palette search, overview dashboard, and three new features: Failure Clusters, Gallery, Comparison.

**Key accomplishments:**
1. Dark theme as default with Playwright-style color palette
2. Command palette search (⌘K) with fuzzy matching
3. Export button for report download
4. Sidebar with pass rate ring, quick stats, navigation icons, filter chips
5. Overview dashboard with Suite Health, trends, Attention Required, Quick Insights
6. Failure Clusters — error grouping with normalized matching
7. Gallery — cross-test attachment browsing with type filtering
8. Comparison — run diff view with Map-based O(n+m) algorithm

**Stats:**
- Phases: 7
- Plans: 11
- LOC: ~5,500+ TypeScript/TSX (was 5,200 at v1.2)
- Timeline: 2 days

**Archive:** `.planning/milestones/v1.3-ROADMAP.md`, `.planning/milestones/v1.3-REQUIREMENTS.md`

## v1.4 Layout Simplification

**Shipped:** 2026-02-11
**Phases:** 25-29 (5 phases, 5 plans)

**Delivered:** Simplified layout by replacing permanent sidebar with hamburger menu navigation, adding persistent status bar, converting test details to modal, and removing duplicate statistics.

**Key accomplishments:**
1. Hamburger navigation menu with MUI Menu dropdown
2. Persistent status bar with pass rate donut and quick stats
3. Modal test details dialog with scrollbar-gutter CSS fix
4. Sidebar removal and layout cleanup
5. Statistics deduplication in dashboard

**Archive:** `.planning/milestones/v1.4-ROADMAP.md`, `.planning/milestones/v1.4-REQUIREMENTS.md`

## v1.5 Qase TMS Style

**Shipped:** 2026-02-11
**Phases:** 30-36 (7 phases, 23 plans)

**Delivered:** Complete migration from MUI to shadcn/ui with Qase TMS visual style — tab navigation, right sidebar with completion ring, Sheet test details drawer, TanStack Table with virtual scrolling.

**Key accomplishments:**
1. Tailwind CSS v4 + shadcn/ui foundation (replaced MUI)
2. lucide-react icons (replaced @mui/icons-material)
3. Tab-based navigation with 5 tabs
4. Right sidebar with completion rate ring and run metadata
5. Test details drawer (Sheet component with 4 tabs)
6. TanStack Table with sorting and virtual scrolling
7. Command palette (Cmd+K) with fuzzy search
8. Suite hierarchy with expandable rows and multi-segment progress bars

**Archive:** `.planning/milestones/v1.5-ROADMAP.md`, `.planning/milestones/v1.5-REQUIREMENTS.md`

## v1.6 Qase TMS Design Polish

**Shipped:** 2026-02-12
**Phases:** 37-40 (4 phases, 4 plans)

**Delivered:** Design polish matching Qase TMS — new column structure, thin progress bars, enhanced sidebar with timestamps, and Timeline view.

**Key accomplishments:**
1. Test list column redesign (ID, STATUS, TITLE, DURATION)
2. Thin horizontal progress bars for suites
3. Enhanced sidebar with Started at, Total Time, Finished at fields
4. Timeline view with thread-based swimlanes

**Archive:** `.planning/milestones/v1.6-ROADMAP.md`, `.planning/milestones/v1.6-REQUIREMENTS.md`

## v1.7 Layout & Analytics Cleanup

**Shipped:** 2026-02-12
**Phases:** 41-43 (3 phases, 3 plans)

**Delivered:** Tab reordering with Test cases as default, Analytics view cleanup with 2-column grid, and Run/Host information moved to sidebar.

**Key accomplishments:**
1. Test cases as default (first) tab
2. Overview renamed to Analytics
3. 2-column grid layout in Analytics view
4. Run Information section in sidebar
5. Host Information section in sidebar
6. Horizontal scrollable Recent Runs
7. Removed duplicate metadata widgets from Analytics

**Archive:** `.planning/milestones/v1.7-ROADMAP.md`, `.planning/milestones/v1.7-REQUIREMENTS.md`

