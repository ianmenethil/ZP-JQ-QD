/**
 * ZenPay Plugin – Output Parameters (TypeScript-only)
 * Now uses external JSON data from jq-output-parameters.json
 */

import { bootstrap } from '../globals.ts';
import { showModal } from './modal.ts';

type OutputParamType = 'string' | 'number' | 'boolean';

export interface OutputParameter {
	name: string;
	type: OutputParamType | string;
	required: boolean;
	condition: string | null;
	description: string;
	default: unknown | null;
}

/** External JSON structure */
export interface ExternalOutputParameter {
	parameter: string;
	value: string;
}

/** External JSON structure for combined data */
export interface ExternalOutputData {
	mode02: ExternalOutputParameter[];
	mode1: ExternalOutputParameter[];
	combined: ExternalOutputParameter[];
}

/** Cache for loaded parameters */
let outputParametersCache: OutputParameter[] | null = null;

/**
 * Load output parameters from external JSON file
 */
async function loadOutputParameters(): Promise<OutputParameter[]> {
	if (outputParametersCache) {
		return outputParametersCache;
	}

	try {
		const response = await fetch('/public/jq-output-parameters.json');
		if (!response.ok) {
			throw new Error(`Failed to load output parameters: ${response.statusText}`);
		}

		const externalData: ExternalOutputData = await response.json();
		const convertedData = convertToInternalFormat(externalData);
		outputParametersCache = convertedData;
		return convertedData;
	} catch (error) {
		console.error('Error loading output parameters:', error);
		showModal(
			'Error Loading Parameters',
			'Failed to load output parameters. Please check your connection and try again.',
			'danger'
		);
		return [];
	}
}

/**
 * Convert external JSON format to internal format
 */
function convertToInternalFormat(externalData: ExternalOutputData): OutputParameter[] {
	const allParams = [...externalData.mode02, ...externalData.mode1];

	return allParams.map((param) => ({
		name: param.parameter,
		type: 'string', // Default type since external data doesn't specify
		required: true, // Default to required
		condition: null,
		description: param.value,
		default: null,
	}));
}

/**
 * Get output parameters (async version)
 */
export async function getOutputParameters(): Promise<OutputParameter[]> {
	return await loadOutputParameters();
}

/**
 * Filter output parameters based on search term
 */
async function filterOutputParameters(searchTerm: string): Promise<OutputParameter[]> {
	const parameters = await getOutputParameters();
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
 * Render output parameters to DOM
 */
async function renderOutputParameters(
	parameters: OutputParameter[],
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
 * Initialize output parameters modal
 */
export async function initOutputParametersModal(): Promise<void> {
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

	const rerender = async () => {
		const filtered = await filterOutputParameters(searchInput?.value ?? '');
		await renderOutputParameters(filtered, content);
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
	(window as any).outputParametersRerender = rerender;
	(window as any).outputParametersModal = modal;
	(window as any).outputParametersSearchInput = searchInput;

	const parameters = await getOutputParameters();
	console.log('[outputParameters] Modal initialized with', parameters.length, 'parameters');
}

/**
 * Show output parameters modal with pre-filtered search
 */
// export function showOutputParameterModal(searchTerm: string): void {
// 	const modal = (window as any).outputParametersModal;
// 	const searchInput = (window as any).outputParametersSearchInput;
// 	const rerender = (window as any).outputParametersRerender;

// 	if (!modal || !searchInput || !rerender) {
// 		console.warn('[outputParameters] Modal not initialized');
// 		return;
// 	}

// 	searchInput.value = searchTerm;
// 	rerender();
// 	modal.show();
// }
