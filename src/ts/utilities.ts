/** Base64 encoded string type for better type safety */
type Base64EncodedString = string & { readonly __brand: 'Base64EncodedString' };

/** Complete customer name information */
interface CustomerNameInformation {
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
	constructor(
		message: string,
		public override readonly cause?: Error
	) {
		super(message);
		this.name = 'Base64Error';
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
	constructor(
		message: string,
		public readonly value: unknown,
		public readonly operation?: string
	) {
		super(message);
		this.name = 'PaymentAmountValidationError';
	}
}

export class ClipboardOperationError extends Error {
	constructor(
		message: string,
		public readonly operation: ClipboardOperation,
		public override readonly cause?: Error
	) {
		super(message);
		this.name = 'ClipboardOperationError';
	}
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ASCII_REGEX = /^[\x20-\x7E]*$/; // printable ASCII

const PAYMENT_AMOUNT_CONSTRAINTS = {
	MIN: 1.0,
	MAX: 99999.99,
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
	if (raw === null || raw === undefined) return null;
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
	const sanitizedFirstName = firstName
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '')
		.slice(0, 20);
	if (sanitizedFirstName.length === 0) {
		throw new CustomerGenerationError('First name contains no valid characters for email generation', 'email');
	}
	return `${sanitizedFirstName}@zenpay.com.au`;
}

/** Generate a random contact number (Australian mobile format) */
export function generateRandomContactNumber(): string {
	// Australian mobile numbers start with 04 followed by 8 digits
	// Ensure it's always 10 digits starting with 0
	const randomDigits = Math.floor(Math.random() * 100000000)
		.toString()
		.padStart(8, '0');
	const fullNumber = `04${randomDigits}`;

	// Double-check format: must be exactly 10 digits starting with 0
	if (!/^04\d{8}$/.test(fullNumber)) {
		console.warn('[generateRandomContactNumber] Invalid format generated, using default');
		return '0400000000';
	}

	return fullNumber;
}

/**
 * Obfuscate sensitive text by showing only first 2 and last 2 characters
 * If already obfuscated, returns the text unchanged
 * @param text - The text to obfuscate
 * @returns Obfuscated text (e.g., "ab****yz" for "abcdefghijklyz")
 */
export function obfuscateCredential(text: string): string {
	if (!text || text.length <= 4) {
		return '****'; // Too short to obfuscate meaningfully
	}
	// Check if already obfuscated
	if (/^\w{2}\*+\w{2}$/.test(text)) {
		return text; // Already obfuscated, return as-is
	}
	const first2 = text.slice(0, 2);
	const last2 = text.slice(-2);
	const middleLength = text.length - 4;
	const asterisks = '*'.repeat(Math.max(4, middleLength));
	return `${first2}${asterisks}${last2}`;
}

/**
 * Generate a random payment amount within a valid range and return formatted string (pure).
 * Throws on invalid input or out-of-constraint values.
 */
export function generateRandomPaymentAmount(
	minimumAmount: number = PAYMENT_AMOUNT_CONSTRAINTS.MIN,
	maximumAmount: number = PAYMENT_AMOUNT_CONSTRAINTS.MAX
): string {
	if (!Number.isFinite(minimumAmount) || !Number.isFinite(maximumAmount)) {
		throw new PaymentAmountValidationError('Amounts must be finite numbers', {
			minimumAmount,
			maximumAmount,
		});
	}
	if (minimumAmount >= maximumAmount) {
		throw new PaymentAmountValidationError('Minimum amount must be less than maximum amount', {
			minimumAmount,
			maximumAmount,
		});
	}
	if (minimumAmount < PAYMENT_AMOUNT_CONSTRAINTS.MIN || maximumAmount > PAYMENT_AMOUNT_CONSTRAINTS.MAX) {
		throw new PaymentAmountValidationError(
			`Payment amount must be between ${PAYMENT_AMOUNT_CONSTRAINTS.MIN} and ${PAYMENT_AMOUNT_CONSTRAINTS.MAX}`,
			{ minimumAmount, maximumAmount }
		);
	}

	const randomAmount = Math.random() * (maximumAmount - minimumAmount) + minimumAmount;
	return randomAmount.toFixed(PAYMENT_AMOUNT_CONSTRAINTS.DECIMAL_PLACES);
}

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
 * Helper function error class
 */
export class HelperFunctionError extends Error {
	constructor(
		message: string,
		public readonly functionName: string,
		public override readonly cause?: Error
	) {
		super(message);
		this.name = 'HelperFunctionError';
	}
}
