/**
 * ZenPay Plugin – Input Parameters (TypeScript-only)
 * Now uses external JSON data from jq-input-parameters.json
 */

import { bootstrap } from '../globals.ts';
import { showModal } from './modal.ts';

/** Literal strings in JSON for the `type` field */
// export type ParamType = 'string' | 'string (uri)' | 'string (email)' | 'integer' | 'boolean';

/** Input parameter interface matching the JSON structure */
export interface InputParameter {
	name: string;
	type: string;
	conditional: string;
	remarks: string;
}

/** Internal parameter format for compatibility */
export interface InternalInputParameter {
	name: string;
	type: string;
	required: boolean;
	condition: string | null;
	description: string;
	default: unknown | null;
}

/** Cache for loaded parameters */
let inputParametersCache: InternalInputParameter[] | null = null;

/**
 * Load input parameters from external JSON file
 */
async function loadInputParameters(): Promise<InternalInputParameter[]> {
	if (inputParametersCache) {
		return inputParametersCache;
	}

	try {
		const response = await fetch('/public/jq-input-parameters.json');
		if (!response.ok) {
			throw new Error(`Failed to load input parameters: ${response.statusText}`);
		}

		const externalData: InputParameter[] = await response.json();
		const convertedData = convertToInternalFormat(externalData);
		inputParametersCache = convertedData;
		return convertedData;
	} catch (error) {
		console.error('Error loading input parameters:', error);
		showModal(
			'Error Loading Parameters',
			'Failed to load input parameters. Please check your connection and try again.',
			'danger'
		);
		return [];
	}
}

/**
 * Convert external JSON format to internal format
 */
function convertToInternalFormat(externalData: InputParameter[]): InternalInputParameter[] {
	return externalData.map((param) => ({
		name: param.name,
		type: param.type,
		required: param.conditional === 'Required',
		condition: param.conditional === 'Required' ? null : param.conditional,
		description: param.remarks,
		default: null,
	}));
}

/**
 * Get input parameters (async version)
 */
export async function getInputParameters(): Promise<InternalInputParameter[]> {
	return await loadInputParameters();
}

/**
 * Return an object of defaults for parameters that specify a non-null default
 */
// export async function getDefaults(): Promise<Record<string, unknown>> {
// 	const parameters = await getInputParameters();
// 	const out: Record<string, unknown> = {};
// 	for (const p of parameters) {
// 		if (p.default !== null && p.default !== undefined) out[p.name] = p.default;
// 	}
// 	return out;
// }

/**
 * Filter input parameters based on search term
 */
async function filterInputParameters(searchTerm: string): Promise<InternalInputParameter[]> {
	const parameters = await getInputParameters();
	if (!searchTerm.trim()) return parameters;

	const term = searchTerm.toLowerCase();
	return parameters.filter(
		(param) =>
			param.name.toLowerCase().includes(term) ||
			param.description.toLowerCase().includes(term) ||
			param.type.toLowerCase().includes(term)
	);
}

/**
 * Render input parameters to DOM
 */
async function renderInputParameters(
	parameters: InternalInputParameter[],
	container: HTMLElement
): Promise<void> {
	if (!parameters.length) {
		container.innerHTML = '<p class="text-muted">No parameters found.</p>';
		return;
	}

	const html = parameters
		.map(
			(param) => `
		<div class="parameter-item mb-3 p-3 border rounded">
			<div class="d-flex justify-content-between align-items-start mb-2">
				<h6 class="mb-0 text-primary">${param.name}</h6>
				<span class="badge ${param.required ? 'bg-danger' : 'bg-secondary'}">${param.required ? 'Required' : 'Optional'}</span>
			</div>
			<div class="mb-2">
				<strong>Type:</strong> <code>${param.type}</code>
				${param.condition ? `<br><strong>Condition:</strong> ${param.condition}` : ''}
			</div>
			<div class="text-muted">
				${param.description}
			</div>
		</div>
	`
		)
		.join('');

	container.innerHTML = html;
}

/**
 * Initialize input parameters modal
 */
export async function initInputParametersModal(): Promise<void> {
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

	const rerender = async () => {
		const filtered = await filterInputParameters(searchInput?.value ?? '');
		await renderInputParameters(filtered, content);
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
	(window as any).inputParametersRerender = rerender;
	(window as any).inputParametersModal = modal;
	(window as any).inputParametersSearchInput = searchInput;

	const parameters = await getInputParameters();
	console.log('[inputParameters] Modal initialized with', parameters.length, 'parameters');
}

/**
 * Show input parameters modal with pre-filtered search
 */
export function showParameterModal(searchTerm: string): void {
	const modal = (window as any).inputParametersModal;
	const searchInput = (window as any).inputParametersSearchInput;
	const rerender = (window as any).inputParametersRerender;

	if (!modal || !searchInput || !rerender) {
		console.warn('[inputParameters] Modal not initialized');
		return;
	}

	searchInput.value = searchTerm;
	rerender();
	modal.show();
}
