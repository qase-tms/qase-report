# Qase Report

## What This Is

Open-source инструмент для визуализации отчётов тестирования в формате Qase Report Format. Интерактивный HTML-отчёт с dashboard, test list, step timeline, attachments viewer. Работает как dev server и как standalone static HTML.

## Core Value

Пользователь может открыть Qase Report JSON и увидеть результаты тестирования в понятном, интерактивном интерфейсе с фильтрацией, детальными шагами и вложениями.

## Current State

**v1.0 MVP shipped:** 2026-02-10

- 2,572 LOC TypeScript/TSX
- Tech stack: React 18, TypeScript 5.9, Vite, MUI 5, MobX, Zod v4
- Full Qase Report Format support
- Static HTML works with file:// protocol

## Requirements

### Validated

- ✓ Загрузка и парсинг Qase Report JSON (run.json + results/*.json) — v1.0
- ✓ Dashboard с общей статистикой (passed/failed/skipped/broken) — v1.0
- ✓ Test list с фильтрацией по статусу — v1.0
- ✓ Test details с информацией о тесте — v1.0
- ✓ Step timeline (вложенные шаги с длительностью) — v1.0
- ✓ Attachments viewer (screenshots, logs, files) — v1.0
- ✓ Suite hierarchy view (группировка по relations.suite) — v1.0
- ✓ Search по названию теста — v1.0
- ✓ Static HTML export — v1.0

### Active

- [ ] История прогонов (test-history.json)
- [ ] Тренды pass rate и duration
- [ ] Flakiness detection
- [ ] Performance regression alerts
- [ ] Stability scoring (A+ to F grades)

### Out of Scope

- AI-анализ ошибок — требует интеграции с Claude/OpenAI
- Real-time reporting — низкий приоритет, сложная реализация
- Slack/Teams notifications — low priority
- Локализация — nice-to-have
- Keyboard shortcuts — nice-to-have

## Context

**Qase Report Format** — структура данных для результатов тестирования:
- `run.json` — метаданные прогона, статистика, список тестов
- `results/{uuid}.json` — детали каждого теста (steps, attachments, params, fields)
- `attachments/` — файлы вложений (screenshots, logs)

**Конкуренты:**
- Allure 2/3 — зрелые проекты
- ReportPortal — enterprise, сложная установка
- Playwright Smart Reporter — современный, но только для Playwright

**Уникальное преимущество:** нативная поддержка Qase TMS через testops_ids.

## Constraints

- **Tech stack**: React 18 + TypeScript 5.9 + Vite + MUI 5 + MobX + Zod v4
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

---
*Last updated: 2026-02-10 after v1.0 milestone*
