/**
 * Core Dropdown Component - Generic, Reusable Button-Style Dropdown
 * @module ui/coreDropdown
 * @description Modern dropdown that displays square/rectangular buttons with three-part layout:
 * - Top text (title)
 * - Center icon
 * - Bottom text (subtitle/description)
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Size options for dropdown buttons
 */
export type CoreDropdownSize = 'square' | 'rectangle' | 'wide';

/**
 * Button option configuration
 */
export interface CoreDropdownOption {
	/** Unique value for this option */
	value: string;
	/** Top text displayed above icon */
	title: string;
	/** Bootstrap icon class (e.g., 'bi-shield-check') */
	icon: string;
	/** Bottom text displayed below icon */
	subtitle: string;
	/** Optional color override for icon (CSS var or hex) */
	iconColor?: string;
}

/**
 * Core dropdown configuration
 */
export interface CoreDropdownConfig {
	/** ID of the trigger button element */
	buttonId: string;
	/** ID of the dropdown container element */
	dropdownId: string;
	/** Array of options to display */
	options: CoreDropdownOption[];
	/** Size of the option buttons */
	size?: CoreDropdownSize;
	/** Maximum columns in grid (1-4, default: 4) */
	maxColumns?: number;
	/** Callback when option is selected */
	onSelect?: (value: string, option: CoreDropdownOption) => void;
	/** Initial selected value */
	initialValue?: string | null;
}

// ============================================================================
// CORE DROPDOWN CLASS
// ============================================================================

/**
 * Generic dropdown component with square/rectangular button options
 * Follows existing app patterns with modern styling and full theme support
 *
 * @example
 * ```typescript
 * const dropdown = new CoreDropdown({
 *   buttonId: 'myDropdownButton',
 *   dropdownId: 'myDropdownContainer',
 *   size: 'rectangle',
 *   maxColumns: 2,
 *   options: [
 *     {
 *       value: '0',
 *       title: 'Customer Facing',
 *       icon: 'bi-shield-check',
 *       subtitle: 'Requires 3DS/CVV'
 *     },
 *     {
 *       value: '1',
 *       title: 'Merchant Facing',
 *       icon: 'bi-building',
 *       subtitle: 'No 3DS/CVV'
 *     }
 *   ],
 *   onSelect: (value, option) => {
 *     console.log('Selected:', value, option.title);
 *   }
 * });
 * ```
 */
export class CoreDropdown {
	private button: HTMLElement;
	private dropdown: HTMLElement;
	private config: Required<CoreDropdownConfig>;
	private isOpen: boolean = false;
	private selectedValue: string | null = null;

	constructor(config: CoreDropdownConfig) {
		// Set defaults
		this.config = {
			...config,
			size: config.size || 'rectangle',
			maxColumns: config.maxColumns || 4,
			onSelect: config.onSelect || (() => {}),
			initialValue: config.initialValue ?? null,
		};

		// Get DOM elements
		const button = document.getElementById(this.config.buttonId);
		const dropdown = document.getElementById(this.config.dropdownId);

		if (!button || !dropdown) {
			console.error(
				`[CoreDropdown] Elements not found - button: ${this.config.buttonId}, dropdown: ${this.config.dropdownId}`
			);
			throw new Error('CoreDropdown: Required DOM elements not found');
		}

		this.button = button;
		this.dropdown = dropdown;

		// Initialize
		this.init();
	}

	/**
	 * Initialize the dropdown component
	 */
	private init(): void {
		// Ensure dropdown has correct classes
		this.dropdown.classList.add('core-dropdown-content');

		// Build the options grid
		this.buildOptions();

		// Set up event listeners
		this.setupEventListeners();

		// Set initial selection if provided
		if (this.config.initialValue) {
			this.setSelectedValue(this.config.initialValue, false);
		}

		console.log(`[CoreDropdown] Initialized: ${this.config.buttonId}`);
	}

	/**
	 * Build the options grid inside the dropdown
	 */
	private buildOptions(): void {
		// Clear existing content
		this.dropdown.innerHTML = '';

		// Create grid container
		const grid = document.createElement('div');
		grid.className = 'core-dropdown-grid';
		grid.dataset['size'] = this.config['size'];
		grid.dataset['maxColumns'] = String(this.config['maxColumns']);

		// Create option buttons
		this.config.options.forEach((option) => {
			const optionButton = this.createOptionButton(option);
			grid.appendChild(optionButton);
		});

		this.dropdown.appendChild(grid);
	}

