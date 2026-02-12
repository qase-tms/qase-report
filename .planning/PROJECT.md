# Qase Report

## What This Is

Open-source инструмент для визуализации отчётов тестирования в формате Qase Report Format. Интерактивный HTML-отчёт с dashboard, test list, step timeline, attachments viewer, и аналитикой истории тестов. Работает как dev server и как standalone static HTML.

## Core Value

Пользователь может открыть Qase Report JSON и увидеть результаты тестирования в понятном, интерактивном интерфейсе с фильтрацией, детальными шагами, вложениями и аналитикой стабильности.

## Current State

**v1.7 Layout & Analytics Cleanup shipped:** 2026-02-12

- ~10,000 LOC TypeScript/TSX
- Tech stack: React 18, TypeScript 5.9, Vite 5, shadcn/ui, Tailwind CSS v4, MobX, Zod v4, Recharts, TanStack Table, TanStack Virtual
- Full Qase Report Format support
- History analytics: trends, flakiness detection, regression alerts, stability scoring
- Dark theme by default (CSS variables, FOUC prevention)
- Command palette search (⌘K) with fuzzy matching
- Tab navigation (Test cases, Analytics, Timeline, Failure Clusters, Gallery, Comparison)
- Test cases as default (first) tab
- Right sidebar with completion rate ring, run metadata, Run Info, Host Info
- Test details drawer (Sheet component with 4 tabs)
- TanStack Table with sorting and virtual scrolling (500+ tests)
- Suite hierarchy with expandable rows and multi-segment progress bars
- Analytics view with 2-column grid and horizontal Recent Runs
- Loading skeletons in all views
- 300ms animations standardized
- Static HTML works with file:// protocol

## Shipped Milestones

- **v1.0 MVP** — Core visualization (shipped 2026-02-10)
- **v1.1 History & Trends** — Analytics features (shipped 2026-02-10)
- **v1.2 Design Refresh** — Modern UI, virtual scrolling (shipped 2026-02-10)
- **v1.3 Design Overhaul** — Playwright-style, new features (shipped 2026-02-11)
- **v1.4 Layout Simplification** — Hamburger menu, modal details (shipped 2026-02-11)
- **v1.5 Qase TMS Style** — shadcn/ui migration, TanStack Table, suite hierarchy (shipped 2026-02-11)
- **v1.6 Qase TMS Design Polish** — Column redesign, progress bars, sidebar, Timeline view (shipped 2026-02-12)
- **v1.7 Layout & Analytics Cleanup** — Tab reorder, Analytics cleanup, sidebar enhancement (shipped 2026-02-12)

## Requirements

### Validated

