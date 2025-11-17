/**
 * @file initZP.ts
 * @description ZenPay plugin initialization with TypeScript type safety
 */

import { parseCodePreviewConfig } from './codePreview.ts';
import { generatePaymentSecurityFingerprint } from './core/fingerprintGenerator.ts';
import { showError } from './modals/modal.ts';
import { getOriginalCredentialValue, saveCredentials, saveState } from './session.ts';

// Import jQuery only for the zpPayment plugin (required dependency)
// jQuery is loaded externally and provides the zpPayment plugin
interface JQueryStatic {
	zpPayment(config: Partial<ZenPayPluginConfig>): ZenPayPluginInstance;
}

declare const $: JQueryStatic;

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
	allowUnionPayOneOffPayment?: boolean;
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
		throw new ZenPayValidationError('Username is required for initialization', 'username', username);
	}

	if (!password || password.trim().length === 0) {
		throw new ZenPayValidationError('Password is required for initialization', 'password', password);
	}
}

/**
 * Validate API key for fingerprint generation
 * @param apiKey - API key from configuration
 * @throws {ZenPayValidationError} When API key is invalid
 */
function validateApiKey(apiKey: string): void {
	if (!apiKey || apiKey === '<<API-KEY>>' || apiKey.trim().length === 0) {
		throw new ZenPayValidationError('A valid API Key is required for initialization', 'apiKey', apiKey);
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
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get credentials from form inputs
 * @returns Object containing username and password
 */
function getCredentialsFromForm(): { username: string; password: string } {
	const usernameInput = document.getElementById('usernameInput') as HTMLInputElement;
	const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;

	const username = usernameInput ? getOriginalCredentialValue(usernameInput) : '';
	const password = passwordInput ? getOriginalCredentialValue(passwordInput) : '';

	return { username, password };
}

/**
 * Build complete configuration with required fields
 * @param parsedConfig - Partial configuration from code preview
 * @param username - Username from form
 * @param password - Password from form
 * @returns Complete configuration with all required fields
 */
function buildCompleteConfig(
	parsedConfig: Partial<ZenPayPluginConfig>,
	username: string,
	password: string
): ZenPayPluginConfig {
	return {
		...parsedConfig,
		username,
		password,
		apiKey: parsedConfig.apiKey || '',
		paymentAmount: parsedConfig.paymentAmount || 0,
		mode: parsedConfig.mode || 0,
		fingerprint: parsedConfig.fingerprint || '',
		merchantUniquePaymentId: parsedConfig.merchantUniquePaymentId || '',
	};
}

/**
 * Convert payment amount from cents to dollars
 * @param paymentAmountInCents - Payment amount in cents
 * @returns Payment amount in dollars as string with 2 decimal places
 */
function convertPaymentAmountToDollars(paymentAmountInCents: number): string {
	return (paymentAmountInCents / 100).toFixed(2);
}

/**
 * Generate timestamp and fingerprint for ZenPay
 * @param config - Complete ZenPay configuration
 * @param username - Username for fingerprint generation
 * @param password - Password for fingerprint generation
 * @param paymentAmountInDollars - Payment amount in dollars
 * @returns Object containing timestamp and fingerprint
 */
async function generateTimestampAndFingerprint(
	config: ZenPayPluginConfig,
	username: string,
	password: string,
	paymentAmountInDollars: string
): Promise<{ timestamp: string; fingerprint: string }> {
	const timestamp = new Date().toISOString().slice(0, 19);

	const fingerprintParams: FingerprintParams = {
		apiKey: config.apiKey,
		username,
		password,
		mode: String(config.mode),
		paymentAmount: paymentAmountInDollars,
		merchantUniquePaymentId: config.merchantUniquePaymentId,
		timestamp,
	};

	const fingerprint = await generatePaymentSecurityFingerprint(fingerprintParams);
	validateFingerprint(fingerprint);

	return { timestamp, fingerprint: fingerprint as string };
}

/**
 * Apply UI configuration (minimum height and V3 compatibility mode)
 * @param config - Configuration to modify
 */
function applyUIConfiguration(config: Partial<ZenPayPluginConfig>): void {
	const minHeightFromUI = (document.getElementById('minHeightInput') as HTMLInputElement)?.value?.trim() || '';
	if (minHeightFromUI) {
		config.minHeight = parseInt(minHeightFromUI, 10);
	}

	if (window.zpV3CompatMode?.omitMerchantCodeFromPayload) {
		console.warn('[initializeZenPayPlugin] ⚠️ V3 Compat Mode: Omitting merchantCode from payload');
		delete config.merchantCode;
	}

	if (window.zpV3CompatMode?.omitTimestampFromHash) {
		console.warn('[initializeZenPayPlugin] ⚠️ V3 Compat Mode: Omitting timestamp from payload');
		delete config.timestamp;
	}
}

/**
 * Save credentials and state to session storage
 * @param config - Complete configuration with credentials
 */
function saveSessionData(config: ZenPayPluginConfig): void {
	saveCredentials(config.apiKey, config.username, config.password, config.merchantCode || '');

	const callbackUrl = (document.getElementById('callbackUrlInput') as HTMLInputElement)?.value || '';
	saveState(callbackUrl);
	console.log('[initializeZenPayPlugin] Saved credentials and complete form state to session storage');
}

/**
 * Create the onPluginClose callback function
 * @returns Callback function for plugin close event
 */
function createPluginCloseCallback(): OnPluginCloseCallback {
	return function (this: ZenPayPluginInstance): void {
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
}

/**
 * Initialize the plugin and log results
 * @param config - Configuration for plugin initialization
 * @throws {ZenPayInitializationError} When initialization fails
 */
function initializePlugin(config: Partial<ZenPayPluginConfig>): void {
	const payment = $.zpPayment(config) as ZenPayPluginInstance;

	console.log('[initializeZenPayPlugin] 👇 ZP Payload 👇');
	console.info(config);
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
		const parsedConfig: Partial<ZenPayPluginConfig> = parseCodePreviewConfig();
		const { username, password } = getCredentialsFromForm();
		const completeConfig = buildCompleteConfig(parsedConfig, username, password);

		const paymentAmount = convertPaymentAmountToDollars(completeConfig.paymentAmount);

		validateCredentials(username, password);
		validateApiKey(completeConfig.apiKey);

		const { timestamp, fingerprint } = await generateTimestampAndFingerprint(
			completeConfig,
			username,
			password,
			paymentAmount
		);

		parsedConfig.timestamp = timestamp;
		parsedConfig.fingerprint = fingerprint;
		parsedConfig.paymentAmount = parseFloat(paymentAmount);

		applyUIConfiguration(parsedConfig);
		saveSessionData(completeConfig);

		parsedConfig.onPluginClose = createPluginCloseCallback();

		initializePlugin(parsedConfig);
	} catch (error: unknown) {
		console.error('[initializeZenPayPlugin] Error initializing plugin:', error);

		if (error instanceof ZenPayValidationError) {
			showError('Validation Error', error.message);
			throw error;
		} else {
			const initError = new ZenPayInitializationError(
				'Unable to initialize plugin. See console for details.',
				error instanceof Error ? { cause: error } : undefined
			);

			showError('Initialization Error', initError.message);
			throw initError;
		}
	}
}
