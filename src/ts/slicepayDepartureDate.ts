import { updateCodePreview } from './codePreview.ts';
import { bootstrap } from './globals.ts';

/**
 * SlicePay Departure Date functionality
 * Handles the automatic date selection modal when SlicePay is enabled
 */

class SlicePayDepartureDateError extends Error {
	constructor(
		message: string,
		public readonly operation: string,
		public override readonly cause?: Error
	) {
		super(message);
		this.name = 'SlicePayDepartureDateError';
	}
}

/**
 * Calculate date 21 days from today in YYYY-MM-DD format
 */
function calculateDepartureDate(): string {
	const today = new Date();
	const departureDate = new Date(today);
	departureDate.setDate(today.getDate() + 21);
	const isoDate = departureDate.toISOString().split('T')[0];
	return isoDate ?? '';
}

/**
 * Show departure date modal
 */
function showDepartureDateModal(): void {
	try {
		const modalElement = document.getElementById('slicePayDepartureDateModal');
		if (!modalElement) {
			throw new Error('SlicePay departure date modal not found');
		}

		const dateInput = document.getElementById('departureDateInput') as HTMLInputElement;
		if (!dateInput) {
			throw new Error('Departure date input not found');
		}

		// Calculate and set the departure date (21 days ahead)
		const departureDate = calculateDepartureDate();
		dateInput.value = departureDate;
		dateInput.min = departureDate;

		// Show the modal
		const modal = new bootstrap.Modal(modalElement);
		modal.show();
	} catch (error) {
		throw new SlicePayDepartureDateError(
			'Failed to show departure date modal',
			'showDepartureDateModal',
			error instanceof Error ? error : undefined
		);
	}
}

/**
 * Handle cancel button - uncheck SlicePay and hide modal
 */
function handleCancel(): void {
	const slicePayCheckbox = document.getElementById(
		'allowSlicePayOneOffPayment'
	) as HTMLInputElement;
	if (slicePayCheckbox) {
		slicePayCheckbox.checked = false;
	}

	const modalElement = document.getElementById('slicePayDepartureDateModal');
	if (modalElement) {
		const modal = bootstrap.Modal.getInstance(modalElement);
		modal?.hide();
	}

	updateCodePreview();
}

/**
 * Handle confirm button - hide modal and update preview
 */
function handleConfirm(): void {
	const modalElement = document.getElementById('slicePayDepartureDateModal');
	if (modalElement) {
		const modal = bootstrap.Modal.getInstance(modalElement);
		modal?.hide();
	}

	updateCodePreview();
}

/**
 * Initialize SlicePay departure date functionality
 */
export function initSlicePayDepartureDate(): void {
	try {
		const slicePayCheckbox = document.getElementById(
			'allowSlicePayOneOffPayment'
		) as HTMLInputElement;
		if (!slicePayCheckbox) {
			console.warn('[initSlicePayDepartureDate] SlicePay checkbox not found');
			return;
		}

		// Get modal and buttons
		const modalElement = document.getElementById('slicePayDepartureDateModal');
		const cancelBtn = document.getElementById('slicePayCancelBtn');
		const confirmBtn = document.getElementById('slicePayConfirmBtn');

		if (!modalElement || !cancelBtn || !confirmBtn) {
			console.warn('[initSlicePayDepartureDate] Modal elements not found');
			return;
		}

		// Add event listener for SlicePay toggle
		slicePayCheckbox.addEventListener('change', function (this: HTMLInputElement) {
			if (this.checked) {
				// SlicePay is being enabled - show departure date modal
				showDepartureDateModal();
			} else {
				// SlicePay is being disabled - clear departure date
				const dateInput = document.getElementById('departureDateInput') as HTMLInputElement;
				if (dateInput) {
					dateInput.value = '';
				}
				updateCodePreview();
			}
		});

		// Add event listeners for modal buttons
		cancelBtn.addEventListener('click', handleCancel);
		confirmBtn.addEventListener('click', handleConfirm);

		// Handle modal close via backdrop or X button
		modalElement.addEventListener('hidden.bs.modal', () => {
			// If SlicePay is still checked but no date saved, uncheck it
			if (slicePayCheckbox.checked) {
				const dateInput = document.getElementById('departureDateInput') as HTMLInputElement;
				if (!dateInput?.value) {
					slicePayCheckbox.checked = false;
					updateCodePreview();
				}
			}
		});

		console.log('[initSlicePayDepartureDate] SlicePay departure date functionality initialized');
	} catch (error) {
		console.error('[initSlicePayDepartureDate] Error initializing:', error);
		throw new SlicePayDepartureDateError(
			'Failed to initialize SlicePay departure date functionality',
			'initSlicePayDepartureDate',
			error instanceof Error ? error : undefined
		);
	}
}
