# Requirements: Qase Report v1.8

**Defined:** 2026-02-12
**Core Value:** Пользователь может открыть Qase Report JSON и увидеть результаты тестирования в понятном, интерактивном интерфейсе с фильтрацией, детальными шагами, вложениями и аналитикой стабильности.

## v1.8 Requirements

Requirements for v1.8 CLI & NPM Package. CLI utility for launching and generating reports.

### CLI Core

- [ ] **CLI-01**: User can run `qase-report open <path>` to serve report from results folder
- [ ] **CLI-02**: User can run `qase-report generate <path>` to create static HTML report
- [x] **CLI-03**: User sees help with `qase-report --help`
- [x] **CLI-04**: User sees version with `qase-report --version`

### Server & Browser

- [ ] **SERV-01**: Server starts on port 3000 by default (configurable via `--port`)
- [ ] **SERV-02**: Browser opens automatically (disable via `--no-open`)
- [ ] **SERV-03**: Server serves React app + data from results folder via API
- [ ] **SERV-04**: Server gracefully shuts down on Ctrl+C

### History Management

- [ ] **HIST-01**: History auto-saves when opening a new test run
- [ ] **HIST-02**: User can specify history file path via `--history <file>`
- [ ] **HIST-03**: Default history location is `./qase-report-history.json`
- [ ] **HIST-04**: History respects `maxHistoryRuns` limit (default: 30)

### NPM Package

- [ ] **NPM-01**: Package installable globally via `npm install -g qase-report`
- [ ] **NPM-02**: Package usable via `npx qase-report`
- [ ] **NPM-03**: Package includes bundled React app (no separate build step)

### Generate Command

- [ ] **GEN-01**: `generate` creates self-contained HTML file
- [ ] **GEN-02**: User can specify output path via `-o` or `--output`
- [ ] **GEN-03**: Generated HTML includes embedded history if available

## Future Requirements

Deferred to future releases.

### Enhanced CLI

- **CLI-05**: Watch mode for live report updates
- **CLI-06**: Configuration file support (qase-report.config.js)

### Integration

- **INT-01**: Plugin system for custom reporters
- **INT-02**: CI environment detection

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time test execution | Focus on report viewing, not test running |
| Multiple report formats | Qase Report Format only for v1.8 |
| Remote server deployment | Local development only |
| Docker image | NPM package sufficient for v1.8 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLI-01 | Phase 45 | Pending |
| CLI-02 | Phase 47 | Pending |
| CLI-03 | Phase 44 | ✓ Complete |
| CLI-04 | Phase 44 | ✓ Complete |
| SERV-01 | Phase 45 | Pending |
| SERV-02 | Phase 45 | Pending |
| SERV-03 | Phase 45 | Pending |
| SERV-04 | Phase 45 | Pending |
| HIST-01 | Phase 46 | Pending |
| HIST-02 | Phase 46 | Pending |
| HIST-03 | Phase 46 | Pending |
| HIST-04 | Phase 46 | Pending |
| NPM-01 | Phase 48 | Pending |
| NPM-02 | Phase 48 | Pending |
| NPM-03 | Phase 48 | Pending |
| GEN-01 | Phase 47 | Pending |
| GEN-02 | Phase 47 | Pending |
| GEN-03 | Phase 47 | Pending |

**Coverage:**
- v1.8 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-02-12*
*Last updated: 2026-02-12 after roadmap creation*
