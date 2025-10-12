/**
 * @file initZP.ts
 * @description ZenPay plugin initialization with TypeScript type safety
 */

import { parseCodePreviewConfig } from './codePreview.ts';
import { generatePaymentSecurityFingerprint } from './core/fingerprintGenerator.ts';
import { showError } from './modals/modal.ts';
import {
    getOriginalCredentialValue,
    saveCredentials,
    saveState,
} from './session.ts';
// Removed unnecessary import - using new Date().toISOString().slice(0, 19) directly

// Import jQuery only for the zpPayment plugin (required dependency)
declare const $: any;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * ZenPay plugin configuration interface
 */
interface ZenPayPluginConfig {
	apiKey: string;
	username: string;
	password: string;
	merchantCode?: string;
	paymentAmount: number;
	mode: number;
	fingerprint: string;
	timestamp?: string;
	merchantUniquePaymentId: string;
	minHeight?: string | number;
	redirectUrl?: string;
	callbackUrl?: string;
	customerName?: string;
	customerReference?: string;
	customerEmail?: string;
	contactNumber?: string;
	sendConfirmationEmailToCustomer?: boolean;
	sendConfirmationEmailToMerchant?: boolean;
	hideTermsAndConditions?: boolean;
	hideMerchantLogo?: boolean;
	userMode?: number;
	overrideFeePayer?: number;
	showFeeOnTokenising?: boolean;
	showFailedPaymentFeeOnTokenising?: boolean;
	allowBankAcOneOffPayment?: boolean;
	allowPayToOneOffPayment?: boolean;
	allowPayIdOneOffPayment?: boolean;
	allowApplePayOneOffPayment?: boolean;
	allowGooglePayOneOffPayment?: boolean;
	allowSlicePayOneOffPayment?: boolean;
	allowSaveCardUserOption?: boolean;
	onPluginClose?: (params: LogPayload) => void;
}

/**
 * Fingerprint generation parameters interface
 */
interface FingerprintParams {
	apiKey: string;
	username: string;
	password: string;
	mode: string;
	paymentAmount: string;
	merchantUniquePaymentId: string;
	timestamp: string;
}

// /**
//  * Session configuration interface extending ZenPayPluginConfig
//  */
// export interface SessionConfig extends ZenPayPluginConfig {
// 	username: string;
// 	password: string;
// }

/**
 * ZenPay plugin instance interface
 */
interface ZenPayPluginInstance {
	options: ZenPayPluginConfig;
	init(): void;
}

/**
 * Validation error class for ZenPay initialization
 */
class ZenPayValidationError extends Error {
	private readonly _field: string;
	private readonly _value: unknown;

	constructor(message: string, field: string, value: unknown) {
		super(message);
		this.name = 'ZenPayValidationError';
		this._field = field;
		this._value = value;
	}

	get field(): string {
		return this._field;
	}

	get value(): unknown {
		return this._value;
	}
}

/**
 * Initialization error class for ZenPay plugin
 */
class ZenPayInitializationError extends Error {
	constructor(message: string, options?: { cause?: Error }) {
		super(message, options);
		this.name = 'ZenPayInitializationError';
	}
}

/**
 * Log payload interface for the onPluginClose event
 */
interface LogPayload {
	merchantUniquePaymentId: string;
	event: string;
	at: string;
}

/**
 * OnPluginClose callback interface
 */