	/**
	 * Create a single option button element
	 */
	private createOptionButton(option: CoreDropdownOption): HTMLElement {
		const button = document.createElement('div');
		button.className = 'core-dropdown-option';
		button.dataset['value'] = option.value;
		button.dataset['size'] = this.config['size'];

		// Top text
		const title = document.createElement('div');
		title.className = 'core-dropdown-option-title';
		title.textContent = option.title;

		// Center icon
		const iconWrapper = document.createElement('div');
		iconWrapper.className = 'core-dropdown-option-icon';
		const icon = document.createElement('i');
		icon.className = `bi ${option.icon}`;
		if (option.iconColor) {
			icon.style.color = option.iconColor;
		}
		iconWrapper.appendChild(icon);

		// Bottom text
		const subtitle = document.createElement('div');
		subtitle.className = 'core-dropdown-option-subtitle';
		subtitle.textContent = option.subtitle;

		// Assemble button
		button.appendChild(title);
		button.appendChild(iconWrapper);
		button.appendChild(subtitle);

		return button;
	}

	/**
	 * Set up all event listeners
	 */
	private setupEventListeners(): void {
		// Toggle dropdown on button click
		this.button.addEventListener('click', (e) => {
			e.stopPropagation();
			this.toggle();
		});

		// Handle option selection
		this.dropdown.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			const optionButton = target.closest('.core-dropdown-option') as HTMLElement;

			if (optionButton && optionButton.dataset['value']) {
				e.stopPropagation();
				this.selectOption(optionButton.dataset['value']);
			}
		});

		// Close dropdown when clicking outside
		document.addEventListener('click', (e) => {
			const target = e.target as Node;
			if (!this.button.contains(target) && !this.dropdown.contains(target)) {
				this.close();
			}
		});

		// Close on Escape key
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && this.isOpen) {
				this.close();
			}
		});
	}

	/**
	 * Toggle dropdown open/closed
	 */
	private toggle(): void {
		if (this.isOpen) {
			this.close();
		} else {
			this.open();
		}
	}

	/**
	 * Open the dropdown
	 */
	private open(): void {
		this.dropdown.classList.add('show');
		this.isOpen = true;

		// Update chevron icon if present
		const chevron = this.button.querySelector('i.bi-chevron-down, i.bi-chevron-up');
		if (chevron) {
			chevron.classList.remove('bi-chevron-down');
			chevron.classList.add('bi-chevron-up');
		}

		console.log(`[CoreDropdown] Opened: ${this.config.buttonId}`);
	}

	/**
	 * Close the dropdown
	 */
	private close(): void {
		this.dropdown.classList.remove('show');
		this.isOpen = false;
		const chevron = this.button.querySelector('i.bi-chevron-down, i.bi-chevron-up');
		if (chevron) {
			chevron.classList.remove('bi-chevron-up');
			chevron.classList.add('bi-chevron-down');
		}
	}

	/**
	 * Select an option by value
	 */
	private selectOption(value: string): void {
		this.setSelectedValue(value, true);
		this.close();
	}

	/**
	 * Set the selected value and update UI
	 * @param value - The value to select
	 * @param triggerCallback - Whether to trigger the onSelect callback
	 */
	private setSelectedValue(value: string, triggerCallback: boolean): void {
		const option = this.config.options.find((opt) => opt.value === value);
		if (!option) {
			console.warn(`[CoreDropdown] Option not found: ${value}`);
			return;
		}

		// Update selected value
		this.selectedValue = value;

		// Update visual selection state
		const allOptions = this.dropdown.querySelectorAll('.core-dropdown-option');
		allOptions.forEach((opt) => {
			if ((opt as HTMLElement).dataset['value'] === value) {
				opt.classList.add('selected');
			} else {
				opt.classList.remove('selected');
			}
		});

		// Update button text (if it has a text element)
		const buttonText = this.button.querySelector('[data-dropdown-text]');
		if (buttonText) {
			buttonText.textContent = option.title;
		}

		// Trigger callback
		if (triggerCallback && this.config.onSelect) {
			this.config.onSelect(value, option);
		}

		console.log(`[CoreDropdown] Selected: ${value} (${option.title})`);
	}

	/**
	 * Get the currently selected value
	 */
	public getSelectedValue(): string | null {
		return this.selectedValue;
	}

	/**
	 * Get the currently selected option
	 */
	public getSelectedOption(): CoreDropdownOption | null {
		if (!this.selectedValue) return null;
		return this.config.options.find((opt) => opt.value === this.selectedValue) || null;
	}

	/**
	 * Programmatically set the selected value
	 */
	public setValue(value: string): void {
		this.setSelectedValue(value, false);
	}

	/**
	 * Update the options and rebuild the dropdown
	 */
	public updateOptions(options: CoreDropdownOption[]): void {
		this.config.options = options;
		this.buildOptions();
		this.setupEventListeners();
	}

	/**
	 * Destroy the dropdown and clean up event listeners
	 */
	public destroy(): void {
		// Note: Event listeners are automatically cleaned up when elements are removed
		this.dropdown.innerHTML = '';
		this.dropdown.classList.remove('show', 'core-dropdown-content');
		console.log(`[CoreDropdown] Destroyed: ${this.config.buttonId}`);
	}
}
