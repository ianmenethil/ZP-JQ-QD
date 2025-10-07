/**
 * ZenPay Plugin – Input Parameters (TypeScript-only)
 */

/** Literal strings in JSON for the `type` field */
export type ParamType = 'string' | 'string (uri)' | 'string (email)' | 'integer' | 'boolean';

const INPUT_PARAMS = `
[
    {
        "name": "url",
        "type": "string (uri)",
        "required": true,
        "condition": null,
        "description": "Plugin access URL (v4 recommended)",
        "default": null
    },
    {
        "name": "merchantCode",
        "type": "string",
        "required": true,
        "condition": null,
        "description": "As provided by Zenith",
        "default": null
    },
    {
        "name": "apiKey",
        "type": "string",
        "required": true,
        "condition": null,
        "description": "As provided by Zenith",
        "default": null
    },
    {
        "name": "fingerprint",
        "type": "string",
        "required": true,
        "condition": null,
        "description": "SHA3-512/SHA-512/SHA-1 hash of credential string",
        "default": null
    },
    {
        "name": "redirectUrl",
        "type": "string (uri)",
        "required": true,
        "condition": null,
        "description": "Redirect URL for result",
        "default": null
    },
    {
        "name": "merchantUniquePaymentId",
        "type": "string",
        "required": true,
        "condition": null,
        "description": "Unique payment ID from merchant",
        "default": null
    },
    {
        "name": "mode",
        "type": "integer",
        "required": false,
        "condition": null,
        "description": "0=Make Payment, 1=Tokenise, 2=Custom Payment, 3=Preauthorisation",
        "default": 0
    },
    {
        "name": "displayMode",
        "type": "integer",
        "required": false,
        "condition": null,
        "description": "0=Modal (default), 1=Redirect URL",
        "default": 0
    },
    {
        "name": "customerName",
        "type": "string",
        "required": true,
        "condition": "mode 0/2",
        "description": "Customer name",
        "default": null
    },
    {
        "name": "CustomerNameLabel",
        "type": "string",
        "required": false,
        "condition": null,
        "description": "Custom label to override default customer name display text",
        "default": null
    },
    {
        "name": "customerReference",
        "type": "string",
        "required": true,
        "condition": "mode 0/2",
        "description": "Customer reference",
        "default": null
    },
    {
        "name": "CustomerReferenceLabel",
        "type": "string",
        "required": false,
        "condition": null,
        "description": "Custom label to override default customer reference display text",
        "default": null
    },
    {
        "name": "paymentAmount",
        "type": "integer",
        "required": true,
        "condition": "mode 0/2",
        "description": "Amount in cents (0 if mode=2)",
        "default": null
    },
    {
        "name": "PaymentAmountLabel",
        "type": "string",
        "required": false,
        "condition": null,
        "description": "Custom label to override default payment amount display text",
        "default": null
    },
    {
        "name": "allowBankAcOneOffPayment",
        "type": "boolean",
        "required": true,
        "condition": "mode 0/2",
        "description": "Show bank account option",
        "default": null
    },
    {
        "name": "allowPayToOneOffPayment",
        "type": "boolean",
        "required": true,
        "condition": "mode 0/2",
        "description": "Show PayTo option",
        "default": null
    },
    {
        "name": "allowPayIdOneOffPayment",
        "type": "boolean",
        "required": true,
        "condition": "mode 0/2",
        "description": "Show PayID option",
        "default": null
    },
    {
        "name": "allowApplePayOneOffPayment",
        "type": "boolean",
        "required": false,
        "condition": null,
        "description": "Show Apple Pay option",
        "default": null
    },
    {
        "name": "allowGooglePayOneOffPayment",
        "type": "boolean",
        "required": false,
        "condition": null,
        "description": "Show Google Pay option",
        "default": null
    },
    {
        "name": "allowLatitudePayOneOffPayment",
        "type": "boolean",
        "required": false,
        "condition": null,
        "description": "Show Latitude Pay option",
        "default": null
    },
    {
        "name": "allowSlicePayOneOffPayment",
        "type": "boolean",
        "required": false,
        "condition": "mode 0",
        "description": "Show Slice Pay option only if the option is enable for the merchant",
        "default": false
    },
    {
        "name": "showFeeOnTokenising",
        "type": "boolean",
        "required": true,
        "condition": "mode 1",
        "description": "Show applicable fees for token",
        "default": null
    },
    {
        "name": "showFailedPaymentFeeOnTokenising",
        "type": "boolean",
        "required": false,
        "condition": null,
        "description": "Show failed payment fees for token",
        "default": null
    },
    {
        "name": "timestamp",
        "type": "string (date-time)",
        "required": false,
        "condition": "required for v4",
        "description": "UTC ISO 8601 timestamp",
        "default": null
    },
    {
        "name": "cardProxy",
        "type": "string",
        "required": false,
        "condition": null,
        "description": "Card proxy for payment",
        "default": null
    },
    {
        "name": "callbackUrl",
        "type": "string (uri)",
        "required": false,
        "condition": null,
        "description": "Callback URL for result POST",
        "default": null
    },
    {
        "name": "hideTermsAndConditions",
        "type": "boolean",
        "required": false,
        "condition": null,
        "description": "Hide Terms and Conditions",
        "default": false
    },
    {
        "name": "sendConfirmationEmailToMerchant",
        "type": "boolean",
        "required": false,
        "condition": null,
        "description": "Send confirmation email to merchant",
        "default": false
    },
    {
        "name": "additionalReference",
        "type": "string",
        "required": false,
        "condition": null,
        "description": "Additional reference for reconciliation",
        "default": null
    },
    {
        "name": "contactNumber",
        "type": "string",
        "required": false,
        "condition": null,
        "description": "Customer contact number",
        "default": null
    },
    {
        "name": "customerEmail",
        "type": "string (email)",
        "required": false,
        "condition": "required for v4",
        "description": "Customer email address",
        "default": null
    },
    {
        "name": "abn",
        "type": "string",
        "required": false,
        "condition": null,
        "description": "Australian Business Number",
        "default": null
    },
    {
        "name": "companyName",
        "type": "string",
        "required": false,
        "condition": null,
        "description": "Customer company name",
        "default": null
    },
    {
        "name": "title",
        "type": "string",
        "required": false,
        "condition": null,
        "description": "Plugin title",
        "default": "Process Payment"
    },
    {
        "name": "hideHeader",
        "type": "boolean",
        "required": false,
        "condition": null,
        "description": "Hide program header",
        "default": true
    },
    {
        "name": "hideMerchantLogo",
        "type": "boolean",
        "required": false,
        "condition": null,
        "description": "Hide merchant logo",
        "default": false
    },
    {
        "name": "overrideFeePayer",
        "type": "integer",
        "required": false,
        "condition": null,
        "description": "0=Default, 1=Merchant, 2=Customer",
        "default": 0
    },
    {
        "name": "userMode",
        "type": "integer",
        "required": false,
        "condition": null,
        "description": "0=Customer Facing, 1=Merchant Facing",
        "default": 0
    },
    {
        "name": "minHeight",
        "type": "integer",
        "required": false,
        "condition": null,
        "description": "Minimum height for UI",
        "default": null
    },
    {
        "name": "onPluginClose",
        "type": "string",
        "required": false,
        "condition": null,
        "description": "JS callback on plugin close",
        "default": null
    },
    {
        "name": "sendConfirmationEmailToCustomer",
        "type": "boolean",
        "required": false,
        "condition": null,
        "description": "Send confirmation email to customer",
        "default": false
    },
    {
        "name": "allowSaveCardUserOption",
        "type": "boolean",
        "required": false,
        "condition": null,
        "description": "Allow save card option",
        "default": false
    },
    {
        "name": "departureDate",
        "type": "string",
        "required": false,
        "condition": null,
        "description": "departureDate is required for Slice Pay. Provide date in UTC ISO 8601 format as departureDate. format: yyyy-MM-dd",
        "default": null
    }
]
`;

