/**
 * ZenPay Payment Plugin Demo - Utilities (modern, strict, minimal)
 * @module utilities
 * @description Consolidated utility functions for the ZenPay demo application
 * Runtime targets: modern browsers / Node 18+ (ES2022+)
 * Side effects: only in explicitly UI-bound helpers (DOM/Clipboard)
 */
/* ============================================================================
 * Public API Quick Reference (1-liners)
 * Add this block at the top of the file for a concise overview.
 * ============================================================================
 *
 * Types
 * - Base64EncodedString: branded string representing Base64-encoded ASCII text.
 * - UniversallyUniqueIdentifier: UUID v4 string (kept as plain string for compat).
 * - IsoTimestampString: branded ISO timestamp "YYYY-MM-DDTHH:mm:ss".
 * - CustomerNameInformation: { firstName, lastName, fullName } tuple.
 * - DebouncedFunction<T>: function type returned by debounce/throttle utilities.
 * - CancellableDebouncedFunction<T>: debounced function with cancel/flush/pending.
 * - ClipboardOperation: union of 'copy' | 'read' | 'write'.
 *
 * Errors
 * - Base64Error: thrown on Base64 encode/decode failures.
 * - UniqueIdentifierGenerationError: thrown when UUID generation is unavailable/fails.
 * - CustomerGenerationError: thrown when name/email generation fails (operation-tagged).
 * - PaymentAmountValidationError: thrown on invalid payment amount/range.
 * - ClipboardOperationError: thrown on clipboard API failures.
 *
 * JSON / Formatting
 * - safeStringify(value): JSON.stringify with circular refs handled as "[Circular]".
 * - safeParse<T>(raw): JSON.parse that returns null on invalid input/errors.
 * - formatPaymentAmount(value): format number to fixed currency decimals.
 *
 * Base64 (pure)
 * - encodeAsciiTextToBase64(asciiText): ASCII -> Base64 (validates printable ASCII).
 * - decodeBase64TextToAscii(base64): Base64 -> ASCII (throws on invalid input).
 *
 * Timing Utilities (pure)
 * - createDebouncedFunction(fn, wait, leading?): debounce with optional leading edge.
 * - createAdvancedDebouncedFunction(fn, wait, leading?): debounce with cancel/flush/pending.
 * - createThrottledFunction(fn, wait): throttle; run at most once per interval.
 *
 * Time / IDs (pure)
 * - generateCurrentIsoTimestamp(): current UTC timestamp without milliseconds.
 * - generateUniversallyUniqueIdentifier(): UUID v4 via crypto.randomUUID.
 * - generatePaymentIdentifiers(): returns { customerReferenceIdentifier, merchantUniquePaymentIdentifier }.
 *
 * Customer (pure)
 * - generateRandomCustomerName(): pick a random name from the predefined list.
 * - generateZenPayEmailAddress(firstName): sanitized firstName -> "name@zenpay.com.au".
 *
 * Payments (pure)
 * - generateRandomPaymentAmount(min?, max?): random amount within range as formatted string.
 *
 * Clipboard (UI-bound)
 * - copyTextToClipboard(text, { button?, durationMs? }): copy using modern Clipboard API; optional button feedback.
 * - copyCodeSnippetToClipboard(selector?): copy inner text of element to clipboard.
 *
 * Notes
 * - Utilities are pure unless explicitly UI-bound (DOM/Clipboard).
 * - Deprecated aliases and legacy fallbacks removed for modern runtimes.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Base64 encoded string type for better type safety */
export type Base64EncodedString = string & { readonly __brand: 'Base64EncodedString' };

/** UUID string type for better type safety (kept as plain string for compatibility) */
export type UniversallyUniqueIdentifier = string;

/** ISO timestamp string type for better type safety */
export type IsoTimestampString = string & { readonly __brand: 'IsoTimestampString' };

/** Complete customer name information */
export interface CustomerNameInformation {
  readonly firstName: string;
  readonly lastName: string;
  readonly fullName: string;
}

/** Generic function type */
type Fn<Args extends unknown[] = unknown[], R = unknown> = (...args: Args) => R;

/** Debounced function type that accepts the same parameters as the original function */
export type DebouncedFunction<T extends Fn> = (...args: Parameters<T>) => void;

/** Cancellable debounced function interface */
export interface CancellableDebouncedFunction<T extends Fn> extends DebouncedFunction<T> {
  cancel(): void;
  flush(): void;
  pending(): boolean;
}

