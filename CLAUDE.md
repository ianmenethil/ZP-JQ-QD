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

---

## Project Overview

**ZenPay Payment Plugin Demo** - A TypeScript-based single-page application that demonstrates ZenPay payment integration. The app provides a configuration UI for merchants to generate payment forms with various options and preview the integration code.

### Tech Stack

- **Language**: TypeScript 5.9+ (strict mode)
- **Build Tool**: Vite 7.1+ (custom plugin architecture)
- **Package Manager**: Bun
- **Runtime**: ES2020+ targeting modern browsers
- **Linting**: ESLint 9 (flat config) + TypeScript ESLint
- **Formatting**: Prettier with tabs, single quotes, 120 char width
- **Validation**: Zod 4.1+ for runtime schema validation
- **Dependencies**: Minimal (tslib, zod only)

### Repository Information

- **Homepage**: https://zenithpayments.support
- **Repository**: https://github.com/ZenithPayments/zenpay-payment-plugin
- **Author**: Ian Menethil
- **License**: MIT

---

## Build Commands

```bash
bun run dev              # Lint + type-check, then start Vite dev server on port 3000
bun run build            # Lint + type-check, then production build with minification
bun run build:check      # Type-check then production build
bun run build:dev        # Type-check then development build (no minification)
bun run type-check       # Run TypeScript compiler without emitting files
bun run lint             # ESLint with auto-fix for src/ts/**/*.ts
bun run format           # Prettier formatting for TypeScript files
bun run clean            # Remove build and dist directories
bun run preview          # Preview production build
```

### Utility Scripts

```bash
bun run generate:standalone    # Generate standalone HTML file
bun run extract-data           # Extract data from jQuery demo page
bun run check-samples          # Validate code samples
bun run find-usage             # Find usage of TypeScript exports
```

---

## Architecture

### CRITICAL: Build System & Deployment Model

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
- **DEPLOYMENT**: Static files served via CDN or web server (configured for Cloudflare Workers via `wrangler deploy` but can be served from any static host)

### Directory Structure

```
ZP-JQ-QD/
├── src/                          # Source files
│   ├── ts/                       # TypeScript modules
│   │   ├── core/                 # Core utilities
│   │   │   ├── applogger.ts      # Logging system
│   │   │   ├── buttonState.logic.ts  # Button state management
│   │   │   └── fingerprintGenerator.ts  # Fingerprint generation
│   │   ├── modals/               # Modal-related modules
│   │   │   ├── modal.ts          # Base modal functionality
│   │   │   ├── errorCodes.ts     # Error codes modal
│   │   │   ├── inputParameters.ts # Input parameters modal
│   │   │   └── outputParameters.ts # Output parameters modal
│   │   ├── ui/                   # UI components
│   │   │   ├── buttonState.ui.ts # Button UI state
│   │   │   └── coreDropdown.ts   # Dropdown component
│   │   ├── types/                # TypeScript type definitions
│   │   │   └── globals.types.ts  # Global type definitions
│   │   ├── index.ts              # Application entry point
│   │   ├── main.ts               # Main application logic
│   │   ├── globals.ts            # Global state and constants
│   │   ├── codePreview.ts        # Code preview functionality
│   │   ├── displayMode.ts        # Display mode handling
│   │   ├── downloadApp.ts        # Download functionality
│   │   ├── emailConfirmation.ts  # Email confirmation
│   │   ├── eventListenersClass.ts # Event listener management
│   │   ├── extendedOptions.ts    # Extended options handling
│   │   ├── fileInput.ts          # File input handling
│   │   ├── initZP.ts             # ZenPay initialization
│   │   ├── keyboardShortcuts.ts  # Keyboard shortcuts
│   │   ├── overrideFeePayer.ts   # Fee payer override
│   │   ├── paymentMode.ts        # Payment mode selection
│   │   ├── paymentUrlBuilder.ts  # Payment URL construction
│   │   ├── placeholders.ts       # Placeholder management
│   │   ├── session.ts            # Session management
│   │   ├── slicepayDepartureDate.ts # SlicePay departure date
│   │   ├── theme.ts              # Theme management
│   │   ├── tooltips.ts           # Tooltip functionality
│   │   ├── userMode.ts           # User mode handling
│   │   ├── utilities.ts          # Utility functions
│   │   └── zpLogo.ts             # ZenPay logo handling
│   ├── html/                     # HTML partials
│   │   ├── index.html            # Main HTML entry point
│   │   ├── header.html           # Header partial
│   │   ├── main.html             # Main content partial
│   │   ├── footer.html           # Footer partial
│   │   ├── modal.html            # Modal partial
│   │   └── main.partials/        # Main content sub-partials
│   │       ├── code-preview.html
│   │       ├── config-card.html
│   │       ├── end.html
│   │       ├── tab.credentials.html
│   │       └── warning.html
│   ├── css/                      # Stylesheets
│   │   └── styles.css            # Main stylesheet
│   └── data/                     # Static JSON data
│       ├── jq-code-samples.json  # Code samples
│       ├── jq-error-codes.json   # Error codes
│       ├── jq-input-parameters.json  # Input parameters
│       └── jq-output-parameters.json # Output parameters
├── scripts/                      # Utility scripts
│   ├── generateStandalone.ts     # Standalone HTML generator
│   ├── zenpay-jquery-demopage-extractor.ts  # Data extractor
│   ├── check-code-samples.ts     # Sample validator
│   └── find-usage.ts             # Usage finder
├── public/                       # Public static assets
├── build/                        # Build output (gitignored)
├── index.html                    # Vite entry point
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.mjs             # ESLint configuration (flat)
├── .prettierrc                   # Prettier configuration
├── package.json                  # Package manifest
├── CLAUDE.md                     # This file
└── tasks.md                      # Task tracking
```

