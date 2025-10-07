/**
 * ZenPay Payment Plugin Demo - Cryptographic Fingerprint Generation
 * @module cryptographicFingerprintGenerator
 */

import { sha3_512 } from './globals.ts';
import { showError } from './modal.ts';
export interface FingerprintPayload {
    readonly apiKey: string;
    readonly username: string;
    readonly password: string;
    readonly mode: string;
    readonly paymentAmount: string;
    readonly merchantUniquePaymentId: string;
    readonly timestamp: string;
}
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

export interface HashGenerationOptions {
  readonly algorithm: HashAlgorithm;
  readonly includeTimestamp?: boolean;
  readonly useV3CompatMode?: boolean;
}

export class FingerprintValidationError extends Error {
  constructor(
    message: string,
    public readonly fieldName: keyof PaymentFingerprintPayload,
    public readonly fieldValue: unknown,
  ) {
    super(message);
    this.name = 'FingerprintValidationError';
  }
}

export class FingerprintGenerationError extends Error {
  constructor(
    message: string,
    public readonly algorithm: HashAlgorithm,
    public override readonly cause?: Error,
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

const TS_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

// =============================
// Small helpers
// =============================
function isIsoTimestamp(ts: string): boolean {
  return TS_REGEX.test(ts);
}

function requireNonEmpty(value: string, field: keyof PaymentFingerprintPayload): void {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new FingerprintValidationError(`${String(field)} is required and must be a non-empty string`, field, value);
  }
}

function requirePositiveAmount(amount: string): void {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    throw new FingerprintValidationError('paymentAmount is required and must be a positive number', 'paymentAmount', amount);
  }
}

function hexFromBuffer(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function joinForHash(parts: readonly unknown[], omitTs: boolean): string {
  // keep v3 compat: optionally omit timestamp
  return (omitTs ? parts.slice(0, -1) : parts).join('|');
}

function removePlaceholderCredentials(c: { apiKey: string; username: string; password: string }): ProcessedCredentials {
  return {
    apiKey: c.apiKey === PLACEHOLDER_CREDENTIALS.API_KEY ? '' : c.apiKey,
    username: c.username === PLACEHOLDER_CREDENTIALS.USERNAME ? '' : c.username,
    password: c.password === PLACEHOLDER_CREDENTIALS.PASSWORD ? '' : c.password,
  };
}

// =============================
// Validation
// =============================
function validatePaymentFingerprintPayload(p: PaymentFingerprintPayload): void {
  requireNonEmpty(p.apiKey, 'apiKey');
  requireNonEmpty(p.username, 'username');
  requireNonEmpty(p.password, 'password');
  requireNonEmpty(p.mode, 'mode');
  requirePositiveAmount(p.paymentAmount);
  requireNonEmpty(p.merchantUniquePaymentId, 'merchantUniquePaymentId');
  requireNonEmpty(p.timestamp, 'timestamp');
  if (!isIsoTimestamp(p.timestamp)) {
    throw new FingerprintValidationError('timestamp must be in format yyyy-mm-ddThh:mm:ss', 'timestamp', p.timestamp);
  }
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
    throw new FingerprintGenerationError(`Failed to generate ${alg} hash`, alg, e instanceof Error ? e : undefined);
  }
}

function sha3Hash(input: string): string {
  try {
    return sha3_512(input);
  } catch (e) {
    throw new FingerprintGenerationError('Failed to generate SHA-3-512 hash', 'SHA-3-512', e instanceof Error ? e : undefined);
  }
}

// =============================
// Public builders
// =============================
export function buildValidatedPaymentFingerprintPayload(
  apiKey: string,
  username: string,
  password: string,
  mode: PaymentMode,
  paymentAmount: string,
  merchantUniquePaymentId: string,
  timestamp: string,
): PaymentFingerprintPayload {
  const payload: PaymentFingerprintPayload = {
    apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp,
  };
  try {
    validatePaymentFingerprintPayload(payload);
    return payload;
  } catch (err) {
    if (err instanceof FingerprintValidationError) showError('Validation Error', err.message);
    throw err;
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
  timestamp: string,
): Promise<CryptographicFingerprint> {
  const omitTs = !!window.zpV3CompatMode?.omitTimestampFromHash;
  const pipe = joinForHash([apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp], omitTs);
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
  timestamp: string,
): Promise<CryptographicFingerprint> {
  const omitTs = !!window.zpV3CompatMode?.omitTimestampFromHash;
  const pipe = joinForHash([apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp], omitTs);
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
  timestamp: string,
): CryptographicFingerprint {
  const omitTs = !!window.zpV3CompatMode?.omitTimestampFromHash;
  const pipe = joinForHash([apiKey, username, password, mode, paymentAmount, merchantUniquePaymentId, timestamp], omitTs);
  const out = sha3Hash(pipe);
  return out as CryptographicFingerprint;
}

// =============================
// Main entry
// =============================
export async function generatePaymentSecurityFingerprint(
  payload: PaymentFingerprintPayload,
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
  const normalizedAmount = payload.mode === '2'
    ? '0'
    : String(payload.paymentAmount).replace('.', '');

  // pick version from DOM, fallback to v5
  const vInput = document.querySelector('input[name="version"]:checked') as HTMLInputElement | null;
  const ver = (vInput?.value ?? 'v5') as ZenPayApiVersion;
  const version: ZenPayApiVersion = ver in HASH_ALGORITHM_CONFIG ? ver : 'v5';

  if (version === 'v3') {
    return createSha1PaymentFingerprint(
      creds.apiKey, creds.username, creds.password,
      payload.mode, normalizedAmount, payload.merchantUniquePaymentId, payload.timestamp,
    );
  }
  if (version === 'v4') {
    return createSha512PaymentFingerprint(
      creds.apiKey, creds.username, creds.password,
      payload.mode, normalizedAmount, payload.merchantUniquePaymentId, payload.timestamp,
    );
  }
  return createSha3PaymentFingerprint(
    creds.apiKey, creds.username, creds.password,
    payload.mode, normalizedAmount, payload.merchantUniquePaymentId, payload.timestamp,
  );
}

// =============================
// Utilities
// =============================
export function isCryptographicFingerprint(value: unknown): value is CryptographicFingerprint {
  return typeof value === 'string' && value.length > 0 && /^[a-f0-9]+$/i.test(value);
}

export function getHashAlgorithmForVersion(version: ZenPayApiVersion): HashAlgorithm {
  return HASH_ALGORITHM_CONFIG[version];
}

export function getSupportedApiVersions(): ZenPayApiVersion[] {
  return Object.keys(HASH_ALGORITHM_CONFIG) as ZenPayApiVersion[];
}

export function isSupportedApiVersion(version: string): version is ZenPayApiVersion {
  return version in HASH_ALGORITHM_CONFIG;
}
