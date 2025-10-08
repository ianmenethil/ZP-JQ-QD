/**
 * @file main.ts
 * @description Main module for event-handler registration and user interactions.
 */

import './applogger.ts';
import { updateCodePreview, updateMinHeightBasedOnMode } from './codePreview.ts';
import { initDownloadFunctionality } from './downloadApp.ts';
import { initErrorCodesSystem } from './errorCodes.ts';
import { initExtendedOptions } from './extendedOptions.ts';
import { initFileInputListener } from './fileInput.ts';
import { paymentMethodsTab } from './globals.ts';
import { initializePaymentUrlBuilder } from './helpers.ts';
import { initInputParametersModal, showParameterModal } from './inputParameters.ts';
import { initOutputParametersModal } from './outputParameters.ts';

import {
	initAdditionalOptionsListeners,
	initCopyCodeListener,
	initCredentialsListeners,
	initEmailConfirmationListeners,
	initInitializePluginListener,
	initModeSelectListener,
	initOptionTooltips,
	initOverrideFeePayerPopover,
	initOverrideFeePayerToggle,
	initPaymentAmountListener,
	initPaymentMethodToggleListeners,
	initPaymentModeChangeTooltip,
	initPaymentModeHoverTooltip,
	initUiMinHeightListener,
	initUserModePopover,
	initUserModeToggle,
	updateActionButtonsState, // Import this function to use after session restoration
} from './initListeners.ts';
import './keyboardShortcuts.ts';
import { initPlaceholder, setupPlaceholderStyling } from './placeholders.ts';
import { loadCredentials, loadState } from './session.ts';
import { initThemeToggle } from './theme.ts';
import { initTooltips } from './tooltips.ts';

/**
 * Initialize the entire application with all required modules and event listeners
 * @returns Promise that resolves when initialization is complete
 * @example
 * ```typescript
 * // Initialize the application
 * await initializeApp();
 * ```
 */
export async function initializeApp(): Promise<void> {
	try {
		// Initialize header elements

		// Initialize tooltips and UI components
		initTooltips();
		initPaymentModeHoverTooltip();
		initPaymentModeChangeTooltip();

		// Initialize form listeners
		initCredentialsListeners();
		initPaymentMethodToggleListeners();
		initAdditionalOptionsListeners();
		initUiMinHeightListener();
		initModeSelectListener();
		initInitializePluginListener();
		initCopyCodeListener();
		initFileInputListener();
		initOptionTooltips();

		// Initialize URL and email listeners (handled by initializePaymentUrlBuilder)
		initEmailConfirmationListeners();
		initOverrideFeePayerPopover();
		initUserModePopover();

		// Initialize theme and UI components
		initThemeToggle();
		initializePaymentUrlBuilder(true);
		initExtendedOptions({ generateCustomerData: false });
		initPlaceholder();
		setupPlaceholderStyling();

		// Initialize payment-specific listeners
		initPaymentAmountListener();
		initUserModeToggle();
		initOverrideFeePayerToggle();

		// Restore session data
		const credentials = loadCredentials();
		if (credentials) {
			const apiKeyInput = document.getElementById('apiKeyInput') as HTMLInputElement;
			const usernameInput = document.getElementById('usernameInput') as HTMLInputElement;
			const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
			const merchantCodeInput = document.getElementById('merchantCodeInput') as HTMLInputElement;

			if (apiKeyInput) apiKeyInput.value = credentials.apiKey;
			if (usernameInput) usernameInput.value = credentials.username;
			if (passwordInput) passwordInput.value = credentials.password;
			if (merchantCodeInput) merchantCodeInput.value = credentials.merchantCode;
		}

		const state = loadState();
		if (state) {
			const callbackUrlInput = document.getElementById('callbackUrlInput') as HTMLInputElement;
			if (callbackUrlInput) callbackUrlInput.value = state.callbackUrl;

			// Restore payment method toggles
			Object.assign(paymentMethodsTab, state.paymentMethods);

			// Update UI toggles to match restored state
			const updateToggle = (id: string, value: boolean) => {
				const toggle = document.getElementById(id) as HTMLInputElement;
				if (toggle) toggle.checked = value;
			};

			updateToggle('allowBankAcOneOffPayment', state.paymentMethods.allowBankAcOneOffPayment);
			updateToggle('allowPayToOneOffPayment', state.paymentMethods.allowPayToOneOffPayment);
			updateToggle('allowPayIdOneOffPayment', state.paymentMethods.allowPayIdOneOffPayment);
			updateToggle('allowApplePayOneOffPayment', state.paymentMethods.allowApplePayOneOffPayment);
			updateToggle('allowGooglePayOneOffPayment', state.paymentMethods.allowGooglePayOneOffPayment);
			updateToggle('allowSlicePayOneOffPayment', state.paymentMethods.allowSlicePayOneOffPayment);
			updateToggle('allowSaveCardUserOption', state.paymentMethods.allowSaveCardUserOption);
		}

		// Generate initial values and update UI
		// Note: Random value generation functions are available but not auto-populating fields
		// generateRandomPaymentAmountForForm(); // Available but not auto-calling
		// generateAndPopulatePaymentIdentifiersInForm(); // Available but not auto-calling
		updateMinHeightBasedOnMode();
		updateCodePreview();

		// Update action buttons state if available
		if (typeof updateActionButtonsState === 'function') {
			updateActionButtonsState();
		} else {
			console.warn('[main] updateActionButtonsState not available after session restoration');
		}

		// Initialize download functionality
		initDownloadFunctionality('#downloadDemoBtn');

		// Initialize error codes system
		initErrorCodesSystem();

		// Initialize parameter modals
		initInputParametersModal();
		initOutputParametersModal();

		// Make showParameterModal globally available for info icons
		(window as any).showParameterModal = showParameterModal;

		console.log('[main] Application initialization completed successfully');
	} catch (error) {
		console.error('[main] Error during application initialization:', error);
		throw new Error(
			`Application initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Initialize the application when the DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
	initializeApp().catch((error) => {
		console.error('[main] Failed to initialize application:', error);
	});
});
