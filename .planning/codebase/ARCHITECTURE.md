# Architecture

**Analysis Date:** 2026-02-09

## Pattern Overview

**Overall:** MobX-based Flux-like pattern with React functional components and Material-UI

**Key Characteristics:**
- Centralized observable state management via MobX RootStore
- Observer-wrapped React components for reactive UI updates
- Material-UI component library for presentation
- TypeScript for type safety across all layers
- Modular component and layout structure

## Layers

**Presentation Layer (Components):**
- Purpose: Reusable UI components that accept props and render interface elements
- Location: `src/components/`
- Contains: Observer-wrapped React functional components using MUI components
- Depends on: MUI Material library, MobX observer
- Used by: Layout components and other components

**Layout Layer:**
- Purpose: Structural organization of page sections and component composition
- Location: `src/layout/`
- Contains: MainLayout component that orchestrates grid-based page structure
- Depends on: Presentation components, store access via useRootStore hook
- Used by: App root component

**State Management Layer (Store):**
- Purpose: Centralized application state and business logic
- Location: `src/store/index.tsx`
- Contains: RootStore class with observable properties and actions
- Depends on: MobX library
- Used by: All components via useRootStore hook

**Application Root Layer:**
- Purpose: Theme setup and provider configuration
- Location: `src/App.tsx`
- Contains: ThemeProvider wrapping MainLayout
- Depends on: MUI theme, MainLayout
- Used by: main.tsx entry point

**Bootstrap Layer:**
- Purpose: DOM mounting and provider setup
- Location: `src/main.tsx`
- Contains: React DOM rendering with RootStoreProvider
- Depends on: App component, RootStoreProvider
- Used by: index.html entry point

## Data Flow

**State Update Flow:**

1. User interaction (e.g., button click) triggers event handler in observer component
2. Event handler calls action method from RootStore (e.g., openDock, closeDock)
3. MobX updates observable state property (e.g., isDockOpen)
4. Observer-wrapped components re-render automatically with new state
5. UI reflects state changes

**Example: Sidebar Toggle**

1. User clicks "Open sidebar" button in MainLayout (`src/layout/MainLayout/index.tsx`)
2. onClick handler calls `openDock()` from store
3. RootStore.isDockOpen changes from false to true
4. MainLayout component observes change via observer() wrapper
5. Sidebar component re-renders with isOpen={true}
6. Drawer opens via MUI Drawer component

**State Management:**

- Single RootStore instance created at module load time (`src/store/index.tsx`)
- Store wrapped in React Context (RootStoreContext)
- Components access store via useRootStore hook, which uses useContext
- MobX observables automatically track dependencies and trigger re-renders

## Key Abstractions

**RootStore:**
- Purpose: Centralized state container and action dispatcher
- Examples: `src/store/index.tsx`
- Pattern: Class-based with MobX makeAutoObservable for automatic reactivity
- Properties: isDockOpen (boolean), actions: openDock(), closeDock()

**Observer Components:**
- Purpose: Components that react to store state changes
- Examples: `src/layout/MainLayout/index.tsx`, `src/components/Sidebar/index.tsx`
- Pattern: Functional components wrapped with observer() from mobx-react-lite
- Automatically subscribe to accessed observable properties

**Context Provider Pattern:**
- Purpose: Provide store access throughout component tree
- Example: RootStoreProvider in `src/store/index.tsx`
- Implementation: React Context API with custom hook (useRootStore)

## Entry Points

**HTML Document:**
- Location: `index.html`
- Triggers: Browser navigation to application URL
- Responsibilities: Defines root DOM element, loads src/main.tsx script

**React Entry Point:**
- Location: `src/main.tsx`
- Triggers: Loaded by index.html script tag
- Responsibilities: Mount React app to DOM, wrap with providers (RootStoreProvider, StrictMode)

**Application Component:**
- Location: `src/App.tsx`
- Triggers: Rendered by main.tsx
- Responsibilities: Setup MUI ThemeProvider, render MainLayout, render AppBar header

**Main Layout:**
- Location: `src/layout/MainLayout/index.tsx`
- Triggers: Rendered by App component
- Responsibilities: Setup page grid structure, manage sidebar state, render main content and Sidebar

## Error Handling

**Strategy:** Minimal current implementation with console logging

**Patterns:**
- console.log used in store action (closeDock method logs "Fire!")
- No global error boundary currently implemented
- No try-catch blocks in current code

## Cross-Cutting Concerns

**Logging:** Currently minimal - only debug log in closeDock action

**Validation:** No validation layer currently implemented; prop types provided via TypeScript interfaces

**Authentication:** Not implemented in current architecture