/** One parameter row as defined by JSON */
export interface InputParameter {
	name: string;
	type: ParamType | string; // accept future strings but validate best-effort
	required: boolean;
	condition: string | null;
	description: string;
	default: unknown | null;
}

/** Strongly-typed readonly view of the JSON */
export const INPUT_PARAMETERS: readonly InputParameter[] = JSON.parse(INPUT_PARAMS) as InputParameter[];

/** Return an object of defaults for parameters that specify a non-null default */
export function getDefaults(): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const p of INPUT_PARAMETERS) {
		if (p.default !== null && p.default !== undefined) out[p.name] = p.default;
	}
	return out;
}

/** Minimal email check (same leniency as many UI forms) */
function isEmail(x: string): boolean {
	// Intentionally simple. Replace with stricter validator if needed.
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
}

/** URI check using URL constructor */
function isUri(x: string): boolean {
	try {
		// Accept absolute URLs only
		const u = new URL(x);
		return Boolean(u.protocol && u.host);
	} catch {
		return false;
	}
}

function isIntegerNumber(x: unknown): boolean {
	return typeof x === 'number' && Number.isInteger(x);
}

function coerceValue(type: ParamType | string, value: unknown): unknown {
	switch (type) {
		case 'boolean':
			if (typeof value === 'boolean') return value;
			if (typeof value === 'string') {
				const v = value.trim().toLowerCase();
				if (v === 'true') return true;
				if (v === 'false') return false;
			}
			return value;

		case 'integer':
			if (isIntegerNumber(value)) return value;
			if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
				const n = Number(value);
				if (Number.isInteger(n)) return n;
			}
			return value;

		case 'string':
		case 'string (uri)':
		case 'string (email)':
		default:
			if (value === null) return value;
			return typeof value === 'string' ? value : String(value);
	}
}

