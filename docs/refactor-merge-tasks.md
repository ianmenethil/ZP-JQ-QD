Refactor Tasks: Merge Duplicates and Fix Inconsistencies

Overview: This checklist captures duplicate or overlapping logic and missing imports in the TS codebase. Each task includes concrete file references and acceptance criteria to keep changes safe and targeted.

1) Fix Missing Imports (Clipboard + Timestamp)
- [x] Change clipboard imports to use utilities
  - Replace `copyTextToClipboard` import in `src/ts/paymentUrlBuilder.ts:1-6` from `./clipboardCodeCopier.ts` to `./utilities.ts`.
  - Replace `copyCodeSnippetToClipboard` import in `src/ts/initListeners.ts:1-12` from `./clipboardCodeCopier.ts` to `./utilities.ts`.
- [x] Change timestamp import in `src/ts/initZP.ts:1-14`
  - Replace `import { generateCurrentIsoTimestamp } from './timestampGenerator.ts';` with `import { generateCurrentIsoTimestamp } from './utilities.ts';`

Acceptance criteria:
- Project compiles with no missing-module errors for clipboard/timestamp.
- Copy buttons and initialization continue to work.

2) Consolidate Clipboard Utilities
- [x] Canonicalize on `utilities.copyTextToClipboard` and `utilities.copyCodeSnippetToClipboard`
  - Keep `helpers.copyCodeToClipboardVanilla` only as a thin wrapper or mark deprecated; ensure no callers rely on it directly (if any, switch them to utilities).

Acceptance criteria:
- All clipboard operations route through `src/ts/utilities.ts`.
- No references remain to a non-existent `clipboardCodeCopier.ts`.

3) Remove Duplicate URL Builder Listeners
- [x] Use the canonical listeners in `paymentUrlBuilder.initializePaymentUrlBuilder()` only
  - Remove `initUrlBuilderListeners()` in `src/ts/initListeners.ts` (definition and export at ~lines 398-419).
  - Remove import and usage from `src/ts/main.ts` (do not call both; keep `initializePaymentUrlBuilder(true)`).

Acceptance criteria:
- URL preview updates correctly when subdomain/domain/version change.
- No duplicate listeners (handlers fire once per interaction).

-4) Unify JSON Helpers (safeStringify/safeParse)
- [x] Add `safeStringify` and `safeParse` to `src/ts/utilities.ts` (use a circular-safe implementation similar to `applogger` or a minimal variant if circulars aren’t expected in storage).
- [x] Update `src/ts/session.ts` to import and use them, removing its local duplicates (`safeStringify`/`safeParse`).
- [Optional] Consider making `applogger` use the utilities version, but avoid introducing circular dependencies.

Acceptance criteria:
- Single authoritative implementation for session serialization/parsing.
- No behavior regressions saving/loading session values.

5) Unify Payment Amount Formatting
- [x] Add `formatPaymentAmount(value: number): string` in `src/ts/utilities.ts` using existing `PAYMENT_AMOUNT_CONSTRAINTS.DECIMAL_PLACES`.
- [x] Update `src/ts/initListeners.ts:232-241` blur handler to use the utility instead of inlining `toFixed(2)`.

Acceptance criteria:
- `#paymentAmountInput` formats consistently according to constraints.
- No hard-coded decimal handling in listeners.

-6) Unify minHeight Defaults
- [x] Replace hard-coded '925' in `src/ts/codePreview.ts:156-167` and `:254-258`
  - Use `DEFAULT_VALUES.options.minHeight` instead; keep the mode === '1' special-case for `600`.

Acceptance criteria:
- Default minHeight derives from `DEFAULT_VALUES.options.minHeight`.
- Code preview logic no longer hard-codes 925.

7) Align SHA3 Typing With Runtime Behavior
- [x] Update `src/ts/types/external-libs.d.ts` declaration for `sha3_512` to reflect flexible signatures used in `src/ts/globals.ts`.
  - Suggested overloads:
    - `function sha3_512(data: string): string;`
    - `function sha3_512(): (data: string) => string;`

Acceptance criteria:
- No TS complaints when calling `sha3_512(data)` or using fallback `sha3_512()()(data)` patterns.

8) Deprecate generateCurrentDatetime Alias (Optional)
- [x] Keep `utilities.generateCurrentDatetime` as a deprecation alias but prefer `generateCurrentIsoTimestamp` throughout (as already used in most places).
- [x] Update imports where convenient to the canonical name (e.g., in `src/ts/codePreview.ts`).

Acceptance criteria:
- Call sites use the canonical `generateCurrentIsoTimestamp` (alias remains for BC until removed).

Notes / Pointers
- Clipboard references:
  - `src/ts/utilities.ts:694` `copyCodeSnippetToClipboard`
  - `src/ts/utilities.ts:731` `copyTextToClipboard`
  - `src/ts/helpers.ts:202` `copyCodeToClipboardVanilla` (wrapper)
  - `src/ts/paymentUrlBuilder.ts:250` uses `copyTextToClipboard` (adjust import)
  - `src/ts/initListeners.ts:335` uses `copyCodeToClipboard` (adjust import)
- URL builder listeners:
  - Canonical: `src/ts/paymentUrlBuilder.ts:280` (`setupUrlBuilderEventListeners`)
  - Duplicate: `src/ts/initListeners.ts:398` (`initUrlBuilderListeners`)
- Timestamp imports:
  - Canonical: `src/ts/utilities.ts:434` `generateCurrentIsoTimestamp`
  - Invalid import: `src/ts/initZP.ts:10` from `./timestampGenerator.ts`

Follow-up Fixes Completed

- [x] Type-check cleanup: align fingerprint call signature in `src/ts/codePreview.ts`
  - Replaced object-arg call with positional arguments to `createSha3PaymentFingerprint`.
  - Type-check passes (`npm run type-check`).
- [x] Restore clipboard fallback method in `src/ts/utilities.ts`
  - Re-added `copyTextUsingFallbackMethod` used by `copyTextToClipboard` for older browsers.

New Candidates To Merge/Consolidate

9) Centralize payment method and option keys
- [] Create `src/ts/types/option-keys.ts` exporting two arrays:
  - `PAYMENT_METHOD_KEYS` (e.g., `allowBankAcOneOffPayment`, `allowPayToOneOffPayment`, ...)
  - `ADDITIONAL_OPTION_KEYS` (e.g., `sendConfirmationEmailToCustomer`, `hideTermsAndConditions`, ...)
- [] Use these arrays in `src/ts/codePreview.ts` when building the snippet (instead of hard-coded lists).

10) Route modal tooltip init through tooltips module
- [] In `src/ts/paymentUrlBuilder.ts` inside `initializeUrlBuilderModal`, replace manual bootstrap tooltip init with `reinitializeTooltips()` from `src/ts/tooltips.ts` when the modal opens.
- [] Remove direct dependency on `(window as any).bootstrap.Tooltip` for consistency.

11) Unify safeStringify usage in applogger
- [] Import `safeStringify` from `src/ts/utilities.ts` in `src/ts/applogger.ts` instead of local implementation.
- [] Keep local fallback only if import causes cycle (guard with comment).

12) Prefer DomUtils for form value mutations
- [] Replace direct `input.value = ...` writes in utilities helpers (e.g., `generateRandomPaymentAmountForForm`) with `DomUtils.setValue` for consistency.
- [] Do similar cleanups in files where direct assignments exist and DomUtils is available.
