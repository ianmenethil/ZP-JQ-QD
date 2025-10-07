/**
 * ZenPay Plugin – Output Parameters (TypeScript-only)
 */

export type OutputParamType = 'string' | 'number' | 'boolean';

export interface OutputParameter {
	name: string;
	type: OutputParamType | string; // tolerate future labels
	required: boolean;
	condition: string | null;
	description: string;
	default: unknown | null;
}

const OUTPUT_PARAMS = `
[
    {
        "name": "CustomerName",
        "type": "string",
        "required": true,
        "condition": null,
        "description": "Same as input parameter.",
        "default": null
    },
    {
        "name": "CustomerReference",
        "type": "string",
        "required": true,
        "condition": null,
        "description": "Same as input parameter.",
        "default": null
    },
    {
        "name": "MerchantUniquePaymentId",
        "type": "string",
        "required": true,
        "condition": null,
        "description": "Same as input parameter.",
        "default": null
    },
    {
        "name": "AccountOrCardNo",
        "type": "string",
        "required": true,
        "condition": null,
        "description": "Account or card number used to process payment.",
        "default": null
    },
    {
        "name": "PaymentReference",
        "type": "string",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Payment reference. (applicable for Payment)",
        "default": null
    },
    {
        "name": "PreauthReference",
        "type": "string",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Preauthorization reference. (applicable for Preauthorization)",
        "default": null
    },
    {
        "name": "ProcessorReference",
        "type": "string",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Processor reference.",
        "default": null
    },
    {
        "name": "PaymentStatus",
        "type": "number",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Possible values: 0 => Pending, 1 => Error, 3 => Successful, 4 => Failed, 5 => Cancelled, 6 => Suppressed, 7 => InProgress",
        "default": null
    },
    {
        "name": "PaymentStatusString",
        "type": "string",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Possible values: Pending, Error, Successful, Failed, Cancelled, Suppressed, InProgress",
        "default": null
    },
    {
        "name": "PreauthStatus",
        "type": "number",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Possible values: 0 => Pending, 1 => Error, 3 => Successful, 4 => Failed, 5 => Cancelled, 6 => Suppressed, 7 => InProgress",
        "default": null
    },
    {
        "name": "PreauthStatusString",
        "type": "string",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Possible values: Pending, Error, Successful, Failed, Cancelled, Suppressed, InProgress",
        "default": null
    },
    {
        "name": "TransactionSource",
        "type": "number",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Possible values: 36 => Public_OnlineOneOffPayment",
        "default": null
    },
    {
        "name": "TransactionSourceString",
        "type": "string",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Possible values: Public_OnlineOneOffPayment",
        "default": null
    },
    {
        "name": "ProcessingDate",
        "type": "string",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "The date and time when the payment is processed. Format: yyyy-MM-ddTHH:mm:ss",
        "default": null
    },
    {
        "name": "SettlementDate",
        "type": "string",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "The date when the payment is settled to the merchant. Format: yyyy-MM-dd",
        "default": null
    },
    {
        "name": "IsPaymentSettledToMerchant",
        "type": "boolean",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Flag to indicate whether the funds are settled to the merchant or not.",
        "default": null
    },
    {
        "name": "BaseAmount",
        "type": "number",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Same as payment amount.",
        "default": null
    },
    {
        "name": "CustomerFee",
        "type": "number",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Fee charged to the customer to process the payment.",
        "default": null
    },
    {
        "name": "ProcessedAmount",
        "type": "number",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Base amount + Customer fee. (applicable for Payment)",
        "default": null
    },
    {
        "name": "PreauthAmount",
        "type": "number",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Base amount + Customer fee. (applicable for Preauthorization)",
        "default": null
    },
    {
        "name": "FundsToMerchant",
        "type": "number",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Base amount - Merchant fee, if applicable.",
        "default": null
    },
    {
        "name": "MerchantCode",
        "type": "string",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Merchant code.",
        "default": null
    },
    {
        "name": "FailureCode",
        "type": "string",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Populated only when payment is not successful.",
        "default": null
    },
    {
        "name": "FailureReason",
        "type": "string",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Populated only when payment is not successful.",
        "default": null
    },
    {
        "name": "Token",
        "type": "string",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Returned only if payment is processed using cardProxy input parameter. The value will be same as cardProxy.",
        "default": null
    },
    {
        "name": "PayId",
        "type": "string",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Returned only if payment is processed using PayID.",
        "default": null
    },
    {
        "name": "PayIdName",
        "type": "string",
        "required": false,
        "condition": "mode === 0 || mode === 2",
        "description": "Returned only if payment is processed using PayID. Display name for the PayID.",
        "default": null
    },
    {
        "name": "Token",
        "type": "string",
        "required": false,
        "condition": "mode === 1",
        "description": "The proxy that can be saved and then used to process payment using API or payment plugin.",
        "default": null
    },
    {
        "name": "CardType",
        "type": "string",
        "required": false,
        "condition": "mode === 1",
        "description": "Type of card i.e. Visa, MasterCard, American Express or Bank Account.",
        "default": null
    },
    {
        "name": "CardHolderName",
        "type": "string",
        "required": false,
        "condition": "mode === 1",
        "description": "Card holder name provided by the user. Returned only if user selects credit/debit card.",
        "default": null
    },
    {
        "name": "CardNumber",
        "type": "string",
        "required": false,
        "condition": "mode === 1",
        "description": "Obfuscated card number provided by the user. Returned only if user selects credit/debit card.",
        "default": null
    },
    {
        "name": "CardExpiry",
        "type": "string",
        "required": false,
        "condition": "mode === 1",
        "description": "Card expiry date. Returned only if user selects credit/debit card. Format: MM/CCYY",
        "default": null
    },
    {
        "name": "AccountName",
        "type": "string",
        "required": false,
        "condition": "mode === 1",
        "description": "Account name provided by the user. Returned only if user selects bank account.",
        "default": null
    },
    {
        "name": "AccountNumber",
        "type": "string",
        "required": false,
        "condition": "mode === 1",
        "description": "Obfuscated account number provided by the user. Returned only if user selects bank account.",
        "default": null
    },
    {
        "name": "PayId",
        "type": "string",
        "required": false,
        "condition": "mode === 1",
        "description": "Returned only if payment is processed using PayID.",
        "default": null
    },
    {
        "name": "PayIdName",
        "type": "string",
        "required": false,
        "condition": "mode === 1",
        "description": "Returned only if payment is processed using PayID. Display name for the PayID.",
        "default": null
    },
    {
        "name": "IsRestrictedCard",
        "type": "boolean",
        "required": false,
        "condition": "mode === 1",
        "description": "Flag to indicate whether the card is restricted or not.",
        "default": null
    },
    {
        "name": "PaymentAmount",
        "type": "number",
        "required": false,
        "condition": "mode === 1",
        "description": "Same as input parameter.",
        "default": null
    },
    {
        "name": "CustomerFee",
        "type": "number",
        "required": false,
        "condition": "mode === 1",
        "description": "Customer fee applicable to process a payment of amount specified in PaymentAmount input parameter.",
        "default": null
    },
    {
        "name": "MerchantFee",
        "type": "number",
        "required": false,
        "condition": "mode === 1",
        "description": "Merchant fee applicable to process a payment of amount specified in PaymentAmount input parameter.",
        "default": null
    },
    {
        "name": "ProcessingAmount",
        "type": "number",
        "required": false,
        "condition": "mode === 1",
        "description": "The total amount that will be processed i.e. PaymentAmount + CustomerFee.",
        "default": null
    }
]
`;

