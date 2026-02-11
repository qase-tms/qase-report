# Qase Report

## What This Is

Open-source инструмент для визуализации отчётов тестирования в формате Qase Report Format. Интерактивный HTML-отчёт с dashboard, test list, step timeline, attachments viewer, и аналитикой истории тестов. Работает как dev server и как standalone static HTML.

## Core Value

Пользователь может открыть Qase Report JSON и увидеть результаты тестирования в понятном, интерактивном интерфейсе с фильтрацией, детальными шагами, вложениями и аналитикой стабильности.

## Current State

**v1.3 Design Overhaul shipped:** 2026-02-11

- ~5,500+ LOC TypeScript/TSX
- Tech stack: React 18, TypeScript 5.9, Vite, MUI 5, MobX, Zod v4, Recharts, react-window
- Full Qase Report Format support
- History analytics: trends, flakiness detection, regression alerts, stability scoring
- Dark theme by default, Playwright-style design
- Command palette search (⌘K), Failure Clusters, Gallery, Comparison views
- Virtual scrolling for 500+ tests, microinteractions
- Static HTML works with file:// protocol

## Current Milestone: v1.4 Layout Simplification

**Goal:** Упрощение layout — hamburger menu для навигации, постоянный статус в top bar, удаление sidebar, test details как modal.

**Target features:**
- Hamburger menu с dropdown навигацией
- Persistent status bar (компактный бублик pass rate + run info)
- Удаление sidebar — больше места для контента
- Дедупликация графиков и статистики
- Test details как modal/dialog
- Фильтры перемещены в test list view

**Design principles:**
- Минимализм — меньше элементов, больше фокуса
- Информация всегда видна — статус рана доступен везде
- Быстрая навигация — один клик до любого view

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

### Active

- [ ] Hamburger menu с dropdown навигацией
- [ ] Persistent status bar (бублик + run info в top bar)
- [ ] Удаление sidebar
- [ ] Дедупликация графиков/статистики
- [ ] Test details как modal/dialog
- [ ] Фильтры в test list view

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

- **Tech stack**: React 18 + TypeScript 5.9 + Vite + MUI 5 + MobX + Zod v4 + Recharts
- **Format**: Dev server + Static HTML — оба варианта работают
- **Input**: Qase Report Format JSON — фиксированная структура

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| MobX для state | Уже в проекте, хорошо работает с React | ✓ Good |
| MUI для UI | Уже в проекте, богатая библиотека компонентов | ✓ Good |
| Zod v4 для валидации | Runtime validation + TypeScript types | ✓ Good |
| Map для test results | O(1) lookup по ID | ✓ Good |
| yet-another-react-lightbox | TypeScript-native, zoom/download | ✓ Good |
| prism-react-renderer | Lightweight syntax highlighting (50KB) | ✓ Good |
| Vite legacy plugin | file:// protocol support | ✓ Good |
| Signature-based test identity | Stable tracking across runs (not UUID) | ✓ Good |
| Recharts for visualization | React-native, simpler than D3 | ✓ Good |
| 2-sigma regression detection | Balances false positives and catching regressions | ✓ Good |
| Weighted stability formula | Balances pass rate, flakiness, and variance | ✓ Good |

---
*Last updated: 2026-02-11 after v1.4 milestone start*
