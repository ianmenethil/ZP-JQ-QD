/**
 * Display Mode Dropdown
 * @file displayMode.ts
 * @description Manages the displayMode dropdown using CoreDropdown component
 */

import { CoreDropdown, type CoreDropdownOption } from './ui/coreDropdown.ts';
import { updateCodePreview } from './codePreview.ts';

// ============================================================================
// DISPLAY MODE OPTIONS
// ============================================================================

const displayModeOptions: CoreDropdownOption[] = [
	{
		value: '0',
		title: 'Standard Modal',
		icon: 'bi-window',
		subtitle: 'jQuery modal flow (default)',
	},
	{
		value: '1',
		title: 'Redirect URL',
		icon: 'bi-box-arrow-up-right',
		subtitle: 'Returns URL for integration',
	},
];

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the Display Mode dropdown
 * Creates a CoreDropdown instance with two options:
 * - 0: Standard Modal (jQuery) - Default
 * - 1: Redirect URL - For custom integration
 */
export function initDisplayModeDropdown(): void {
	try {
		new CoreDropdown({
			buttonId: 'displayModeButton',
			dropdownId: 'displayModeDropdown',
			size: 'rectangle',
			maxColumns: 2,
			options: displayModeOptions,
			initialValue: '0',
			onSelect: (value, option) => {
				console.log(`[DisplayMode] Selected: ${value} - ${option.title}`);

				// Update hidden radio buttons
				const modalRadio = document.getElementById('selectDisplayModeModal') as HTMLInputElement;
				const redirectRadio = document.getElementById('selectDisplayModeRedirect') as HTMLInputElement;

				if (modalRadio && redirectRadio) {
					modalRadio.checked = value === '0';
					redirectRadio.checked = value === '1';
				}

				// Update code preview
				updateCodePreview();
			},
		});

		console.log('[DisplayMode] Dropdown initialized successfully');
	} catch (error) {
		console.error('[DisplayMode] Failed to initialize dropdown:', error);
	}
}