/** Loaded from JSON as a readonly array */
export const OUTPUT_PARAMETERS: readonly OutputParameter[] = JSON.parse(OUTPUT_PARAMS) as OutputParameter[];

/** Unique parameter names (across all modes) */
export const OUTPUT_PARAM_NAMES: readonly string[] = Object.freeze(
	Array.from(new Set(OUTPUT_PARAMETERS.map((p) => p.name)))
);

/** Match simple condition strings like "mode === 0 || mode === 2" */
function matchesCondition(cond: string | null, mode: number): boolean {
	if (!cond) return true;
	const nums = Array.from(cond.matchAll(/mode\s*===\s*(\d+)/g)).map((m) => Number(m[1]));
	return nums.length ? nums.includes(mode) : false;
}

/** Parameters applicable to a given mode (0=Payment, 1=Tokenize, 2=Preauth, per your JSON) */
export function paramsForMode(mode: 0 | 1 | 2): OutputParameter[] {
	return OUTPUT_PARAMETERS.filter((p) => matchesCondition(p.condition, mode));
}

/** Multi-map index: name -> all variants (handles duplicates like Token/PayId across modes) */
export function indexByName(): Readonly<Record<string, OutputParameter[]>> {
	const map: Record<string, OutputParameter[]> = {};
	for (const p of OUTPUT_PARAMETERS) {
		(map[p.name] ||= []).push(p);
	}
	return map;
}

