# Coding Conventions

**Analysis Date:** 2026-02-09

## Naming Patterns

**Files:**
- Component files: PascalCase with `index.tsx` pattern (e.g., `Sidebar/index.tsx`)
- Layout files: PascalCase with `index.tsx` pattern (e.g., `MainLayout/index.tsx`)
- Store files: lowercase with domain name (e.g., `store/index.tsx`)
- Config files: lowercase with `.config` infix (e.g., `vite.config.ts`, `tsconfig.json`)

**Functions:**
- Arrow functions preferred with camelCase naming
- Component names in PascalCase (e.g., `MainLayout`, `Sidebar`)
- Event handlers use camelCase with verb prefix: `openDock`, `closeDock`, `onClose`
- Methods in classes use camelCase (e.g., `makeAutoObservable`)

**Variables:**
- Local state and properties use camelCase (e.g., `isDockOpen`, `rootStore`)
- Boolean props/properties prefix with `is` or `on` for events (e.g., `isOpen`, `onClose`)
- Context variables follow PascalCase convention (e.g., `RootStoreContext`, `RootStoreProvider`)

**Types:**
- Interface names use PascalCase with `Props` suffix for component props (e.g., `SidebarProps`)
- Type definitions in PascalCase (e.g., `ChildStore`)
- Exported classes use PascalCase (e.g., `RootStore`)

## Code Style

**Formatting:**
- Prettier 2.8.7 configured in `.prettierrc.json`
- 2 spaces for indentation
- No semicolons at end of statements
- Single quotes for strings

**Prettier Configuration Details:**
```json
{
  "tabWidth": 2,
  "semi": false,
  "singleQuote": true,
  "arrowParens": "avoid"
}
```

**Linting:**
- No ESLint configured - relies on Prettier for formatting only
- TypeScript strict mode enabled in `tsconfig.json` with:
  - `"strict": true`
  - `"forceConsistentCasingInFileNames": true`
  - `"noEmit": true`
  - `"isolatedModules": true`

## Import Organization

**Order:**
1. External dependencies from node_modules (`react`, `mobx`, `@mui/material`)
2. Local project imports from `/` paths (`./store`, `./layout`, `./components`)
3. Relative imports from current directory (`./<filename>`)

**Examples from codebase:**
- `src/main.tsx`: React imports first, then local RootStoreProvider, then CSS
- `src/App.tsx`: MUI imports first, then MainLayout relative import
- `src/layout/MainLayout/index.tsx`: MobX observer, MUI Grid, store hooks, component imports

**Path Aliases:**
- Not configured - uses relative imports throughout

## Error Handling

**Patterns:**
- No error boundaries detected in current codebase
- Console logging used for debugging (e.g., `console.log('Fire!')` in `src/store/index.tsx`)
- No try-catch blocks in reviewed files
- MobX handles state mutations automatically via `makeAutoObservable`

## Logging

**Framework:** `console` (native)

**Patterns:**
- Direct `console.log()` calls for debugging (found in `src/store/index.tsx` line 12)
- No structured logging framework in use
- Intended for development - no production logging infrastructure

## Comments

**When to Comment:**
- Minimal commenting observed in codebase
- Code is self-documenting through descriptive function/variable names
- MobX decorators and TypeScript types provide documentation

**JSDoc/TSDoc:**
- Not in use in current codebase
- TypeScript interfaces and types serve as documentation

## Function Design

**Size:**
- Functions kept small and focused
- Functional components as primary pattern
- Arrow functions for event handlers and callbacks

**Parameters:**
- Destructuring used in function parameters for clarity
- Props interfaces define expected shape
- Spread operator for flexible component composition

**Example from `src/components/Sidebar/index.tsx`:**
```typescript
export const Sidebar = observer(
  ({
    children,
    isOpen,
    onClose,
    width = '40vw',
  }: PropsWithChildren<SidebarProps>) => {
    // component implementation
  }
)
```

**Return Values:**
- Components return JSX.Element
- Void returns for event handlers (state mutation via MobX)
- Consistent with React Functional Components pattern

## Module Design

**Exports:**
- Named exports preferred for components and utilities
- Example: `export const Sidebar`, `export const MainLayout`, `export class RootStore`
- Default exports for root-level entry points (e.g., `export default App`)

**Barrel Files:**
- `index.tsx` files used as barrel exports in component/layout directories
- `src/store/index.tsx` contains RootStore class, context, provider, and hook

**Observer Pattern:**
- Components wrapped with `observer()` from mobx-react-lite to track state mutations
- Applied to: `MainLayout`, `Sidebar` (found in `src/layout/MainLayout/index.tsx` and `src/components/Sidebar/index.tsx`)

---

*Convention analysis: 2026-02-09*
