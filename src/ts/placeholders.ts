/**
 * Placeholder utilities (modern, strict, minimal side effects limited to DOM)
 */

import {
	generateRandomContactNumber,
	generateRandomCustomerName,
	generateRandomPaymentAmount,
	generateZenPayEmailAddress,
} from './utilities.ts';

interface PlaceholderState {
	hasValue: boolean;
	hasFocus: boolean;
	originalPlaceholder: string;
}

/**
 * Placeholder management error class
 */
class PlaceholderError extends Error {
	constructor(
		message: string,
		public readonly selector?: string,
		public override readonly cause?: Error
	) {
		super(message);
		this.name = 'PlaceholderError';
	}
}

/**
 * Field ID constants (single source of truth for all field selectors)
 */
export const FIELD_IDS = {
	API_KEY: '#apiKeyInput',
	USERNAME: '#usernameInput',
	PASSWORD: '#passwordInput',
	MERCHANT_CODE: '#merchantCodeInput',
	PAYMENT_AMOUNT: '#paymentAmountInput',
	REDIRECT_URL: '#redirectUrlInput',
	CALLBACK_URL: '#callbackUrlInput',
	CUSTOMER_NAME: '#customerNameInput',
	CONTACT_NUMBER: '#contactNumberInput',
	CUSTOMER_EMAIL: '#customerEmailInput',
	CUSTOMER_REFERENCE: '#customerReferenceInput',
	MERCHANT_PAYMENT_ID: '#merchantUniquePaymentIdInput',
	ADDITIONAL_REFERENCE: '#additionalReferenceInput',
	MIN_HEIGHT: '#minHeightInput',
	DEPARTURE_DATE: '#departureDateInput',
} as const;

/**
 * All form field selectors (derived from FIELD_IDS to avoid duplication)
 */
const FORM_FIELD_SELECTORS = Object.values(FIELD_IDS) as readonly string[];

/**
 * Form floating selectors for styling
 */
const FORM_FLOATING_SELECTOR =
	'.form-floating input[placeholder], .form-floating textarea[placeholder]';

/**
 * CSS class constants
 */
const CSS_CLASSES = {
	HAS_PLACEHOLDER: 'has-placeholder',
	PLACEHOLDER_AS_VALUE: 'placeholder-as-value',
} as const;

/**
 * Data attribute constants
 */
const DATA_ATTRIBUTES = {
	ORIGINAL_PLACEHOLDER: 'originalPlaceholder',
} as const;

type TextControl = HTMLInputElement | HTMLTextAreaElement;

const isTextControl = (el: Element | null): el is TextControl =>
	!!el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement);

/**
 * Get placeholder state for an input/textarea element
 */
function getPlaceholderState(element: TextControl): PlaceholderState {
	const value = element.value;
	const originalPlaceholder =
		element.dataset['originalPlaceholder'] || element.getAttribute('placeholder') || '';
	return {
		hasValue: value.trim().length > 0,
		hasFocus: document.activeElement === element,
		originalPlaceholder,
	};
}

/**
 * Update placeholder display based on current state
 */
function updatePlaceholderDisplay(element: TextControl, state: PlaceholderState): void {
	if (state.hasValue) {
		element.classList.remove('has-placeholder');
		element.setAttribute('placeholder', '');
	} else {
		element.classList.add('has-placeholder');
		element.setAttribute('placeholder', state.originalPlaceholder);
	}
}

/**
 * Update styling classes based on placeholder state
 */
function updatePlaceholderStyling(element: TextControl, state: PlaceholderState): void {
	if (state.hasValue) {
		element.classList.remove('placeholder-as-value');
	} else {
		element.classList.add('placeholder-as-value');
	}
}

/** Internal handler registries to avoid mutating arbitrary element properties */
const handlerMap = new WeakMap<TextControl, EventListener>();
const focusHandlerMap = new WeakMap<TextControl, EventListener>();

/**
 * Setup event listeners for a single input/textarea element
 */
function setupInputEventListeners(
	element: TextControl,
	enhanceConsistency: boolean = true,
	setupStyling: boolean = true
): void {
	const updateState: EventListener = () => {
		const state = getPlaceholderState(element);
		if (enhanceConsistency) updatePlaceholderDisplay(element, state);
		if (setupStyling) updatePlaceholderStyling(element, state);
	};

	// Remove existing listeners (if any) to prevent duplicates
	const existing = handlerMap.get(element);
	if (existing) {
		element.removeEventListener('input', existing);
		element.removeEventListener('change', existing);
		element.removeEventListener('blur', existing);
	}
	const existingFocus = focusHandlerMap.get(element);
	if (existingFocus) {
		element.removeEventListener('focus', existingFocus);
	}

	// Attach fresh listeners
	element.addEventListener('input', updateState);
	element.addEventListener('change', updateState);
	element.addEventListener('blur', updateState);
	handlerMap.set(element, updateState);

	if (enhanceConsistency) {
		const onFocus: EventListener = () => {
			const state = getPlaceholderState(element);
			if (!state.hasValue) {
				element.classList.add(CSS_CLASSES.HAS_PLACEHOLDER);
				element.setAttribute('placeholder', state.originalPlaceholder);
			}
		};
		element.addEventListener('focus', onFocus);
		focusHandlerMap.set(element, onFocus);
	} else {
		focusHandlerMap.delete(element);
	}

	// Initial state update
	updateState(new Event('init'));
}

