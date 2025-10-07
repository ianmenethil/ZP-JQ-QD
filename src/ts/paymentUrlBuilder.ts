import { updateCodePreview } from './codePreview.ts';
import { DEFAULT_VALUES, DomUtils, extendedOptions, SESSION_KEYS } from './globals.ts';
import { getFromSession, saveToSession } from './session.ts';
import { copyTextToClipboard } from './utilities.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * URL builder configuration interface
 */
export interface PaymentUrlConfiguration {
	readonly subdomain: string;
	readonly domain: string;
	readonly version: string;
}

/**
 * URL builder error class
 */
export class PaymentUrlBuilderError extends Error {
	constructor(
		message: string,
		public readonly operation: 'build' | 'update' | 'restore',
		public override readonly cause?: Error
	) {
		super(message);
		this.name = 'PaymentUrlBuilderError';
	}
}

// ============================================================================
// URL BUILDING FUNCTIONS
// ============================================================================

/**
 * Build the complete ZenPay payment URL based on configuration
 * @param configuration - URL configuration with subdomain, domain, and version
 * @returns Complete ZenPay payment URL
 * @example
 * ```typescript
 * const url = buildZenPayPaymentUrl({
 *   subdomain: 'payuat',
 *   domain: 'travelpay',
 *   version: 'v5'
 * });
 * console.log(url); // "https://payuat.travelpay.com.au/online/v5"
 * ```
 */
export function buildZenPayPaymentUrl(configuration: PaymentUrlConfiguration): string {
	const { subdomain, domain, version } = configuration;
	return `https://${subdomain}.${domain}.com.au/online/${version}`;
}

/**
 * Build redirect and callback URLs based on domain configuration
 * @param subdomain - The subdomain to use
 * @param domain - The domain to use
 * @returns Object containing redirect and callback URLs
 */
function buildRedirectAndCallbackUrls(
	subdomain: string,
	domain: string
): {
	redirectUrl: string;
	callbackUrl: string;
} {
	return {
		// redirectUrl: `https://${subdomain}.${domain}.com.au/demo/`,
		redirectUrl: `https://client.zenithpayments.support/results`,
		callbackUrl: `https://${subdomain}.${domain}.com.au/callback/`,
	};
}

// (Removed env update functions – chip is now static in header)

// ============================================================================
// FORM UPDATE FUNCTIONS
// ============================================================================

/**
 * Update redirect URL form fields based on selected domain and subdomain
 * Gracefully handles missing elements (when modal hasn't been initialized yet)
 * @example
 * ```typescript
 * updateRedirectUrlInForm();
 * console.log('Redirect URL updated in form');
 * ```
 */
export function updateRedirectUrlInForm(): void {
	try {
		const selectedDomain = DomUtils.getValue('#domainSelect');
		const selectedSubdomain = DomUtils.getValue('input[name="subdomain"]:checked');

		if (!selectedDomain || !selectedSubdomain) {
			console.warn(
				'[updateRedirectUrlInForm] URL builder modal not initialized yet, skipping redirect URL update'
			);
			return;
		}

		const { redirectUrl, callbackUrl } = buildRedirectAndCallbackUrls(
			selectedSubdomain,
			selectedDomain
		);

		// Update form fields
		DomUtils.setValue('#redirectUrlInput', redirectUrl);

		const callbackUrlElement = document.querySelector('#callbackUrlInput') as HTMLInputElement;
		if (callbackUrlElement) {
			callbackUrlElement.setAttribute('placeholder', callbackUrl);
		}

		// Update extended options
		(extendedOptions as any).redirectUrl = redirectUrl;

		// Update code preview if available
		if (typeof updateCodePreview === 'function') {
			updateCodePreview();
		}

		console.log('[updateRedirectUrlInForm] Redirect URL updated:', redirectUrl);
	} catch (error) {
		const urlError =
			error instanceof PaymentUrlBuilderError
				? error
				: new PaymentUrlBuilderError(
						'Failed to update redirect URL in form',
						'update',
						error instanceof Error ? error : undefined
					);

		console.error('[updateRedirectUrlInForm]', urlError.message, error);
		throw urlError;
	}
}

// ============================================================================
// SESSION MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Restore URL builder configuration from session storage
 * @returns The restored configuration or default values
 */
function restoreUrlBuilderConfigurationFromSession(): PaymentUrlConfiguration {
	return {
		subdomain: getFromSession(SESSION_KEYS.SUBDOMAIN, DEFAULT_VALUES.url.subdomain),
		domain: getFromSession(SESSION_KEYS.DOMAIN, DEFAULT_VALUES.url.domain),
		version: getFromSession(SESSION_KEYS.VERSION, DEFAULT_VALUES.url.version),
	};
}

/**
 * Save URL builder configuration to session storage
 * @param configuration - The configuration to save
 */