### TypeScript Configuration

**Compiler Target**: ES2020 with ES2022 lib and DOM support

**Strict Mode Enabled** with additional restrictions:
- `noUnusedLocals`: true
- `noUnusedParameters`: true
- `exactOptionalPropertyTypes`: true
- `noImplicitReturns`: true
- `noFallthroughCasesInSwitch`: true
- `noUncheckedIndexedAccess`: true
- `noImplicitOverride`: true
- `noPropertyAccessFromIndexSignature`: true
- `verbatimModuleSyntax`: true
- `useUnknownInCatchVariables`: true
- `allowUnreachableCode`: false

**Module System**: ESNext with bundler resolution

**Path Aliases**:
- `@/*` → `src/*`
- `@/ts/*` → `src/ts/*`
- `@/css/*` → `src/css/*`
- `@/html/*` → `src/html/*`

### Vite Build System

**Custom Plugins**:

1. **HTML Include Plugin**: Processes `@@include('path/to/file.html')` directives recursively
2. **Copy Public Files Plugin**: Copies `src/data/` to `build/public/` and serves JSON in dev mode

**Build Characteristics**:

- **Single Bundle**: `rollupOptions.output.manualChunks = undefined` disables code splitting
- **File Naming**:
  - Dev: `js/bundle.js`, `css/bundle.css`
  - Prod: `js/bundle.min.js`, `css/bundle.min.css`
- **Minification**: Terser in production only (preserves console logs, removes debugger)
- **Source Maps**: Development only
- **CSS Processing**: Autoprefixer + cssnano (prod only)

**Dev Server**:
- Port: 3000
- Auto-open browser
- CORS enabled
- Serves `src/data/` files at `/public/*` path
- Serves `build/` files without Vite transformation for download functionality

### Module Organization

**Entry Point**: `src/ts/index.ts`
- Imports CSS (`styles.css`)
- Imports core modules (`main.ts`, `modals/errorCodes.ts`, `zpLogo.ts`)

**Module Categories**:

1. **Core** (`src/ts/core/`): Low-level utilities and business logic
2. **UI** (`src/ts/ui/`): UI components and state management
3. **Modals** (`src/ts/modals/`): Modal dialogs and their logic
4. **Types** (`src/ts/types/`): TypeScript type definitions
5. **Feature Modules** (root of `src/ts/`): Business features and application logic