/** Get metadata for a parameter name, optionally narrowed by mode */
export function describeParam(name: string, mode?: 0 | 1 | 2): OutputParameter[] {
	const all = indexByName()[name] ?? [];
	if (mode === undefined || mode === null) return all;
	return all.filter((p) => matchesCondition(p.condition, mode));
}

/** Collect JSON defaults (non-null only) */
export function getDefaults(): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const p of OUTPUT_PARAMETERS) {
		if (p.default !== null && p.default !== undefined) out[p.name] = p.default;
	}
	return out;
}

/**
 * Project an object to only fields relevant for a mode.
 * Leaves values untouched (no coercion). Useful for response shaping.
 */
export function pickForMode<T extends Record<string, unknown>>(
	mode: 0 | 1 | 2,
	obj: T
): Partial<T> {
	const allowed = new Set(paramsForMode(mode).map((p) => p.name));
	const out: Partial<T> = {};
	for (const k in obj) if (allowed.has(k)) out[k as keyof T] = obj[k];
	return out;
}

/** Simple type guard by declared `type` (optional helper) */
export function validateTypesForMode(
	mode: 0 | 1 | 2,
	obj: Record<string, unknown>
): Record<string, string> {
	const errors: Record<string, string> = {};
	const spec = paramsForMode(mode);
	const byName: Record<string, OutputParameter> = Object.fromEntries(spec.map((s) => [s.name, s]));

	for (const [k, v] of Object.entries(obj)) {
		const p = byName[k];
		if (!p) continue;
		const want = p.type;
		if (want === 'string' && typeof v !== 'string') errors[k] = 'must be a string';
		else if (want === 'number' && typeof v !== 'number') errors[k] = 'must be a number';
		else if (want === 'boolean' && typeof v !== 'boolean') errors[k] = 'must be a boolean';
	}
	return errors;
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

function renderOutputParameters(params: OutputParameter[], container: HTMLElement): void {
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

function filterOutputParameters(searchText: string): OutputParameter[] {
	const q = searchText.toLowerCase();
	return OUTPUT_PARAMETERS.filter((p) =>
		!q ||
		p.name.toLowerCase().includes(q) ||
		p.description.toLowerCase().includes(q) ||
		p.type.toLowerCase().includes(q) ||
		(p.condition ?? '').toLowerCase().includes(q)
	);
}

export function initOutputParametersModal(): void {
	const doc = globalThis.document;
	if (!doc) return;

	const modalEl = doc.getElementById('outputParametersModal');
	const searchInput = doc.getElementById('outputParamSearchInput') as HTMLInputElement | null;
	const content = doc.getElementById('outputParametersContent');
	const btn = doc.getElementById('outputParametersBtn');

	if (!modalEl || !content) {
		console.warn('[outputParameters] Required DOM elements not found');
		return;
	}

	const modal = new bootstrap.Modal(modalEl);

	const rerender = () => {
		const filtered = filterOutputParameters(searchInput?.value ?? '');
		renderOutputParameters(filtered, content);
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

	console.log('[outputParameters] Modal initialized with', OUTPUT_PARAMETERS.length, 'parameters');
}