interface OnPluginCloseCallback {
	(this: ZenPayPluginInstance): void;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate credentials for ZenPay initialization
 * @param username - Username from form input
 * @param password - Password from form input
 * @throws {ZenPayValidationError} When credentials are invalid
 */
function validateCredentials(username: string, password: string): void {
	if (!username || username.trim().length === 0) {
		throw new ZenPayValidationError(
			'Username is required for initialization',
			'username',
			username
		);
	}

	if (!password || password.trim().length === 0) {
		throw new ZenPayValidationError(
			'Password is required for initialization',
			'password',
			password
		);
	}
}

/**
 * Validate API key for fingerprint generation
 * @param apiKey - API key from configuration
 * @throws {ZenPayValidationError} When API key is invalid
 */
function validateApiKey(apiKey: string): void {
	if (!apiKey || apiKey === '<<API-KEY>>' || apiKey.trim().length === 0) {
		throw new ZenPayValidationError(
			'A valid API Key is required for initialization',
			'apiKey',
			apiKey
		);
	}
}

/**
 * Validate fingerprint generation result
 * @param fingerprint - Generated fingerprint
 * @throws {ZenPayValidationError} When fingerprint is invalid
 */
function validateFingerprint(fingerprint: string | null): void {
	if (!fingerprint || fingerprint.trim().length === 0) {
		throw new ZenPayValidationError(
			'Failed to generate security fingerprint. Please check API credentials.',
			'fingerprint',
			fingerprint
		);
	}
}

// ============================================================================
// MAIN INITIALIZATION FUNCTION
// ============================================================================

/**
 * Initialize the ZenPay plugin with configuration from code preview
 * @returns Promise that resolves when plugin is successfully initialized
 * @throws {ZenPayValidationError} When validation fails
 * @throws {ZenPayInitializationError} When initialization fails
 * @example
 * ```typescript
 * try {
 *   await initializeZenPayPlugin();
 *   console.log('ZenPay plugin initialized successfully');
 * } catch (error) {
 *   if (error instanceof ZenPayValidationError) {
 *     console.error('Validation error:', error.message);
 *   } else if (error instanceof ZenPayInitializationError) {
 *     console.error('Initialization error:', error.message);
 *   }
 * }
 * ```
 */
export async function initializeZenPayPlugin(): Promise<void> {
	try {
		// Parse configuration from code preview
		const parsedConfig: Partial<ZenPayPluginConfig> = parseCodePreviewConfig();

		// Get credentials from form inputs (using original unobfuscated values)
		const usernameInput = document.getElementById('usernameInput') as HTMLInputElement;
		const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;

		const username: string = usernameInput ? getOriginalCredentialValue(usernameInput) : '';
		const password: string = passwordInput ? getOriginalCredentialValue(passwordInput) : '';

		// Create complete config with required fields
		const completeConfig: ZenPayPluginConfig = {
			...parsedConfig,
			username,
			password,
			apiKey: parsedConfig.apiKey || '',
			paymentAmount: parsedConfig.paymentAmount || 0,
			mode: parsedConfig.mode || 0,
			fingerprint: parsedConfig.fingerprint || '',
			merchantUniquePaymentId: parsedConfig.merchantUniquePaymentId || '',
		};
		// Convert normalized payment amount (cents) back to dollars for fingerprint generation
		// parsedConfig.paymentAmount is already in cents (e.g., 10000 for $100.00)
		// We need to convert it back to dollars (100.00) for the fingerprint
		const paymentAmount: string = (completeConfig.paymentAmount / 100).toFixed(2);

		// Validate credentials
		validateCredentials(username, password);
		validateApiKey(completeConfig.apiKey);

		// Generate timestamp and fingerprint
		const timestamp: string = new Date().toISOString().slice(0, 19);
		parsedConfig.timestamp = timestamp;

		const fingerprintParams: FingerprintParams = {
			apiKey: completeConfig.apiKey,
			username: username,
			password: password,
			mode: String(completeConfig.mode),
			paymentAmount: paymentAmount,
			merchantUniquePaymentId: completeConfig.merchantUniquePaymentId,
			timestamp: timestamp,
		};

		const fingerprint: string | null = await generatePaymentSecurityFingerprint(fingerprintParams);
		validateFingerprint(fingerprint);

		parsedConfig.fingerprint = fingerprint;

		// Convert paymentAmount back to dollars (with 2 decimal places) for ZenPay payload
		// parsedConfig.paymentAmount is in cents (e.g., 10000), ZenPay expects dollars (e.g., 100.00)
		parsedConfig.paymentAmount = parseFloat(paymentAmount);

		// Set minimum height from UI
		const minHeightFromUI: string =
			(document.getElementById('minHeightInput') as HTMLInputElement)?.value?.trim() || '';
		if (minHeightFromUI) {
			completeConfig.minHeight = parseInt(minHeightFromUI, 10);
		}

		// Handle V3 compatibility mode
		if (window.zpV3CompatMode?.omitMerchantCodeFromPayload) {
			console.warn(
				'[initializeZenPayPlugin] ⚠️ V3 Compat Mode: Omitting merchantCode from payload'
			);
			delete parsedConfig.merchantCode;
		}

		if (window.zpV3CompatMode?.omitTimestampFromHash) {
			console.warn('[initializeZenPayPlugin] ⚠️ V3 Compat Mode: Omitting timestamp from payload');
			delete parsedConfig.timestamp;
		}

		// Save credentials when initialize is clicked
		saveCredentials(completeConfig.apiKey, username, password, completeConfig.merchantCode || '');

		// Save complete state (payment methods, options, mode, etc.) when initialize is clicked
		const callbackUrl =
			(document.getElementById('callbackUrlInput') as HTMLInputElement)?.value || '';
		saveState(callbackUrl);
		console.log('[initializeZenPayPlugin] Saved credentials and complete form state to session storage');

		const onPluginCloseLogFunction: OnPluginCloseCallback = function (
			this: ZenPayPluginInstance
		): void {
			console.log('[onPluginClose] Plugin closed, sending log via fetch...');
			const logPayload: LogPayload = {
				merchantUniquePaymentId: this.options.merchantUniquePaymentId,
				event: 'pluginClosed',
				at: new Date().toISOString(),
			};
			fetch('/api/log', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(logPayload),
			})
				.then((response: Response) => {
					if (!response.ok) {
						throw new Error(`Network response was not ok: ${response.statusText}`);
					}
					return response.json();
				})
				.then((data: unknown) => {
					console.log('[onPluginClose] Log sent successfully:', data);
				})
				.catch((error: unknown) => {
					console.error('[onPluginClose] Error sending log:', error);
				});
		};

		parsedConfig.onPluginClose = onPluginCloseLogFunction;

		const payment: ZenPayPluginInstance = $.zpPayment(parsedConfig) as ZenPayPluginInstance;

		console.log('[initializeZenPayPlugin] 👇 ZP Payload 👇');
		console.info(parsedConfig);
		console.log('');
		console.log('[initializeZenPayPlugin] 👇 Payment object initialized 👇');
		console.info(payment.options);

		const result = payment.init();
		if (result === undefined) {
			throw new ZenPayInitializationError(
				'Plugin initialization returned undefined. Please check the configuration and try again.'
			);
		}

		console.log('[initializeZenPayPlugin] Plugin initialization completed successfully');
	} catch (error: unknown) {
		console.error('[initializeZenPayPlugin] Error initializing plugin:', error);

		if (error instanceof ZenPayValidationError) {
			showError('Validation Error', error.message);
			throw error;
		} else {
			const initError: ZenPayInitializationError = new ZenPayInitializationError(
				'Unable to initialize plugin. See console for details.',
				error instanceof Error ? { cause: error } : undefined
			);

			showError('Initialization Error', initError.message);
			throw initError;
		}
	}
}