**No Circular Dependencies**: Modules must maintain a clear dependency hierarchy

---

## Development Workflow

### 1. Making Changes

1. **Always run linters first**:
   ```bash
   bun run lint && bun run type-check
   ```

2. **Start dev server**:
   ```bash
   bun run dev  # Includes pre-flight checks
   ```

3. **Make changes** to TypeScript, HTML, or CSS files

4. **Verify build**:
   ```bash
   bun run build:check
   ```

5. **Preview production build**:
   ```bash
   bun run preview
   ```

### 2. Pre-commit Checklist

- [ ] No linting errors (`bun run lint`)
- [ ] No type errors (`bun run type-check`)
- [ ] Production build succeeds (`bun run build`)
- [ ] No unused imports or variables
- [ ] No `any` types
- [ ] No `var` declarations
- [ ] No `==` or `!=` operators
- [ ] No TODOs in code
- [ ] No commented-out code (except temporary debug)
- [ ] Functions under 50 lines
- [ ] Max 3 levels of nesting
- [ ] All errors logged or rethrown (no silent catch)
- [ ] External data validated with Zod schemas

### 3. Common Tasks

**Add a new TypeScript module**:
1. Create file in appropriate directory (`src/ts/`, `src/ts/core/`, etc.)
2. Export only what's needed
3. Import in `src/ts/index.ts` or relevant parent module
4. Add types to `src/ts/types/globals.types.ts` if globally needed
5. Run `bun run type-check` to verify

**Add a new HTML partial**:
1. Create file in `src/html/` or `src/html/main.partials/`
2. Include via `@@include('relative/path.html')` in parent
3. Run `bun run build:dev` to verify includes resolve

**Add new JSON data**:
1. Create file in `src/data/`
2. Define Zod schema for validation
3. Fetch from `/public/filename.json` at runtime
4. Validate response with schema before use

**Update styles**:
1. Edit `src/css/styles.css`
2. Dev server auto-reloads
3. Verify build: `bun run build:dev`

---

## Code Style & Conventions

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 120,
  "tabWidth": 4,
  "useTabs": true,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "auto"
}
```

### ESLint Rules (Key Enforcements)

- **No unused variables**: Error (underscore prefix `_` NOT allowed)
- **No empty catch blocks**: Error (must log or rethrow)
- **Always use `===`/`!==`**: Error on `==`/`!=`
- **Prefer const**: Error on reassignable `let` when not needed
- **No var**: Error

### Naming Conventions

- **Files**: camelCase for modules, kebab-case acceptable for configs
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Types/Interfaces**: PascalCase
- **Private members**: Prefix with `#` (native private fields) or document as private

### Import Style

```typescript
// External dependencies first
import { z } from 'zod';

// Internal modules with path aliases
import type { GlobalConfig } from '@/ts/types/globals.types.ts';
import { logger } from '@/ts/core/applogger.ts';

// Relative imports last
import { helper } from './utilities.ts';
```

### Error Handling

```typescript
// GOOD: Error is logged and rethrown
try {
	riskyOperation();
} catch (error: unknown) {
	logger.error('Operation failed', error);
	throw error;
}

// BAD: Silent error handling
try {
	riskyOperation();
} catch {}  // FORBIDDEN
```

### Function Size

```typescript
// GOOD: Small, focused function
function calculateTotal(items: Item[]): number {
	return items.reduce((sum, item) => sum + item.price, 0);
}

// BAD: Function doing too much (>50 lines)
function processOrderAndSendEmailAndUpdateInventory() {
	// 100 lines of code...
}
```

### Nesting Depth

```typescript
// GOOD: Max 3 levels
if (condition1) {
	if (condition2) {
		if (condition3) {
			doSomething();
		}
	}
}

// BAD: More than 3 levels
if (a) {
	if (b) {
		if (c) {
			if (d) {  // TOO DEEP
				// ...
			}
		}
	}
}
```

