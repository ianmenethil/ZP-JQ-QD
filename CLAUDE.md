# SACRED RULES THAT MUST BE OBEYED AT ALL TIMES

- No use of `any`
- No use of loose types over strict types
- No use of `var`
- No use of `==` or `!=` (always use `===` or `!==`)
- No TODOs left in the code
- No commented out code (unless temporarily for debugging)
- No backward compatibility hacks
- No shortcuts or "clever" code that sacrifice readability
- No deeply nested code (max 3 levels of nesting)
- No large functions (max 50 lines, ideally 20–30)
- No fallbacks
- No hardcoded secrets or sensitive info
- No duplicated code (DRY principle)
- No unused imports or variables and no `_` prefix usage
- Application must always pass linting and type checks after any change
- No making assumptions or decisions without explicit approval
- No additional tasks or changes beyond what is requested
- Application is deployed with `wrangler deploy`
- No circular dependencies between modules
- No silent error handling (`catch {}` forbidden) — all errors must be logged or rethrown
- No mutated global state or prototype extensions
- No `eval`, `Function`, or dynamic imports from unchecked input
- All external API responses must undergo runtime schema validation (e.g. Zod)
- Tests required for all business logic — no skipping or disabling tests
- All environment access must go through a typed config module (no inline `process.env`)
- No deprecated or unreviewed dependencies allowed
- Consistent code style enforced (Prettier, ESLint, TS strict mode)
- Mandatory high-level comments only where logic is non-trivial (explain _why_, not _what_)
- Changelog must be updated for behavior-affecting changes
- No secrets in code — use environment variables or secret manager only
- All inputs must be validated and sanitized (server-side), no trust in client data
- All external APIs or webhooks must use runtime schema validation (e.g. Zod)
- No use of `eval`, `Function`, or dynamic code execution
- Errors must never leak internals — no stack traces or system details in responses
- All authentication and authorization checks must be explicit (no implicit trust or bypass paths)
- Sensitive data (tokens, passwords, PII) must never be logged or stored in plain text
- Use parameterized queries or ORM — no raw SQL/string concatenation

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZenPay Payment Plugin Demo - A TypeScript-based single-page application that demonstrates ZenPay payment integration. The app provides a configuration UI for merchants to generate payment forms with various options and preview the integration code.

## Build Commands

```bash
npm run dev              # Start Vite dev server on port 3000
npm run build            # Production build with minification
npm run build:check      # Type-check then production build
npm run build:dev        # Type-check then development build (no minification)
npm run type-check       # Run TypeScript compiler without emitting files
npm run lint             # ESLint with auto-fix for src/ts/**/*.ts
npm run format           # Prettier formatting for TypeScript files
npm run clean            # Remove build and dist directories
npm run preview          # Preview production build
```

## Architecture

### � CRITICAL: Build System & Deployment Model

**THIS IS A STATIC SINGLE-PAGE APPLICATION - NOT A SERVER-SIDE APPLICATION**

- **Build Output**: Everything bundles into **3 static files**:
  1. `build/index.html` - Single HTML file (all partials inlined via `@@include` directive)
  2. `build/js/bundle.min.js` - Single JavaScript bundle (all TypeScript compiled)
  3. `build/css/bundle.min.css` - Single CSS bundle
  4. `build/public/` - Static files (JSON data, templates) copied as-is

- **NO SERVER**: No backend, no API server, no Node.js runtime at deployment
- **NO CODE-SPLITTING**: Everything bundles into ONE JavaScript file
- **NO LAZY-LOADING**: All JavaScript loads immediately (Vite config disables code splitting)
- **NO ROUTES**: Single HTML file, no client-side routing

### Build Process

- **Vite** bundles everything with custom HTML include plugin for `@@include` directives
- Entry: `index.html` � `src/ts/index.ts` � `src/ts/main.ts`
- All TypeScript modules compile into single `bundle.min.js`
- All CSS files combine into single `bundle.min.css`
- HTML partials processed via custom plugin that recursively resolves `@@include('path/to/file.html')`

### HTML Template System

Uses Vite's custom `@@include` directive (see [vite.config.ts:10-43](vite.config.ts#L10-L43)):

- Root: [index.html](index.html) includes:
  - [src/html/header.html](src/html/header.html) - App header with theme toggle
  - [src/html/main.html](src/html/main.html) - Main content grid
  - [src/html/modal.html](src/html/modal.html) - Bootstrap modals
  - [src/html/footer.html](src/html/footer.html) - App footer
