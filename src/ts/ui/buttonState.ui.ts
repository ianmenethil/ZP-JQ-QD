/**
 * Button State UI Module
 * @module ui/buttonState.ui
 * @description DOM manipulation for button state updates
 * @version 1.0.0
 */

import { areCredentialsFilled, EventListenerError } from '../core/buttonState.logic.ts';
import { DomUtils } from '../globals.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Button state configuration interface */
interface ButtonStateConfig {
	element: HTMLElement | null;
	enabledTitle: string;
	disabledTitle: string;
	enabledClass?: string;
	disabledClass?: string;
}

// ============================================================================
// DOM MANIPULATION FUNCTIONS
// ============================================================================

/**
 * Updates button state (enabled/disabled) with styling and title
 * @param config - Button state configuration
 * @param isEnabled - Whether button should be enabled
 */
function updateButtonState(config: ButtonStateConfig, isEnabled: boolean): void {
	const {
		element,
		enabledTitle,
		disabledTitle,
		enabledClass = '',
		disabledClass = 'btn-disabled',
	} = config;
	if (!element) {
		console.warn('[updateButtonState] Button element not found');
		return;
	}
	if (isEnabled) {
		element.removeAttribute('disabled');
		DomUtils.removeClass(element, disabledClass);
		if (enabledClass) DomUtils.addClass(element, enabledClass);
		element.setAttribute('title', enabledTitle);
		// Update button text to enabled state (only if button has text content)
		const buttonText = element.querySelector('.btn-text');
		if (buttonText) {
			buttonText.textContent = enabledTitle;
		}
	} else {
		element.setAttribute('disabled', 'disabled');
		DomUtils.addClass(element, disabledClass);
		if (enabledClass) DomUtils.removeClass(element, enabledClass);
		element.setAttribute('title', disabledTitle);
		// Update button text to disabled state (only if button has text content)
		const buttonText = element.querySelector('.btn-text');
		if (buttonText) {
			buttonText.textContent = disabledTitle;
		}
	}
}

/**
 * Updates all action buttons (Download, Initialize) based on credential status
 * @throws {EventListenerError} If button state update fails
 */
export function updateActionButtonsState(): void {
	try {
		const credentialsFilled = areCredentialsFilled();

		const downloadButtonConfig: ButtonStateConfig = {
			element: document.querySelector('#downloadDemoBtn'),
			enabledTitle: 'Download Demo',
			disabledTitle: 'Fill in credentials first',
			enabledClass: 'btn-primary',
			disabledClass: 'btn-secondary',
		};

		const initializeButtonConfig: ButtonStateConfig = {
			element: document.querySelector('#initializePlugin'),
			enabledTitle: 'Initialize Plugin',
			disabledTitle: 'Fill in credentials first',
			enabledClass: 'btn-success',
			disabledClass: 'btn-secondary',
		};

		updateButtonState(downloadButtonConfig, credentialsFilled);
		updateButtonState(initializeButtonConfig, credentialsFilled);
	} catch (error) {
		throw new EventListenerError(
			'Failed to update action button states',
			'buttonState',
			error instanceof Error ? error : undefined
		);
	}
}