---

## Key Files & Their Purposes

### Configuration Files

- **`vite.config.ts`**: Vite build configuration with custom HTML include plugin
- **`tsconfig.json`**: TypeScript compiler options (strict mode, path aliases)
- **`tsconfig.eslint.json`**: ESLint-specific TypeScript config
- **`eslint.config.mjs`**: ESLint flat config with TypeScript rules
- **`.prettierrc`**: Code formatting rules
- **`.prettierignore`**: Files excluded from Prettier
- **`.gitignore`**: Git exclusions (includes secret config files)
- **`package.json`**: Dependencies and scripts

### Source Files

- **`src/ts/index.ts`**: Application entry point (imports CSS and core modules)
- **`src/ts/main.ts`**: Main application initialization and orchestration
- **`src/ts/globals.ts`**: Global state, constants, and configuration
- **`src/ts/types/globals.types.ts`**: Global TypeScript type definitions
- **`src/html/index.html`**: Vite HTML entry point (uses `@@include` directives)
- **`src/css/styles.css`**: Main stylesheet (bundled into single CSS file)

### Data Files

- **`src/data/jq-code-samples.json`**: Code sample templates
- **`src/data/jq-error-codes.json`**: Error code definitions
- **`src/data/jq-input-parameters.json`**: Input parameter specifications
- **`src/data/jq-output-parameters.json`**: Output parameter specifications

### Secret Configuration (Gitignored)

- **`CCEP.json`**, **`CCEP.*.json`**: Credit card endpoint configurations
- **`TP.json`**, **`TP.*.json`**: Third-party configurations
- **`SEP.json`**, **`SEP.*.json`**: Secure endpoint configurations

**NEVER commit these files** - they contain sensitive API keys and endpoints.

### Build Output (Gitignored)

- **`build/index.html`**: Compiled single HTML file
- **`build/js/bundle.min.js`**: Compiled JavaScript bundle
- **`build/css/bundle.min.css`**: Compiled CSS bundle
- **`build/public/`**: Copied static data files

---

## Data Flow & Patterns

### 1. Application Initialization

```
index.html (Vite entry)
  ↓
src/ts/index.ts
  ↓ imports CSS
  ↓ imports main.ts
src/ts/main.ts
  ↓ initializes globals
  ↓ sets up event listeners
  ↓ loads configuration
```

### 2. Event Flow

```
User Action (DOM event)
  ↓
Event Listener (eventListenersClass.ts)
  ↓
Business Logic (feature module)
  ↓
State Update (globals.ts or local state)
  ↓
UI Update (UI module)
  ↓
Code Preview Update (codePreview.ts)
```

### 3. Data Loading

```
Application Start
  ↓
Fetch JSON from /public/*.json
  ↓
Validate with Zod Schema
  ↓
Store in Global State
  ↓
Populate UI Components
```

### 4. Code Generation Flow

```
User Configuration (form inputs)
  ↓
Collect Values (various feature modules)
  ↓
Build Payment URL (paymentUrlBuilder.ts)
  ↓
Generate Code Preview (codePreview.ts)
  ↓
Display in UI (syntax highlighting)
  ↓
Download Option (downloadApp.ts)
```

---

## Testing & Validation

### Type Safety

- **100% TypeScript coverage** required
- **No `any` types** allowed
- **Runtime validation** for all external data with Zod

### Linting

```bash
bun run lint  # Must pass with zero errors
```

### Type Checking

```bash
bun run type-check  # Must pass with zero errors
```

### Build Verification

```bash
bun run build:check  # Full type check + production build
```

### Code Quality Checks

- **No unused exports**: Use `bun run find-usage` to identify
- **No circular dependencies**: Enforced by build system
- **Function complexity**: Max 50 lines per function
- **Nesting depth**: Max 3 levels

---

## Deployment

### Static Deployment (Recommended)

Since this is a static SPA, deploy the `build/` directory to any static host:

1. **Build production bundle**:
   ```bash
   bun run build
   ```