- Main grid includes partials from [src/html/main.partials/](src/html/main.partials/):
  - `tab.credentials.html` - API credentials form
  - `config-card.html` - Configuration UI
  - `code-preview.html` - JSON preview with syntax highlighting

### TypeScript Architecture

**Initialization Flow:**

1. [src/ts/index.ts](src/ts/index.ts) - Entry point, imports CSS and modules
2. [src/ts/main.ts:206-210](src/ts/main.ts#L206-L210) - DOMContentLoaded listener calls `initializeApp()`
3. [src/ts/main.ts:47-201](src/ts/main.ts#L47-L201) - `initializeApp()` orchestrates all initialization
4. [src/ts/eventListenersClass.ts](src/ts/eventListenersClass.ts) - Centralized event listener registration via class-based approach

**Core Module Organization:**

- **[src/ts/globals.ts](src/ts/globals.ts)** - Central hub for:
  - External library guards ([globals.ts:5-48](src/ts/globals.ts#L5-L48)) - Runtime validation for Bootstrap, hljs, sha3_512
  - SESSION_KEYS constants ([globals.ts:91-121](src/ts/globals.ts#L91-L121))
  - DEFAULT_VALUES for credentials, payment methods, options ([globals.ts:123-165](src/ts/globals.ts#L123-L165))
  - DomUtils ([globals.ts:211-290](src/ts/globals.ts#L211-L290)) - Vanilla JS DOM manipulation helpers
  - V3 compatibility mode flags ([globals.ts:51-79](src/ts/globals.ts#L51-L79)) - `window.zpV3CompatMode`

- **[src/ts/utilities.ts](src/ts/utilities.ts)** - Pure utility functions (no side effects):
  - Base64 encoding/decoding with ASCII validation
  - Debounce/throttle functions (simple and cancellable variants)
  - UUID generation via crypto.randomUUID
  - ISO timestamp generation (UTC, no milliseconds)
  - Customer name/email generation from predefined list
  - Payment amount formatting and generation
  - Clipboard operations (modern API only)

- **[src/ts/session.ts](src/ts/session.ts)** - Session storage with base64 encoding:
  - Credentials storage: ZPSC key ([session.ts:130-148](src/ts/session.ts#L130-L148))
  - State storage: ZPS key ([session.ts:188-228](src/ts/session.ts#L188-L228))
  - Credential obfuscation via WeakMap ([session.ts:70-92](src/ts/session.ts#L70-L92))
  - Focus/blur handlers for secure credential display

- **[src/ts/core/fingerprintGenerator.ts](src/ts/core/fingerprintGenerator.ts)** - SHA3-512 fingerprint generation:
  - Version-specific hashing: SHA-1 (v3), SHA-512 (v4), SHA-3-512 (v5)
  - Field order matters for security: `apiKey|username|password|mode|amount|merchantId|timestamp`
  - V3 compatibility mode support (omit timestamp/merchantCode)
  - Amount normalization: remove decimal, mode '2' forces 0

- **[src/ts/initZP.ts](src/ts/initZP.ts)** - ZenPay plugin initialization:
  - Validates credentials before initialization
  - Generates fingerprint via `generatePaymentSecurityFingerprint()`
  - Calls jQuery plugin: `$.zpPayment(config)` ([initZP.ts:335](src/ts/initZP.ts#L335))
  - Saves credentials and state to session on init

**Event Management:**

- **[src/ts/eventListenersClass.ts](src/ts/eventListenersClass.ts)** - Class-based event listener organization:
  - `@HandleErrors` decorator for automatic error handling ([core/applogger.ts:192-209](src/ts/core/applogger.ts#L192-L209))
  - `initFormListeners()` - credentials, payment amount, mode
  - `initButtonListeners()` - initialize plugin, copy code
  - `initToggleListeners()` - payment methods, options, radio buttons
  - `initAllListeners()` - orchestrates all listener groups

**UI Components:**

- [src/ts/codePreview.ts](src/ts/codePreview.ts) - JSON config display with hljs syntax highlighting
- [src/ts/modals/modal.ts](src/ts/modals/modal.ts) - Bootstrap modal utilities (showSuccess, showError, showCustomModal)
- [src/ts/theme.ts](src/ts/theme.ts) - Dark/light theme toggle
- [src/ts/tooltips.ts](src/ts/tooltips.ts) - Bootstrap tooltip initialization
- [src/ts/placeholders.ts](src/ts/placeholders.ts) - Form placeholder generation
- [src/ts/ui/buttonState.ui.ts](src/ts/ui/buttonState.ui.ts) - Button state management
- [src/ts/ui/customDropdown.ts](src/ts/ui/customDropdown.ts) - Custom dropdown components

**Modal System:**

- [src/ts/modals/inputParameters.ts](src/ts/modals/inputParameters.ts) - ZenPay input parameter reference
- [src/ts/modals/outputParameters.ts](src/ts/modals/outputParameters.ts) - ZenPay output parameter reference
- [src/ts/modals/errorCodes.ts](src/ts/modals/errorCodes.ts) - Error code reference system
- Data sourced from [src/data/](src/data/): `jq-input-parameters.json`, `jq-output-parameters.json`, `jq-error-codes.json`

**Logging:**

- [src/ts/core/applogger.ts](src/ts/core/applogger.ts) - Enhanced console logging:
  - Styled console output with color coding
  - `@HandleErrors` decorator for method error handling
  - `console.json()` for pretty-printed objects
  - DEBUG_MODE and TRACE_MODE toggles

### External Dependencies (Runtime)

**Loaded via CDN in [index.html](index.html):**

- jQuery 3.7.1 - Required by ZenPay plugin (not used in app code)
- Bootstrap 5.3.3 - UI framework, accessed via `window.bootstrap`
- highlight.js 11.9.0 - Syntax highlighting, accessed via `window.hljs`
- js-sha3 0.9.3 - SHA3-512 hashing, accessed via `window.sha3_512`
- ZenPay Plugin - Core payment functionality loaded from CDN

**Build Dependencies:**

- TypeScript 5.9+ with comprehensive strict mode ([tsconfig.json:17-32](tsconfig.json#L17-L32))
- Vite 7.1+ for bundling
- ESLint with TypeScript plugin
- Zod 4.1+ for schema validation
- PostCSS with autoprefixer and cssnano

### V3 Compatibility Mode

Global flags for backward compatibility ([src/ts/globals.ts:51-79](src/ts/globals.ts#L51-L79)):

- `window.zpV3CompatMode.omitTimestampFromHash` - Exclude timestamp from fingerprint hash
- `window.zpV3CompatMode.omitMerchantCodeFromPayload` - Exclude merchant code from payload
- Debug helper: `window.zenhelp()` - Shows current V3 compat settings in console

## Development Guidelines

### Adding New Features

1. **Global Constants**: Add session keys to SESSION_KEYS in [src/ts/globals.ts](src/ts/globals.ts)
2. **Event Listeners**: Add methods to EventListeners class in [src/ts/eventListenersClass.ts](src/ts/eventListenersClass.ts)
3. **UI Components**: Create TypeScript module, import in [src/ts/main.ts](src/ts/main.ts), call init function
4. **Pure Utilities**: Add to [src/ts/utilities.ts](src/ts/utilities.ts) (keep functions pure, no side effects)
5. **UI-bound Helpers**: Add to specific component modules (e.g., session.ts, codePreview.ts)

### Code Conventions

- Small, single-responsibility exported functions
- Pure utilities (no side effects) go in utilities.ts
- Session helpers over direct sessionStorage access
- DomUtils from globals.ts instead of jQuery for DOM manipulation
- Console logging with descriptive prefixes (see applogger.ts patterns)
- TypeScript strict mode with comprehensive checks ([tsconfig.json:17-32](tsconfig.json#L17-L32))
- Path aliases: `@/ts/*`, `@/css/*`, `@/html/*` ([tsconfig.json:36-48](tsconfig.json#L36-L48))
- Branded types for type safety (Base64EncodedString, IsoTimestampString)
- Error classes extend Error with descriptive names and cause tracking
- Decorator pattern for error handling (`@HandleErrors`)

### Module Organization

- **globals.ts**: Runtime guards, constants, defaults, DOM utilities
- **utilities.ts**: Pure functions, no side effects, no DOM dependencies
- **session.ts**: Storage operations, credential obfuscation
- **Components**: UI-specific modules with DOM manipulation
- **core/**: Core logic (fingerprintGenerator, applogger, buttonState.logic)
- **modals/**: Modal-based UI components
- **ui/**: Reusable UI components
- **types/**: TypeScript type definitions

### Critical Integration Points

- **ZenPay Plugin**: `$.zpPayment(config)` in [initZP.ts:335](src/ts/initZP.ts#L335) - jQuery required
- **Fingerprint Generation**: SHA3-512 hash via [core/fingerprintGenerator.ts](src/ts/core/fingerprintGenerator.ts) - Field order is security-critical
- **Session Persistence**: Base64-encoded storage via [session.ts](src/ts/session.ts) - Keys: ZPSC (credentials), ZPS (state)
- **External Libraries**: Access via guarded exports from [globals.ts](src/ts/globals.ts) (bootstrap, hljs, sha3_512)
- **Event Listeners**: Centralized in [eventListenersClass.ts](src/ts/eventListenersClass.ts) with decorator-based error handling

### Download Standalone Demo Feature

**Purpose**: Generates a single self-contained HTML file with all credentials and configuration pre-filled

**How It Works** ([downloadApp.ts](src/ts/downloadApp.ts)):

1. User fills credentials in main app (API Key, Username, Password, Merchant Code)
2. User clicks "Download Demo" button ([main.ts:179](src/ts/main.ts#L179))
3. System fetches three files from `/public/`:
   - [Template.html](src/public/Template.html) - Standalone UI template (different from main app)
   - [scripts.js](src/public/scripts.js) - Vanilla JS for standalone demo
   - [styles.css](src/public/styles.css) - Styles for standalone demo
4. Inlines CSS and JS into Template.html ([downloadApp.ts:176-186](src/ts/downloadApp.ts#L176-L186))
5. Injects initialization script with pre-filled credentials ([downloadApp.ts:70-122](src/ts/downloadApp.ts#L70-L122))
6. Downloads as `ZenPay_Tester_{MerchantCode}.html`

**Key Details**:

- Downloaded file has **zero external dependencies** - runs completely offline
- Template.html uses different field IDs (no "Input" suffix: `apiKey` vs `apiKeyInput`)
- Template includes hidden `#initializePlugin` button triggered by "Process Payment" button
- Credentials are pre-filled via DOMContentLoaded script injection
- File can be opened directly from filesystem (no server required)

**Critical Files**:

- **[src/ts/downloadApp.ts](src/ts/downloadApp.ts)** - Download orchestration and file generation
- **[src/public/Template.html](src/public/Template.html)** - Standalone demo template (lines 26, 785: `inline` attributes)
- **[src/public/scripts.js](src/public/scripts.js)** - Standalone demo behavior (theme toggle, dropdowns, payment methods)
- **[src/public/styles.css](src/public/styles.css)** - Standalone demo styling (CSS variables with dark mode)

**Known Issues**:

- Currently buggy - file may not save correctly with merchant code
- Inline replacement uses regex matching specific attribute patterns ([downloadApp.ts:177-186](src/ts/downloadApp.ts#L177-L186))

## Important Files

### Critical Security & Integration Files

- **[src/ts/core/fingerprintGenerator.ts](src/ts/core/fingerprintGenerator.ts)** - SHA3-512 fingerprint generation (security-critical field ordering)
- **[src/ts/initZP.ts](src/ts/initZP.ts)** - ZenPay plugin initialization with credential validation
- **[src/ts/globals.ts](src/ts/globals.ts)** - SESSION_KEYS, DEFAULT_VALUES, DomUtils (breaking changes affect persistence)

### Build Configuration

- **[vite.config.ts](vite.config.ts)** - Custom HTML include plugin, single-bundle config, terser settings
- **[tsconfig.json](tsconfig.json)** - Strict mode with comprehensive type checking
- **[eslint.config.mjs](eslint.config.mjs)** - Flat config format, TypeScript rules

### Data Files

- [src/data/jq-input-parameters.json](src/data/jq-input-parameters.json) - ZenPay input API reference
- [src/data/jq-output-parameters.json](src/data/jq-output-parameters.json) - ZenPay output API reference
- [src/data/jq-error-codes.json](src/data/jq-error-codes.json) - ZenPay error code definitions

## Notes

- **Ignore backups**: `*.bak`, `*.backup`, `*.old` files/directories (e.g., `src/ts.bak/`)
- **Public assets**: [src/public/](src/public/) copied to `build/public/` without processing
- **No jQuery in app**: Application uses vanilla JavaScript with DomUtils - jQuery only for ZenPay plugin
- **ESLint rules**: Unused variables must have `_` prefix ([eslint.config.mjs:19-24](eslint.config.mjs#L19-L24))
- **Build output**: Vite processes `index.html` with recursive `@@include` resolution
- **TypeScript strict mode**: All strict checks enabled including noUncheckedIndexedAccess
