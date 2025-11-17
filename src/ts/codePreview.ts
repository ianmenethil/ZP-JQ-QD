/**
 * Code Preview Module
 * @module codePreview
 * @description Generates and displays ZenPay plugin initialization code with syntax highlighting
 */

import { createSha3PaymentFingerprint as generateFingerprint } from './core/fingerprintGenerator.ts';
import { DEFAULT_VALUES, DomUtils, hljs } from './globals.ts';
import {
	createDebouncedFunction as debounce,
	generateRandomContactNumber,
	generateRandomPaymentAmount,
} from './utilities.ts';

/** Configuration for generating code snippet */
interface CodeSnippetConfig {
	apiKey: string;
	paymentAmount: number;
	mode: string;
	timestamp: string;
	merchantUniquePaymentId: string;
	fingerprint: string;
}

/**
 * Parsed configuration from code preview
 */
interface ParsedCodeConfig {
	timeStamp?: string;
	timestamp?: string;
	url?: string;
	merchantCode?: string;
	apiKey?: string;
	fingerprint?: string;
	paymentAmount?: number;
	merchantUniquePaymentId?: string;
	mode?: number;
	redirectUrl?: string;
	customerReference?: string;
	customerName?: string;
	customerEmail?: string;
	callbackUrl?: string;
	contactNumber?: string;
	additionalReference?: string;
	minHeight?: number;
	userMode?: number;
	overrideFeePayer?: number;
	[key: string]: unknown;
}

class CodePreviewError extends Error {
	constructor(
		message: string,
		public readonly operation: string,
		public override readonly cause?: unknown
	) {
		super(message);
		this.name = 'CodePreviewError';
	}
}

/**
 * Gets checked state of a checkbox element
 * @param selector - CSS selector for checkbox
 * @returns True if checked, false otherwise
 */
function getCheckboxState(selector: string): boolean {
	const element = document.querySelector(selector) as HTMLInputElement;
	return element?.checked || false;
}

/**
 * Gets selected radio button value as number
 * @param name - Radio button group name
 * @returns Selected value as integer, 0 if none selected
 */
function getRadioValue(name: string): number {
	const element = document.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement;
	return element ? parseInt(element.value, 10) : 0;
}

/**
 * Gets input value or its placeholder if empty
 * @param inputId - Input element ID
 * @param fallbackGenerator - Optional function to generate fallback value
 * @returns Input value, placeholder, or generated fallback
 */
function getInputValueOrPlaceholder(inputId: string, fallbackGenerator?: () => string): string {
	const value = DomUtils.getValue(`#${inputId}`);
	if (value) {
		return value;
	}

	const input = document.getElementById(inputId) as HTMLInputElement;
	return input?.placeholder || (fallbackGenerator ? fallbackGenerator() : '');
}

/**
 * Collects customer-related field values
 * @returns Object containing customer details
 */
function collectCustomerDetails(): {
	customerReference: string;
	customerName: string;
	customerEmail: string;
	contactNumber: string;
	additionalReference: string;
} {
	const customerReference = getInputValueOrPlaceholder('customerReferenceInput', () => crypto.randomUUID());

	let customerName = getInputValueOrPlaceholder('customerNameInput');
	let customerEmail = DomUtils.getValue('#customerEmailInput');

	if (!customerName) {
		const input = document.getElementById('customerNameInput') as HTMLInputElement;
		customerName = input?.placeholder || '';
		if (!customerEmail) {
			const emailInput = document.getElementById('customerEmailInput') as HTMLInputElement;
			customerEmail = emailInput?.placeholder || '';
		}
	}

	const contactNumber = getInputValueOrPlaceholder('contactNumberInput', generateRandomContactNumber);
	const additionalReference = getInputValueOrPlaceholder('additionalReferenceInput', () => crypto.randomUUID());

	return { customerReference, customerName, customerEmail, contactNumber, additionalReference };
}

/**
 * Collects URL configuration values
 * @returns Object containing redirect and callback URLs
 */
function collectUrls(): { redirectUrl: string; callbackUrl: string } {
	return {
		redirectUrl: DomUtils.getValue('#redirectUrlInput') || DEFAULT_VALUES.extended.redirectUrl,
		callbackUrl: DomUtils.getValue('#callbackUrlInput'),
	};
}

/**
 * Builds array of required properties for code snippet
 * @param config - Code snippet configuration
 * @param merchantCode - Merchant code value
 * @param url - Gateway URL
 * @param customerReference - Customer reference value
 * @returns Array of property strings
 */