2. **Deploy `build/` directory** to:
   - Cloudflare Pages
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - GitHub Pages
   - Any static file server

### Cloudflare Workers (Legacy)

The project was originally configured for Cloudflare Workers (`wrangler deploy`), but it's just serving static files. Use Cloudflare Pages instead for simpler deployment.

### Required Files in Deployment

- `build/index.html` (entry point)
- `build/js/bundle.min.js` (application code)
- `build/css/bundle.min.css` (styles)
- `build/public/*.json` (data files)

### Environment Variables

None required - this is a client-side only application. All configuration is embedded in the build.

---

## Common Pitfalls & Solutions

### ❌ Problem: TypeScript errors about missing types

**Solution**: Install type definitions:
```bash
bun add -D @types/package-name
```

### ❌ Problem: Build fails with "Cannot find module"

**Solution**: Check path aliases in `tsconfig.json` match your import paths. Use `@/ts/*` for TypeScript modules.

### ❌ Problem: HTML partials not included in build

**Solution**: Use `@@include('relative/path.html')` syntax, not ES6 imports. The Vite plugin processes these at build time.

### ❌ Problem: JSON files not found at runtime

**Solution**: JSON files in `src/data/` are copied to `build/public/`. Fetch from `/public/filename.json`, not `/data/filename.json`.

### ❌ Problem: ESLint reports unused variable but it's used

**Solution**: Check if variable is actually used. If it's a parameter you don't need, remove it entirely (don't use `_` prefix - that's forbidden by project rules).

### ❌ Problem: Function too long (>50 lines)

**Solution**: Extract helper functions. Break into smaller, focused functions with clear single responsibilities.

### ❌ Problem: Code is nested too deeply (>3 levels)

**Solution**: Use early returns, extract conditions into named functions, or refactor to use array methods like `filter`/`map`/`reduce`.

---

## FAQ

### Why Bun instead of npm/yarn?

Faster installation and execution. All commands use `bun run` instead of `npm run`.

### Why no `_` prefix for unused variables?

Project rules enforce actually removing unused code rather than marking it with `_`. This keeps the codebase clean.

### Why tabs instead of spaces?

Project convention via Prettier config. Use tabs with width 4.

### Can I add a new dependency?

Yes, but it must be:
1. Not deprecated
2. Well-maintained (recent updates)
3. Approved for use (ask first per sacred rules)
4. Properly typed (has TypeScript definitions)

### How do I debug build issues?

1. Run `bun run build:dev` for unminified build with source maps
2. Check browser console for errors
3. Run `bun run type-check` to isolate TypeScript errors
4. Run `bun run lint` to find code quality issues

### Where do I put new types?

- **Global types**: `src/ts/types/globals.types.ts`
- **Module-specific types**: Same file as module, exported if needed elsewhere
- **External library types**: `@types/library-name` package

### Can I modify the build output structure?

Yes, but update `vite.config.ts` carefully. The current structure (single bundle, specific file names) is intentional for deployment compatibility.

---

## Additional Resources

- **ZenPay Documentation**: https://zenithpayments.support
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Vite Guide**: https://vite.dev/guide/
- **Bun Documentation**: https://bun.sh/docs

---

## Maintenance Notes

### Regular Tasks

- **Dependency updates**: Review monthly, test thoroughly
- **TypeScript version**: Keep on latest stable
- **Vite version**: Update cautiously (may affect build)
- **ESLint/Prettier**: Update patch versions freely

### Breaking Changes to Avoid

- Changing build output structure (breaks deployment)
- Removing path aliases (breaks imports everywhere)
- Disabling TypeScript strict mode (violates sacred rules)
- Adding code splitting (contradicts SPA architecture)
- Introducing server-side code (this is static-only)

### When in Doubt

1. Check sacred rules at top of this file
2. Run all checks: `bun run lint && bun run type-check && bun run build`
3. Follow existing patterns in codebase
4. Ask before making architectural changes
5. Prefer small, incremental changes over large refactors