/** Clipboard operation types */
export type ClipboardOperation = 'copy' | 'read' | 'write';

// ============================================================================
// ERROR CLASSES (domain-specific; retained for compatibility)
// ============================================================================

export class Base64Error extends Error {
  constructor(message: string, public override readonly cause?: Error) {
    super(message);
    this.name = 'Base64Error';
  }
}

export class UniqueIdentifierGenerationError extends Error {
  constructor(message: string, public override readonly cause?: Error) {
    super(message);
    this.name = 'UniqueIdentifierGenerationError';
  }
}

export class CustomerGenerationError extends Error {
  constructor(
    message: string,
    public readonly operation: 'name' | 'email',
    public override readonly cause?: Error
  ) {
    super(message);
    this.name = 'CustomerGenerationError';
  }
}

export class PaymentAmountValidationError extends Error {
  constructor(message: string, public readonly value: unknown, public readonly operation?: string) {
    super(message);
    this.name = 'PaymentAmountValidationError';
  }
}

export class ClipboardOperationError extends Error {
  constructor(message: string, public readonly operation: ClipboardOperation, public override readonly cause?: Error) {
    super(message);
    this.name = 'ClipboardOperationError';
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ASCII_REGEX = /^[\x20-\x7E]*$/; // printable ASCII

const PAYMENT_AMOUNT_CONSTRAINTS = {
  MIN: 10.0,
  MAX: 1000.0,
  DECIMAL_PLACES: 2,
} as const;

const PREDEFINED_CUSTOMER_NAMES: readonly CustomerNameInformation[] = [
  { firstName: 'Tyrael', lastName: 'Justice', fullName: 'Tyrael Justice' },
  { firstName: 'Imperius', lastName: 'Valor', fullName: 'Imperius Valor' },
  { firstName: 'Baal', lastName: 'Destruction', fullName: 'Baal Destruction' },
  { firstName: 'Leah', lastName: 'Adria', fullName: 'Leah Adria' },
  { firstName: 'Deckard', lastName: 'Cain', fullName: 'Deckard Cain' },
  { firstName: 'Durotan', lastName: 'Frostwolf', fullName: 'Durotan Frostwolf' },
  { firstName: 'Orgrim', lastName: 'Doomhammer', fullName: 'Orgrim Doomhammer' },
  { firstName: "Kael'thas", lastName: 'Sunstrider', fullName: "Kael'thas Sunstrider" },
  { firstName: 'Maiev', lastName: 'Shadowsong', fullName: 'Maiev Shadowsong' },
  { firstName: 'Medivh', lastName: 'Guardian', fullName: 'Medivh Guardian' },
  { firstName: 'Jim', lastName: 'Raynor', fullName: 'Jim Raynor' },
  { firstName: 'Sarah', lastName: 'Kerrigan', fullName: 'Sarah Kerrigan' },
  { firstName: 'Arcturus', lastName: 'Mengsk', fullName: 'Arcturus Mengsk' },
  { firstName: 'Zeratul', lastName: 'Darkblade', fullName: 'Zeratul Darkblade' },
  { firstName: 'Tassadar', lastName: 'Executor', fullName: 'Tassadar Executor' },
  { firstName: 'Arthas', lastName: 'Menethil', fullName: 'Arthas Menethil' },
  { firstName: 'Thrall', lastName: "Go'el", fullName: "Thrall Go'el" },
  { firstName: 'Illidan', lastName: 'Stormrage', fullName: 'Illidan Stormrage' },
  { firstName: 'Jaina', lastName: 'Proudmoore', fullName: 'Jaina Proudmoore' },
  { firstName: 'Sylvanas', lastName: 'Windrunner', fullName: 'Sylvanas Windrunner' },
  { firstName: 'Bolvar', lastName: 'Fordragon', fullName: 'Bolvar Fordragon' },
  { firstName: 'Garrosh', lastName: 'Hellscream', fullName: 'Garrosh Hellscream' },
  { firstName: 'Varian', lastName: 'Wrynn', fullName: 'Varian Wrynn' },
  { firstName: 'Anduin', lastName: 'Wrynn', fullName: 'Anduin Wrynn' },
  { firstName: 'Tyrande', lastName: 'Whisperwind', fullName: 'Tyrande Whisperwind' },
  { firstName: 'Calia', lastName: 'Menethil', fullName: 'Calia Menethil' },
] as const;

// ============================================================================
// JSON HELPERS (pure)
// ============================================================================

/** Safely stringify a value. Handles circular structures. */
export function safeStringify(value: unknown): string {
  const seen = new WeakSet<object>();
  try {
    const json = JSON.stringify(
      value,
      (_k, v: unknown) => {
        if (typeof v === 'object' && v !== null) {
          if (seen.has(v as object)) return '[Circular]';
          seen.add(v as object);
        }
        return v as unknown;
      },
      0
    );
    return json ?? String(value);
  } catch {
    try {
      return String(value);
    } catch {
      return 'null';
    }
  }
}

/** Safely parse JSON. Returns null on error or null/undefined input. */
export function safeParse<T>(raw: string | null | undefined): T | null {
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Format a payment amount according to constraints */
export function formatPaymentAmount(value: number): string {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(PAYMENT_AMOUNT_CONSTRAINTS.DECIMAL_PLACES) : '0.00';
}

// ============================================================================
// BASE64 (pure)
// ============================================================================

/**
 * Encode ASCII text to Base64 format
 * @throws {Base64Error} When input is not string or contains non-ASCII chars
 */
export function encodeAsciiTextToBase64(asciiText: string): Base64EncodedString {
  if (typeof asciiText !== 'string') {
    throw new Base64Error('Input must be a string');
  }
  if (!ASCII_REGEX.test(asciiText)) {
    throw new Base64Error('Input contains non-ASCII characters');
  }
  try {
    return btoa(asciiText) as Base64EncodedString;
  } catch (error) {
    throw new Base64Error(
      `Base64 encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Decode Base64 encoded text back to ASCII string
 * @throws {Base64Error} When decoding fails
 */
export function decodeBase64TextToAscii(base64EncodedText: Base64EncodedString): string {
  if (typeof base64EncodedText !== 'string') {
    throw new Base64Error('Input must be a string');
  }
  try {
    return atob(base64EncodedText);
  } catch (error) {
    throw new Base64Error(
      `Base64 decoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

// Deprecated aliases removed: base64EncodeASCII, base64DecodeASCII

// ============================================================================
// DEBOUNCING / THROTTLING (pure)
// ============================================================================

/**
 * Create a debounced function.
 * @param leading If true, fires on the leading edge as well.
 */
export function createDebouncedFunction<T extends Fn>(
  originalFunction: T,
  waitTimeInMilliseconds: number,
  leading = false
): DebouncedFunction<T> {
  if (typeof originalFunction !== 'function') {
    throw new Error('First argument must be a function');
  }
  if (!Number.isFinite(waitTimeInMilliseconds) || waitTimeInMilliseconds < 0) {
    throw new Error('Wait time must be a non-negative number');
  }

  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: ThisParameterType<T> | undefined;

  const delayed = () => {
    const args = lastArgs;
    const ctx = lastThis;
    timeoutHandle = null;

    if (!leading && args) {
      originalFunction.apply(ctx, args);
    } else if (leading && args) {
      // trailing call when there were calls during the wait window
      originalFunction.apply(ctx, args);
    }
    lastArgs = null;
  };

  return function debounced(this: ThisParameterType<T>, ...args: Parameters<T>) {
    lastThis = this;
    lastArgs = args;

    const callNow = leading && !timeoutHandle;
    if (timeoutHandle) clearTimeout(timeoutHandle);
    timeoutHandle = setTimeout(delayed, waitTimeInMilliseconds);

    if (callNow) {
      originalFunction.apply(lastThis, lastArgs);
    }
  };
}

/** Create an advanced debounced function with cancel/flush/pending controls. */
export function createAdvancedDebouncedFunction<T extends Fn>(
  originalFunction: T,
  waitTimeInMilliseconds: number,
  leading = false
): CancellableDebouncedFunction<T> {
  if (typeof originalFunction !== 'function') {
    throw new Error('First argument must be a function');
  }
  if (!Number.isFinite(waitTimeInMilliseconds) || waitTimeInMilliseconds < 0) {
    throw new Error('Wait time must be a non-negative number');
  }

  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: ThisParameterType<T> | undefined;

  const delayed = () => {
    const args = lastArgs;
    const ctx = lastThis;
    timeoutHandle = null;
    if (!leading && args) {
      originalFunction.apply(ctx, args);
    } else if (leading && args) {
      originalFunction.apply(ctx, args);
    }
    lastArgs = null;
  };

  const fn = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    lastThis = this;
    lastArgs = args;
    const callNow = leading && !timeoutHandle;

    if (timeoutHandle) clearTimeout(timeoutHandle);
    timeoutHandle = setTimeout(delayed, waitTimeInMilliseconds);

    if (callNow) originalFunction.apply(lastThis, lastArgs);
  } as CancellableDebouncedFunction<T>;

  fn.cancel = () => {
    if (timeoutHandle) clearTimeout(timeoutHandle);
    timeoutHandle = null;
    lastArgs = null;
  };

  fn.flush = () => {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
      timeoutHandle = null;
      if (lastArgs) {
        originalFunction.apply(lastThis, lastArgs);
        lastArgs = null;
      }
    }
  };

  fn.pending = () => timeoutHandle !== null;

  return fn;
}

/** Create a throttled function that executes at most once per interval. */
export function createThrottledFunction<T extends Fn>(
  originalFunction: T,
  waitTimeInMilliseconds: number
): DebouncedFunction<T> {
  if (typeof originalFunction !== 'function') {
    throw new Error('First argument must be a function');
  }
  if (!Number.isFinite(waitTimeInMilliseconds) || waitTimeInMilliseconds < 0) {
    throw new Error('Wait time must be a non-negative number');
  }

  let lastExecution = 0;
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: ThisParameterType<T> | undefined;

  return function throttled(this: ThisParameterType<T>, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = waitTimeInMilliseconds - (now - lastExecution);

    lastArgs = args;
    lastThis = this;

    if (remaining <= 0) {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }
      lastExecution = now;
      originalFunction.apply(lastThis, lastArgs);
      lastArgs = null;
    } else if (!timeoutHandle) {
      timeoutHandle = setTimeout(() => {
        lastExecution = Date.now();
        timeoutHandle = null;
        if (lastArgs) {
          originalFunction.apply(lastThis, lastArgs);
          lastArgs = null;
        }
      }, remaining);
    }
  };
}

// Deprecated alias removed: debounce

// ============================================================================
// TIMESTAMP (pure)
// ============================================================================

/** Current timestamp in ISO without milliseconds or timezone: YYYY-MM-DDTHH:mm:ss (UTC) */
export function generateCurrentIsoTimestamp(): IsoTimestampString {
  return new Date().toISOString().slice(0, 19) as IsoTimestampString;
}

// Deprecated alias removed: generateCurrentDatetime

// ============================================================================
// UUID (pure)
// ============================================================================

/**
 * Validate UUID format (RFC 4122 v4)
 * Note: kept as a private helper for internal checks if needed elsewhere.
 */
function validateUniversallyUniqueIdentifierFormat(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/** Generate a cryptographically secure UUID v4 (modern runtimes only). */
export function generateUniversallyUniqueIdentifier(): UniversallyUniqueIdentifier {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    const id = crypto.randomUUID();
    // Optionally assert format in dev paths; avoid extra runtime cost in prod
    if (!validateUniversallyUniqueIdentifierFormat(id)) {
      throw new UniqueIdentifierGenerationError('Generated UUID failed validation');
    }
    return id as UniversallyUniqueIdentifier;
  }
  throw new UniqueIdentifierGenerationError('crypto.randomUUID is unavailable in this environment');
}

/** Pure: generate both payment identifiers. */
export function generatePaymentIdentifiers(): {
  customerReferenceIdentifier: UniversallyUniqueIdentifier;
  merchantUniquePaymentIdentifier: UniversallyUniqueIdentifier;
} {
  return {
    customerReferenceIdentifier: generateUniversallyUniqueIdentifier(),
    merchantUniquePaymentIdentifier: generateUniversallyUniqueIdentifier(),
  };
}

// UI-bound generator that mutates inputs has been removed to keep utilities pure.
// Deprecated alias removed: generateAndSetUuids

// ============================================================================
// CUSTOMER NAME (pure)
// ============================================================================

/** Generate a random customer name from predefined list */
export function generateRandomCustomerName(): CustomerNameInformation {
  const randomIndex = Math.floor(Math.random() * PREDEFINED_CUSTOMER_NAMES.length);
  const selectedCustomerName = PREDEFINED_CUSTOMER_NAMES[randomIndex];
  if (!selectedCustomerName) {
    throw new CustomerGenerationError('Failed to select a customer name', 'name');
  }
  return selectedCustomerName;
}

/** Generate a ZenPay email address from first name */
export function generateZenPayEmailAddress(firstName: string): string {
  if (!firstName || firstName.trim().length === 0) {
    throw new CustomerGenerationError('First name is required for email address generation', 'email');
  }
  const sanitizedFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
  if (sanitizedFirstName.length === 0) {
    throw new CustomerGenerationError('First name contains no valid characters for email generation', 'email');
  }
  return `${sanitizedFirstName}@zenpay.com.au`;
}

// Deprecated aliases removed: generateFirstLastName, generateEmail

// ============================================================================
// PAYMENT AMOUNT (pure)
// ============================================================================

/** Validate payment amount range (throws on invalid). */
function validatePaymentAmountRange(amount: number): void {
  if (amount < PAYMENT_AMOUNT_CONSTRAINTS.MIN || amount > PAYMENT_AMOUNT_CONSTRAINTS.MAX) {
    throw new PaymentAmountValidationError(
      `Payment amount must be between ${PAYMENT_AMOUNT_CONSTRAINTS.MIN} and ${PAYMENT_AMOUNT_CONSTRAINTS.MAX}`,
      amount
    );
  }
}

/** Generate a random payment amount within valid range and return formatted string (pure). */
export function generateRandomPaymentAmount(
  minimumAmount: number = PAYMENT_AMOUNT_CONSTRAINTS.MIN,
  maximumAmount: number = PAYMENT_AMOUNT_CONSTRAINTS.MAX
): string {
  if (!Number.isFinite(minimumAmount) || !Number.isFinite(maximumAmount)) {
    throw new PaymentAmountValidationError('Amounts must be finite numbers', { minimumAmount, maximumAmount });
  }
  if (minimumAmount >= maximumAmount) {
    throw new PaymentAmountValidationError('Minimum amount must be less than maximum amount', {
      minimumAmount,
      maximumAmount,
    });
  }

  validatePaymentAmountRange(minimumAmount);
  validatePaymentAmountRange(maximumAmount);

  const randomAmount = Math.random() * (maximumAmount - minimumAmount) + minimumAmount;
  return randomAmount.toFixed(PAYMENT_AMOUNT_CONSTRAINTS.DECIMAL_PLACES);
}

// Deprecated UI-bound variant removed: generateRandomPaymentAmountForForm

// ============================================================================
// CLIPBOARD (UI-bound; modern API only)
// ============================================================================

/**
 * Copy text to clipboard (modern Clipboard API only).
 * Optional UI feedback via a provided button element.
 */
export async function copyTextToClipboard(
  text: string,
  options?: { button?: HTMLButtonElement; durationMs?: number }
): Promise<void> {
  if (!text || text.trim().length === 0) {
    throw new ClipboardOperationError('No text content found to copy', 'copy');
  }
  if (!navigator.clipboard?.writeText) {
    throw new ClipboardOperationError('Clipboard API is unavailable', 'copy');
  }

  await navigator.clipboard.writeText(text);

  // Optional visual feedback
  const button = options?.button;
  if (button) {
    const originalButtonContent = button.innerHTML;
    const originalDisabled = button.disabled;
    const duration = options?.durationMs ?? 2000;

    button.innerHTML = '<i aria-hidden="true">✔︎</i>';
    button.disabled = true;
    button.setAttribute('aria-label', 'Copied successfully');

    setTimeout(() => {
      button.innerHTML = originalButtonContent;
      button.disabled = originalDisabled;
      button.setAttribute('aria-label', 'Copy to clipboard');
    }, duration);
  }
}

/**
 * Copy code snippet to clipboard from a DOM element by selector.
 * Uses `copyTextToClipboard` for the actual copy operation.
 */
export async function copyCodeSnippetToClipboard(elementSelector: string = '#codePreview'): Promise<void> {
  const codeElement = document.querySelector<HTMLElement>(elementSelector);
  if (!codeElement) {
    throw new ClipboardOperationError(`Element with selector '${elementSelector}' not found`, 'copy');
  }
  const codeTextContent = codeElement.textContent ?? codeElement.innerText ?? '';
  const copyButton = document.querySelector<HTMLButtonElement>('#copyCodeBtn');
  await copyTextToClipboard(codeTextContent, copyButton ? { button: copyButton } : undefined);
}