function saveUrlBuilderConfigurationToSession(configuration: PaymentUrlConfiguration): void {
	saveToSession(SESSION_KEYS.SUBDOMAIN, configuration.subdomain);
	saveToSession(SESSION_KEYS.DOMAIN, configuration.domain);
	saveToSession(SESSION_KEYS.VERSION, configuration.version);
}

/**
 * Apply saved configuration to form elements
 * @param configuration - The configuration to apply
 */
function applyConfigurationToFormElements(configuration: PaymentUrlConfiguration): void {
	// Apply saved subdomain
	const subdomainInput = document.querySelector(
		`input[name="subdomain"][value="${configuration.subdomain}"]`
	) as HTMLInputElement;
	if (subdomainInput) {
		subdomainInput.checked = true;
	}

	// Apply saved domain
	const domainSelect = document.getElementById('domainSelect') as HTMLSelectElement;
	if (domainSelect) {
		domainSelect.value = configuration.domain;
	}

	// Apply saved version
	const versionInput = document.querySelector(
		`input[name="version"][value="${configuration.version}"]`
	) as HTMLInputElement;
	if (versionInput) {
		versionInput.checked = true;
	}
}

// ============================================================================
// URL PREVIEW FUNCTIONS
// ============================================================================

/**
 * Update the URL preview display based on current form values
 */
export function updatePaymentUrlPreviewDisplay(): void {
	try {
		const subdomainInput = document.querySelector(
			'input[name="subdomain"]:checked'
		) as HTMLInputElement;
		const domainSelect = document.getElementById('domainSelect') as HTMLSelectElement;
		const versionInput = document.querySelector(
			'input[name="version"]:checked'
		) as HTMLInputElement;

		if (!subdomainInput || !domainSelect || !versionInput) {
			console.warn(
				'[updatePaymentUrlPreviewDisplay] URL builder form elements not yet available, skipping update'
			);
			return;
		}

		const configuration: PaymentUrlConfiguration = {
			subdomain: subdomainInput.value,
			domain: domainSelect.value,
			version: versionInput.value,
		};

		// Save configuration to session
		saveUrlBuilderConfigurationToSession(configuration);

		// Build and display URL
		const paymentUrl = buildZenPayPaymentUrl(configuration);

		const urlPreviewElement = document.getElementById('urlPreview') as HTMLInputElement;
		if (urlPreviewElement) {
			urlPreviewElement.value = paymentUrl;
		}

		// Update modal preview if it exists
		const modalUrlPreviewElement = document.getElementById('modalUrlPreview') as HTMLInputElement;
		if (modalUrlPreviewElement) {
			modalUrlPreviewElement.value = paymentUrl;
		}

		// Update redirect URL when domain changes
		updateRedirectUrlInForm();

		// Update code preview if available
		if (typeof updateCodePreview === 'function') {
			updateCodePreview();
		}

		// Environment chip is static; no dynamic update required

		console.log('[updatePaymentUrlPreviewDisplay] URL preview updated:', paymentUrl);
	} catch (error) {
		console.error('[updatePaymentUrlPreviewDisplay] Error updating URL preview:', error);
		throw error;
	}
}
// ============================================================================
// CLIPBOARD FUNCTIONS
// ============================================================================

/**
 * Copy URL from modal preview to clipboard with visual feedback using modern Clipboard API
 */
async function copyUrlFromModalToClipboard(): Promise<void> {
	const modalUrlPreviewElement = document.getElementById('modalUrlPreview') as HTMLInputElement;
	const modalCopyButton = document.getElementById('modalCopyUrlBtn') as HTMLButtonElement;

	if (!modalUrlPreviewElement || !modalCopyButton) {
		console.warn('[copyUrlFromModalToClipboard] Modal elements not found');
		return;
	}

	try {
		// Use the unified clipboard utility
		await copyTextToClipboard(modalUrlPreviewElement.value, { button: modalCopyButton });

		console.log(
			'[copyUrlFromModalToClipboard] URL copied to clipboard:',
			modalUrlPreviewElement.value
		);
	} catch (error) {
		console.error('[copyUrlFromModalToClipboard] Failed to copy URL:', error);

		// Show user-friendly error message
		alert('Failed to copy URL. Please select and copy manually.');
	}
}

// ============================================================================
// EVENT LISTENER SETUP FUNCTIONS
// ============================================================================

/**
 * Set up event listeners for URL builder form elements
 * Follows same pattern as errorCodes.ts - create modal instance once, reuse it
 */
