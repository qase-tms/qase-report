# Codebase Concerns

**Analysis Date:** 2026-02-09

## Tech Debt

**Debug Console Output:**
- Issue: Hardcoded `console.log('Fire!')` statement in closeDock handler leaves debugging output in production
- Files: `src/store/index.tsx:12`
- Impact: Clutters browser console in production builds, unprofessional user experience
- Fix approach: Remove the debug statement or replace with proper error logging/telemetry

**Incomplete HTML Title:**
- Issue: HTML title tag shows "Vite + React + TS" - generic boilerplate not updated to "Qase Report"
- Files: `index.html:6`
- Impact: Browser tabs and search results show incorrect application name
- Fix approach: Update title to "Qase Report" in index.html

**Redundant Toolbar Component:**
- Issue: App.tsx renders `<Toolbar variant={'dense'} />` as a spacer below AppBar (line 14)
- Files: `src/App.tsx:14`
- Impact: Semantic HTML mismatch, MUI Toolbar used for layout purposes instead of its intended use
- Fix approach: Replace with spacer div or use CSS margin/padding approach

## Known Issues

**Missing Type Safety in Store Context:**
- Issue: `RootStoreContext` initialized with `rootStore` value but created with generic type inference
- Files: `src/store/index.tsx:24`
- Impact: Could lead to type coercion issues if context value is ever null/undefined in consumers
- Workaround: useRootStore hook is used consistently, so current usage is safe
- Safe migration: Consider explicit type parameter for createContext to ensure type safety

**Sidebar Width Prop Logic:**
- Issue: Width prop has confusing logic: `width: width || '40vw'` when width has default value
- Files: `src/components/Sidebar/index.tsx:24`
- Impact: Default value in parameter already provides '40vw', redundant fallback is confusing
- Fix approach: Remove the `|| '40vw'` fallback since default parameter already handles undefined

## Security Considerations

**No Input Sanitization Framework:**
- Risk: If the application expands to handle user input, there's no sanitization library
- Current mitigation: Application currently only renders static content
- Recommendations: When adding user-generated content handling, integrate DOMPurify or similar sanitization

**Missing Security Headers Configuration:**
- Risk: No Content Security Policy or other security headers configured
- Files: `vite.config.ts` (no headers configured)
- Current mitigation: Running locally; production deployment would need headers
- Recommendations: Configure vite server or production server to add CSP, X-Frame-Options, X-Content-Type-Options

**No Environment Variable Validation:**
- Risk: Application doesn't validate or document required environment variables
- Current mitigation: No external API integrations yet
- Recommendations: When integrating with external services, implement env validation at startup

## Performance Bottlenecks

**Full Viewport Height Calculation:**
- Problem: MainLayout calculates height as `calc(100vh - 48px)` but AppBar height is hardcoded
- Files: `src/layout/MainLayout/index.tsx:13`
- Cause: Magic number 48px assumes dense Toolbar height; if theme/sizing changes, layout breaks
- Improvement path: Extract AppBar height to constant or CSS variable; use theme spacing values

**No Code Splitting or Lazy Loading:**
- Problem: All components bundled together with no route-based splitting
- Files: Application structure
- Cause: Single page application with simple routing
- Improvement path: Implement React.lazy() and Suspense as features grow; add route-based code splitting

**MUI Theme Recreation on Every Render:**
- Problem: `createTheme()` called in App component render function (line 5)
- Files: `src/App.tsx:5`
- Cause: Theme object recreated on every render, potentially causing unnecessary style recalculations
- Improvement path: Move createTheme() call outside component or useMemo it

## Fragile Areas

**Store Implementation:**
- Files: `src/store/index.tsx`
- Why fragile: Uses singleton pattern with module-level instantiation; makes testing difficult and ties store state to module initialization
- Safe modification: Wrap store initialization in custom hooks; enable per-test store instances
- Test coverage: No unit tests for store logic; closeDock action logic untested
- Risk: Store state persists across tests if testing is added; production state pollution possible

**Layout Assumptions:**
- Files: `src/layout/MainLayout/index.tsx`, `src/components/Sidebar/index.tsx`
- Why fragile: Hard-coded grid proportions (xs={10} and xs={2}), fixed viewport height calculation, fixed sidebar width
- Safe modification: Extract hard-coded values to config; use MUI theme breakpoints for responsive behavior
- Test coverage: No responsive tests; layout breaks untested on different screen sizes

