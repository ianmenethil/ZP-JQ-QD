/**
 * Override Fee Payer Dropdown Component
 * @module overrideFeePayer
 * @description Initializes override fee payer dropdown using CoreDropdown
 */

import { CoreDropdown, type CoreDropdownOption } from './ui/coreDropdown';
import { updateCodePreview } from './codePreview';

/**
 * Override fee payer options configuration
 */
const overrideFeePayerOptions: CoreDropdownOption[] = [
	{
		value: '0',
		title: 'Default',
		icon: 'bi-arrow-clockwise',
		subtitle: 'Use pricing profile setting',
	},
	{
		value: '1',
		title: 'Merchant Pays',
		icon: 'bi-building',
		subtitle: 'Merchant absorbs all fees',
	},
	{
		value: '2',
		title: 'Customer Pays',
		icon: 'bi-person',
		subtitle: 'Customer pays all fees',
	},
];

/**
 * Initialize the override fee payer dropdown
 */
export function initOverrideFeePayerDropdown(): void {
	new CoreDropdown({
		buttonId: 'overrideFeePayerButton',
		dropdownId: 'overrideFeePayerDropdown',
		options: overrideFeePayerOptions,
		size: 'rectangle',
		maxColumns: 3,
		initialValue: '0',
		onSelect: (value, option) => {
			// Update hidden radio buttons
			const defaultRadio = document.getElementById('overrideFeePayerDefault') as HTMLInputElement;
			const merchantRadio = document.getElementById('overrideFeePayerMerchant') as HTMLInputElement;
			const customerRadio = document.getElementById('overrideFeePayerCustomer') as HTMLInputElement;

			if (value === '0' && defaultRadio) {
				defaultRadio.checked = true;
			} else if (value === '1' && merchantRadio) {
				merchantRadio.checked = true;
			} else if (value === '2' && customerRadio) {
				customerRadio.checked = true;
			}

			// Update code preview
			updateCodePreview();

			console.log(`[OverrideFeePayer] Selected: ${value} - ${option.title}`);
		},
	});
}
