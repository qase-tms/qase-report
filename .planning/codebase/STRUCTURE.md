# Codebase Structure

**Analysis Date:** 2026-02-09

## Directory Layout

```
qase-report/
├── src/                           # Application source code
│   ├── components/                # Reusable UI components
│   │   └── Sidebar/               # Sidebar drawer component
│   │       └── index.tsx
│   ├── layout/                    # Layout/page structure components
│   │   └── MainLayout/            # Primary page layout
│   │       └── index.tsx
│   ├── store/                     # State management (MobX)
│   │   └── index.tsx              # RootStore and context setup
│   ├── App.tsx                    # Root application component
│   ├── main.tsx                   # React DOM entry point
│   ├── index.css                  # Global styles
│   └── vite-env.d.ts              # Vite type definitions
├── index.html                     # HTML entry point
├── package.json                   # Project dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.node.json             # TypeScript config for Vite
├── vite.config.ts                 # Vite build configuration
├── .prettierrc.json               # Prettier code formatting config
└── CLAUDE.md                      # Project-specific Claude instructions
```

## Directory Purposes

**src/:**
- Purpose: All application source code
- Contains: TypeScript React components, store, configuration
- Key files: `App.tsx` (root), `main.tsx` (entry), `store/index.tsx` (state)

**src/components/:**
- Purpose: Reusable UI components for use across layouts and pages
- Contains: Observer-wrapped functional components using MUI
- Key files: `Sidebar/index.tsx` (sliding drawer component)

**src/layout/:**
- Purpose: Page structure and layout components that compose child components
- Contains: Grid-based layout orchestration, state management integration
- Key files: `MainLayout/index.tsx` (primary application structure)

**src/store/:**
- Purpose: Centralized state management and business logic
- Contains: MobX RootStore class, React Context setup, store access hooks
- Key files: `index.tsx` (single file containing all store code)

## Key File Locations

**Entry Points:**
- `index.html`: HTML document root, defines DOM target and loads main.tsx script
- `src/main.tsx`: React initialization, mounts App to #root element
- `src/App.tsx`: Application root component, provides theme and renders MainLayout

**Configuration:**
- `tsconfig.json`: TypeScript compiler options (strict mode enabled, ESNext target)
- `vite.config.ts`: Vite build tool configuration with React plugin
- `.prettierrc.json`: Code formatting rules (no semicolons, single quotes, 2-space indent)

**Core Logic:**
- `src/store/index.tsx`: RootStore state container, Context provider, useRootStore hook
- `src/layout/MainLayout/index.tsx`: Grid-based page layout, Sidebar state management

**Styling:**
- `src/index.css`: Global styles (colors, typography, button/link styles)
- MUI sx prop: Inline styles in components via Material-UI theme system

## Naming Conventions

**Files:**
- TSX components: PascalCase (e.g., `Sidebar/index.tsx`, `MainLayout/index.tsx`)
- Index pattern: Component folder with `index.tsx` inside
- Main app files: PascalCase (App.tsx, MainLayout)
- Utilities/entry: camelCase (main.tsx, vite-env.d.ts)

**Directories:**
- Component folders: PascalCase matching component name (Sidebar, MainLayout)
- Feature folders: lowercase plural (components, layout, store)

**Functions:**
- Component names: PascalCase (MainLayout, Sidebar)
- Store actions: camelCase (openDock, closeDock)
- Hooks: camelCase with 'use' prefix (useRootStore)

**Variables:**
- Observable state: camelCase (isDockOpen)
- Props interfaces: PascalCase with 'Props' suffix (SidebarProps)

**Types:**
- Interfaces: PascalCase (SidebarProps, ChildStore)
- Store class: PascalCase (RootStore)

## Where to Add New Code

**New Feature:**
- Primary code: Add to `src/store/index.tsx` (RootStore property + action) or new store file
- UI components: Add to `src/components/[FeatureName]/index.tsx`
- Tests: Create `src/components/[FeatureName]/[FeatureName].test.tsx` or `src/store/[name].test.tsx`

**New Component/Module:**
- Implementation: Create folder under `src/components/[ComponentName]/` with `index.tsx`
- Export: Re-export from folder index, components imported by path
- Pattern: Use observer() wrapper if component accesses store state

**New Layout:**
- Implementation: Create folder under `src/layout/[LayoutName]/` with `index.tsx`
- Store integration: Access store via useRootStore hook
- Pattern: Use Grid or other MUI layout components for structure

**Utilities:**
- Shared helpers: Create `src/utils/[name].ts` (currently unused - no utils directory yet)
- Type definitions: Extend interfaces in component files or centralize in `src/types/` (create if needed)

**Store Extensions:**
- Single store file: Add to `src/store/index.tsx` (currently all store code here)
- Future split: Could create `src/store/[domain].ts` files for separation

## Special Directories

**node_modules/:**
- Purpose: npm package dependencies
- Generated: Yes (from package-lock.json)
- Committed: No (in .gitignore)

**dist/:**
- Purpose: Production build output
- Generated: Yes (by `npm run build`)
- Committed: No (in .gitignore)

**.git/:**
- Purpose: Git version control repository
- Generated: Yes
- Committed: Yes

## File Type Patterns

**TypeScript/React:**
- `.tsx`: React component files with JSX
- `.ts`: Utility, store, type definition files
- `.d.ts`: Type declaration files (vite-env.d.ts)

**Configuration:**
- `.json`: JSON configuration files (tsconfig, prettier, package)
- `.ts`: TypeScript configuration files (vite.config.ts)

**Documentation:**
- `.md`: Markdown documentation (README.md, CLAUDE.md)

**Styling:**
- `.css`: Global CSS (index.css only, component styles use MUI sx prop)

## Import Patterns

**Absolute imports:**
- All imports use relative paths (e.g., `import { MainLayout } from './layout/MainLayout'`)
- No path aliases configured in tsconfig (could be added via baseUrl/paths)

**Component imports:**
- From folder with index: `import { Sidebar } from '../../components/Sidebar'`
- Direct from index file: `import { Sidebar } from '../../components/Sidebar/index'`

**Store access:**
- Always via custom hook: `import { useRootStore } from '../../store'`
- Not via direct context import (abstraction layer)

**MUI imports:**
- Named imports: `import { Button, Grid } from '@mui/material'`
- Theme: `import { createTheme, ThemeProvider } from '@mui/material'`

**MobX imports:**
- Observer wrapper: `import { observer } from 'mobx-react-lite'`
- Store utilities: `import { makeAutoObservable } from 'mobx'`