**MobX MakeAutoobservable Usage:**
- Files: `src/store/index.tsx:6`
- Why fragile: `makeAutoObservable` auto-decorates all fields and methods; refactoring method names will break tracking
- Safe modification: Explicitly declare observable/action fields instead of makeAutoObservable
- Test coverage: No tests verify store reactivity; observer component re-renders untested

## Scaling Limits

**Single Store Architecture:**
- Current capacity: Suitable for small feature set; isDockOpen boolean only
- Limit: Adding complex nested state (multiple modals, form states, API cache) becomes unwieldy
- Scaling path: Implement modular stores (separate ModalStore, FormStore, APIStore) before feature complexity grows

**No API Layer:**
- Current capacity: Static UI only
- Limit: Application has no network communication infrastructure; adding API calls will require new patterns
- Scaling path: Create services/ directory with fetch/axios clients before adding data fetching

**No Routing:**
- Current capacity: Single-view application
- Limit: Multi-page report visualization requires routing
- Scaling path: Implement React Router v6 before adding multiple report views

## Dependencies at Risk

**MUI Major Version Gap:**
- Risk: MUI 5.12.0 installed but 5.18.0 and 7.3.7 available; significant minor version lag
- Impact: Missing bug fixes, new features; MUI 7.0 is major breaking change not attempted
- Migration plan: Update to latest MUI 5.x patch before adding features; defer MUI 7 migration until planned refactor

**React Version Behind:**
- Risk: React 18.2.0 installed but 18.3.1 available; React 19 available
- Impact: Missing performance improvements in 18.3+; React 19 has breaking changes
- Migration plan: Update 18.x patch versions routinely; evaluate React 19 when libraries support it

**TypeScript Version Lag:**
- Risk: TypeScript 4.9.3 installed but 5.x available
- Impact: Missing new language features; type safety improvements available
- Migration plan: Update to TypeScript 5.x in dedicated upgrade phase

**Prettier Version Pinned:**
- Risk: Prettier 2.8.7 used; Prettier 3.x available with formatting changes
- Impact: Team consistency depends on specific version; upgrading causes format churn
- Migration plan: Pin Prettier version in CI/pre-commit hooks; schedule coordinated upgrade

## Missing Critical Features

**No Error Boundary:**
- Problem: Application has no error boundary component
- Blocks: React runtime errors will crash entire application
- Recommended implementation: Add ErrorBoundary wrapper around MainLayout

**No Loading States:**
- Problem: No skeleton/loading UI components
- Blocks: When API integration is added, UI has no way to show loading/pending states
- Recommended implementation: Create LoadingSpinner component; add to component library before API work

**No Form Handling:**
- Problem: No form library or validation
- Blocks: Report generation/filtering forms can't be implemented
- Recommended implementation: Evaluate react-hook-form + zod before form features

**No Notification System:**
- Problem: No toast/snackbar service for user feedback
- Blocks: User actions (export, upload) have no success/error feedback mechanism
- Recommended implementation: Create NotificationStore in MobX; integrate MUI Snackbar component

## Test Coverage Gaps

**Untested Store Logic:**
- What's not tested: isDockOpen state management, openDock/closeDock actions
- Files: `src/store/index.tsx`
- Risk: State mutations could be broken undetected; observer reactivity may fail silently
- Priority: High

**Untested Components:**
- What's not tested: All React components (MainLayout, Sidebar, App)
- Files: `src/layout/MainLayout/index.tsx`, `src/components/Sidebar/index.tsx`, `src/App.tsx`
- Risk: UI interactions and state binding broken without detection; theme changes break rendering untested
- Priority: High

**No Responsive Design Tests:**
- What's not tested: Layout behavior on mobile/tablet/desktop breakpoints
- Files: `src/layout/MainLayout/index.tsx` (hard-coded xs={10}, xs={2} grid)
- Risk: Application may be unusable on mobile devices; breakpoint bugs remain undetected
- Priority: Medium

**No Integration Tests:**
- What's not tested: Store + Component integration; observer components re-render on store updates
- Files: Entire application layer
- Risk: Store updates may fail to trigger UI updates; component lifecycle bugs undetected
- Priority: Medium

**No E2E Tests:**
- What's not tested: User workflows (open/close sidebar, navigate)
- Files: Entire application
- Risk: Complete feature breakage possible with no automated detection
- Priority: Low (defer until feature-rich)

---

*Concerns audit: 2026-02-09*