function validateType(type: ParamType | string, value: unknown): string | null {
	switch (type) {
		case 'boolean':
			return typeof value === 'boolean' ? null : 'must be a boolean';

		case 'integer':
			return isIntegerNumber(value) ? null : 'must be an integer number';

		case 'string':
			return typeof value === 'string' ? null : 'must be a string';

		case 'string (uri)':
			return typeof value === 'string' && isUri(value) ? null : 'must be a valid URI';

		case 'string (email)':
			return typeof value === 'string' && isEmail(value) ? null : 'must be a valid email';

		default:
			// Unknown type label from JSON: accept strings by default
			return typeof value === 'string' ? null : 'must be a string';
	}
}

/** Result of validation */
export interface ValidationResult<T extends Record<string, unknown> = Record<string, unknown>> {
	ok: boolean;
	/** normalized values with defaults and coercions applied */
	value: T | null;
	/** human-readable errors keyed by parameter name */
	errors: Record<string, string>;
}

/**
 * Validate and normalize an options object against INPUT_PARAMETERS.
 * - Applies defaults
 * - Coerces strings to booleans/integers where obvious
 * - Checks required fields
 * - Validates URIs and emails when declared
 */
export function validateOptions<T extends Record<string, unknown>>(
	input: Partial<T> | undefined | null
): ValidationResult<T> {
	const errors: Record<string, string> = {};
	const merged: Record<string, unknown> = { ...getDefaults(), ...(input ?? {}) };

	for (const p of INPUT_PARAMETERS) {
		const raw = (merged as Record<string, unknown>)[p.name];

		// Required check
		if (p.required && (raw === undefined || raw === null || raw === '')) {
			errors[p.name] = 'is required';
			continue;
		}

		// Skip undefined non-required
		if (raw === undefined || raw === null) continue;

		// Coerce, then validate
		const coerced = coerceValue(p.type, raw);
		const typeErr = validateType(p.type, coerced);
		if (typeErr) {
			errors[p.name] = typeErr;
			continue;
		}
		merged[p.name] = coerced;
	}

	return {
		ok: Object.keys(errors).length === 0,
		value: Object.keys(errors).length === 0 ? (merged as T) : null,
		errors,
	};
}

/** Get a single parameter meta by name */
export function getParam(name: string): InputParameter | undefined {
	return INPUT_PARAMETERS.find((p) => p.name === name);
}

/** Convenience: list of required parameter names */
export function requiredParams(): string[] {
	return INPUT_PARAMETERS.filter((p) => p.required).map((p) => p.name);
}

/** Convenience: parameters relevant to a given mode string match in `condition` */
export function paramsForCondition(substr: string): InputParameter[] {
	const s = substr.toLowerCase();
	return INPUT_PARAMETERS.filter((p) => (p.condition ?? '').toLowerCase().includes(s));
}

// ============================================================================
// MODAL DISPLAY
// ============================================================================

import { bootstrap } from './globals.ts';

function escapeHtml(text: string): string {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

function renderInputParameters(params: InputParameter[], container: HTMLElement): void {
	if (!params || params.length === 0) {
		container.innerHTML = '<div class="alert alert-info">No parameters found.</div>';
		return;
	}

	const table = `
		<div class="table-responsive">
			<table class="table table-hover">
				<thead>
					<tr>
						<th>Parameter</th>
						<th>Type</th>
						<th>Required</th>
						<th>Condition</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					${params.map(param => `
						<tr>
							<td><code>${escapeHtml(param.name)}</code></td>
							<td><span class="badge bg-secondary">${escapeHtml(param.type)}</span></td>
							<td>${param.required ? '<span class="badge bg-danger">Required</span>' : '<span class="badge bg-secondary">Optional</span>'}</td>
							<td>${param.condition ? escapeHtml(param.condition) : '-'}</td>
							<td>${escapeHtml(param.description)}</td>
						</tr>
					`).join('')}
				</tbody>
			</table>
		</div>
	`;

	container.innerHTML = table;
}

function filterInputParameters(searchText: string): InputParameter[] {
	const q = searchText.toLowerCase();
	return INPUT_PARAMETERS.filter((p) =>
		!q ||
		p.name.toLowerCase().includes(q) ||
		p.description.toLowerCase().includes(q) ||
		p.type.toLowerCase().includes(q) ||
		(p.condition ?? '').toLowerCase().includes(q)
	);
}

export function initInputParametersModal(): void {
	const doc = globalThis.document;
	if (!doc) return;

	const modalEl = doc.getElementById('inputParametersModal');
	const searchInput = doc.getElementById('inputParamSearchInput') as HTMLInputElement | null;
	const content = doc.getElementById('inputParametersContent');
	const btn = doc.getElementById('inputParametersBtn');

	if (!modalEl || !content) {
		console.warn('[inputParameters] Required DOM elements not found');
		return;
	}

	const modal = new bootstrap.Modal(modalEl);

	const rerender = () => {
		const filtered = filterInputParameters(searchInput?.value ?? '');
		renderInputParameters(filtered, content);
	};

	if (searchInput) {
		searchInput.addEventListener('input', rerender);
	}

	if (btn) {
		btn.addEventListener('click', () => {
			if (searchInput) searchInput.value = '';
			rerender();
			modal.show();
		});
	}

	console.log('[inputParameters] Modal initialized with', INPUT_PARAMETERS.length, 'parameters');
}
