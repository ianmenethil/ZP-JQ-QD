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
bun run dev              # Start Vite dev server on port 3000
bun run build            # Production build with minification
bun run build:check      # Type-check then production build
bun run build:dev        # Type-check then development build (no minification)
bun run type-check       # Run TypeScript compiler without emitting files
bun run lint             # ESLint with auto-fix for src/ts/**/*.ts
bun run format           # Prettier formatting for TypeScript files
bun run clean            # Remove build and dist directories
bun run preview          # Preview production build
```

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
