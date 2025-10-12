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
 * Builds JavaScript code snippet for ZenPay plugin initialization
 * @param config - Code snippet configuration
 * @returns Formatted JavaScript code string
 * @throws {CodePreviewError} If snippet generation fails
 */
function buildCodeSnippet(config: CodeSnippetConfig): string {
	try {
		const { apiKey, paymentAmount, mode, timestamp, merchantUniquePaymentId, fingerprint } = config;

		const url = DomUtils.getValue('#urlPreview');
		const merchantCode = DomUtils.getValue('#merchantCodeInput') || DEFAULT_VALUES.credentials.merchantCode;

		// Get customer values or use placeholders
		let customerReference = DomUtils.getValue('#customerReferenceInput');
		if (!customerReference) {
			const input = document.getElementById('customerReferenceInput') as HTMLInputElement;
			customerReference = input?.placeholder || crypto.randomUUID();
		}

		let customerName = DomUtils.getValue('#customerNameInput');
		let customerEmail = DomUtils.getValue('#customerEmailInput');
		if (!customerName) {
			const input = document.getElementById('customerNameInput') as HTMLInputElement;
			customerName = input?.placeholder || '';
			// Only use placeholder for email if both are empty
			if (!customerEmail) {
				const emailInput = document.getElementById('customerEmailInput') as HTMLInputElement;
				customerEmail = emailInput?.placeholder || '';
			}
		}

		let contactNumber = DomUtils.getValue('#contactNumberInput');
		if (!contactNumber) {
			const input = document.getElementById('contactNumberInput') as HTMLInputElement;
			contactNumber = input?.placeholder || generateRandomContactNumber();
		}

		let additionalReference = DomUtils.getValue('#additionalReferenceInput');
		if (!additionalReference) {
			const input = document.getElementById('additionalReferenceInput') as HTMLInputElement;
			additionalReference = input?.placeholder || crypto.randomUUID();
		}

		const redirectUrl = DomUtils.getValue('#redirectUrlInput') || DEFAULT_VALUES.extended.redirectUrl;
		const callbackUrl = DomUtils.getValue('#callbackUrlInput');

		// Start with required properties
		const properties: string[] = [
			`timeStamp: "${timestamp}"`,
			`url: "${url}"`,
			`merchantCode: "${merchantCode}"`,
			`apiKey: "${apiKey}"`,
			`fingerprint: "${fingerprint}"`,
			`paymentAmount: ${paymentAmount}`,
			`merchantUniquePaymentId: "${merchantUniquePaymentId}"`,
			`mode: ${mode}`,
			`redirectUrl: "${redirectUrl}"`,
		];

		if (customerReference) {
			properties.push(`customerReference: "${customerReference}"`);
		}

		if (customerName) {
			properties.push(`customerName: "${customerName}"`);
		}

		if (customerEmail) {
			properties.push(`customerEmail: "${customerEmail}"`);
		}

		if (callbackUrl) {
			properties.push(`callbackUrl: "${callbackUrl}"`);
		}

		if (additionalReference) {
			properties.push(`additionalReference: "${additionalReference}"`);
		}

		// Add payment method options
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

		// Add additional options
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

		// Add tokenization options for mode 1
		if (mode === '1') {
			if (getCheckboxState('#showFeeOnTokenising')) {
				properties.push('showFeeOnTokenising: true');
			}
			if (getCheckboxState('#showFailedPaymentFeeOnTokenising')) {
				properties.push('showFailedPaymentFeeOnTokenising: true');
			}
		}

		// Add user mode and fee payer options
		const userMode = getRadioValue('userMode');
		if (userMode !== 0) {
			properties.push(`userMode: ${userMode}`);
		}

		const overrideFeePayer = getRadioValue('overrideFeePayer');
		if (overrideFeePayer !== 0) {
			properties.push(`overrideFeePayer: ${overrideFeePayer}`);
		}

		// Add display mode
		const displayMode = getRadioValue('displayMode');
		if (displayMode !== 0) {
			properties.push(`displayMode: ${displayMode}`);
		}

		// Add minHeight if different from default
		const minHeight = parseInt(DomUtils.getValue('#minHeightInput'), 10);
		const defaultHeight = mode === '1' ? 600 : DEFAULT_VALUES.options.minHeight;
		if (minHeight && minHeight !== defaultHeight) {
			properties.push(`minHeight: ${minHeight}`);
		}

		// Add contact number if provided
		if (contactNumber) {
			properties.push(`contactNumber: ${contactNumber}`);
		}

		// Add departure date if SlicePay is enabled
		if (getCheckboxState('#allowSlicePayOneOffPayment')) {
			const departureDate = DomUtils.getValue('#departureDateInput');
			if (departureDate) {
				properties.push(`departureDate: "${departureDate}"`);
			}
		}

		let snippet = `var payment = $.zpPayment({\n    ${properties.join(',\n    ')}\n});`;
		snippet += `\n\npayment.init();`;

		return snippet.trim();
	} catch (error) {
		throw new CodePreviewError(
			'Failed to build code snippet',
			'buildCodeSnippet',
			error instanceof Error ? error : undefined
		);
	}
}

