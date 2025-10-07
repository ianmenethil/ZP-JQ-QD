/**
 * Helper Functions Module
 * @file helpers.ts
 * @description Consolidated helper functions with TypeScript type safety and no jQuery dependencies
 */

import { updateRedirectUrlInForm } from './paymentUrlBuilder.ts';
import { copyTextToClipboard } from './utilities.ts';
import { DomUtils } from './globals.ts';

// Re-export functions from specialized modules for backward compatibility
export {
    encodeAsciiTextToBase64 as base64EncodeASCII,
    decodeBase64TextToAscii as base64DecodeASCII,
    copyTextToClipboard,
    generateZenPayEmailAddress as generateEmail,
    generateRandomCustomerName as generateFirstLastName,
    createDebouncedFunction as debounce,
    generateRandomPaymentAmount,
    generateCurrentIsoTimestamp as generateCurrentDatetime,
    generatePaymentIdentifiers as generateAndSetUuids,
    generateUniversallyUniqueIdentifier as generateUUID
} from './utilities.ts';
export { DomUtils } from './globals.ts';
export {
    generateRandomPaymentAmountForForm,
    generateAndPopulatePaymentIdentifiersInForm
} from './placeholders.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Update redirect URL in the extended options and UI
 * @param newUrl - New redirect URL to set
 * @throws {HelperFunctionError} When URL update fails
 * @example
 * ```typescript
 * updateRedirectUrl('https://example.com/redirect');
 * ```
 */
export function updateRedirectUrl(newUrl: string): void {
    try {
        // Set the redirect URL input value
        const redirectInput = document.querySelector('#redirectUrlInput') as HTMLInputElement;
        if (redirectInput) {
            redirectInput.value = newUrl;
        }

        // Use the canonical function to handle the rest of the URL update logic
        updateRedirectUrlInForm();

        console.log(`[updateRedirectUrl] Updated redirect URL to: ${newUrl}`);
    } catch (error) {
        throw new HelperFunctionError(
            'Failed to update redirect URL',
            'updateRedirectUrl',
            error instanceof Error ? error : undefined
        );
    }
}

/**
 * Check if a string is a valid URL
 * @param url - URL string to validate
 * @returns True if the URL is valid
 * @example
 * ```typescript
 * const isValid = isValidUrl('https://example.com');
 * console.log('URL is valid:', isValid);
 * ```
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Format a number as currency
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'AUD')
 * @param locale - Locale for formatting (default: 'en-AU')
 * @returns Formatted currency string
 * @example
 * ```typescript
 * const formatted = formatCurrency(99.99);
 * console.log(formatted); // '$99.99'
 * ```
 */
export function formatCurrency(
    amount: number,
    currency: string = 'AUD',
    locale: string = 'en-AU'
): string {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
        }).format(amount);
    } catch (error) {
        console.warn('[formatCurrency] Error formatting currency:', error);
        return `$${amount.toFixed(2)}`;
    }
}

/**
 * Sanitize HTML string to prevent XSS
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 * @example
 * ```typescript
 * const safe = sanitizeHtml('<script>alert("xss")</script>Hello');
 * console.log(safe); // 'Hello'
 * ```
 */
export function sanitizeHtml(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Deep cloned object
 * @example
 * ```typescript
 * const original = { a: 1, b: { c: 2 } };
 * const cloned = deepClone(original);
 * ```
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime()) as T;
    }
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item)) as T;
    }
    if (typeof obj === 'object') {
        const cloned = {} as T;
        Object.keys(obj).forEach(key => {
            (cloned as any)[key] = deepClone((obj as any)[key]);
        });
        return cloned;
    }
    return obj;
}

/**
 * Generate a random payment amount between 10.00 and 1000.00 and set it in the form
 * @example
 * ```typescript
 * generateRandomPaymentAmountForForm();
 * ```
 */
// (generateRandomPaymentAmountForForm is re-exported above)

/**
 * Generate new UUIDs for customer reference and merchant unique payment ID
 * @example
 * ```typescript
 * generateAndPopulatePaymentIdentifiersInForm();
 * ```
 */

/**
 * Generate a UUID v4
 * @returns A randomly generated UUID
 * @example
 * ```typescript
 * const uuid = generateUUID();
 * console.log(uuid); // e.g., "550e8400-e29b-41d4-a716-446655440000"
 * ```
 */

/**
 * Copy the code snippet to the clipboard without jQuery
 * @example
 * ```typescript
 * copyCodeToClipboardVanilla();
 * ```
 */
export async function copyCodeToClipboardVanilla(): Promise<void> {
    try {
        const codeText = DomUtils.getText('#codePreview');

        if (!codeText) {
            throw new Error('No code to copy');
        }

        const copyBtn = document.querySelector('#copyCodeBtn') as HTMLButtonElement;
        await copyTextToClipboard(codeText, { button: copyBtn });

        console.log('[copyCodeToClipboardVanilla] Code copied to clipboard');
    } catch (error) {
        console.error('[copyCodeToClipboardVanilla] Failed to copy code:', error);
        throw new HelperFunctionError(
            'Failed to copy code to clipboard',
            'copyCodeToClipboardVanilla',
            error instanceof Error ? error : undefined
        );
    }
}

/**
 * Initialize payment URL builder - re-export from paymentUrlBuilder.ts
 * @param autoUpdate - Whether to auto-update the URL
 * @example
 * ```typescript
 * initializePaymentUrlBuilder(true);
 * ```
 */
export { initializePaymentUrlBuilder } from './paymentUrlBuilder.ts';
