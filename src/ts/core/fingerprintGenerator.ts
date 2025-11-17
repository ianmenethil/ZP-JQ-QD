/**
 * ZenPay Payment Plugin Demo - Cryptographic Fingerprint Generation
 * @module cryptographicFingerprintGenerator
 */

import { sha3_512 } from '../globals.ts';

// =============================
// Types
// =============================
export type HashAlgorithm = 'SHA-1' | 'SHA-512' | 'SHA-3-512';
export type ZenPayApiVersion = 'v3' | 'v4' | 'v5';
export type PaymentMode = '1' | '2' | string; // 1 = payment, 2 = tokenization
export type CryptographicFingerprint = string & { readonly __brand: 'CryptographicFingerprint' };

export interface PaymentFingerprintPayload {
	readonly apiKey: string;
	readonly username: string;
	readonly password: string;
	readonly mode: PaymentMode;
	readonly paymentAmount: string;
	readonly merchantUniquePaymentId: string;
	readonly timestamp: string;
}

export interface ProcessedCredentials {
	readonly apiKey: string;
	readonly username: string;
	readonly password: string;
}

export class FingerprintValidationError extends Error {
	constructor(
		message: string,
		public readonly fieldName: keyof PaymentFingerprintPayload,
		public readonly fieldValue: unknown
	) {
		super(message);
		this.name = 'FingerprintValidationError';
	}
}

export class FingerprintGenerationError extends Error {
	constructor(
		message: string,
		public readonly algorithm: HashAlgorithm,
		public override readonly cause?: Error
	) {
		super(message);
		this.name = 'FingerprintGenerationError';
	}
}

// =============================
// Constants
// =============================
const PLACEHOLDER_CREDENTIALS = {
	API_KEY: '<<API-KEY>>',
	USERNAME: '<<USERNAME>>',
	PASSWORD: '<<PASSWORD>>',
} as const;

const HASH_ALGORITHM_CONFIG: Record<ZenPayApiVersion, HashAlgorithm> = {
	v3: 'SHA-1',
	v4: 'SHA-512',
	v5: 'SHA-3-512',
} as const;

// =============================
// Small helpers
// =============================
function hexFromBuffer(buf: ArrayBuffer): string {
	return Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

function joinForHash(parts: readonly unknown[], omitTs: boolean): string {
	// keep v3 compat: optionally omit timestamp
	return (omitTs ? parts.slice(0, -1) : parts).join('|');
}

function removePlaceholderCredentials(c: {
	apiKey: string;
	username: string;
	password: string;
}): ProcessedCredentials {
	return {
		apiKey: c.apiKey === PLACEHOLDER_CREDENTIALS.API_KEY ? '' : c.apiKey,
		username: c.username === PLACEHOLDER_CREDENTIALS.USERNAME ? '' : c.username,
		password: c.password === PLACEHOLDER_CREDENTIALS.PASSWORD ? '' : c.password,
	};
}

// =============================
// Hash primitives
// =============================
async function webCryptoHash(alg: 'SHA-1' | 'SHA-512', input: string): Promise<string> {
	try {
		const data = new TextEncoder().encode(input);
		const buf = await crypto.subtle.digest(alg, data);
		return hexFromBuffer(buf);
	} catch (e) {
		throw new FingerprintGenerationError(
			`Failed to generate ${alg} hash`,
			alg,
			e instanceof Error ? e : undefined
		);
	}
}

function sha3Hash(input: string): string {
	try {
		return sha3_512(input);
	} catch (e) {
		throw new FingerprintGenerationError(
			'Failed to generate SHA-3-512 hash',
			'SHA-3-512',
			e instanceof Error ? e : undefined
		);
	}
}

// =============================
// Specific fingerprint creators
// =============================
export async function createSha1PaymentFingerprint(
	apiKey: string,
	username: string,
	password: string,
	mode: PaymentMode | number,
	paymentAmount: string | number,
	merchantUniquePaymentId: string,
	timestamp: string
): Promise<CryptographicFingerprint> {
	const omitTs = !!window.zpV3CompatMode?.omitTimestampFromHash;
	const pipe = joinForHash(
		[apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp],
		omitTs
	);
	const out = await webCryptoHash('SHA-1', pipe);
	return out as CryptographicFingerprint;
}

export async function createSha512PaymentFingerprint(
	apiKey: string,
	username: string,
	password: string,
	mode: PaymentMode | number,
	paymentAmount: string | number,
	merchantUniquePaymentId: string,
	timestamp: string
): Promise<CryptographicFingerprint> {
	const omitTs = !!window.zpV3CompatMode?.omitTimestampFromHash;
	const pipe = joinForHash(
		[apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp],
		omitTs
	);
	const out = await webCryptoHash('SHA-512', pipe);
	return out as CryptographicFingerprint;
}

export function createSha3PaymentFingerprint(
	apiKey: string,
	username: string,
	password: string,
	mode: PaymentMode | number,
	paymentAmount: string | number,
	merchantUniquePaymentId: string,
	timestamp: string
): CryptographicFingerprint {
	const omitTs = !!window.zpV3CompatMode?.omitTimestampFromHash;
	const pipe = joinForHash(
		[apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp],
		omitTs
	);
	const out = sha3Hash(pipe);
	return out as CryptographicFingerprint;
}

// =============================
// Main entry
// =============================
export async function generatePaymentSecurityFingerprint(
	payload: PaymentFingerprintPayload
): Promise<CryptographicFingerprint> {
	// sanitize creds
	const creds = removePlaceholderCredentials({
		apiKey: payload.apiKey,
		username: payload.username,
		password: payload.password,
	});
	if (!creds.apiKey || !creds.username || !creds.password) {
		console.warn('[generatePaymentSecurityFingerprint] Missing required credentials');
		return '' as CryptographicFingerprint;
	}

	// amount normalization: remove decimal unless tokenization (mode '2' -> force 0)
	const normalizedAmount =
		payload.mode === '2' ? '0' : String(payload.paymentAmount).replace('.', '');

	// pick version from DOM, fallback to v5
	const vInput = document.querySelector('input[name="version"]:checked') as HTMLInputElement | null;
	const ver = (vInput?.value ?? 'v5') as ZenPayApiVersion;
	const version: ZenPayApiVersion = ver in HASH_ALGORITHM_CONFIG ? ver : 'v5';

	if (version === 'v3') {
		return createSha1PaymentFingerprint(
			creds.apiKey,
			creds.username,
			creds.password,
			payload.mode,
			normalizedAmount,
			payload.merchantUniquePaymentId,
			payload.timestamp
		);
	}
	if (version === 'v4') {
		return createSha512PaymentFingerprint(
			creds.apiKey,
			creds.username,
			creds.password,
			payload.mode,
			normalizedAmount,
			payload.merchantUniquePaymentId,
			payload.timestamp
		);
	}
	return createSha3PaymentFingerprint(
		creds.apiKey,
		creds.username,
		creds.password,
		payload.mode,
		normalizedAmount,
		payload.merchantUniquePaymentId,
		payload.timestamp
	);
}

// =============================
// Utilities
// =============================