**v1.0 MVP:**
- ✓ Загрузка и парсинг Qase Report JSON (run.json + results/*.json) — v1.0
- ✓ Dashboard с общей статистикой (passed/failed/skipped/broken) — v1.0
- ✓ Test list с фильтрацией по статусу — v1.0
- ✓ Test details с информацией о тесте — v1.0
- ✓ Step timeline (вложенные шаги с длительностью) — v1.0
- ✓ Attachments viewer (screenshots, logs, files) — v1.0
- ✓ Suite hierarchy view (группировка по relations.suite) — v1.0
- ✓ Search по названию теста — v1.0
- ✓ Static HTML export — v1.0

**v1.1 History & Trends:**
- ✓ История прогонов (test-history.json) — v1.1
- ✓ Тренды pass rate и duration — v1.1
- ✓ Flakiness detection — v1.1
- ✓ Performance regression alerts — v1.1
- ✓ Stability scoring (A+ to F grades) — v1.1

**v1.2 Design Refresh:**
- ✓ Theme system (light/dark/system) — v1.2
- ✓ Bento Grid dashboard layout — v1.2
- ✓ Sidebar navigation — v1.2
- ✓ Micro-visualizations (sparklines, progress rings) — v1.2
- ✓ Microinteractions (fade-in, hover effects) — v1.2
- ✓ Progressive disclosure (collapsible suites) — v1.2
- ✓ Virtual scrolling (100-500 tests) — v1.2

**v1.3 Design Overhaul:**
- ✓ Dark theme по умолчанию — v1.3
- ✓ Новый sidebar (pass rate ring, quick stats, навигация, фильтры) — v1.3
- ✓ Top bar (поиск ⌘K, export, theme toggle, дата прогона) — v1.3
- ✓ Overview dashboard (Suite Health, trends, Attention Required, Quick Insights) — v1.3
- ✓ Failure Clusters (группировка по типу ошибки) — v1.3
- ✓ Gallery (просмотр всех attachments) — v1.3
- ✓ Comparison (diff view между прогонами) — v1.3

**v1.4 Layout Simplification:**
- ✓ Hamburger menu с dropdown навигацией — v1.4
- ✓ Persistent status bar (бублик + run info в top bar) — v1.4
- ✓ Удаление sidebar — v1.4
- ✓ Дедупликация графиков/статистики — v1.4
- ✓ Test details как modal/dialog — v1.4
- ✓ Фильтры в test list view — v1.4

**v1.5 Qase TMS Style:**
- ✓ Миграция с MUI на shadcn/ui (Tailwind CSS v4 + Radix) — v1.5
- ✓ lucide-react icons (replaced @mui/icons-material) — v1.5
- ✓ Tab-based navigation (5 tabs) — v1.5
- ✓ Right sidebar с completion rate ring и run metadata — v1.5
- ✓ Test details drawer (Sheet with 4 tabs) — v1.5
- ✓ TanStack Table с сортировкой и virtual scrolling — v1.5
- ✓ Command palette (Cmd+K) с fuzzy search — v1.5
- ✓ Suite hierarchy с expandable rows — v1.5
- ✓ Multi-segment progress bars для suites — v1.5
- ✓ Loading skeletons во всех views — v1.5
- ✓ 300ms animations standardized — v1.5
- ✓ Static HTML export verified — v1.5

**v1.6 Qase TMS Design Polish:**
- ✓ Новая структура колонок test list (ID, STATUS, TITLE, DURATION) — v1.6
- ✓ Тонкие horizontal progress bars для suites — v1.6
- ✓ Обновлённый sidebar (Started at, Total Time, Elapsed Time, Finished at, Status) — v1.6
- ✓ Timeline tab для визуализации execution timeline — v1.6

**v1.7 Layout & Analytics Cleanup:**
- ✓ Test cases как первый (default) таб — v1.7
- ✓ Overview переименован в Analytics — v1.7
- ✓ Analytics с 2-колоночным grid layout — v1.7
- ✓ Recent Runs горизонтально со скроллом — v1.7
- ✓ Run Information в правом sidebar — v1.7
- ✓ Host Information в правом sidebar — v1.7
- ✓ Удалены дублирующиеся виджеты из Analytics — v1.7

### Out of Scope

- AI-анализ ошибок — требует интеграции с Claude/OpenAI
- Real-time reporting — низкий приоритет, сложная реализация
- Slack/Teams notifications — low priority
- Локализация — nice-to-have
- Keyboard shortcuts — deferred to v1.5+
- Infinite history — Storage bloat, diminishing returns after 30-50 runs
- Per-step performance tracking — Exponentially increases data volume
- Enterprise scale (2000+ tests) — deferred, current target 100-500 tests
- Mobile responsive — deferred to v1.5+

## Context

**Qase Report Format** — структура данных для результатов тестирования:
- `run.json` — метаданные прогона, статистика, список тестов
- `results/{uuid}.json` — детали каждого теста (steps, attachments, params, fields)
- `attachments/` — файлы вложений (screenshots, logs)
- `test-history.json` — опциональная история прогонов для аналитики

**Конкуренты:**
- Allure 2/3 — зрелые проекты
- ReportPortal — enterprise, сложная установка
- Playwright Smart Reporter — современный, но только для Playwright

**Уникальное преимущество:** нативная поддержка Qase TMS через testops_ids + встроенная аналитика стабильности.

## Constraints

- **Tech stack**: React 18 + TypeScript 5.9 + Vite 5 + shadcn/ui + Tailwind CSS v4 + MobX + Zod v4 + Recharts + TanStack Table
- **Format**: Dev server + Static HTML — оба варианта работают
- **Input**: Qase Report Format JSON — фиксированная структура

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| MobX для state | Уже в проекте, хорошо работает с React | ✓ Good |
| shadcn/ui + Tailwind v4 | Replaced MUI in v1.5, better customization, smaller bundle | ✓ Good |
| Zod v4 для валидации | Runtime validation + TypeScript types | ✓ Good |
| Map для test results | O(1) lookup по ID | ✓ Good |
| yet-another-react-lightbox | TypeScript-native, zoom/download | ✓ Good |
| prism-react-renderer | Lightweight syntax highlighting (50KB) | ✓ Good |
| Vite legacy plugin | file:// protocol support | ✓ Good |
| Signature-based test identity | Stable tracking across runs (not UUID) | ✓ Good |
| Recharts for visualization | React-native, simpler than D3 | ✓ Good |
| 2-sigma regression detection | Balances false positives and catching regressions | ✓ Good |
| Weighted stability formula | Balances pass rate, flakiness, and variance | ✓ Good |
| TanStack Table + Virtual | Replaced react-window, better API, active maintenance | ✓ Good |
| Dark theme as default | CSS variables with :root = dark, .light override | ✓ Good |
| TreeNode discriminated union | Type-safe suite vs test row handling | ✓ Good |
| sessionStorage for expand state | Session-scoped persistence, cleaner UX | ✓ Good |

---
*Last updated: 2026-02-12 after v1.7 milestone completion*
