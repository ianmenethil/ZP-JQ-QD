/**
 * Error Codes Module
 * @file errorCodes.ts
 * @description Type-safe ZenPay error codes reference and management system
 */

import { bootstrap } from './globals.ts';

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

export interface ErrorCodeEntry {
	code: string;
	description: string;
	possibleCauses: string[];
	troubleshootingTips: string[];
}

export interface ErrorCode {
	readonly code: string;
	readonly category: ErrorCategory;
	readonly description: string;
	readonly solution: string;
	readonly possibleCauses: readonly string[];
	readonly troubleshootingTips: readonly string[];
}

const ERROR_CODES = `
[
    {
        "code": "E01",
        "description": "Make sure fingerprint and apikey are passed.",
        "possibleCauses": [
            "Make sure fingerprint and apikey are passed."
        ],
        "troubleshootingTips": [
            "Make sure fingerprint and apikey are passed."
        ]
    },
    {
        "code": "E02-*",
        "description": "MerchantUniquePaymentId cannot be empty.",
        "possibleCauses": [
            "MerchantUniquePaymentId cannot be empty."
        ],
        "troubleshootingTips": [
            "MerchantUniquePaymentId cannot be empty."
        ]
    },
    {
        "code": "E03-*",
        "description": "The fingerprint should be unique every time. This can be achieved by using new MerchantUniquePaymentId and current Timestamp every time the plugin is opened.",
        "possibleCauses": [
            "The fingerprint should be unique every time. This can be achieved by using new MerchantUniquePaymentId and current Timestamp every time the plugin is opened."
        ],
        "troubleshootingTips": [
            "The fingerprint should be unique every time. This can be achieved by using new MerchantUniquePaymentId and current Timestamp every time the plugin is opened."
        ]
    },
    {
        "code": "E04",
        "description": "Invalid Credentials. Applicable for V1 and V2 (V1 and V2 are deprecated).",
        "possibleCauses": [
            "Invalid Credentials. Applicable for V1 and V2 (V1 and V2 are deprecated)."
        ],
        "troubleshootingTips": [
            "Invalid Credentials. Applicable for V1 and V2 (V1 and V2 are deprecated)."
        ]
    },
    {
        "code": "E05",
        "description": "Make sure fingerprint and apikey are passed.",
        "possibleCauses": [
            "Make sure fingerprint and apikey are passed."
        ],
        "troubleshootingTips": [
            "Make sure fingerprint and apikey are passed."
        ]
    },
    {
        "code": "E06",
        "description": "Account is not active. Contact administrator.",
        "possibleCauses": [
            "Account is not active. Contact administrator."
        ],
        "troubleshootingTips": [
            "Account is not active. Contact administrator."
        ]
    },
    {
        "code": "E07",
        "description": "Provided endpoint is not supported.",
        "possibleCauses": [
            "Provided endpoint is not supported."
        ],
        "troubleshootingTips": [
            "Provided endpoint is not supported."
        ]
    },
    {
        "code": "E08",
        "description": "Invalid Credentials. Make sure fingerprint is correctly generated, refer to fingerprint generation logic.",
        "possibleCauses": [
            "Invalid Credentials. Make sure fingerprint is correctly generated, refer to fingerprint generation logic."
        ],
        "troubleshootingTips": [
            "Invalid Credentials. Make sure fingerprint is correctly generated, refer to fingerprint generation logic."
        ]
    },
    {
        "code": "E09",
        "description": "Security violation. Close and open the plugin with fresh fingerprint.",
        "possibleCauses": [
            "Security violation. Close and open the plugin with fresh fingerprint."
        ],
        "troubleshootingTips": [
            "Security violation. Close and open the plugin with fresh fingerprint."
        ]
    },
    {
        "code": "E10",
        "description": "Security violation. Close and open the plugin with fresh fingerprint.",
        "possibleCauses": [
            "Security violation. Close and open the plugin with fresh fingerprint."
        ],
        "troubleshootingTips": [
            "Security violation. Close and open the plugin with fresh fingerprint."
        ]
    },
    {
        "code": "E11",
        "description": "Timestamp cannot be empty. Make sure to pass same timestamp as in generated fingerprint.",
        "possibleCauses": [
            "Timestamp cannot be empty. Make sure to pass same timestamp as in generated fingerprint."
        ],
        "troubleshootingTips": [
            "Timestamp cannot be empty. Make sure to pass same timestamp as in generated fingerprint."
        ]
    },
    {
        "code": "E13",
        "description": "MerchantCode provided does not match with the provided credentials.",
        "possibleCauses": [
            "MerchantCode provided does not match with the provided credentials."
        ],
        "troubleshootingTips": [
            "MerchantCode provided does not match with the provided credentials."
        ]
    },
    {
        "code": "E14",
        "description": "Security violation. Close and open the plugin with fresh fingerprint.",
        "possibleCauses": [
            "Security violation. Close and open the plugin with fresh fingerprint."
        ],
        "troubleshootingTips": [
            "Security violation. Close and open the plugin with fresh fingerprint."
        ]
    },
    {
        "code": "E15",
        "description": "MerchantCode cannot be empty (V4 onwards).",
        "possibleCauses": [
            "MerchantCode cannot be empty (V4 onwards)."
        ],
        "troubleshootingTips": [
            "MerchantCode cannot be empty (V4 onwards)."
        ]
    },
    {
        "code": "E16",
        "description": "Version can not be empty.",
        "possibleCauses": [
            "Version can not be empty."
        ],
        "troubleshootingTips": [
            "Version can not be empty."
        ]
    },
    {
        "code": "E17",
        "description": "CustomerEmail can not be empty (V4 onwards).",
        "possibleCauses": [
            "CustomerEmail can not be empty (V4 onwards)."
        ],
        "troubleshootingTips": [
            "CustomerEmail can not be empty (V4 onwards)."
        ]
    },
    {
        "code": "E18",
        "description": "DepartureDate is required for Slice Pay.",
        "possibleCauses": [
            "DepartureDate is required for Slice Pay."
        ],
        "troubleshootingTips": [
            "DepartureDate is required for Slice Pay."
        ]
    }
]
`;

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class ErrorCodesInitializationError extends Error {
	constructor(
		message: string,
		public override readonly cause?: Error
	) {
		super(message);
		this.name = 'ErrorCodesInitializationError';
	}
}

