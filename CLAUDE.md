# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZenPay Payment Plugin Demo - A TypeScript-based single-page application that demonstrates ZenPay payment integration. The app provides a configuration UI for merchants to generate payment forms with various options and preview the integration code.

## Build Commands

```bash
npm run dev              # Start Vite dev server on port 3000
npm run build            # Production build with TypeScript checks and minification
npm run build:check      # Type-check and production build
npm run build:dev        # Type-check and development build (no minification)
npm run type-check       # Run TypeScript compiler without emitting files
npm run lint             # ESLint with auto-fix for src/ts/**/*.ts
npm run format           # Prettier formatting for TypeScript files
npm run clean            # Remove build and dist directories
npm run preview          # Preview production build
```

## Architecture

### ⚠️ CRITICAL: Build System & Deployment Model

**THIS IS A STATIC SINGLE-PAGE APPLICATION - NOT A SERVER-SIDE APPLICATION**

- **Build Output**: Everything bundles into **3 static files** only:
  1. `build/index.html` - Single HTML file (all partials processed and inlined)
  2. `build/js/bundle.min.js` - Single JavaScript bundle (all TypeScript compiled and bundled)
  3. `build/css/bundle.min.css` - Single CSS bundle (all styles bundled)
  4. `build/public/` - Static JSON files and templates (copied as-is)