// ============================================================================
// MAIN PLACEHOLDER FUNCTIONS
// ============================================================================

/**
 * Initialize basic placeholder functionality for form fields
 */
export function initPlaceholder(selectors: readonly string[] = FORM_FIELD_SELECTORS): void {
	try {
		const selectorString = selectors.join(', ');
		const elements = document.querySelectorAll(selectorString);
		elements.forEach((el) => {
			if (!isTextControl(el)) return;
			const placeholderText = el.getAttribute('placeholder') || '';
			if (!el.dataset[DATA_ATTRIBUTES.ORIGINAL_PLACEHOLDER]) {
				el.dataset[DATA_ATTRIBUTES.ORIGINAL_PLACEHOLDER] = placeholderText;
			}
			el.setAttribute('placeholder', el.dataset[DATA_ATTRIBUTES.ORIGINAL_PLACEHOLDER] || '');
		});
	} catch (error) {
		throw new PlaceholderError(
			'Failed to initialize basic placeholder functionality',
			selectors.join(', '),
			error instanceof Error ? error : undefined
		);
	}
}

/**
 * Setup placeholder styling for form floating inputs/textareas
 */
export function setupPlaceholderStyling(selector: string = FORM_FLOATING_SELECTOR): void {
	try {
		const elements = document.querySelectorAll(selector);
		elements.forEach((el) => {
			if (!isTextControl(el)) return;
			if (!el.getAttribute('placeholder')) return; // skip if no placeholder
			setupInputEventListeners(el, false, true);
		});
	} catch (error) {
		throw new PlaceholderError(
			'Failed to setup placeholder styling',
			selector,
			error instanceof Error ? error : undefined
		);
	}
}

/**
 * Initialize auto-generated placeholders for all relevant fields
 * This sets random values as placeholders that will be used if the user doesn't fill them in
 */
export function initAutoGeneratedPlaceholders(): void {
	try {
		// Payment Amount
		const paymentAmountInput = document.getElementById('paymentAmountInput') as HTMLInputElement;
		if (paymentAmountInput && !paymentAmountInput.value) {
			paymentAmountInput.placeholder = generateRandomPaymentAmount(10.0, 1000.0);
		}

		// Merchant Unique Payment ID
		const merchantPaymentIdInput = document.getElementById(
			'merchantUniquePaymentIdInput'
		) as HTMLInputElement;
		if (merchantPaymentIdInput && !merchantPaymentIdInput.value) {
			merchantPaymentIdInput.placeholder = crypto.randomUUID();
		}

		// Customer Reference
		const customerRefInput = document.getElementById('customerReferenceInput') as HTMLInputElement;
		if (customerRefInput && !customerRefInput.value) {
			customerRefInput.placeholder = crypto.randomUUID();
		}

		// Customer Name and Email
		const customerNameInput = document.getElementById('customerNameInput') as HTMLInputElement;
		const customerEmailInput = document.getElementById('customerEmailInput') as HTMLInputElement;
		if (customerNameInput && !customerNameInput.value) {
			const nameData = generateRandomCustomerName();
			customerNameInput.placeholder = nameData.fullName;

			if (customerEmailInput && !customerEmailInput.value) {
				customerEmailInput.placeholder = generateZenPayEmailAddress(nameData.firstName);
			}
		}

		// Contact Number
		const contactNumberInput = document.getElementById('contactNumberInput') as HTMLInputElement;
		if (contactNumberInput && !contactNumberInput.value) {
			contactNumberInput.placeholder = generateRandomContactNumber();
		}

		// Additional Reference
		const additionalRefInput = document.getElementById(
			'additionalReferenceInput'
		) as HTMLInputElement;
		if (additionalRefInput && !additionalRefInput.value) {
			additionalRefInput.placeholder = crypto.randomUUID();
		}

		console.log('[initAutoGeneratedPlaceholders] Auto-generated placeholders initialized');
	} catch (error) {
		console.error('[initAutoGeneratedPlaceholders] Error initializing placeholders:', error);
	}
}
