# Technology Stack

**Analysis Date:** 2026-02-09

## Languages

**Primary:**
- TypeScript 4.9.3 - All source code in `src/`
- JavaScript - Build and configuration files

**Secondary:**
- CSS - Styling in `src/index.css`

## Runtime

**Environment:**
- Node.js (no specific version locked; no `.nvmrc` file)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (standard npm lockfile)

## Frameworks

**Core:**
- React 18.2.0 - UI framework (`src/App.tsx`, `src/main.tsx`)
- TypeScript 4.9.3 - Type safety and compilation

**Build/Dev:**
- Vite 4.2.0 - Build tool and dev server (`vite.config.ts`)
- @vitejs/plugin-react 3.1.0 - React plugin for Vite
- Prettier 2.8.7 - Code formatting (`.prettierrc.json`)

**State Management:**
- MobX 6.9.0 - Reactive state management (`src/store/index.tsx`)
- mobx-react-lite 3.4.3 - React bindings for MobX

**UI Components:**
- @mui/material 5.12.0 - Material Design components (`src/App.tsx`, `src/components/`, `src/layout/`)

**Styling:**
- @emotion/react 11.10.6 - CSS-in-JS library (dependency of MUI)
- @emotion/styled 11.10.6 - Styled component library (dependency of MUI)

## Key Dependencies

**Critical:**
- react-dom 18.2.0 - React DOM rendering (`src/main.tsx`)

## Configuration

**Environment:**
- No `.env` file present
- No environment variables currently configured
- Application runs with hardcoded defaults

**Build:**
- `vite.config.ts` - Minimal Vite configuration with React plugin
- `tsconfig.json` - TypeScript compilation settings:
  - Target: ESNext
  - Lib: DOM, DOM.Iterable, ESNext
  - Module: ESNext
  - Strict mode: enabled
  - JSX: react-jsx
- `tsconfig.node.json` - Referenced in `tsconfig.json` for build tools
- `.prettierrc.json` - Code formatting rules:
  - tabWidth: 2 spaces
  - semi: false (no semicolons)
  - singleQuote: true
  - arrowParens: avoid

## Platform Requirements

**Development:**
- npm (Node.js package manager)
- Node.js runtime (no specific version requirement)

**Production:**
- Static hosting capable of serving compiled assets
- No backend or server-side runtime requirements
- Client-side React SPA (Single Page Application)

---

*Stack analysis: 2026-02-09*
