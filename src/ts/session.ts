/**
 * @module session
 * @description Simplified session storage with base64 encoding for ZenPay credentials and state
 *
 * Storage Keys:
 * - ZPSC: Base64-encoded credentials (apiKey, username, password, merchantCode)
 * - ZPS: Base64-encoded state (payment methods, callbackUrl)
 *
 * Credential Obfuscation:
 * - Username and password are obfuscated in the UI (show first 2 + last 2 chars)
 * - Original values are stored in a WeakMap to retrieve when needed
 */

import {
	decodeBase64TextToAscii,
	encodeAsciiTextToBase64,
	obfuscateCredential,
	safeParse,
	safeStringify,
} from './utilities.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Credentials {
	apiKey: string;
	username: string;
	password: string;
	merchantCode: string;
}

interface PaymentState {
	paymentMethods: {
		allowBankAcOneOffPayment: boolean;
		allowPayToOneOffPayment: boolean;
		allowPayIdOneOffPayment: boolean;
		allowApplePayOneOffPayment: boolean;
		allowGooglePayOneOffPayment: boolean;
		allowSlicePayOneOffPayment: boolean;
		allowSaveCardUserOption: boolean;
		allowUnionPayOneOffPayment: boolean;
	};
	options: {
		sendConfirmationEmailToCustomer: boolean;
		sendConfirmationEmailToMerchant: boolean;
		hideTermsAndConditions: boolean;
		hideMerchantLogo: boolean;
		userMode: number;
		overrideFeePayer: number;
		showFeeOnTokenising: boolean;
		showFailedPaymentFeeOnTokenising: boolean;
		displayMode: number;
	};
	callbackUrl: string;
	mode: string;
	departureDate: string;
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

const store: Storage | null = typeof globalThis.sessionStorage !== 'undefined' ? globalThis.sessionStorage : null;

const KEYS = {
	CREDENTIALS: 'ZPSC',
	STATE: 'ZPS',
} as const;

// WeakMap to store original credential values (before obfuscation)
const originalCredentials = new WeakMap<HTMLInputElement, string>();

/**
 * Get the original (unobfuscated) value of a credential input
 * @param input - The input element
 * @returns The original value, or the current value if not obfuscated
 */
export function getOriginalCredentialValue(input: HTMLInputElement): string {
	const stored = originalCredentials.get(input);
	if (stored) return stored;
	return input.value;
}

/**
 * Set obfuscated value in input while preserving original in WeakMap
 * @param input - The input element
 * @param originalValue - The original unobfuscated value
 */
export function setObfuscatedCredential(input: HTMLInputElement, originalValue: string): void {
	originalCredentials.set(input, originalValue);
	input.value = obfuscateCredential(originalValue);
	input.dataset['obfuscated'] = 'true';
}

/**
 * Clear obfuscation and restore original value
 * @param input - The input element
 */
function clearObfuscation(input: HTMLInputElement): void {
	const original = originalCredentials.get(input);
	if (original) {
		input.value = original;
		delete input.dataset['obfuscated'];
	}
}

/**
 * Handle focus event - clear obfuscation to show real value
 * @param input - The input element
 */
export function handleCredentialFocus(input: HTMLInputElement): void {
	if (input.dataset['obfuscated'] === 'true') {
		clearObfuscation(input);
	}
}

/**
 * Handle blur event - obfuscate value again
 * @param input - The input element
 */
export function handleCredentialBlur(input: HTMLInputElement): void {
	if (input.value) {
		setObfuscatedCredential(input, input.value);
	}
}

/**
 * Save credentials to session storage (base64 encoded)
 */
export function saveCredentials(apiKey: string, username: string, password: string, merchantCode: string): void {
	if (!store) return;

	const credentials: Credentials = {
		apiKey: apiKey || '',
		username: username || '',
		password: password || '',
		merchantCode: merchantCode || '',
	};

	const json = safeStringify(credentials);
	const encoded = encodeAsciiTextToBase64(json);
	store.setItem(KEYS.CREDENTIALS, encoded);
}

/**
 * Load credentials from session storage (base64 decoded)
 */
export function loadCredentials(): Credentials | null {
	if (!store) return null;

	const encoded = store.getItem(KEYS.CREDENTIALS);
	if (!encoded) return null;

	try {
		const json = decodeBase64TextToAscii(encoded as any);
		return safeParse<Credentials>(json);
	} catch (error) {
		console.error('[loadCredentials] Failed to decode credentials:', error);
		return null;
	}
}

/**
 * Helper to get checkbox state
 */
function getCheckboxValue(id: string): boolean {
	const el = document.getElementById(id) as HTMLInputElement;
	return el?.checked || false;
}

/**
 * Helper to get radio value
 */
function getRadioValue(name: string): number {
	const el = document.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement;
	return el ? parseInt(el.value, 10) : 0;
}

/**
 * Save payment state to session storage (base64 encoded)
 * Captures all form state including payment methods, options, mode, etc.
 */
export function saveState(callbackUrl?: string): void {
	if (!store) return;

	// Get mode
	const modeSelect = document.getElementById('modeSelect') as HTMLSelectElement;
	const mode = modeSelect?.value || '0';

	// Get departure date
	const departureDateInput = document.getElementById('departureDateInput') as HTMLInputElement;
	const departureDate = departureDateInput?.value || '';

	const state: PaymentState = {
		paymentMethods: {
			allowBankAcOneOffPayment: getCheckboxValue('allowBankAcOneOffPayment'),
			allowPayToOneOffPayment: getCheckboxValue('allowPayToOneOffPayment'),
			allowPayIdOneOffPayment: getCheckboxValue('allowPayIdOneOffPayment'),
			allowApplePayOneOffPayment: getCheckboxValue('allowApplePayOneOffPayment'),
			allowGooglePayOneOffPayment: getCheckboxValue('allowGooglePayOneOffPayment'),
			allowSlicePayOneOffPayment: getCheckboxValue('allowSlicePayOneOffPayment'),
			allowSaveCardUserOption: getCheckboxValue('allowSaveCardUserOption'),
			allowUnionPayOneOffPayment: getCheckboxValue('allowUnionPayOneOffPayment'),
		},
		options: {
			sendConfirmationEmailToCustomer: getCheckboxValue('sendConfirmationEmailToCustomer'),
			sendConfirmationEmailToMerchant: getCheckboxValue('sendConfirmationEmailToMerchant'),
			hideTermsAndConditions: getCheckboxValue('hideTermsAndConditions'),
			hideMerchantLogo: getCheckboxValue('hideMerchantLogo'),
			userMode: getRadioValue('userMode'),
			overrideFeePayer: getRadioValue('overrideFeePayer'),
			showFeeOnTokenising: getCheckboxValue('showFeeOnTokenising'),
			showFailedPaymentFeeOnTokenising: getCheckboxValue('showFailedPaymentFeeOnTokenising'),
			displayMode: getRadioValue('displayMode'),
		},
		callbackUrl: callbackUrl || '',
		mode: mode,
		departureDate: departureDate,
	};

	const json = safeStringify(state);
	const encoded = encodeAsciiTextToBase64(json);
	store.setItem(KEYS.STATE, encoded);
	console.log('[saveState] Payment state saved to session storage');
}

/**
 * Load payment state from session storage (base64 decoded)
 */
export function loadState(): PaymentState | null {
	if (!store) return null;

	const encoded = store.getItem(KEYS.STATE);
	if (!encoded) return null;

	try {
		const json = decodeBase64TextToAscii(encoded as any);
		return safeParse<PaymentState>(json);
	} catch (error) {
		console.error('[loadState] Failed to decode state:', error);
		return null;
	}
}

/**
 * Clear all ZenPay session storage
 */
/* function clearSession(): void {
    if (!store) return;
    store.removeItem(KEYS.CREDENTIALS);
    store.removeItem(KEYS.STATE);
} */

// ============================================================================
// LEGACY STORAGE HELPERS (for theme, URL builder, etc.)
// ============================================================================

export const STORAGE_TYPE = { LOCAL: 'local', SESSION: 'session' } as const;
type StorageType = (typeof STORAGE_TYPE)[keyof typeof STORAGE_TYPE];

const lstore: Storage | null = typeof globalThis.localStorage !== 'undefined' ? globalThis.localStorage : null;

function pickStorage(type: StorageType): Storage | null {
	return type === STORAGE_TYPE.LOCAL ? lstore : store;
}

/**
 * Get value from storage (automatically base64 decoded)
 */
export function getFromStorage<T = unknown>(
	key: string,
	fallback: T | null = null,
	type: StorageType = STORAGE_TYPE.SESSION
): T | null {
	const s = pickStorage(type);
	if (!s) return fallback;

	const encoded = s.getItem(key);
	if (!encoded) return fallback;

	try {
		// Decode base64 first
		const decoded = decodeBase64TextToAscii(encoded as any);
		const parsed = safeParse<T>(decoded);

		if (parsed !== null) return parsed;
		if (decoded !== null) return decoded as unknown as T;
		return fallback;
	} catch (error) {
		console.error(`[getFromStorage] Failed to decode base64 for key "${key}":`, error);
		return fallback;
	}
}

/**
 * Save value to storage (automatically base64 encoded)
 */
export function saveToStorage(key: string, value: unknown, type: StorageType = STORAGE_TYPE.SESSION): void {
	const s = pickStorage(type);
	if (!s) return;

	try {
		const raw = typeof value === 'string' ? value : safeStringify(value);
		const encoded = encodeAsciiTextToBase64(raw);
		s.setItem(key, encoded);
	} catch (error) {
		console.error(`[saveToStorage] Failed to encode base64 for key "${key}":`, error);
	}
}

/**
 * Save to session storage (automatically base64 encoded)
 */
/* function saveToSession(key: string, value: unknown): void {
    if (!store) return;

    try {
        const raw = typeof value === 'string' ? value : safeStringify(value);
        const encoded = encodeAsciiTextToBase64(raw);
        store.setItem(key, encoded);
    } catch (error) {
        console.error(`[saveToSession] Failed to encode base64 for key "${key}":`, error);
    }
} */

/**
 * Get from session storage with fallback (automatically base64 decoded)
 */
export function getFromSession<T = unknown>(key: string): T | null;
export function getFromSession<T>(key: string, fallback: T): T;
export function getFromSession<T>(key: string, fallback?: T): T | null {
	if (!store) return (fallback ?? null) as T | null;

	const encoded = store.getItem(key);
	if (!encoded) return (fallback ?? null) as T | null;

	try {
		// Decode base64 first
		const decoded = decodeBase64TextToAscii(encoded as any);
		const parsed = safeParse<T>(decoded);

		if (parsed !== null) return parsed;
		if (decoded !== null) return decoded as unknown as T;
		return (fallback ?? null) as T | null;
	} catch (error) {
		console.error(`[getFromSession] Failed to decode base64 for key "${key}":`, error);
		return (fallback ?? null) as T | null;
	}
}