- **NO SERVER**: There is no backend, no API server, no Node.js runtime
- **NO CODE-SPLITTING**: Everything bundles into ONE JavaScript file
- **NO LAZY-LOADING**: All JavaScript loads immediately (dynamic imports don't split chunks due to Vite config)
- **NO ROUTES**: Single HTML file, no client-side routing, no separate pages

### Build Process
- **Vite** bundles everything with custom HTML include plugin for `@@include` directives
- Entry: `index.html` → `src/ts/index.ts` → `src/ts/main.ts`
- All TypeScript modules compile into a single `bundle.min.js`
- All CSS files combine into a single `bundle.min.css`
- HTML partials (`@@include`) are processed and inlined into `index.html`

### Optimization Strategy
- **Do NOT attempt lazy-loading** - everything is in one bundle anyway
- **Do NOT use dynamic imports** - they won't split code and add unnecessary complexity
- **Focus on**: Tree-shaking, minification, removing dead code
- **Keep it simple**: Direct imports, eager initialization, minimal abstraction

### TypeScript Module Organization

**Core Initialization Flow:**
1. `src/ts/index.ts` - Entry point that imports CSS and initializes modules
2. `src/ts/main.ts` - Main orchestrator that initializes all components via DOMContentLoaded
3. `src/ts/initZP.ts` - ZenPay plugin initialization with credential validation
4. `src/ts/initListeners.ts` - Centralized event listener registration

**Key Architectural Components:**
- **Global State**: `src/ts/globals.ts` - Unified module with library guards, defaults, and DOM utils
  - External library guards (Bootstrap, hljs, sha3_512) with runtime validation
  - SESSION_KEYS, DEFAULT_VALUES, and default tab configurations
  - DomUtils object for vanilla JS DOM manipulation
  - V3 compatibility mode flags (`window.zpV3CompatMode`) and debug helper (`window.zenhelp()`)
- **Utilities**: `src/ts/utilities.ts` - Pure utility functions (modern, strict, minimal)
  - Base64 encoding/decoding with ASCII validation
  - Debounce/throttle functions (simple and advanced with cancel/flush)
  - UUID v4 generation via crypto.randomUUID
  - ISO timestamp generation (UTC, no milliseconds)
  - Random customer name/email generation from predefined list
  - Random payment amount generation with validation
  - Clipboard operations (modern Clipboard API only)
- **Helpers**: `src/ts/helpers.ts` - Backward-compatible exports and UI-bound helpers
  - Re-exports utilities with legacy aliases for compatibility
  - URL validation and update functions
  - Currency formatting and HTML sanitization
  - Deep clone utility for objects
- **Session Management**: `src/ts/session.ts` - SessionStorage wrapper for form persistence
- **Code Preview**: `src/ts/codePreview.ts` - JSON configuration display and validation
- **Security**: `src/ts/cryptographicFingerprintGenerator.ts` - SHA3-512 fingerprint generation
- **Plugin Parameters**: Type-safe parameter validation and documentation
  - `src/ts/inputParameters.ts` - ZenPay plugin input parameter schemas with modal UI
  - `src/ts/outputParameters.ts` - ZenPay plugin output parameter schemas with modal UI
  - `src/ts/errorCodes.ts` - Error code reference system with categorization and modal UI
- **UI Components**:
  - `src/ts/theme.ts` - Dark/light theme toggle
  - `src/ts/modal.ts` - Bootstrap modal helpers
  - `src/ts/tooltips.ts` - Bootstrap tooltip initialization
  - `src/ts/placeholders.ts` - Form placeholder generation and styling
  - `src/ts/extendedOptions.ts` - Extended payment options UI
  - `src/ts/fileInput.ts` - File input handling
  - `src/ts/downloadApp.ts` - Application download functionality
  - `src/ts/paymentUrlBuilder.ts` - Payment URL construction and updates
  - `src/ts/zpLogo.ts` - ZenPay logo component
  - `src/ts/keyboardShortcuts.ts` - Keyboard shortcut handling
- **Logging**: `src/ts/applogger.ts` - Application logging with prefixes
- **Types**: `src/ts/types/` - TypeScript type definitions
  - `globals.types.ts` - Global interfaces and types
  - `external-libs.d.ts` - External library type declarations

### HTML Template System
- Uses Vite's custom `@@include` directive to compose HTML from partials
- Main structure: `src/html/index.html` includes:
  - `src/html/header.html` - Application header with theme toggle and app title
  - `src/html/main.html` - Main content with tabbed interface
  - `src/html/main.partials/*.html` - Individual UI components:
    - `tab.credentials.html` - API credentials input form
    - `tab.payment-methods.html` - Payment method toggles
    - `tab.options.html` - Additional payment options
    - `tab.extended.html` - Extended configuration options
    - `config-card.html` - Configuration summary card
    - `code-preview.html` - JSON code preview with syntax highlighting
    - `url-builder.html` - Payment URL builder interface
    - `warning.html` - Warning messages
    - `end.html` - End section
  - `src/html/modal.html` - Bootstrap modals (error codes, input/output parameters)
  - `src/html/footer.html` - Application footer

### External Dependencies
- **Required at runtime** (loaded via CDN in HTML):
  - jQuery 3.7.1 - Required by ZenPay plugin (not used in application code)
  - Bootstrap 5.3.3 - UI framework (accessed via `window.bootstrap`)
  - highlight.js 11.9.0 - Code syntax highlighting (accessed via `window.hljs`)
  - js-sha3 0.9.3 - Cryptographic hashing (accessed via `window.sha3_512`)
  - ZenPay Payment Plugin - Core payment functionality (loaded dynamically)
- **Build dependencies** (package.json):
  - TypeScript 5.9+ with strict mode enabled
  - Vite 7.1+ for bundling
  - ESLint with TypeScript plugin for linting
  - Prettier for code formatting
  - Zod 4.1+ for schema validation
  - PostCSS with autoprefixer and cssnano

### V3 Compatibility Mode
Global flags for backward compatibility:
- `window.zpV3CompatMode.omitTimestampFromHash` - Exclude timestamp from fingerprint
- `window.zpV3CompatMode.omitMerchantCodeFromPayload` - Exclude merchant code
- Debug helper: `window.zenhelp()` - Shows current V3 compat settings

## Development Guidelines

### Adding New Features
1. **Global Constants**: Add new session keys to SESSION_KEYS in `src/ts/globals.ts`
2. **Event Listeners**: Register in `src/ts/initListeners.ts` and export initialization function
3. **UI Components**: Create TypeScript module, import in `src/ts/main.ts`, add initialization call
4. **Form Fields**: Update validation schemas in `src/ts/schemas/validationSchemas.ts` if validation module exists
5. **Pure Utilities**: Add to `src/ts/utilities.ts` (keep functions pure and side-effect free)
6. **UI-bound Helpers**: Add to `src/ts/helpers.ts` or specific component modules

### Code Conventions
- Use small, single-responsibility exported functions
- Keep utilities pure (no side effects) - separate UI-bound code into helpers/components
- Prefer existing session helpers over direct sessionStorage access
- Use DomUtils from `globals.ts` for vanilla JS DOM manipulation instead of jQuery
- Console logging with descriptive prefixes (see `applogger.ts` patterns)
- TypeScript strict mode enabled with comprehensive checks
- Path aliases configured in vite.config.ts: `@/ts/*`, `@/css/*`, `@/html/*`
- Error classes should extend Error and include descriptive names
- Branded types for better type safety (e.g., `Base64EncodedString`, `IsoTimestampString`)

### Module Organization Best Practices
- **Globals**: Runtime guards, constants, default values, DOM utilities
- **Utilities**: Pure functions with no side effects or DOM dependencies
- **Helpers**: Backward compatibility re-exports and UI-bound helper functions
- **Components**: UI-specific modules with DOM manipulation and event handling
- **Types**: Centralized TypeScript interfaces and type definitions

### Critical Integration Points
- **ZenPay Plugin**: `$.zpPayment(config)` in `initZP.ts` - jQuery required, handle with care
- **Fingerprint Generation**: SHA3-512 hash via `cryptographicFingerprintGenerator.ts` - Field order matters
- **Session Persistence**: Use `saveSessionValues()` and `saveToSession()` from `session.ts`
- **External Libraries**: Access via guarded exports from `globals.ts` (bootstrap, hljs, sha3_512)
- **V3 Compatibility**: Use `window.zpV3CompatMode` flags for backward compatibility

## Testing & Validation

Currently no automated tests configured. Manual testing approach:
1. Run `npm run dev` for development server
2. Test form interactions and payment flow
3. Verify code preview matches form configuration
4. Check session persistence across page reloads
5. Test all payment method toggles and options

## Important Files Not to Modify Without Review

- `src/ts/initZP.ts` - Core payment plugin integration with ZenPay
- `src/ts/cryptographicFingerprintGenerator.ts` - Security-critical SHA3-512 hashing
- `src/ts/globals.ts` SESSION_KEYS - Breaking changes affect session persistence
- `src/ts/inputParameters.ts` - Plugin input parameter definitions (matches ZenPay API spec)
- `src/ts/outputParameters.ts` - Plugin output parameter definitions (matches ZenPay API spec)
- `src/ts/errorCodes.ts` - ZenPay error code definitions
- `vite.config.ts` - Build configuration with custom HTML include plugin
- `tsconfig.json` - TypeScript compiler configuration with strict mode

## Notes

- **Ignore backup files**: `*.bak`, `*.backup`, `*.old` files and directories (e.g., `src/ts.bak/`)
- **Public assets**: `src/public/` contains static files (Template.html, scripts.js) copied directly to build
- **Global variables**: Application expects jQuery `$`, Bootstrap, hljs, sha3_512 to be loaded via CDN
- **No jQuery in app code**: Application code uses vanilla JavaScript with DomUtils - jQuery only for ZenPay plugin
- **ESLint rules**: TypeScript strict mode enabled, unused variables must have `_` prefix
- **CSS structure**: `src/css/styles.css` is the main stylesheet (params.css removed in favor of TypeScript constants)
- **Build output**: Vite processes `index.html` with includes, outputs to `build/` directory
- **TypeScript migration**: Project fully migrated from JavaScript to TypeScript with comprehensive type safety