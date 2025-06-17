// F:\_Zenith_Github\ZP-JQ-QD\src\js\initZP.js

import { $ } from './globals.js';
import { generateFingerprint } from './hash.js';
import { generateCurrentDatetime } from './helpers.js';
import { saveSessionValues } from './session.js';
import { showError } from './modal.js';
import { parseCodePreviewConfig } from './codePreview.js';

/**
 * Initialize the ZenPay plugin with configuration from code preview
 * @returns {void}
 */
export async function initializeZenPayPlugin() {
	try {
		const parsedConfig = parseCodePreviewConfig();
		const paymentAmount = parsedConfig.paymentAmount.toFixed(2);

		const username = $('#usernameInput').val().trim();
		const password = $('#passwordInput').val().trim();

		if (!username || !password) {
			showError('Validation Error', 'Credentials are required for initialization.');
			return;
		}

		const timestamp = generateCurrentDatetime();
		parsedConfig.timestamp = timestamp;

		if (!parsedConfig.apiKey || parsedConfig.apiKey === '<<API-KEY>>') {
			console.error('[initializeZenPayPlugin] Invalid API Key for fingerprint generation');
			showError('Validation Error', 'A valid API Key is required for initialization.');
			return;
		}

		const fingerprint = await generateFingerprint({
			apiKey: parsedConfig.apiKey,
			username: username,
			password: password,
			mode: String(parsedConfig.mode),
			paymentAmount: paymentAmount,
			merchantUniquePaymentId: parsedConfig.merchantUniquePaymentId,
			timestamp: timestamp,
		});

		if (!fingerprint) {
			console.error('[initializeZenPayPlugin] Failed to generate fingerprint');
			showError(
				'Validation Error',
				'Failed to generate security fingerprint. Please check API credentials.'
			);
			return;
		}

		parsedConfig.fingerprint = fingerprint;
		const minHeightFromUI = $('#minHeightInput').val() ? $('#minHeightInput').val().trim() : '';
		parsedConfig.minHeight = minHeightFromUI;

		// Handle V3 compatibility mode
		if (window.zpV3CompatMode?.omitMerchantCodeFromPayload) {
			console.warn('[initializeZenPayPlugin] ⚠️ V3 Compat Mode: Omitting merchantCode from payload');
			delete parsedConfig.merchantCode;
		}

		if (window.zpV3CompatMode?.omitTimestampFromHash) {
			console.warn('[initializeZenPayPlugin] ⚠️ V3 Compat Mode: Omitting timestamp from payload');
			delete parsedConfig.timestamp;
		}

		const sessionConfig = { ...parsedConfig };
		sessionConfig.username = username;
		sessionConfig.password = password;

		saveSessionValues(sessionConfig);
		const payment = $.zpPayment(parsedConfig);
		console.log('[initializeZenPayPlugin] 👇 ZP Payload 👇');
		console.info(parsedConfig);
		console.log('');
		console.log('[initializeZenPayPlugin] 👇 Payment object initialized 👇');
		console.info(payment.options);
		const result = payment.init();
	} catch (err) {
		console.error('[initializeZenPayPlugin] Error initializing plugin:', err);
		showError('Initialization Error', 'Unable to initialize plugin. See console for details.');
	}
}
