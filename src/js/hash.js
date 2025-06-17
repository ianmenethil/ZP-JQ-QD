import { sha3_512, $ } from './globals.js';
import { showError } from './modal.js';
/**
 * @typedef {Object} FingerprintPayload
 * @property {string} apiKey
 * @property {string} username
 * @property {string} password
 * @property {string} mode
 * @property {number} paymentAmount   -  amount in whole number i.e. 1000 for 10.00
 * @property {string} merchantUniquePaymentId
 * @property {string} timestamp    – 'yyyy-mm-ddThh:mm:ss' format
 */

/**
 * Validate timestamp format yyyy-mm-ddThh:mm:ss
 * @param {string} timestamp
 * @returns {boolean}
 */
function validateTimestampFormat(timestamp) {
	const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
	return regex.test(timestamp);
}

/**
 * Validate fingerprint payload fields.
 * @param {string} apiKey
 * @param {string} username
 * @param {string} password
 * @param {string} mode
 * @param {number} paymentAmount
 * @param {string} merchantUniquePaymentId
 * @param {string} timestamp
 * @returns {boolean} True if all required fields are valid, false otherwise.
 */
function validateFingerprintPayload(apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp) {
	if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
		showError('Validation Error', 'apiKey is required and must be a non-empty string.');
		return false;
	}
	if (!username || typeof username !== 'string' || username.trim() === '') {
		showError('Validation Error', 'username is required and must be a non-empty string.');
		return false;
	}
	if (!password || typeof password !== 'string' || password.trim() === '') {
		showError('Validation Error', 'password is required and must be a non-empty string.');
		return false;
	}
	if (!mode || typeof mode !== 'string' || mode.trim() === '') {
		showError('Validation Error', 'mode is required and must be a non-empty string.');
		return false;
	}
	if (paymentAmount === undefined || paymentAmount === null || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
		showError('Validation Error', 'paymentAmount is required and must be a positive number.');
		return false;
	}
	if (!merchantUniquePaymentId || typeof merchantUniquePaymentId !== 'string' || merchantUniquePaymentId.trim() === '') {
		showError('Validation Error', 'merchantUniquePaymentId is required and must be a non-empty string.');
		return false;
	}
	if (!timestamp || typeof timestamp !== 'string' || timestamp.trim() === '') {
		showError('Validation Error', 'timestamp is required and must be a non-empty string.');
		return false;
	}
	if (!validateTimestampFormat(timestamp)) {
		showError('Validation Error', 'timestamp must be in the format yyyy-mm-ddThh:mm:ss.');
		return false;
	}
	return true;
}

export function buildFingerprintPayload(apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp) {
	console.log(`[buildFingerprintPayload] apiKey: ${apiKey}`);
	console.log(`[buildFingerprintPayload] username: ${username}`);
	console.log(`[buildFingerprintPayload] password: ${password}`);
	console.log(`[buildFingerprintPayload] mode: ${mode}`);
	console.log(`[buildFingerprintPayload] paymentAmount: ${paymentAmount}`);
	console.log(`[buildFingerprintPayload] merchantUniquePaymentId: ${merchantUniquePaymentId}`);
	console.log(`[buildFingerprintPayload] timestamp: ${timestamp}`);
	if (!validateFingerprintPayload(apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp)) {
		throw new Error('[buildFingerprintPayload] Invalid fingerprint payload');
	}
	const payload = {
		apiKey,
		username,
		password,
		mode,
		paymentAmount,
		merchantUniquePaymentId,
		timestamp
	};
	console.log(`[buildFingerprintPayload] Payload:`);
	console.log(payload);
	console.log('{payload}');
	console.json(payload);
	console.log('{json-payload}');
	console.log(`[buildFingerprintPayload] Payload: ${JSON.stringify(payload)}`);
	return payload;
}

const DummyApiKey = '<<API-KEY>>';
const DummyUsername = '<<USERNAME>>';
const DummyPassword = '<<PASSWORD>>';
export function checkDummyCreds(apiKey, username, password) {
	if (apiKey === DummyApiKey) {
		apiKey = '';
	}
	if (username === DummyUsername) {
		username = '';
	}
	if (password === DummyPassword) {
		password = '';
	}
	return { apiKey, username, password };
}

/**
 * Generate the SHA-3-512 fingerprint from a payload object.
 */