function buildRequiredProperties(
	config: CodeSnippetConfig,
	merchantCode: string,
	url: string,
	customerReference: string,
	redirectUrl: string
): string[] {
	const { apiKey, paymentAmount, mode, timestamp, merchantUniquePaymentId, fingerprint } = config;

	return [
		`timeStamp: "${timestamp}"`,
		`url: "${url}"`,
		`merchantCode: "${merchantCode}"`,
		`apiKey: "${apiKey}"`,
		`fingerprint: "${fingerprint}"`,
		`paymentAmount: ${paymentAmount}`,
		`merchantUniquePaymentId: "${merchantUniquePaymentId}"`,
		`mode: ${mode}`,
		`redirectUrl: "${redirectUrl}"`,
		...(customerReference ? [`customerReference: "${customerReference}"`] : []),
	];
}

/**
 * Adds optional customer-related fields to properties array
 * @param properties - Properties array to modify
 * @param customerName - Customer name value
 * @param customerEmail - Customer email value
 * @param callbackUrl - Callback URL value
 * @param additionalReference - Additional reference value
 * @param contactNumber - Contact number value
 */
function addOptionalCustomerFields(
	properties: string[],
	customerName: string,
	customerEmail: string,
	callbackUrl: string,
	additionalReference: string,
	contactNumber: string
): void {
	if (customerName) properties.push(`customerName: "${customerName}"`);
	if (customerEmail) properties.push(`customerEmail: "${customerEmail}"`);
	if (callbackUrl) properties.push(`callbackUrl: "${callbackUrl}"`);
	if (additionalReference) properties.push(`additionalReference: "${additionalReference}"`);
	if (contactNumber) properties.push(`contactNumber: ${contactNumber}`);
}

/**
 * Adds payment method options to properties array
 * @param properties - Properties array to modify
 */
function addPaymentMethodOptions(properties: string[]): void {
	const paymentMethods = [
		'allowBankAcOneOffPayment',
		'allowPayToOneOffPayment',
		'allowPayIdOneOffPayment',
		'allowApplePayOneOffPayment',
		'allowGooglePayOneOffPayment',
		'allowSlicePayOneOffPayment',
		'allowSaveCardUserOption',
		'allowUnionPayOneOffPayment',
	];

	paymentMethods.forEach(method => {
		if (getCheckboxState(`#${method}`)) {
			properties.push(`${method}: true`);
		}
	});
}

/**
 * Adds additional options to properties array
 * @param properties - Properties array to modify
 */
function addAdditionalOptions(properties: string[]): void {
	const additionalOptions = [
		'sendConfirmationEmailToCustomer',
		'sendConfirmationEmailToMerchant',
		'hideTermsAndConditions',
		'hideMerchantLogo',
	];

	additionalOptions.forEach(option => {
		if (getCheckboxState(`#${option}`)) {
			properties.push(`${option}: true`);
		}
	});
}

/**
 * Adds tokenization-specific options to properties array
 * @param properties - Properties array to modify
 * @param mode - Payment mode
 */
function addTokenizationOptions(properties: string[], mode: string): void {
	if (mode === '1') {
		if (getCheckboxState('#showFeeOnTokenising')) {
			properties.push('showFeeOnTokenising: true');
		}
		if (getCheckboxState('#showFailedPaymentFeeOnTokenising')) {
			properties.push('showFailedPaymentFeeOnTokenising: true');
		}
	}
}

/**
 * Adds user interface options to properties array
 * @param properties - Properties array to modify
 */
function addUserInterfaceOptions(properties: string[]): void {
	const userMode = getRadioValue('userMode');
	if (userMode !== 0) {
		properties.push(`userMode: ${userMode}`);
	}

	const overrideFeePayer = getRadioValue('overrideFeePayer');
	if (overrideFeePayer !== 0) {
		properties.push(`overrideFeePayer: ${overrideFeePayer}`);
	}

	const displayMode = getRadioValue('displayMode');
	if (displayMode !== 0) {
		properties.push(`displayMode: ${displayMode}`);
	}
}

/**
 * Adds numeric configuration options to properties array
 * @param properties - Properties array to modify
 * @param mode - Payment mode
 */
function addNumericOptions(properties: string[], mode: string): void {
	const minHeight = parseInt(DomUtils.getValue('#minHeightInput'), 10);
	const defaultHeight = mode === '1' ? 600 : DEFAULT_VALUES.options.minHeight;
	if (minHeight && minHeight !== defaultHeight) {
		properties.push(`minHeight: ${minHeight}`);
	}
}

/**
 * Adds SlicePay-specific options to properties array
 * @param properties - Properties array to modify
 */
function addSlicePayOptions(properties: string[]): void {
	if (getCheckboxState('#allowSlicePayOneOffPayment')) {
		const departureDate = DomUtils.getValue('#departureDateInput');
		if (departureDate) {
			properties.push(`departureDate: "${departureDate}"`);
		}
	}
}

