import { updateCodePreview } from './codePreview.ts';
import { DEFAULT_VALUES, DomUtils, extendedOptions, SESSION_KEYS } from './globals.ts';
import { getFromSession } from './session.ts';
import { copyTextToClipboard } from './utilities.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * URL builder configuration interface
 */
interface PaymentUrlConfiguration {
	readonly subdomain: string;
	readonly domain: string;
	readonly version: string;
}

/**
 * URL builder error class
 */
class PaymentUrlBuilderError extends Error {
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
function buildZenPayPaymentUrl(configuration: PaymentUrlConfiguration): string {
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
		redirectUrl: `https://${subdomain}.${domain}.com.au/demo/`,
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
		const redirectUrlElement = document.querySelector('#redirectUrlInput') as HTMLInputElement;
		if (redirectUrlElement) {
			redirectUrlElement.setAttribute('placeholder', redirectUrl);
		}

		const callbackUrlElement = document.querySelector('#callbackUrlInput') as HTMLInputElement;
		if (callbackUrlElement) {
			callbackUrlElement.setAttribute('placeholder', callbackUrl);
		}

		// Update extended options
		(extendedOptions as unknown as Record<string, string | number>)['redirectUrl'] = redirectUrl;

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
 * Save URL builder configuration to session storage - NO LONGER SAVES INDIVIDUALLY
 * Configuration will be saved only when credentials are loaded or plugin is initialized
 * @param configuration - The configuration (for future use)
 */
function saveUrlBuilderConfigurationToSession(configuration: PaymentUrlConfiguration): void {
	// Session storage now happens only on credential load or initialization
	// This function kept for backward compatibility but does nothing
	void configuration; // Avoid unused parameter warning
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
function updatePaymentUrlPreviewDisplay(): void {
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
 * Attaches listeners to subdomain radio buttons
 */
function attachSubdomainListeners(): void {
	const subdomainInputs = document.querySelectorAll('input[name="subdomain"]');
	subdomainInputs.forEach(input => {
		input.addEventListener('change', updatePaymentUrlPreviewDisplay);
	});
}

/**
 * Attaches listeners to domain select and version radio buttons
 */
function attachDomainAndVersionListeners(): void {
	const domainSelect = document.getElementById('domainSelect');
	if (domainSelect) {
		domainSelect.addEventListener('change', updatePaymentUrlPreviewDisplay);
	}

	const versionInputs = document.querySelectorAll('input[name="version"]');
	versionInputs.forEach(input => {
		input.addEventListener('change', updatePaymentUrlPreviewDisplay);
	});
}

/**
 * Attaches listeners to modal action buttons (copy and apply)
 * @param modal - Bootstrap modal instance
 */
function attachModalActionListeners(modal: bootstrap.Modal): void {
	const modalCopyButton = document.getElementById('modalCopyUrlBtn');
	if (modalCopyButton) {
		modalCopyButton.addEventListener('click', copyUrlFromModalToClipboard);
	}

	const applyUrlChangesButton = document.getElementById('applyUrlChanges');
	if (applyUrlChangesButton) {
		applyUrlChangesButton.addEventListener('click', () => {
			console.log('[attachModalActionListeners] Applying URL changes from modal');
			updatePaymentUrlPreviewDisplay();
			modal.hide();
		});
	}
}

/**
 * Attaches listener to URL Builder button to open modal
 * @param modal - Bootstrap modal instance
 */
function attachUrlBuilderButtonListener(modal: bootstrap.Modal): void {
	const urlBuilderBtn = document.getElementById('urlBuilderBtn');

	if (urlBuilderBtn) {
		urlBuilderBtn.addEventListener('click', () => {
			console.log('[attachUrlBuilderButtonListener] URL Builder button clicked, showing modal');
			modal.show();
		});
		console.log('[attachUrlBuilderButtonListener] Click listener attached to URL Builder button');
	} else {
		console.warn('[attachUrlBuilderButtonListener] urlBuilderBtn not found, modal can only open programmatically');
	}
}

/**
 * Set up event listeners for URL builder form elements
 * Follows same pattern as errorCodes.ts - create modal instance once, reuse it
 */
function setupUrlBuilderEventListeners(): void {
	const doc = globalThis.document;
	if (!doc) return;

	const modalEl = doc.getElementById('urlBuilderModal');

	console.log('[setupUrlBuilderEventListeners] Modal element found:', !!modalEl);

	if (!modalEl) {
		console.error('[setupUrlBuilderEventListeners] urlBuilderModal element not found in DOM');
		return;
	}

	const modal = new window.bootstrap.Modal(modalEl);
	console.log('[setupUrlBuilderEventListeners] Bootstrap Modal instance created');

	attachSubdomainListeners();
	attachDomainAndVersionListeners();
	attachModalActionListeners(modal);
	attachUrlBuilderButtonListener(modal);
}

/**
 * Initialize modal-specific functionality
 */
function initializeUrlBuilderModal(): void {}

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