function setupUrlBuilderEventListeners(): void {
	const doc = globalThis.document;
	if (!doc) return;

	// Get modal element and button
	const modalEl = doc.getElementById('urlBuilderModal');
	const urlBuilderBtn = doc.getElementById('urlBuilderBtn');

	console.log('[setupUrlBuilderEventListeners] Modal element found:', !!modalEl);
	console.log('[setupUrlBuilderEventListeners] Button found:', !!urlBuilderBtn);

	if (!modalEl) {
		console.error('[setupUrlBuilderEventListeners] urlBuilderModal element not found in DOM');
		return;
	}

	// Create modal instance once (same pattern as errorCodes)
	const modal = new (window as any).bootstrap.Modal(modalEl);
	console.log('[setupUrlBuilderEventListeners] Bootstrap Modal instance created');

	// Subdomain radio buttons
	const subdomainInputs = doc.querySelectorAll('input[name="subdomain"]');
	subdomainInputs.forEach((input) => {
		input.addEventListener('change', updatePaymentUrlPreviewDisplay);
	});

	// Domain select dropdown
	const domainSelect = doc.getElementById('domainSelect');
	if (domainSelect) {
		domainSelect.addEventListener('change', updatePaymentUrlPreviewDisplay);
	}

	// Version radio buttons
	const versionInputs = doc.querySelectorAll('input[name="version"]');
	versionInputs.forEach((input) => {
		input.addEventListener('change', updatePaymentUrlPreviewDisplay);
	});

	// Modal copy button
	const modalCopyButton = doc.getElementById('modalCopyUrlBtn');
	if (modalCopyButton) {
		modalCopyButton.addEventListener('click', copyUrlFromModalToClipboard);
	}

	// Apply URL changes button
	const applyUrlChangesButton = doc.getElementById('applyUrlChanges');
	if (applyUrlChangesButton) {
		applyUrlChangesButton.addEventListener('click', () => {
			console.log('[setupUrlBuilderEventListeners] Applying URL changes from modal');
			updatePaymentUrlPreviewDisplay();
			modal.hide();
		});
	}

	// URL Builder button - open modal (same pattern as errorCodes)
	if (urlBuilderBtn) {
		urlBuilderBtn.addEventListener('click', () => {
			console.log('[setupUrlBuilderEventListeners] URL Builder button clicked, showing modal');
			modal.show();
		});
		console.log('[setupUrlBuilderEventListeners] Click listener attached to URL Builder button');
	} else {
		console.warn(
			'[setupUrlBuilderEventListeners] urlBuilderBtn not found, modal can only open programmatically'
		);
	}
}

/**
 * Initialize modal-specific functionality
 */
function initializeUrlBuilderModal(): void {
	// Initialize tooltips when modal is shown
	const urlBuilderModal = document.getElementById('urlBuilderModal');
	if (urlBuilderModal) {
		urlBuilderModal.addEventListener('shown.bs.modal', () => {
			const tooltipElements = urlBuilderModal.querySelectorAll('[data-bs-toggle="tooltip"]');
			tooltipElements.forEach((element) => {
				// Initialize Bootstrap tooltips using native API
				if ((window as any).bootstrap?.Tooltip) {
					new (window as any).bootstrap.Tooltip(element);
				}
			});
		});
	}
}

// ============================================================================
// MAIN INITIALIZATION FUNCTION
// ============================================================================

/**
 * Initialize URL builder functionality with form restoration and event listeners
 * @param shouldRestoreFromSession - Whether to restore values from session storage
 * @throws {PaymentUrlBuilderError} When initialization fails
 * @example
 * ```typescript
 * // Initialize with session restoration
 * initializePaymentUrlBuilder(true);
 *
 * // Initialize without session restoration
 * initializePaymentUrlBuilder(false);
 * ```
 */
export function initializePaymentUrlBuilder(shouldRestoreFromSession: boolean = true): void {
	try {
		// Restore saved URL from session and display in main form immediately
		const savedConfiguration = restoreUrlBuilderConfigurationFromSession();
		const paymentUrl = buildZenPayPaymentUrl(savedConfiguration);

		const urlPreviewElement = document.getElementById('urlPreview') as HTMLInputElement;
		if (urlPreviewElement) {
			urlPreviewElement.value = paymentUrl;
		}

		// Set up event listeners for modal (modal HTML exists at body level)
		setupUrlBuilderEventListeners();

		// Initialize modal functionality
		initializeUrlBuilderModal();

		// Restore configuration to modal form elements if requested
		if (shouldRestoreFromSession) {
			applyConfigurationToFormElements(savedConfiguration);
			console.log(
				'[initializePaymentUrlBuilder] Configuration restored from session:',
				savedConfiguration
			);
		}

		// Update URL preview displays (both main form and modal)
		updatePaymentUrlPreviewDisplay();

		console.log('[initializePaymentUrlBuilder] URL builder initialized successfully');
	} catch (error) {
		console.error('[initializePaymentUrlBuilder] Error initializing URL builder:', error);
		// Don't throw - graceful degradation
	}
}