/**
 * Formats properties array into final code snippet
 * @param properties - Array of property strings
 * @returns Formatted JavaScript code snippet
 */
function formatCodeSnippet(properties: string[]): string {
	let snippet = `var payment = $.zpPayment({\n    ${properties.join(',\n    ')}\n});`;
	snippet += `\n\npayment.init();`;
	return snippet.trim();
}

/**
 * Builds JavaScript code snippet for ZenPay plugin initialization
 * @param config - Code snippet configuration
 * @returns Formatted JavaScript code string
 * @throws {CodePreviewError} If snippet generation fails
 */
function buildCodeSnippet(config: CodeSnippetConfig): string {
	try {
		const url = DomUtils.getValue('#urlPreview');
		const merchantCode = DomUtils.getValue('#merchantCodeInput') || DEFAULT_VALUES.credentials.merchantCode;

		const customerDetails = collectCustomerDetails();
		const urls = collectUrls();

		const properties = buildRequiredProperties(
			config,
			merchantCode,
			url,
			customerDetails.customerReference,
			urls.redirectUrl
		);

		addOptionalCustomerFields(
			properties,
			customerDetails.customerName,
			customerDetails.customerEmail,
			urls.callbackUrl,
			customerDetails.additionalReference,
			customerDetails.contactNumber
		);

		addPaymentMethodOptions(properties);
		addAdditionalOptions(properties);
		addTokenizationOptions(properties, config.mode);
		addUserInterfaceOptions(properties);
		addNumericOptions(properties, config.mode);
		addSlicePayOptions(properties);

		return formatCodeSnippet(properties);
	} catch (error) {
		throw new CodePreviewError(
			'Failed to build code snippet',
			'buildCodeSnippet',
			error instanceof Error ? error : undefined
		);
	}
}

/**
 * Collects form values with fallback to placeholders or defaults
 * @returns Object containing all required form values
 */
function collectFormValuesWithPlaceholders(): {
	merchantUniquePaymentId: string;
	apiKey: string;
	username: string;
	password: string;
	paymentAmount: number;
	mode: string;
} {
	let merchantUniquePaymentId = DomUtils.getValue('#merchantUniquePaymentIdInput');
	if (!merchantUniquePaymentId) {
		const input = document.getElementById('merchantUniquePaymentIdInput') as HTMLInputElement;
		merchantUniquePaymentId = input?.placeholder || crypto.randomUUID();
	}

	const apiKey = DomUtils.getValue('#apiKeyInput') || DEFAULT_VALUES.credentials.apiKey;
	const username = DomUtils.getValue('#usernameInput') || DEFAULT_VALUES.credentials.username;
	const password = DomUtils.getValue('#passwordInput') || DEFAULT_VALUES.credentials.password;

	let paymentAmountStr = DomUtils.getValue('#paymentAmountInput');
	if (!paymentAmountStr) {
		const input = document.getElementById('paymentAmountInput') as HTMLInputElement;
		paymentAmountStr = input?.placeholder || generateRandomPaymentAmount(10.0, 1000.0);
	}
	const paymentAmount = parseFloat(paymentAmountStr);

	const mode = DomUtils.getValue('#modeSelect');

	return { merchantUniquePaymentId, apiKey, username, password, paymentAmount, mode };
}

/**
 * Generates fingerprint with error handling
 * @param formValues - Form values for fingerprint generation
 * @param timestamp - Current timestamp
 * @returns Generated fingerprint or empty string on error
 */
async function generateFingerprintSafely(
	formValues: {
		apiKey: string;
		username: string;
		password: string;
		paymentAmount: number;
		mode: string;
		merchantUniquePaymentId: string;
	},
	timestamp: string
): Promise<string> {
	try {
		const { apiKey, username, password, paymentAmount, mode, merchantUniquePaymentId } = formValues;

		if (apiKey && username && password && paymentAmount && mode && timestamp && merchantUniquePaymentId) {
			return await generateFingerprint(
				apiKey,
				username,
				password,
				mode,
				paymentAmount.toString(),
				merchantUniquePaymentId,
				timestamp
			);
		}
	} catch (error) {
		console.warn('[generateFingerprintSafely] Could not generate fingerprint:', error);
	}

	return '';
}

/**
 * Updates code preview DOM element with syntax highlighting
 * @param snippet - Code snippet to display
 */
function updateCodePreviewDisplay(snippet: string): void {
	const codePreviewEl = document.getElementById('codePreview');
	if (codePreviewEl) {
		codePreviewEl.textContent = snippet;
		delete codePreviewEl.dataset['highlighted'];
		hljs.highlightElement(codePreviewEl);
	}
}

