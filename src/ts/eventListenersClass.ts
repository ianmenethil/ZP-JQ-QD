/**
 * Event Listeners Class with grouped methods and decorator-based error handling
 * Replaces the many individual init functions with organized, maintainable code
 */

import { HandleErrors } from './core/applogger.ts';
import { updateActionButtonsState } from './ui/buttonState.ui.ts';
import { updateCodePreview, updateMinHeightBasedOnMode } from './codePreview.ts';
import { initEmailConfirmationListeners } from './emailConfirmation.ts';
import { DomUtils } from './globals.ts';
import { initializeZenPayPlugin } from './initZP.ts';
import { FIELD_IDS } from './placeholders.ts';
import { copyTextToClipboard, formatPaymentAmount } from './utilities.ts';

export class EventListeners {
	/**
	 * Initialize all form input listeners (credentials, payment amount, mode, etc.)
	 */
	@HandleErrors('initFormListeners')
	initFormListeners(): void {
		// Credentials listeners
		const credentialSelectors = [
			FIELD_IDS.API_KEY,
			FIELD_IDS.USERNAME,
			FIELD_IDS.PASSWORD,
			FIELD_IDS.MERCHANT_CODE,
		];

		const handleCredentialBlur = () => {
			updateCodePreview();
			updateActionButtonsState();
		};

		credentialSelectors.forEach((sel) => {
			const el = document.querySelector<HTMLElement>(sel);
			if (el) {
				DomUtils.on(sel, 'blur', handleCredentialBlur);
			}
		});

		// Payment amount listener
		const paymentAmountEl = document.getElementById(
			'paymentAmountInput'
		) as HTMLInputElement | null;
		paymentAmountEl?.addEventListener('blur', function (this: HTMLInputElement) {
			const rawValue = this.value ?? '';
			const numericValue = Number.parseFloat(rawValue || '0');
			const formatted = formatPaymentAmount(numericValue);
			this.value = formatted;
			updateCodePreview();
		});

		// Mode select listener
		const modeSelect = document.getElementById('modeSelect') as HTMLSelectElement | null;
		modeSelect?.addEventListener('change', function (this: HTMLSelectElement) {
			updateMinHeightBasedOnMode();
			updateCodePreview();
		});

		// Additional form field listeners for live updates
		const additionalFieldSelectors = [
			FIELD_IDS.CONTACT_NUMBER,
			FIELD_IDS.ADDITIONAL_REFERENCE,
			FIELD_IDS.CUSTOMER_NAME,
			FIELD_IDS.CUSTOMER_EMAIL,
			FIELD_IDS.REDIRECT_URL,
			FIELD_IDS.CALLBACK_URL,
		];

		additionalFieldSelectors.forEach((sel) => {
			const el = document.querySelector<HTMLElement>(sel);
			if (el) {
				DomUtils.on(sel, 'blur', () => updateCodePreview());
				DomUtils.on(sel, 'input', () => updateCodePreview());
			}
		});

		// Special handling for contact number - only allow digits
		const contactNumberEl = document.getElementById(
			'contactNumberInput'
		) as HTMLInputElement | null;
		contactNumberEl?.addEventListener('input', function (this: HTMLInputElement) {
			// Remove any non-digit characters
			this.value = this.value.replace(/[^0-9]/g, '');
		});
	}

	/**
	 * Initialize all button listeners (initialize plugin, copy code, etc.)
	 */
	@HandleErrors('initButtonListeners')
	initButtonListeners(): void {
		// Initialize Plugin button
		const initBtn = document.getElementById('initializePlugin');
		initBtn?.addEventListener('click', () => {
			initializeZenPayPlugin();
		});

		// Copy Code button
		const copyBtn = document.getElementById('copyCodeBtn') as HTMLButtonElement;
		copyBtn?.addEventListener('click', async () => {
			const codeText = DomUtils.getText('#codePreview');
			if (codeText) {
				await copyTextToClipboard(codeText, { button: copyBtn });
			}
		});
	}

	/**
	 * Initialize all toggle/checkbox listeners (payment methods, options, etc.)
	 */
	@HandleErrors('initToggleListeners')
	initToggleListeners(): void {
		// Payment method toggles - only update code preview, no individual session saves
		document.querySelectorAll<HTMLInputElement>('.payment-method-toggle').forEach((el) => {
			el.addEventListener('change', function (this: HTMLInputElement) {
				updateCodePreview();
			});
		});

		// Additional options toggles - only update code preview, no individual session saves
		document.querySelectorAll<HTMLInputElement>('.option-toggle').forEach((el) => {
			el.addEventListener('change', function (this: HTMLInputElement) {
				updateCodePreview();
			});
		});

		// User Mode toggles - only update code preview, no individual session saves
		document.querySelectorAll<HTMLInputElement>('input[name="userMode"]').forEach((el) => {
			el.addEventListener('change', function (this: HTMLInputElement) {
				updateCodePreview();
			});
		});

		// Override Fee Payer toggles - only update code preview, no individual session saves
		document.querySelectorAll<HTMLInputElement>('input[name="overrideFeePayer"]').forEach((el) => {
			el.addEventListener('change', function (this: HTMLInputElement) {
				updateCodePreview();
			});
		});
	}

	/**
	 * Initialize email confirmation listeners
	 */
	@HandleErrors('initEmailListeners')
	initEmailListeners(): void {
		initEmailConfirmationListeners();
	}

	/**
	 * Initialize all listeners at once
	 */
	@HandleErrors('initAllListeners')
	initAllListeners(): void {
		this.initFormListeners();
		this.initButtonListeners();
		this.initToggleListeners();
		this.initEmailListeners();
	}
}
