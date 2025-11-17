/**
 * Reusable Modal Module
 * @file modal.ts
 * @description A Bootstrap 5 compatible modal utility with TypeScript type safety
 */

import { bootstrap } from '../globals.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Modal type enumeration for different alert styles
 */
export const MODAL_TYPE = {
	SUCCESS: 'success',
	ERROR: 'danger',
	WARNING: 'warning',
	INFO: 'info',
} as const;

export type ModalType = (typeof MODAL_TYPE)[keyof typeof MODAL_TYPE];

/**
 * Bootstrap Modal instance interface
 */
export interface BootstrapModalInstance {
	show(): void;
	hide(): void;
	toggle(): void;
	dispose(): void;
}

/**
 * Modal creation error class
 */
export class ModalCreationError extends Error {
	public override readonly cause?: Error | undefined;

	constructor(message: string, cause?: Error) {
		super(message);
		this.cause = cause;
		this.name = 'ModalCreationError';
	}
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create or get the notification modal element
 * @returns The modal DOM element
 * @throws {ModalCreationError} When modal creation fails
 */
function getOrCreateModalElement(): HTMLElement {
	try {
		let modal = document.getElementById('appNotificationModal');

		if (!modal) {
			modal = document.createElement('div');
			modal.id = 'appNotificationModal';
			modal.className = 'modal fade notification-modal';
			modal.tabIndex = -1;
			modal.setAttribute('aria-hidden', 'true');
			modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered notification-dialog">
          <div class="modal-content notification-content">
            <div class="modal-header notification-header">
              <h5 class="modal-title"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body notification-body"></div>
            <div class="modal-footer notification-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `;
			document.body.appendChild(modal);
		}

		return modal;
	} catch (error) {
		throw new ModalCreationError(
			'Failed to create or retrieve modal element',
			error instanceof Error ? error : undefined
		);
	}
}

/**
 * Update modal content and styling
 * @param modal - The modal DOM element
 * @param title - Modal title
 * @param message - Modal message content
 * @param type - Modal type for styling
 * @throws {ModalCreationError} When content update fails
 */
function updateModalContent(
	modal: HTMLElement,
	title: string,
	message: string,
	type?: ModalType
): void {
	try {
		const modalTitle = modal.querySelector('.modal-title') as HTMLElement;
		const modalBody = modal.querySelector('.modal-body') as HTMLElement;
		const modalDialog = modal.querySelector('.modal-dialog') as HTMLElement;
		const modalHeader = modal.querySelector('.modal-header') as HTMLElement;

		if (!modalTitle || !modalBody || !modalDialog || !modalHeader) {
			throw new Error('Required modal elements not found');
		}

		// Update content
		modalTitle.textContent = title;
		modalBody.innerHTML = message;

		// Reset styling classes
		modalDialog.classList.remove(
			'border',
			'border-success',
			'border-danger',
			'border-warning',
			'border-info'
		);
		modalHeader.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'text-white');

		// Apply type styling
		if (type) {
			modalHeader.classList.add(`bg-${type}`, 'text-white');
		}
	} catch (error) {
		throw new ModalCreationError(
			'Failed to update modal content',
			error instanceof Error ? error : undefined
		);
	}
}

// ============================================================================
// MAIN MODAL FUNCTIONS
// ============================================================================

/**
 * Show a custom alert modal with specified configuration
 * @param title - Modal title
 * @param message - Modal message content
 * @param type - Modal type (success, danger, warning, info)
 * @param autoClose - Close modal automatically after delay
 * @param closeDelay - Delay before auto-close (in milliseconds)
 * @returns Bootstrap Modal instance
 * @throws {ModalCreationError} When modal creation or display fails
 * @example
 * ```typescript
 * const modal = showModal(
 *   'Success',
 *   'Operation completed successfully',
 *   MODAL_TYPE.SUCCESS,
 *   true,
 *   3000
 * );
 * ```
 */
export function showModal(
	title: string,
	message: string,
	type: ModalType = MODAL_TYPE.INFO,
	autoClose: boolean = false,
	closeDelay: number = 3000
): BootstrapModalInstance {
	try {
		const modal = getOrCreateModalElement();
		updateModalContent(modal, title, message, type);

		// Create and show modal instance
		const modalInstance = new bootstrap.Modal(modal) as BootstrapModalInstance;
		modalInstance.show();

		// Auto-close if requested
		if (autoClose && closeDelay > 0) {
			setTimeout(() => {
				modalInstance.hide();
			}, closeDelay);
		}

		return modalInstance;
	} catch (error) {
		console.error('[showModal] Error displaying modal:', error);
		throw new ModalCreationError(
			`Failed to show modal: ${title}`,
			error instanceof Error ? error : undefined
		);
	}
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Show a success modal with green styling
 * @param title - Modal title
 * @param message - Modal message content
 * @param autoClose - Close modal automatically after delay (default: true)
 * @returns Bootstrap Modal instance
 * @example
 * ```typescript
 * showSuccess('Success', 'Data saved successfully');
 * ```
 */
export function showSuccess(
	title: string,
	message: string,
	autoClose: boolean = true
): BootstrapModalInstance {
	return showModal(title, message, MODAL_TYPE.SUCCESS, autoClose);
}

/**
 * Show an error modal with red styling
 * @param title - Modal title
 * @param message - Modal message content
 * @param autoClose - Close modal automatically after delay (default: false)
 * @returns Bootstrap Modal instance
 * @example
 * ```typescript
 * showError('Error', 'Failed to save data');
 * ```
 */
export function showError(
	title: string,
	message: string,
	autoClose: boolean = false
): BootstrapModalInstance {
	return showModal(title, message, MODAL_TYPE.ERROR, autoClose);
}