export async function generateFingerprint({ apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp }) {
	// Make copies of the parameters to avoid modifying the originals
	let _apiKey = apiKey;
	let _username = username;
	let _password = password;

	// Check for dummy credentials
	if (_apiKey === DummyApiKey) _apiKey = '';
	if (_username === DummyUsername) _username = '';
	if (_password === DummyPassword) _password = '';

	if (!_apiKey || !_username || !_password || !mode || !paymentAmount || !merchantUniquePaymentId || !timestamp) {
		console.warn('[generateFingerprint] Missing required values for fingerprint generation');
		return '';
	}
	const selectedVersion = $('input[name="version"]:checked').val();
	let hashPaymentAmount = String(paymentAmount).replace('.', '');

	if (mode === '2') {
		hashPaymentAmount = '0';
		console.info(`[generateFingerprint] Payment mode is 2, setting hashPaymentAmount to 0`);
	}

	let hash = '';
	if (selectedVersion === 'v3') {
		hash = await createSHA1Hash(apiKey, username, password, mode, hashPaymentAmount, merchantUniquePaymentId, timestamp);
	} else if (selectedVersion === 'v4') {
		hash = await createSHA512Hash(apiKey, username, password, mode, hashPaymentAmount, merchantUniquePaymentId, timestamp);
	} else {
		hash = createSHA3_512Hash(apiKey, username, password, mode, hashPaymentAmount, merchantUniquePaymentId, timestamp);
	}
	return hash;
}

async function sha512Hash(...inputs) {
	const concatenated = inputs.join('');

	const encoder = new TextEncoder();
	const data = encoder.encode(concatenated);

	const hashBuffer = await crypto.subtle.digest('SHA-512', data);

	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha1Hash(...inputs) {
	const concatenated = inputs.join('');

	const encoder = new TextEncoder();
	const data = encoder.encode(concatenated);

	const hashBuffer = await crypto.subtle.digest('SHA-1', data);

	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a SHA-1 fingerprint for payment payload.
 * @param {string} apiKey - Merchant API key.
 * @param {string} username - Merchant username.
 * @param {string} password - Merchant password.
 * @param {string|number} mode - Payment mode identifier.
 * @param {string|number} paymentAmount - Amount used in the hash.
 * @param {string} merchantUniquePaymentId - Unique payment identifier.
 * @param {string} timestamp - Timestamp string.
 * @returns {Promise<string>} Promise resolving to the SHA-1 fingerprint hash.
 */
export async function createSHA1Hash(apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp) {
	const data = [apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp].join('|');
	console.log(`[createSHA1Hash] Fingerprint Payload 👇`);
	console.json({
		apiKey,
		username,
		password,
		mode,
		paymentAmount,
		merchantUniquePaymentId,
		timestamp
	});
	const hash = await sha1Hash(data);
	console.info(`[createSHA1Hash] SHA1 👉 ${hash}`);
	// Debugging output:
	const debugInput = [apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId].join('|');
	console.info('');
	console.info('');
	console.warn(`[createSHA1Hash] DEBUG:▶️`);
	console.warn(`[createSHA1Hash] 👇 Input without timestamp 👇`);
	console.warn({ debugInput });
	console.warn(`[createSHA1Hash] 👇 Output 👇`);
	console.warn({ hash });
	console.warn(`[createSHA1Hash] DEBUG:🔚`);
	console.info('');
	console.info('');
	return hash;
}

/**
 * Create a SHA-512 fingerprint for payment payload.
 * @param {string} apiKey - Merchant API key.
 * @param {string} username - Merchant username.
 * @param {string} password - Merchant password.
 * @param {string|number} mode - Payment mode identifier.
 * @param {string|number} paymentAmount - Amount used in the hash.
 * @param {string} merchantUniquePaymentId - Unique payment identifier.
 * @param {string} timestamp - Timestamp string.
 * @returns {Promise<string>} Promise resolving to the SHA-512 fingerprint hash.
 */
export async function createSHA512Hash(apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp) {
	const data = [apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp].join('|');
	console.log(`[createSHA512Hash] Fingerprint Payload 👇`);
	console.json({
		apiKey,
		username,
		password,
		mode,
		paymentAmount,
		merchantUniquePaymentId,
		timestamp
	});
	const hash = await sha512Hash(data);
	console.info(`[createSHA512Hash] SHA-512 👉 ${hash}`);
	return hash;
}

/**
 * Create a SHA-3-512 fingerprint for payment payload.
 * @param {string} apiKey - Merchant API key.
 * @param {string} username - Merchant username.
 * @param {string} password - Merchant password.
 * @param {string|number} mode - Payment mode identifier.
 * @param {string|number} paymentAmount - Amount used in the hash.
 * @param {string} merchantUniquePaymentId - Unique payment identifier.
 * @param {string} timestamp - Timestamp string.
 * @returns {string} Hex-encoded SHA-3-512 fingerprint hash.
 */
export function createSHA3_512Hash(apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp) {
	const data = [apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp].join('|');

	console.trace('[createSHA3_512Hash] Called from');
	console.log(`[createSHA3_512Hash] Fingerprint Payload 👇`);
	console.json({
		apiKey,
		username,
		password,
		mode,
		paymentAmount,
		merchantUniquePaymentId,
		timestamp
	});
	const hash = sha3_512(data);
	console.info(`[createSHA3_512Hash] SHA3-512 👉 ${hash}`);
	return hash;
}
