/**
 * Error Codes Module
 * Now uses external JSON data from jq-error-codes.json
 */

import { bootstrap } from '../globals.ts';
import { showModal } from './modal.ts';

// ============================================================================
// TYPES (JSON shape and derived view model)
// ============================================================================

export type ErrorCategory =
	| 'Authentication'
	| 'Validation'
	| 'Security'
	| 'Account'
	| 'Configuration'
	| 'Other';

export interface ErrorCode {
	readonly code: string;
	readonly category: ErrorCategory;
	readonly description: string;
	readonly possibleCauses: readonly string[];
	readonly troubleshootingTips: readonly string[];
}

/** External JSON structure */
export interface ExternalErrorCode {
	code: string;
	description: string;
}

/** Cache for loaded error codes */
let errorCodesCache: ErrorCode[] | null = null;

/**
 * Load error codes from external JSON file
 */
async function loadErrorCodes(): Promise<ErrorCode[]> {
	if (errorCodesCache) {
		return errorCodesCache;
	}

	try {
		const response = await fetch('/public/jq-error-codes.json');
		if (!response.ok) {
			throw new Error(`Failed to load error codes: ${response.statusText}`);
		}

		const externalData: ExternalErrorCode[] = await response.json();
		const convertedData = convertToInternalFormat(externalData);
		errorCodesCache = convertedData;
		return convertedData;
	} catch (error) {
		console.error('Error loading error codes:', error);
		showModal(
			'Error Loading Error Codes',
			'Failed to load error codes. Please check your connection and try again.',
			'danger'
		);
		return [];
	}
}

/**
 * Convert external JSON format to internal format
 */
function convertToInternalFormat(externalData: ExternalErrorCode[]): ErrorCode[] {
	return externalData.map((error) => ({
		code: error.code,
		category: categorizeErrorCode(error.code),
		description: error.description,
		possibleCauses: generatePossibleCauses(error.code),
		troubleshootingTips: generateTroubleshootingTips(error.code),
	}));
}

/**
 * Categorize error code based on code pattern
 */
function categorizeErrorCode(code: string): ErrorCategory {
	if (code.startsWith('E01') || code.startsWith('E02')) return 'Authentication';
	if (code.startsWith('E03') || code.startsWith('E04')) return 'Validation';
	if (code.startsWith('E05') || code.startsWith('E06')) return 'Security';
	if (code.startsWith('E07') || code.startsWith('E08')) return 'Account';
	if (code.startsWith('E09') || code.startsWith('E10')) return 'Configuration';
	return 'Other';
}

/**
 * Generate possible causes based on error code
 */
function generatePossibleCauses(code: string): string[] {
	const causes: Record<string, string[]> = {
		E01: ['Missing or invalid API key', 'Incorrect authentication credentials'],
		E02: ['Invalid merchant code', 'Merchant account not found'],
		E03: ['Invalid payment amount', 'Amount exceeds limits'],
		E04: ['Invalid card details', 'Card number format error'],
		E05: ['Security violation detected', 'Suspicious transaction pattern'],
		E06: ['Invalid fingerprint', 'Hash calculation error'],
		E07: ['Account suspended', 'Insufficient permissions'],
		E08: ['Account not found', 'Invalid account reference'],
		E09: ['Configuration error', 'Missing required settings'],
		E10: ['System configuration issue', 'Service unavailable'],
	};

	return causes[code] || ['Unknown error', 'Please contact support'];
}

/**
 * Generate troubleshooting tips based on error code
 */
function generateTroubleshootingTips(code: string): string[] {
	const tips: Record<string, string[]> = {
		E01: ['Verify API key is correct', 'Check authentication credentials'],
		E02: ['Confirm merchant code', 'Contact support for account verification'],
		E03: ['Check payment amount format', 'Verify amount is within limits'],
		E04: ['Validate card number format', 'Check card expiration date'],
		E05: ['Review transaction details', 'Contact security team if needed'],
		E06: ['Recalculate fingerprint hash', 'Verify hash algorithm'],
		E07: ['Check account status', 'Contact account manager'],
		E08: ['Verify account reference', 'Check account configuration'],
		E09: ['Review system settings', 'Check configuration files'],
		E10: ['Check system status', 'Contact technical support'],
	};

	return tips[code] || ['Review error details', 'Contact support for assistance'];
}

/**
 * Get error codes (async version)
 */
export async function getErrorCodes(): Promise<ErrorCode[]> {
	return await loadErrorCodes();
}

/**
 * Filter error codes based on search term
 */
async function filterErrorCodes(searchTerm: string): Promise<ErrorCode[]> {
	const errorCodes = await getErrorCodes();
	if (!searchTerm.trim()) return errorCodes;

	const term = searchTerm.toLowerCase();
	return errorCodes.filter(
		(error) =>
			error.code.toLowerCase().includes(term) ||
			error.description.toLowerCase().includes(term) ||
			error.category.toLowerCase().includes(term)
	);
}

/**
 * Render error codes to DOM
 */
async function renderErrorCodes(errorCodes: ErrorCode[], container: HTMLElement): Promise<void> {
	if (!errorCodes.length) {
		container.innerHTML =
			'<tr><td colspan="3" class="text-center text-muted">No error codes found.</td></tr>';
		return;
	}

	const html = errorCodes
		.map(
			(error) => `
		<tr>
			<td><code class="text-danger">${error.code}</code></td>
			<td><span class="badge bg-secondary">${error.category}</span></td>
			<td>${error.description}</td>
		</tr>
	`
		)
		.join('');

	container.innerHTML = html;
}

/**
 * Initialize error codes modal
 */
export async function initErrorCodesSystem(): Promise<void> {
	const doc = globalThis.document;
	if (!doc) return;

	const modalEl = doc.getElementById('errorCodesModal');
	const searchInput = doc.getElementById('errorSearchInput') as HTMLInputElement | null;
	const content = doc.getElementById('errorCodesTableBody');
	const btn = doc.getElementById('errorCodesBtn');

	if (!modalEl || !content) {
		console.warn('[errorCodes] Required DOM elements not found');
		return;
	}

	const modal = new bootstrap.Modal(modalEl);

	const rerender = async () => {
		const filtered = await filterErrorCodes(searchInput?.value ?? '');
		await renderErrorCodes(filtered, content);
	};

	if (searchInput) {
		searchInput.addEventListener('input', rerender);
	}

	if (btn) {
		btn.addEventListener('click', async () => {
			if (searchInput) searchInput.value = '';
			await rerender();
			modal.show();
		});
	}

	// Make rerender globally available for info icon functions
	window.errorCodesRerender = rerender;
	window.errorCodesModal = modal;
	if (searchInput) {
		window.errorCodesSearchInput = searchInput;
	}

	const errorCodes = await getErrorCodes();
	console.log('[errorCodes] Modal initialized with', errorCodes.length, 'error codes');
}
