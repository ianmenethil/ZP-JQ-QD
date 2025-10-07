/**
 * @module session
 * @description Simplified session storage with base64 encoding for ZenPay credentials and state
 *
 * Storage Keys:
 * - ZPSC: Base64-encoded credentials (apiKey, username, password, merchantCode)
 * - ZPS: Base64-encoded state (payment methods, callbackUrl)
 */

import { encodeAsciiTextToBase64, decodeBase64TextToAscii, safeStringify, safeParse } from './utilities.ts';
import { paymentMethodsTab } from './globals.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Credentials {
    apiKey: string;
    username: string;
    password: string;
    merchantCode: string;
}

export interface PaymentState {
    paymentMethods: {
        allowBankAcOneOffPayment: boolean;
        allowPayToOneOffPayment: boolean;
        allowPayIdOneOffPayment: boolean;
        allowApplePayOneOffPayment: boolean;
        allowGooglePayOneOffPayment: boolean;
        allowSlicePayOneOffPayment: boolean;
        allowSaveCardUserOption: boolean;
    };
    callbackUrl: string;
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

const store: Storage | null = typeof globalThis.sessionStorage !== 'undefined' ? globalThis.sessionStorage : null;

const KEYS = {
    CREDENTIALS: 'ZPSC',
    STATE: 'ZPS'
} as const;

/**
 * Save credentials to session storage (base64 encoded)
 */
export function saveCredentials(apiKey: string, username: string, password: string, merchantCode: string): void {
    if (!store) return;

    const credentials: Credentials = {
        apiKey: apiKey || '',
        username: username || '',
        password: password || '',
        merchantCode: merchantCode || ''
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
 * Save payment state to session storage (base64 encoded)
 */
export function saveState(callbackUrl: string): void {
    if (!store) return;

    const state: PaymentState = {
        paymentMethods: {
            allowBankAcOneOffPayment: paymentMethodsTab.allowBankAcOneOffPayment,
            allowPayToOneOffPayment: paymentMethodsTab.allowPayToOneOffPayment,
            allowPayIdOneOffPayment: paymentMethodsTab.allowPayIdOneOffPayment,
            allowApplePayOneOffPayment: paymentMethodsTab.allowApplePayOneOffPayment,
            allowGooglePayOneOffPayment: paymentMethodsTab.allowGooglePayOneOffPayment,
            allowSlicePayOneOffPayment: paymentMethodsTab.allowSlicePayOneOffPayment,
            allowSaveCardUserOption: paymentMethodsTab.allowSaveCardUserOption
        },
        callbackUrl: callbackUrl || ''
    };

    const json = safeStringify(state);
    const encoded = encodeAsciiTextToBase64(json);
    store.setItem(KEYS.STATE, encoded);
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
export function clearSession(): void {
    if (!store) return;
    store.removeItem(KEYS.CREDENTIALS);
    store.removeItem(KEYS.STATE);
}

// ============================================================================
// LEGACY STORAGE HELPERS (for theme, URL builder, etc.)
// ============================================================================

export const STORAGE_TYPE = { LOCAL: 'local', SESSION: 'session' } as const;
export type StorageType = typeof STORAGE_TYPE[keyof typeof STORAGE_TYPE];

const lstore: Storage | null = typeof globalThis.localStorage !== 'undefined' ? globalThis.localStorage : null;

function pickStorage(type: StorageType): Storage | null {
    return type === STORAGE_TYPE.LOCAL ? lstore : store;
}

/**
 * Get value from storage
 */
export function getFromStorage<T = unknown>(
    key: string,
    fallback: T | null = null,
    type: StorageType = STORAGE_TYPE.SESSION,
): T | null {
    const s = pickStorage(type);
    if (!s) return fallback;

    const raw = s.getItem(key);
    const parsed = safeParse<T>(raw);

    if (parsed !== null) return parsed;
    if (raw !== null) return (raw as unknown as T);
    return fallback;
}

/**
 * Save value to storage
 */
export function saveToStorage(
    key: string,
    value: unknown,
    type: StorageType = STORAGE_TYPE.SESSION,
): void {
    const s = pickStorage(type);
    if (!s) return;
    const raw = typeof value === 'string' ? value : safeStringify(value);
    s.setItem(key, raw);
}

/**
 * Save to session storage
 */
export function saveToSession(key: string, value: unknown): void {
    if (!store) return;
    const raw = typeof value === 'string' ? value : safeStringify(value);
    store.setItem(key, raw);
}

/**
 * Get from session storage with fallback
 */
export function getFromSession<T = unknown>(key: string): T | null;
export function getFromSession<T>(key: string, fallback: T): T;
export function getFromSession<T>(key: string, fallback?: T): T | null {
    if (!store) return (fallback ?? null) as T | null;
    const raw = store.getItem(key);
    const parsed = safeParse<T>(raw);
    if (parsed !== null) return parsed;
    if (raw !== null) return raw as unknown as T;
    return (fallback ?? null) as T | null;
}
