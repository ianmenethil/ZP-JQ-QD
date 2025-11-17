/**
 * Payment Mode Dropdown
 * @file paymentMode.ts
 * @description Manages the payment mode dropdown using CoreDropdown component
 */

import { CoreDropdown, type CoreDropdownOption } from './ui/coreDropdown.ts';
import { updateCodePreview, updateMinHeightBasedOnMode } from './codePreview.ts';
// import { DomUtils } from './globals.ts';

// ============================================================================
// PAYMENT MODE OPTIONS
// ============================================================================

const paymentModeOptions: CoreDropdownOption[] = [
	{
		value: '0',
		title: 'Make Payment',
		icon: 'bi-credit-card',
		subtitle: 'Process immediate payment',
	},
	{
		value: '1',
		title: 'Tokenise',
		icon: 'bi-key',
		subtitle: 'Save card for future use',
	},
	{
		value: '2',
		title: 'Custom Payment',
		icon: 'bi-gear',
		subtitle: 'Custom parameters',
	},
	{
		value: '3',
		title: 'Preauthorization',
		icon: 'bi-lock',
		subtitle: 'Reserve funds, capture later',
	},
];

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the Payment Mode dropdown
 * Creates a CoreDropdown instance with four options:
 * - 0: Make Payment (Default)
 * - 1: Tokenise
 * - 2: Custom Payment
 * - 3: Preauthorization
 */
export function initPaymentModeDropdown(): void {
	try {
		new CoreDropdown({
			buttonId: 'paymentModeButton',
			dropdownId: 'paymentModeDropdown',
			size: 'rectangle',
			maxColumns: 2,
			options: paymentModeOptions,
			initialValue: '0',
			onSelect: (value, option) => {
				console.log(`[PaymentMode] Selected: ${value} - ${option.title}`);

				// Update hidden select for backward compatibility
				const modeSelect = document.getElementById('modeSelect') as HTMLSelectElement;
				if (modeSelect) {
					modeSelect.value = value;
				}

				// Update min height based on mode
				updateMinHeightBasedOnMode();

				// Update code preview
				updateCodePreview();
			},
		});

		console.log('[PaymentMode] Dropdown initialized successfully');
	} catch (error) {
		console.error('[PaymentMode] Failed to initialize dropdown:', error);
	}
}
