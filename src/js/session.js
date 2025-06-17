/**
 * ZenPay Payment Plugin Demo - Session Management
 * @module sessionManagement
 */

import { $, SESSION_KEYS } from './globals.js';
import { paymentMethodOptions, additionalOptions, DEFAULT_VALUES } from './globals.js';
import { base64EncodeASCII, base64DecodeASCII } from './helpers.js';

/**
 * Storage types enum
 * @constant {Object}
 */
export const STORAGE_TYPE = {
	SESSION: 'session',
	LOCAL: 'local',
};

/**
 * Encoding types enum
 * @constant {Object}
 */
export const ENCODING_TYPE = {
	NONE: 'none',
	JSON: 'json',
	BASE64: 'base64',
};

/**
 * Save a value to storage with BASE64 encoding.
 * @param {string} key - The key under which to store the value.
 * @param {*} value - The value to store.
 * @param {string} [storageType=STORAGE_TYPE.SESSION] - Storage type (session or local).
 * @returns {boolean} - Success status.
 */
export function saveToStorage(key, value, storageType = STORAGE_TYPE.SESSION) {
	try {
		// Choose storage
		const storage = storageType === STORAGE_TYPE.LOCAL ? localStorage : sessionStorage;

		// Convert to string if needed
		let stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

		// Always encode with base64
		const encodedValue = base64EncodeASCII(stringValue);

		// Store value
		storage.setItem(key, encodedValue);

		return true;
	} catch (e) {
		console.error(`[saveToStorage] Error saving to ${storageType} storage:`, e);
		return false;
	}
}

/**
 * Get a value from storage with BASE64 decoding.
 * @param {string} key - The key to retrieve the value for.
 * @param {*} [defaultValue=null] - The default value to return if the key is not found or on error.
 * @param {string} [storageType=STORAGE_TYPE.SESSION] - Storage type (session or local).
 * @returns {*} The retrieved value or the default value if not found.
 */
export function getFromStorage(key, defaultValue = null, storageType = STORAGE_TYPE.SESSION) {
	try {
		// Choose storage
		const storage = storageType === STORAGE_TYPE.LOCAL ? localStorage : sessionStorage;

		// Get encoded value
		const encodedValue = storage.getItem(key);

		// Return default if not found
		if (encodedValue === null) {
			console.debug(`[getFromStorage] No value found for ${key}, returning default:`, defaultValue);
			return defaultValue;
		}

		const decodedValue = base64DecodeASCII(encodedValue);

		// Handle boolean strings
		if (decodedValue === 'true') return true;
		if (decodedValue === 'false') return false;

		// Handle numeric strings
		if (!isNaN(decodedValue) && decodedValue.trim() !== '') {
			const num = Number(decodedValue);
			console.debug(`[getFromStorage] Converted to number: ${num}`);
			return num;
		}

		return decodedValue;
	} catch (e) {
		console.error(`[getFromStorage] Error retrieving from ${storageType} storage:`, e);
		return defaultValue;
	}
}

function getZPSObject() {
	try {
		const storedData = sessionStorage.getItem('ZPS');
		if (!storedData) {
			return {};
		}
		const decodedData = base64DecodeASCII(storedData);
		return JSON.parse(decodedData);
	} catch (e) {
		console.error('[getZPSObject] Error retrieving ZPS data:', e);
		return {};
	}
}

export function saveToSession(key, value) {
	try {
		const zpsData = getZPSObject();

		const cleanKey = key.startsWith('demo') ? key.replace(/^demo(?:_)?/, '') : key;

		zpsData[cleanKey] = value;

		const encodedData = base64EncodeASCII(JSON.stringify(zpsData));
		sessionStorage.setItem('ZPS', encodedData);

		return true;
	} catch (e) {
		console.error('[saveToSession] Error:', e);
		return false;
	}
}
export function getFromSession(key, defaultValue = null) {
	try {
		const zpsData = getZPSObject();

		const cleanKey = key.startsWith('demo') ? key.replace(/^demo(?:_)?/, '') : key;

		if (cleanKey in zpsData) {
			return zpsData[cleanKey];
		}

		return defaultValue;
	} catch (e) {
		console.error('[getFromSession] Error:', e);
		return defaultValue;
	}
}

