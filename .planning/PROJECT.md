# Qase Report

## What This Is

Open-source инструмент для визуализации отчётов тестирования в формате Qase Report Format. Генерирует интерактивный HTML-отчёт с test list, step timeline и attachments. Работает как dev server для разработки и как static HTML для production.

## Core Value

Пользователь может открыть Qase Report JSON и увидеть результаты тестирования в понятном, интерактивном интерфейсе с фильтрацией, детальными шагами и вложениями.

## Requirements

### Validated

<!-- Существующий функционал из codebase -->

- ✓ Базовый layout с AppBar и Sidebar — existing
- ✓ MobX store для state management — existing
- ✓ MUI компоненты для UI — existing
- ✓ Vite dev server и build — existing

### Active

<!-- Phase 1: Core MVP — визуализация Qase Report Format -->

- [ ] Загрузка и парсинг Qase Report JSON (run.json + results/*.json)
- [ ] Dashboard с общей статистикой (passed/failed/skipped/broken)
- [ ] Test list с фильтрацией по статусу
- [ ] Test details с информацией о тесте
- [ ] Step timeline (вложенные шаги с длительностью)
- [ ] Attachments viewer (screenshots, logs, files)
- [ ] Suite hierarchy view (группировка по relations.suite)
- [ ] Search по названию теста
- [ ] Static HTML export (single-file build)

### Out of Scope

<!-- Явно исключено из Phase 1 -->

- AI-анализ ошибок — Phase 3, требует интеграции с Claude/OpenAI
- Flakiness detection — Phase 2, требует историю прогонов
- Performance regression — Phase 2, требует историю прогонов
- Stability scoring — Phase 2, зависит от flakiness и performance
- Real-time reporting — низкий приоритет, сложная реализация
- Slack/Teams notifications — Phase 4
- Локализация — Phase 5
- Keyboard shortcuts — Phase 5

## Context

**Qase Report Format** — структура данных для результатов тестирования:
- `run.json` — метаданные прогона, статистика, список тестов
- `results/{uuid}.json` — детали каждого теста (steps, attachments, params, fields)
- `attachments/` — файлы вложений (screenshots, logs)

**Конкуренты:**
- Allure 2/3 — зрелые проекты, но устаревший UI или молодой
- ReportPortal — enterprise, сложная установка
- Playwright Smart Reporter — современный, но только для Playwright

**Уникальное преимущество:** нативная поддержка Qase TMS через testops_ids.

## Constraints

- **Tech stack**: React 18 + TypeScript + Vite + MUI 5 + MobX — уже установлено
- **Format**: Dev server + Static HTML — оба варианта должны работать
- **Input**: Qase Report Format JSON — фиксированная структура
- **Git**: Изменения в отдельной ветке, без push в remote

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| MobX для state | Уже в проекте, хорошо работает с React | — Pending |
| MUI для UI | Уже в проекте, богатая библиотека компонентов | — Pending |
| Static HTML export | Удобно для CI/CD и sharing | — Pending |

---
*Last updated: 2026-02-09 after initialization*
