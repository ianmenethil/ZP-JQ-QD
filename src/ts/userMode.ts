/**
 * User Mode Dropdown Component
 * @module userMode
 * @description Initializes user mode dropdown using CoreDropdown
 */

import { CoreDropdown, type CoreDropdownOption } from './ui/coreDropdown';
import { updateCodePreview } from './codePreview';

/**
 * User mode options configuration
 */
const userModeOptions: CoreDropdownOption[] = [
	{
		value: '0',
		title: 'Customer Facing',
		icon: 'bi-person',
		subtitle: 'Requires CCV/3DS (Default)',
	},
	{
		value: '1',
		title: 'Merchant Facing',
		icon: 'bi-building',
		subtitle: 'No CCV/3DS required',
	},
];

/**
 * Initialize the user mode dropdown
 */
export function initUserModeDropdown(): void {
	new CoreDropdown({
		buttonId: 'userModeButton',
		dropdownId: 'userModeDropdown',
		options: userModeOptions,
		size: 'rectangle',
		maxColumns: 2,
		initialValue: '0',
		onSelect: (value, option) => {
			// Update hidden radio buttons
			const customerRadio = document.getElementById('selectUserModeCustomer') as HTMLInputElement;
			const merchantRadio = document.getElementById('selectUserModeMerchant') as HTMLInputElement;

			if (value === '0' && customerRadio) {
				customerRadio.checked = true;
			} else if (value === '1' && merchantRadio) {
				merchantRadio.checked = true;
			}

			// Update code preview
			updateCodePreview();

			console.log(`[UserMode] Selected: ${value} - ${option.title}`);
		},
	});
}
