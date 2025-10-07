import { createDebouncedFunction  as debounce } from './utilities.ts';
import { DEFAULT_VALUES, DomUtils, hljs } from './globals.ts';
import { createSha3PaymentFingerprint as generateFingerprint } from './cryptographicFingerprintGenerator.ts';
import { generateCurrentIsoTimestamp } from './utilities.ts';

export interface CodeSnippetConfig {
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
export interface ParsedCodeConfig {
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
	minHeight?: number;
	userMode?: number;
	overrideFeePayer?: number;
	[key: string]: unknown;
}

export class CodePreviewError extends Error {
	constructor(
		message: string,
		public readonly operation: string,
		public override readonly cause?: unknown
	) {
		super(message);
		this.name = 'CodePreviewError';
	}
}

function getCheckboxState(selector: string): boolean {
	const element = document.querySelector(selector) as HTMLInputElement;
	return element?.checked || false;
}

function getRadioValue(name: string): number {
	const element = document.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement;
	return element ? parseInt(element.value, 10) : 0;
}

function buildCodeSnippet(config: CodeSnippetConfig): string {
	try {
		const { apiKey, paymentAmount, mode, timestamp, merchantUniquePaymentId, fingerprint } = config;

		const url = DomUtils.getValue('#urlPreview');
		const merchantCode =
			DomUtils.getValue('#merchantCodeInput') || DEFAULT_VALUES.credentials.merchantCode;

		// Get customer values without fallbacks
		const customerReference = DomUtils.getValue('#customerReferenceInput');
		const customerName = DomUtils.getValue('#customerNameInput');
		const customerEmail = DomUtils.getValue('#customerEmailInput');
		const redirectUrl = DomUtils.getValue('#redirectUrlInput') || DEFAULT_VALUES.extended.redirectUrl;
		const callbackUrl = DomUtils.getValue('#callbackUrlInput');
		const contactNumber = DomUtils.getValue('#contactNumberInput');

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

		// Add payment method options
		const paymentMethods = [
			'allowBankAcOneOffPayment',
			'allowPayToOneOffPayment',
			'allowPayIdOneOffPayment',
			'allowApplePayOneOffPayment',
			'allowGooglePayOneOffPayment',
			'allowSlicePayOneOffPayment',
			'allowSaveCardUserOption',
		];

		paymentMethods.forEach((method) => {
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

		additionalOptions.forEach((option) => {
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
        const timestamp = generateCurrentIsoTimestamp();
		const merchantUniquePaymentId = DomUtils.getValue('#merchantUniquePaymentIdInput');
		const apiKey = DomUtils.getValue('#apiKeyInput') || DEFAULT_VALUES.credentials.apiKey;
		const username = DomUtils.getValue('#usernameInput') || DEFAULT_VALUES.credentials.username;
		const password = DomUtils.getValue('#passwordInput') || DEFAULT_VALUES.credentials.password;
		const paymentAmount = parseFloat(DomUtils.getValue('#paymentAmountInput'));
		const mode = DomUtils.getValue('#modeSelect');

		let fingerprint = '';

		try {
			if (
				apiKey &&
				username &&
				password &&
				paymentAmount &&
				mode &&
				timestamp &&
				merchantUniquePaymentId
			) {
				fingerprint = await generateFingerprint(
					apiKey,
					username,
					password,
					mode,
					paymentAmount.toString(),
					merchantUniquePaymentId,
					timestamp,
				);
			}
		} catch (error) {
			console.warn('[updateCodePreview] Could not generate fingerprint:', error);
		}

		const snippet = buildCodeSnippet({
			apiKey,
			paymentAmount,
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

export function updateMinHeightBasedOnMode(): void {
	try {
		const mode = DomUtils.getValue('#modeSelect');
    const defaultHeight = mode === '1' ? '600' : DEFAULT_VALUES.options.minHeight.toString();

		const minHeightInput = document.getElementById('minHeightInput') as HTMLInputElement;
		if (minHeightInput) {
			const currentHeight = minHeightInput.value;
            if (!currentHeight || currentHeight === '600' || currentHeight === DEFAULT_VALUES.options.minHeight.toString()) {
                minHeightInput.value = defaultHeight;
            }
		}
	} catch (error) {
		console.error('[updateMinHeightBasedOnMode] Error updating min height:', error);
	}
}

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

		configLines.forEach((line) => {
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

export const updateCodePreview = debounce(_updateCodePreviewInternal, 50);
