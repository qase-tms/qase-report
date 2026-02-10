# Qase Report

## What This Is

Open-source инструмент для визуализации отчётов тестирования в формате Qase Report Format. Интерактивный HTML-отчёт с dashboard, test list, step timeline, attachments viewer, и аналитикой истории тестов. Работает как dev server и как standalone static HTML.

## Core Value

Пользователь может открыть Qase Report JSON и увидеть результаты тестирования в понятном, интерактивном интерфейсе с фильтрацией, детальными шагами, вложениями и аналитикой стабильности.

## Current State

**v1.1 History & Trends shipped:** 2026-02-10

- ~4,700 LOC TypeScript/TSX
- Tech stack: React 18, TypeScript 5.9, Vite, MUI 5, MobX, Zod v4, Recharts
- Full Qase Report Format support
- History analytics: trends, flakiness detection, regression alerts, stability scoring
- Static HTML works with file:// protocol

## Current Milestone: v1.2 Design Refresh

**Goal:** Современный, удобный дизайн с Bento Grid layout, темами, sidebar навигацией и улучшенной производительностью.

**Target features:**
- Theme system (light/dark/system) с persistence
- Bento Grid layout для dashboard
- Постоянный sidebar для навигации
- Micro-visualizations (sparklines, progress rings)
- Microinteractions (fade-ins, hover effects, transitions)
- Progressive disclosure (filters, collapsible sections)
- Оптимизация для 100-500 тестов

**Design references:**
- Allure 3 — минималистичный стиль, whitespace
- Playwright Smart Reporter — цветовое кодирование, sidebar
- Apple Bento Grid — модульная компоновка

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

### Active

- [ ] Theme system (light/dark/system)
- [ ] Bento Grid dashboard layout
- [ ] Sidebar navigation
- [ ] Micro-visualizations
- [ ] Microinteractions
- [ ] Progressive disclosure
- [ ] Performance optimization (100-500 tests)

### Out of Scope

- AI-анализ ошибок — требует интеграции с Claude/OpenAI
- Real-time reporting — низкий приоритет, сложная реализация
- Slack/Teams notifications — low priority
- Локализация — nice-to-have
- Keyboard shortcuts — deferred to v1.3
- Infinite history — Storage bloat, diminishing returns after 30-50 runs
- Per-step performance tracking — Exponentially increases data volume
- Enterprise scale (2000+ tests) — v1.2 targets 100-500 tests

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
*Last updated: 2026-02-10 after v1.2 milestone start*