/**
 * Internal update code preview function
 * @private
 */
async function _updateCodePreviewInternal(): Promise<void> {
	try {
		const timestamp = new Date().toISOString().slice(0, 19);
		const formValues = collectFormValuesWithPlaceholders();
		const fingerprint = await generateFingerprintSafely(formValues, timestamp);

		const normalizedPaymentAmount = formValues.mode === '2' ? 0 : Math.floor(formValues.paymentAmount * 100);

		const snippet = buildCodeSnippet({
			apiKey: formValues.apiKey,
			paymentAmount: normalizedPaymentAmount,
			mode: formValues.mode,
			timestamp,
			merchantUniquePaymentId: formValues.merchantUniquePaymentId,
			fingerprint,
		});

		updateCodePreviewDisplay(snippet);
	} catch (error) {
		console.error('[_updateCodePreviewInternal] Error updating code preview:', error);
		throw new CodePreviewError(
			'Failed to update code preview',
			'_updateCodePreviewInternal',
			error instanceof Error ? error : undefined
		);
	}
}

/**
 * Updates minimum height input based on selected payment mode
 * Mode 1 (tokenization) defaults to 600px, others use default height
 */
export function updateMinHeightBasedOnMode(): void {
	try {
		const mode = DomUtils.getValue('#modeSelect');
		const defaultHeight = mode === '1' ? '600' : DEFAULT_VALUES.options.minHeight.toString();

		const minHeightInput = document.getElementById('minHeightInput') as HTMLInputElement;
		if (minHeightInput) {
			const currentHeight = minHeightInput.value;
			if (
				!currentHeight ||
				currentHeight === '600' ||
				currentHeight === DEFAULT_VALUES.options.minHeight.toString()
			) {
				minHeightInput.value = defaultHeight;
			}
		}
	} catch (error) {
		console.error('[updateMinHeightBasedOnMode] Error updating min height:', error);
	}
}

/**
 * Extracts configuration text from code preview
 * @param codePreviewText - Full code preview text
 * @returns Extracted configuration text
 * @throws {Error} If extraction fails
 */
function extractConfigurationText(codePreviewText: string): string {
	if (!codePreviewText) {
		throw new Error('Code preview is empty');
	}

	const configMatch = codePreviewText.match(/\$\.zpPayment\(\{\s*([\s\S]*?)\s*\}\)/);

	if (!configMatch || !configMatch[1]) {
		throw new Error('Could not extract configuration from code preview');
	}

	return configMatch[1];
}

/**
 * Parses a single configuration line into key-value pair
 * @param line - Configuration line to parse
 * @param config - Config object to update
 */
function parseConfigurationLine(line: string, config: ParsedCodeConfig): void {
	const match = line.trim().match(/^([^:]+):\s*(.+)$/);
	if (!match) return;

	let [, key, value] = match;
	key = key?.trim() || '';
	value = value?.trim() || '';

	if (value.startsWith('"') && value.endsWith('"')) {
		config[key] = value.substring(1, value.length - 1);
	} else if (value === 'true') {
		config[key] = true;
	} else if (value === 'false') {
		config[key] = false;
	} else if (!isNaN(Number(value))) {
		config[key] = Number(value);
	} else {
		config[key] = value;
	}
}

/**
 * Normalizes configuration field names (handles timestamp conversion)
 * @param config - Configuration to normalize
 */
function normalizeConfigurationFields(config: ParsedCodeConfig): void {
	if (config.timeStamp) {
		config.timestamp = config.timeStamp as string;
		delete config.timeStamp;
	}
}

/**
 * Parses configuration object from displayed code preview
 * @returns Parsed configuration object
 * @throws {CodePreviewError} If parsing fails
 */
export function parseCodePreviewConfig(): ParsedCodeConfig {
	try {
		const codePreviewText = DomUtils.getText('#codePreview');
		const configText = extractConfigurationText(codePreviewText);
		const configLines = configText.split(',\n');
		const parsedConfig: ParsedCodeConfig = {};

		configLines.forEach(line => parseConfigurationLine(line, parsedConfig));
		normalizeConfigurationFields(parsedConfig);

		console.debug('[parseCodePreviewConfig] Parsed config:', parsedConfig);
		return parsedConfig;
	} catch (error) {
		console.error('[parseCodePreviewConfig] Error parsing code preview:', error);
		throw new CodePreviewError(
			'Failed to parse code preview',
			'parseCodePreviewConfig',
			error instanceof Error ? error : undefined
		);
	}
}

/**
 * Debounced code preview update function (50ms delay)
 * Updates preview with current form values and syntax highlighting
 */
export const updateCodePreview = debounce(_updateCodePreviewInternal, 50);
