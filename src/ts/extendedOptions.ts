/**
 * @module extendedOptionsManager
 * @description Handles extended options for the ZenPay demo plugin with TypeScript type safety,
 * including generating UUIDs, setting default customer details, and managing UI event handlers
 */

import { updateCodePreview } from './codePreview.ts';
import { DomUtils, extendedOptions } from './globals.ts';
import { generateAndSetUuids, generateEmail, generateFirstLastName } from './helpers.ts';
import { updateRedirectUrlInForm } from './paymentUrlBuilder.ts';
import { FIELD_IDS } from './placeholders.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Customer name data interface
 */
export interface CustomerNameData {
	firstName: string;
	lastName: string;
	fullName: string;
}

/**
 * Extended options configuration interface
 */
export interface ExtendedOptionsConfig {
	generateCustomerData?: boolean;
	generateUuids?: boolean;
	setupEventListeners?: boolean;
	updateRedirectUrl?: boolean;
}

/**
 * Form field mapping interface for extended options
 */
export interface ExtendedOptionsFieldMapping {
	[inputElementId: string]: keyof typeof extendedOptions;
}

/**
 * Extended options initialization error class
 */
export class ExtendedOptionsError extends Error {
	constructor(
		message: string,
		public readonly operation: 'generate' | 'setup' | 'update',
		public override readonly cause?: Error
	) {
		super(message);
		this.name = 'ExtendedOptionsError';
	}
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default extended options configuration
 */
const DEFAULT_CONFIG: Required<ExtendedOptionsConfig> = {
	generateCustomerData: true,
	generateUuids: true,
	setupEventListeners: true,
	updateRedirectUrl: true,
} as const;

/**
 * Form field to extended options property mapping
 */
const FORM_FIELD_MAPPING: ExtendedOptionsFieldMapping = {
	redirectUrlInput: 'redirectUrl',
	callbackUrlInput: 'callbackUrl',
	customerNameInput: 'customerName',
	customerReferenceInput: 'customerReference',
	customerEmailInput: 'customerEmail',
	merchantUniquePaymentIdInput: 'merchantUniquePaymentId',
	contactNumberInput: 'contactNumber',
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get form field value safely
 * @param selector - DOM selector for the form field
 * @returns The field value as string
 */
function getFormFieldValue(selector: string): string {
	return DomUtils.getValue(selector);
}

/**
 * Set form field value safely
 * @param selector - DOM selector for the form field
 * @param value - Value to set
 * @returns True if field was found and updated
 */
function setFormFieldValue(selector: string, value: string): boolean {
	try {
		DomUtils.setValue(selector, value);
		return true;
	} catch {
		return false;
	}
}

/**
 * Update extended options property safely
 * @param propertyName - Name of the property to update
 * @param value - Value to set
 */
function updateExtendedOptionsProperty(
	propertyName: keyof typeof extendedOptions,
	value: string
): void {
	try {
		(extendedOptions as any)[propertyName] = value;
	} catch (error) {
		console.warn(
			`[updateExtendedOptionsProperty] Failed to update property ${propertyName}:`,
			error
		);
	}
}

// ============================================================================
// CUSTOMER DATA GENERATION
// ============================================================================

/**
 * Generate and set customer data in form fields and extended options
 * @throws {ExtendedOptionsError} When customer data generation fails
 * @example
 * ```typescript
 * generateCustomerData();
 * console.log('Customer data generated and applied');
 * ```
 */
export function generateCustomerData(): void {
	try {
		// Generate customer name data
		const customerNameData = generateFirstLastName();
		const customerEmail = generateEmail(customerNameData.firstName);
		const customerMobileNumber = extendedOptions.contactNumber || '0400001002';

		// Set values in UI form fields
		const fieldUpdates = [
			{
				selector: FIELD_IDS.CUSTOMER_NAME,
				value: customerNameData.fullName,
				property: 'customerName' as const,
			},
			{
				selector: FIELD_IDS.CUSTOMER_EMAIL,
				value: customerEmail,
				property: 'customerEmail' as const,
			},
			{
				selector: FIELD_IDS.CONTACT_NUMBER,
				value: customerMobileNumber,
				property: 'contactNumber' as const,
			},
		];

		fieldUpdates.forEach(({ selector, value, property }) => {
			if (setFormFieldValue(selector, value)) {
				updateExtendedOptionsProperty(property, value);
			} else {
				console.warn(`[generateCustomerData] Form field not found: ${selector}`);
			}
		});

		console.log('[generateCustomerData] Customer data generated successfully:', {
			name: customerNameData.fullName,
			email: customerEmail,
			contact: customerMobileNumber,
		});
	} catch (error) {
		throw new ExtendedOptionsError(
			'Failed to generate customer data',
			'generate',
			error instanceof Error ? error : undefined
		);
	}
}

/**
 * Generate UUIDs for customer reference and merchant unique payment ID
 * @throws {ExtendedOptionsError} When UUID generation fails
 * @example
 * ```typescript
 * generateUuidsForExtendedOptions();
 * console.log('UUIDs generated for extended options');
 * ```
 */
export function generateUuidsForExtendedOptions(): void {
	try {
		generateAndSetUuids();
		console.log('[generateUuidsForExtendedOptions] UUIDs generated successfully');
	} catch (error) {
		throw new ExtendedOptionsError(
			'Failed to generate UUIDs for extended options',
			'generate',
			error instanceof Error ? error : undefined
		);
	}
}

// ============================================================================
// EVENT LISTENER SETUP
// ============================================================================

/**
 * Setup event listeners for extended options form fields
 * @throws {ExtendedOptionsError} When event listener setup fails
 * @example
 * ```typescript
 * setupExtendedOptionsEventListeners();
 * console.log('Event listeners set up for extended options');
 * ```
 */
export function setupExtendedOptionsEventListeners(): void {
	try {
		// Setup blur event listeners for each mapped form field
		Object.entries(FORM_FIELD_MAPPING).forEach(([inputElementId, optionPropertyName]) => {
			const selector = `#${inputElementId}`;
			const element = document.querySelector(selector) as HTMLInputElement;

			if (element) {
				// Remove existing listeners to prevent duplicates
				const existingHandler = element.getAttribute('data-extended-options-handler');
				if (existingHandler) {
					element.removeEventListener('blur', (element as any)._extendedOptionsHandler);
				}

				// Create new blur listener
				const blurHandler = () => {
					try {
						const inputValue = getFormFieldValue(selector);
						updateExtendedOptionsProperty(optionPropertyName, inputValue);

						// Update code preview if function is available
						if (typeof updateCodePreview === 'function') {
							updateCodePreview();
						}
					} catch (error) {
						console.error(
							`[setupExtendedOptionsEventListeners] Error handling blur for ${selector}:`,
							error
						);
					}
				};

				// Store handler reference and add listener
				(element as any)._extendedOptionsHandler = blurHandler;
				element.addEventListener('blur', blurHandler);
				element.setAttribute('data-extended-options-handler', 'true');
			}
		});

		// Setup domain select change listener for redirect URL updates
		const domainSelect = document.querySelector('#domainSelect') as HTMLSelectElement;
		if (domainSelect) {
			// Remove existing listener
			if (domainSelect.getAttribute('data-extended-options-domain-handler')) {
				domainSelect.removeEventListener(
					'change',
					(domainSelect as any)._extendedOptionsDomainHandler
				);
			}

			const changeHandler = () => {
				try {
					updateRedirectUrlInForm();
				} catch (error) {
					console.error('[setupExtendedOptionsEventListeners] Error updating redirect URL:', error);
				}
			};

			(domainSelect as any)._extendedOptionsDomainHandler = changeHandler;
			domainSelect.addEventListener('change', changeHandler);
			domainSelect.setAttribute('data-extended-options-domain-handler', 'true');
		}

		console.log(
			`[setupExtendedOptionsEventListeners] Set up event listeners for ${Object.keys(FORM_FIELD_MAPPING).length} form fields`
		);
	} catch (error) {
		throw new ExtendedOptionsError(
			'Failed to setup extended options event listeners',
			'setup',
			error instanceof Error ? error : undefined
		);
	}
}

// ============================================================================
// MAIN INITIALIZATION FUNCTION
// ============================================================================

/**
 * Initialize the extended options UI with comprehensive setup
 * @param config - Configuration options for initialization
 * @throws {ExtendedOptionsError} When initialization fails
 * @example
 * ```typescript
 * // Initialize with default settings
 * initExtendedOptions();
 *
 * // Initialize with custom configuration
 * initExtendedOptions({
 *   generateCustomerData: true,
 *   generateUuids: false,
 *   setupEventListeners: true,
 *   updateRedirectUrl: false
 * });
 * ```
 */
export function initExtendedOptions(config: ExtendedOptionsConfig = {}): void {
	try {
		const finalConfig = { ...DEFAULT_CONFIG, ...config };

		// Generate customer data if requested
		if (finalConfig.generateCustomerData) {
			generateCustomerData();
		}

		// Generate UUIDs if requested
		if (finalConfig.generateUuids) {
			generateUuidsForExtendedOptions();
		}

		// Setup event listeners if requested
		if (finalConfig.setupEventListeners) {
			setupExtendedOptionsEventListeners();
		}

		// Update redirect URL if requested
		if (finalConfig.updateRedirectUrl) {
			updateRedirectUrlInForm();
		}

		console.log('[initExtendedOptions] Extended options initialization completed successfully');
	} catch (error) {
		throw new ExtendedOptionsError(
			'Failed to initialize extended options',
			'setup',
			error instanceof Error ? error : undefined
		);
	}
}