/**
 * Internal update code preview function
 * @private
 */
async function _updateCodePreviewInternal(): Promise<void> {
	try {
		const timestamp = new Date().toISOString().slice(0, 19);

		// Get values or use placeholders for empty fields
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

		let fingerprint = '';

		try {
			if (apiKey && username && password && paymentAmount && mode && timestamp && merchantUniquePaymentId) {
				fingerprint = await generateFingerprint(
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
			console.warn('[updateCodePreview] Could not generate fingerprint:', error);
		}

		// Normalize payment amount for API (remove decimal point)
		const normalizedPaymentAmount = mode === '2' ? 0 : Math.floor(paymentAmount * 100);

		const snippet = buildCodeSnippet({
			apiKey,
			paymentAmount: normalizedPaymentAmount,
			mode,
			timestamp,
			merchantUniquePaymentId,
			fingerprint,
		});

		const codePreviewEl = document.getElementById('codePreview');
		if (codePreviewEl) {
			codePreviewEl.textContent = snippet;
			delete (codePreviewEl as any).dataset.highlighted;
			hljs.highlightElement(codePreviewEl);
		}
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
 * Parses configuration object from displayed code preview
 * @returns Parsed configuration object
 * @throws {CodePreviewError} If parsing fails
 */
export function parseCodePreviewConfig(): ParsedCodeConfig {
	try {
		const codePreviewText = DomUtils.getText('#codePreview');

		if (!codePreviewText) {
			throw new Error('Code preview is empty');
		}

		const configMatch = codePreviewText.match(/\$\.zpPayment\(\{\s*([\s\S]*?)\s*\}\)/);

		if (!configMatch || !configMatch[1]) {
			throw new Error('Could not extract configuration from code preview');
		}

		const configText = configMatch[1];
		const configLines = configText.split(',\n');
		const parsedConfig: ParsedCodeConfig = {};

		configLines.forEach(line => {
			const match = line.trim().match(/^([^:]+):\s*(.+)$/);
			if (!match) return;

			let [, key, value] = match;
			key = key?.trim() || '';
			value = value?.trim() || '';

			if (value.startsWith('"') && value.endsWith('"')) {
				parsedConfig[key] = value.substring(1, value.length - 1);
			} else if (value === 'true') {
				parsedConfig[key] = true;
			} else if (value === 'false') {
				parsedConfig[key] = false;
			} else if (!isNaN(Number(value))) {
				parsedConfig[key] = Number(value);
			} else {
				parsedConfig[key] = value;
			}
		});

		// Handle timestamp field name conversion
		if (parsedConfig.timeStamp) {
			parsedConfig.timestamp = parsedConfig.timeStamp as string;
			delete parsedConfig.timeStamp;
		}

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
