/**
 * @file main.js
 * @description Main module for event-handler registration and user interactions.
 */
import { $ } from './globals.js';
import { initTooltips } from './tooltips.js';
import './keyboardShortcuts.js';
import { initThemeToggle } from './theme.js';
import { initUrlBuilder } from './urlBuilder.js';
import { initExtendedOptions } from './extendedOptions.js';
import { initPlaceholder, setupPlaceholderStyling } from './placeholders.js';
import { restoreSessionValues } from './session.js';
import { updateCodePreview, updateMinHeightBasedOnMode } from './codePreview.js';
import './applogger.js';
import {
	initCredentialsListeners,
	initPaymentMethodToggleListeners,
	initAdditionalOptionsListeners,
	initUiMinHeightListener,
	initModeSelectListener,
	initInitializePluginListener,
	initCopyCodeListener,
	initOptionTooltips,
	initPaymentModeHoverTooltip,
	initPaymentModeChangeTooltip,
	initPaymentAmountListener,
	initUserModeToggle,
	initOverrideFeePayerToggle,
	initUrlBuilderListeners,
	initEmailConfirmationListeners,
	updateActionButtonsState // Import this function to use after session restoration
} from './initListeners.js';
import { generateAndSetUuids } from './helpers.js';
import { initFileInputListener } from './fileInput.js';
import { generateRandomPaymentAmount } from './helpers.js';
import { initDownloadFunctionality } from './downloadApp.js'; // Import the new init function

export function initializeApp() {
	initTooltips();
	initPaymentModeHoverTooltip();
	initPaymentModeChangeTooltip();
	initCredentialsListeners();
	initPaymentMethodToggleListeners();
	initAdditionalOptionsListeners();
	initUiMinHeightListener();
	initModeSelectListener();
	initInitializePluginListener();
	initCopyCodeListener();
	initFileInputListener();
	initOptionTooltips();

	initUrlBuilderListeners();
	initEmailConfirmationListeners();

	initThemeToggle();
	initUrlBuilder(true);
	initExtendedOptions(false);
	initPlaceholder();
	setupPlaceholderStyling();

	initPaymentAmountListener();
	initUserModeToggle();
	initOverrideFeePayerToggle();

	restoreSessionValues();

	generateRandomPaymentAmount();
	updateMinHeightBasedOnMode();
	generateAndSetUuids();
	updateCodePreview();

	if (typeof updateActionButtonsState === 'function') {
		updateActionButtonsState();
	} else {
		console.warn('[main] updateActionButtonsState not available after session restoration');
	}
	initDownloadFunctionality('#downloadDemoBtn');
}

$(document).ready(initializeApp);