// ============================================================================
// LOAD + DERIVE
// ============================================================================

const RAW: readonly ErrorCodeEntry[] = JSON.parse(ERROR_CODES) as ErrorCodeEntry[];

/** Heuristic category from description/code */
function deriveCategory(e: ErrorCodeEntry): ErrorCategory {
	const t = `${e.code} ${e.description}`.toLowerCase();
	if (t.includes('invalid credential') || t.includes('apikey') || t.includes('credentials'))
		return 'Authentication';
	if (
		t.includes('cannot be empty') ||
		t.includes('required') ||
		t.includes('provided does not match')
	)
		return 'Validation';
	if (t.includes('security violation') || t.includes('fingerprint')) return 'Security';
	if (t.includes('account is not active')) return 'Account';
	if (t.includes('endpoint is not supported') || t.includes('version can not be empty'))
		return 'Configuration';
	return 'Other';
}

/** Pick first troubleshooting tip or fallback to description */
function deriveSolution(e: ErrorCodeEntry): string {
	return e.troubleshootingTips?.[0] ?? e.description;
}

/** Array for rendering */
export const ERROR_CODES_ARRAY: readonly ErrorCode[] = Object.freeze(
	RAW.map((e) => ({
		code: e.code,
		category: deriveCategory(e),
		description: e.description,
		solution: deriveSolution(e),
		possibleCauses: Object.freeze(e.possibleCauses ?? []),
		troubleshootingTips: Object.freeze(e.troubleshootingTips ?? []),
	}))
);

/** Map for O(1) lookup */
export const ERROR_CODE_MAP: Readonly<Record<string, ErrorCode>> = Object.freeze(
	Object.fromEntries(ERROR_CODES_ARRAY.map((e) => [e.code, e])) as Record<string, ErrorCode>
);

// ============================================================================
// QUERIES
// ============================================================================

export function getErrorByCode(code: string): ErrorCode | null {
	return ERROR_CODE_MAP[code] ?? null;
}

export function getAllErrors(): ErrorCode[] {
	return [...ERROR_CODES_ARRAY];
}

export function isValidErrorCode(code: string): code is keyof typeof ERROR_CODE_MAP {
	return Object.prototype.hasOwnProperty.call(ERROR_CODE_MAP, code);
}

// ============================================================================
// RENDERING (browser guarded)
// ============================================================================

function getUniqueCategories(): ErrorCategory[] {
	const s = new Set<ErrorCategory>();
	for (const e of ERROR_CODES_ARRAY) s.add(e.category);
	return [...s].sort();
}

function filterErrorCodes(searchText?: string, category?: string): ErrorCode[] {
	const q = (searchText ?? '').toLowerCase();
	return ERROR_CODES_ARRAY.filter((e) => {
		const matchQ =
			q.length === 0 ||
			e.code.toLowerCase().includes(q) ||
			e.description.toLowerCase().includes(q) ||
			e.solution.toLowerCase().includes(q) ||
			e.category.toLowerCase().includes(q);
		const matchCat = !category || e.category === category;
		return matchQ && matchCat;
	});
}