export function restoreSessionValues() {
	console.trace(`[restoreSessionValues] Restoring session values called`);

	if ($('#apiKeyInput').length) {
		$('#apiKeyInput').val(getFromSession(SESSION_KEYS.API_KEY, ''));
	}

	if ($('#usernameInput').length) {
		$('#usernameInput').val(getFromSession(SESSION_KEYS.USERNAME, ''));
	}

	if ($('#passwordInput').length) {
		$('#passwordInput').val(getFromSession(SESSION_KEYS.PASSWORD, ''));
	}

	if ($('#merchantCodeInput').length) {
		$('#merchantCodeInput').val(
			getFromSession(SESSION_KEYS.MERCHANT_CODE, '')
		);
	}

	if ($('#modeSelect').length) {
		$('#modeSelect').val(getFromSession(SESSION_KEYS.MODE, '0'));
		if ($('#modeSelect').val() === '1' && $('#tokenizationOptions').length) {
			$('#tokenizationOptions').removeClass('d-none');
		}
	}
	$('.payment-method-toggle').each(function () {
		const option = $(this).data('option');
		const savedValue = getFromSession(`demo_${option}`, false);
		if (savedValue === true) {
			$(this).prop('checked', true);
			if (paymentMethodOptions && option in paymentMethodOptions) {
				paymentMethodOptions[option] = true;
			}
		}
	});
	$('.option-toggle').each(function () {
		const option = $(this).data('option');
		const savedValue = getFromSession(`demo_${option}`, false);
		if (savedValue === true) {
			$(this).prop('checked', true);
			if (additionalOptions && option in additionalOptions) {
				additionalOptions[option] = true;
			}
		}
	});
	const savedSubdomain = getFromSession(SESSION_KEYS.SUBDOMAIN);
	if (savedSubdomain && $(`input[name="subdomain"][value="${savedSubdomain}"]`).length) {
		$(`input[name="subdomain"][value="${savedSubdomain}"]`).prop('checked', true);
	}

	const savedDomain = getFromSession(SESSION_KEYS.DOMAIN);
	if (savedDomain && $('#domainSelect').length) {
		$('#domainSelect').val(savedDomain);
	}

	const savedVersion = getFromSession(SESSION_KEYS.VERSION);
	if (savedVersion && $(`input[name="version"][value="${savedVersion}"]`).length) {
		$(`input[name="version"][value="${savedVersion}"]`).prop('checked', true);
	}
	if ($('#minHeightInput').length) {
		$('#minHeightInput').val(getFromSession(SESSION_KEYS.MIN_HEIGHT, ''));
	}
}

/**
 * Save all form field values from paymentConfig to session storage.
 * @param {Object} paymentConfig - The payment configuration object with varying properties
 * @returns {void}
 */
export function saveSessionValues(paymentConfig) {
	if (!paymentConfig) return;
	Object.entries(paymentConfig).forEach(([key, value]) => {
		if (value === undefined || value === null) return;
		if (key === 'minHeight' && value === DEFAULT_VALUES.options.minHeight.default) {
			return;
		}
		// Handle special cases for keys with underscores in SESSION_KEYS
		let lookupKey = key.toUpperCase();
		if (key === 'apiKey') {
			lookupKey = 'API_KEY';
		} else if (key === 'merchantCode') {
			lookupKey = 'MERCHANT_CODE';
		}
		
		const sessionKey = SESSION_KEYS[lookupKey] || key;
		saveToSession(sessionKey, value);
	});
}

export function savePaymentMethodValuesToSession() {
	$('.payment-method-toggle').each(function () {
		const option = $(this).data('option');
		saveToSession(`demo_${option}`, $(this).prop('checked'));
	});
}

export function saveAdditionalOptionsToSession() {
	$('.option-toggle').each(function () {
		const option = $(this).data('option');
		saveToSession(`demo_${option}`, $(this).prop('checked'));
	});
}