function renderErrorCodes(list: readonly ErrorCode[]): void {
	const doc = globalThis.document;
	if (!doc) return;

	const tableBody = doc.getElementById('errorCodesTableBody');
	const noResultsElement = doc.getElementById('noErrorCodesFound');
	if (!tableBody || !noResultsElement) return;

	tableBody.innerHTML = '';

	if (list.length === 0) {
		noResultsElement.classList.remove('d-none');
		return;
	}
	noResultsElement.classList.add('d-none');

	for (const e of list) {
		const row = doc.createElement('tr');

		const codeCell = doc.createElement('td');
		codeCell.innerHTML = `<span class="badge bg-primary-subtle text-primary">${e.code}</span>`;

		const categoryCell = doc.createElement('td');
		categoryCell.textContent = e.category;

		const descriptionCell = doc.createElement('td');
		descriptionCell.innerHTML = `
      <div>${e.description}</div>
      <div class="text-secondary small mt-1"><strong>Solution:</strong> ${e.solution}</div>
    `;

		row.appendChild(codeCell);
		row.appendChild(categoryCell);
		row.appendChild(descriptionCell);

		tableBody.appendChild(row);
	}
}

function updateModalTheme(): void {
	const doc = globalThis.document;
	if (!doc) return;

	const modal = doc.getElementById('errorCodesModal');
	if (!modal) return;

	const isDark = doc.documentElement.getAttribute('data-bs-theme') === 'dark';
	modal.querySelectorAll('.table').forEach((tbl) => {
		if (isDark) tbl.classList.add('table-dark');
		else tbl.classList.remove('table-dark');
	});
}

// ============================================================================
// MODAL
// ============================================================================

function initErrorCodesModal(): void {
	const doc = globalThis.document;
	if (!doc) return;

	const modalEl = doc.getElementById('errorCodesModal');
	const searchInput = doc.getElementById('errorSearchInput') as HTMLInputElement | null;
	const categoryFilter = doc.getElementById('errorCategoryFilter') as HTMLSelectElement | null;
	const errorCodesBtn = doc.getElementById('errorCodesBtn');

	if (!modalEl || !searchInput || !categoryFilter) {
		console.warn('[errorCodes] Required DOM elements not found for error codes modal:', {
			modalEl: !!modalEl,
			searchInput: !!searchInput,
			categoryFilter: !!categoryFilter,
		});
		return;
	}

	const modal = new bootstrap.Modal(modalEl);

	// categories
	const categories = getUniqueCategories();
	for (const c of categories) {
		const opt = doc.createElement('option');
		opt.value = c;
		opt.textContent = c;
		categoryFilter.appendChild(opt);
	}

	const rerender = () => {
		const filtered = filterErrorCodes(searchInput.value, categoryFilter.value);
		renderErrorCodes(filtered);
	};

	searchInput.addEventListener('input', rerender);
	categoryFilter.addEventListener('change', rerender);

	if (errorCodesBtn) {
		errorCodesBtn.addEventListener('click', () => {
			searchInput.value = '';
			categoryFilter.value = '';
			renderErrorCodes(ERROR_CODES_ARRAY);
			modal.show();
		});
	}

	modalEl.addEventListener('hidden.bs.modal', () => {
		searchInput.value = '';
		categoryFilter.value = '';
	});

	modalEl.addEventListener('shown.bs.modal', updateModalTheme);

	const themeToggle = doc.getElementById('themeToggle');
	if (themeToggle) {
		themeToggle.addEventListener('click', () => {
			if (modalEl.classList.contains('show')) setTimeout(updateModalTheme, 100);
		});
	}
}

// ============================================================================
// PUBLIC UI API
// ============================================================================

export function showErrorCodesModal(): void {
	const doc = globalThis.document;
	if (!doc) return;
	const modalEl = doc.getElementById('errorCodesModal');
	if (modalEl) new bootstrap.Modal(modalEl).show();
}

export function showErrorDetails(code: string): void {
	const doc = globalThis.document;
	if (!doc) return;
	const searchInput = doc.getElementById('errorSearchInput') as HTMLInputElement | null;
	const categoryFilter = doc.getElementById('errorCategoryFilter') as HTMLSelectElement | null;

	const entry = getErrorByCode(code);
	if (!entry) return;

	if (searchInput && categoryFilter) {
		searchInput.value = code;
		categoryFilter.value = '';
		renderErrorCodes(filterErrorCodes(code, ''));
	}
	showErrorCodesModal();
}

// ============================================================================
// INIT
// ============================================================================

export function initErrorCodesSystem(): void {
	const doc = globalThis.document;
	if (!doc) return;

	const boot = () => {
		try {
			initErrorCodesModal();
		} catch (error) {
			console.error('[errorCodes] Failed to initialize error codes modal:', error);
		}
	};

	if (doc.readyState === 'loading') {
		doc.addEventListener('DOMContentLoaded', boot);
	} else {
		// Add a small delay to ensure all modules are loaded
		setTimeout(boot, 100);
	}

	(globalThis as any).ZenPayErrorCodes = {
		getErrorByCode,
		getAllErrors,
		showModal: showErrorCodesModal,
		showErrorDetails,
	} as const;
}
