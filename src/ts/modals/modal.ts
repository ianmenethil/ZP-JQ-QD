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

// /**
//  * Modal configuration interface
//  */
// export interface ModalConfig {
// 	title: string;
// 	message: string;
// 	type?: ModalType;
// 	autoClose?: boolean;
// 	closeDelay?: number;
// 	size?: 'sm' | 'lg' | 'xl';
// 	centered?: boolean;
// }

/**
 * Modal accessibility options
 */
// export interface ModalAccessibilityOptions {
// 	ariaLabel?: string;
// 	ariaDescribedBy?: string;
// 	role?: string;
// }

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

// /**
//  * Show a modal using configuration object
//  * @param config - Modal configuration object
//  * @returns Bootstrap Modal instance
//  * @example
//  * ```typescript
//  * const modal = showModalWithConfig({
//  *   title: 'Warning',
//  *   message: 'Please check your input',
//  *   type: MODAL_TYPE.WARNING,
//  *   autoClose: true,
//  *   closeDelay: 5000
//  * });
//  * ```
//  */
// export function showModalWithConfig(config: ModalConfig): BootstrapModalInstance {
// 	return showModal(
// 		config.title,
// 		config.message,
// 		config.type || MODAL_TYPE.INFO,
// 		config.autoClose || false,
// 		config.closeDelay || 3000
// 	);
// }

// ---------------------------------------------------------------------------
// Custom modal API (for complex content like tables)
// ---------------------------------------------------------------------------

// export interface CustomModalOptions {
// 	dialogClass?: string; // e.g. 'modal-xl'
// 	scrollable?: boolean; // add modal-dialog-scrollable
// 	footer?: string | Node | null;
// 	onShown?: (modal: HTMLElement, instance: BootstrapModalInstance) => void;
// 	onHidden?: (modal: HTMLElement) => void;
// 	autoRemove?: boolean; // remove modal DOM on hide (default true)
// 	accessibility?: ModalAccessibilityOptions;
// }

// /**
//  * Show a custom modal with arbitrary DOM content. The content can be a Node (preferred)
//  * or an HTML string. Returns the Bootstrap Modal instance. The modal DOM is removed
//  * after it is hidden by default to avoid leaking nodes; set autoRemove=false to keep it.
//  */
// export function showCustomModal(
// 	title: string,
// 	content: string | Node,
// 	opts: CustomModalOptions = {}
// ): BootstrapModalInstance {
// 	try {
// 		const modal = document.createElement('div');
// 		modal.className = 'modal fade';
// 		modal.tabIndex = -1;
// 		modal.setAttribute('aria-hidden', 'true');

// 		const dialogClass = ['modal-dialog', opts.dialogClass].filter(Boolean).join(' ');
// 		const scrollableClass = opts.scrollable ? ' modal-dialog-scrollable' : '';

// 		modal.innerHTML = `
//       <div class="${dialogClass}${scrollableClass}" role="document">
//         <div class="modal-content">
//           <div class="modal-header">
//             <h5 class="modal-title"></h5>
//             <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//           </div>
//           <div class="modal-body"></div>
//           <div class="modal-footer"></div>
//         </div>
//       </div>
//     `;

// 		// set title and body content
// 		const titleEl = modal.querySelector('.modal-title') as HTMLElement | null;
// 		const bodyEl = modal.querySelector('.modal-body') as HTMLElement | null;
// 		const footerEl = modal.querySelector('.modal-footer') as HTMLElement | null;

// 		if (!titleEl || !bodyEl || !footerEl) {
// 			throw new ModalCreationError('Failed to create custom modal structure');
// 		}

// 		titleEl.textContent = title;

// 		if (typeof content === 'string') {
// 			// caller-provided HTML string (assumed safe/trusted). Prefer Node usage.
// 			bodyEl.innerHTML = content;
// 		} else {
// 			bodyEl.appendChild(content);
// 		}

// 		if (opts.footer) {
// 			if (typeof opts.footer === 'string') {
// 				footerEl.innerHTML = opts.footer;
// 			} else {
// 				footerEl.appendChild(opts.footer);
// 			}
// 		}

// 		document.body.appendChild(modal);

// 		const modalInstance = new bootstrap.Modal(modal) as BootstrapModalInstance;

// 		const cleanup = () => {
// 			try {
// 				modalInstance.dispose();
// 			} catch {
// 				// ignore
// 			}
// 			if (opts.autoRemove !== false) {
// 				modal.remove();
// 			}
// 		};

// 		modal.addEventListener('shown.bs.modal', () => {
// 			try {
// 				opts.onShown?.(modal, modalInstance);
// 			} catch {
// 				console.warn('[showCustomModal] onShown handler error');
// 			}
// 		});

// 		modal.addEventListener('hidden.bs.modal', () => {
// 			try {
// 				opts.onHidden?.(modal);
// 			} catch {
// 				console.warn('[showCustomModal] onHidden handler error');
// 			}
// 			cleanup();
// 		});

// 		modalInstance.show();
// 		return modalInstance;
// 	} catch (error) {
// 		console.error('[showCustomModal] Error creating custom modal:', error);
// 		throw new ModalCreationError(
// 			'Failed to show custom modal',
// 			error instanceof Error ? error : undefined
// 		);
// 	}
// }

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

// /**
//  * Show a warning modal with yellow styling
//  * @param title - Modal title
//  * @param message - Modal message content
//  * @param autoClose - Close modal automatically after delay (default: true)
//  * @returns Bootstrap Modal instance
//  * @example
//  * ```typescript
//  * showWarning('Warning', 'Please verify your input');
//  * ```
//  */
// export function showWarning(
// 	title: string,
// 	message: string,
// 	autoClose: boolean = true
// ): BootstrapModalInstance {
// 	return showModal(title, message, MODAL_TYPE.WARNING, autoClose);
// }

// /**
//  * Show an info modal with blue styling
//  * @param title - Modal title
//  * @param message - Modal message content
//  * @param autoClose - Close modal automatically after delay (default: true)
//  * @returns Bootstrap Modal instance
//  * @example
//  * ```typescript
//  * showInfo('Information', 'Process completed');
//  * ```
//  */
// export function showInfo(
// 	title: string,
// 	message: string,
// 	autoClose: boolean = true
// ): BootstrapModalInstance {
// 	return showModal(title, message, MODAL_TYPE.INFO, autoClose);
// }

// ============================================================================
// CONFIRMATION MODAL FUNCTIONS
// ============================================================================

/**
 * Confirmation modal options interface
 */
// export interface ConfirmationModalOptions {
// 	confirmText?: string;
// 	cancelText?: string;
// 	type?: ModalType;
// 	onConfirm?: () => void | Promise<void>;
// 	onCancel?: () => void;
// }

// /**
//  * Show a confirmation modal with custom actions
//  * @param title - Modal title
//  * @param message - Modal message content
//  * @param options - Confirmation modal options
//  * @returns Promise that resolves with user's choice
//  * @example
//  * ```typescript
//  * const confirmed = await showConfirmation(
//  *   'Delete Item',
//  *   'Are you sure you want to delete this item?',
//  *   {
//  *     confirmText: 'Delete',
//  *     type: MODAL_TYPE.ERROR,
//  *     onConfirm: () => console.log('Deleted!')
//  *   }
//  * );
//  * ```
//  */
// export function showConfirmation(
// 	title: string,
// 	message: string,
// 	options: ConfirmationModalOptions = {}
// ): Promise<boolean> {
// 	return new Promise((resolve) => {
// 		try {
// 			const {
// 				confirmText = 'Confirm',
// 				cancelText = 'Cancel',
// 				type = MODAL_TYPE.WARNING,
// 				onConfirm,
// 				onCancel,
// 			} = options;

// 			const modal = document.createElement('div');
// 			modal.className = 'modal fade';
// 			modal.tabIndex = -1;
// 			modal.setAttribute('aria-hidden', 'true');

// 			modal.innerHTML = `
//                 <div class="modal-dialog modal-dialog-centered">
//                     <div class="modal-content">
//                         <div class="modal-header bg-${type} text-white">
//                             <h5 class="modal-title">${title}</h5>
//                             <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
//                         </div>
//                         <div class="modal-body">
//                             ${message}
//                         </div>
//                         <div class="modal-footer">
//                             <button type="button" class="btn btn-secondary cancel-btn" data-bs-dismiss="modal">${cancelText}</button>
//                             <button type="button" class="btn btn-${type} confirm-btn">${confirmText}</button>
//                         </div>
//                     </div>
//                 </div>
//             `;

// 			document.body.appendChild(modal);

// 			const modalInstance = new bootstrap.Modal(modal) as BootstrapModalInstance;
// 			const confirmBtn = modal.querySelector('.confirm-btn') as HTMLButtonElement;
// 			const cancelBtn = modal.querySelector('.cancel-btn') as HTMLButtonElement;

// 			const cleanup = () => {
// 				try {
// 					modalInstance.dispose();
// 				} catch {
// 					// ignore
// 				}
// 				modal.remove();
// 			};

// 			confirmBtn.addEventListener('click', async () => {
// 				try {
// 					await onConfirm?.();
// 					modalInstance.hide();
// 					resolve(true);
// 				} catch (error) {
// 					console.error('[showConfirmation] onConfirm error:', error);
// 					resolve(false);
// 				}
// 			});

// 			cancelBtn.addEventListener('click', () => {
// 				try {
// 					onCancel?.();
// 					resolve(false);
// 				} catch (error) {
// 					console.error('[showConfirmation] onCancel error:', error);
// 					resolve(false);
// 				}
// 			});

// 			modal.addEventListener('hidden.bs.modal', cleanup);
// 			modalInstance.show();
// 		} catch (error) {
// 			console.error('[showConfirmation] Error creating confirmation modal:', error);
// 			resolve(false);
// 		}
// 	});
// }

// ============================================================================
// TOAST NOTIFICATIONS (Alternative to modals for quick feedback)
// ============================================================================

/**
 * Toast notification options interface
 */
// export interface ToastOptions {
// 	type?: ModalType;
// 	duration?: number;
// 	position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
// 	dismissible?: boolean;
// }

/**
 * Show a toast notification (alternative to modal for quick feedback)
 * @param message - Toast message content
 * @param options - Toast options
 * @returns Promise that resolves when toast is dismissed
 * @example
 * ```typescript
 * await showToast('Data saved successfully', {
 *   type: MODAL_TYPE.SUCCESS,
 *   duration: 3000,
 *   position: 'top-right'
 * });
 * ```
 */
// export function showToast(message: string, options: ToastOptions = {}): Promise<void> {
// 	return new Promise((resolve) => {
// 		try {
// 			const {
// 				type = MODAL_TYPE.INFO,
// 				duration = 3000,
// 				position = 'top-right',
// 				dismissible = true,
// 			} = options;

// 			// Create or get toast container
// 			let container = document.getElementById('toast-container');
// 			if (!container) {
// 				container = document.createElement('div');
// 				container.id = 'toast-container';
// 				container.className = `position-fixed ${
// 					position === 'top-right'
// 						? 'top-0 end-0'
// 						: position === 'top-left'
// 							? 'top-0 start-0'
// 							: position === 'bottom-right'
// 								? 'bottom-0 end-0'
// 								: position === 'bottom-left'
// 									? 'bottom-0 start-0'
// 									: 'top-0 start-50 translate-middle-x'
// 				} p-3`;
// 				container.style.zIndex = '1080';
// 				document.body.appendChild(container);
// 			}

// 			const toast = document.createElement('div');
// 			toast.className = `toast align-items-center text-bg-${type} border-0`;
// 			toast.setAttribute('role', 'alert');
// 			toast.setAttribute('aria-live', 'assertive');
// 			toast.setAttribute('aria-atomic', 'true');

// 			toast.innerHTML = `
//                 <div class="d-flex">
//                     <div class="toast-body">
//                         ${message}
//                     </div>
//                     ${dismissible ? '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>' : ''}
//                 </div>
//             `;

// 			container.appendChild(toast);

// 			// Use Bootstrap's Toast component if available
// 			if (bootstrap.Toast) {
// 				const toastInstance = new bootstrap.Toast(toast, {
// 					autohide: duration > 0,
// 					delay: duration,
// 				});

// 				toast.addEventListener('hidden.bs.toast', () => {
// 					toast.remove();
// 					resolve();
// 				});

// 				toastInstance.show();
// 			} else {
// 				// Fallback without Bootstrap Toast
// 				if (duration > 0) {
// 					setTimeout(() => {
// 						toast.remove();
// 						resolve();
// 					}, duration);
// 				}
// 			}
// 		} catch (error) {
// 			console.error('[showToast] Error creating toast:', error);
// 			resolve();
// 		}
// 	});
// }

// ============================================================================
// MODAL UTILITIES
// ============================================================================

/**
 * Check if any modal is currently open
 * @returns True if at least one modal is open
 */
// export function isModalOpen(): boolean {
// 	return document.querySelectorAll('.modal.show').length > 0;
// }

/**
 * Close all open modals
 * @example
 * ```typescript
 * closeAllModals();
 * ```
 */
// export function closeAllModals(): void {
// 	try {
// 		const openModals = document.querySelectorAll('.modal.show');
// 		openModals.forEach((modal) => {
// 			const modalInstance = bootstrap.Modal.getInstance(modal as HTMLElement);
// 			if (modalInstance) {
// 				modalInstance.hide();
// 			}
// 		});
// 	} catch (error) {
// 		console.error('[closeAllModals] Error closing modals:', error);
// 	}
// }

// /**
//  * Get the currently active modal element
//  * @returns The active modal element or null if none is active
//  */
// export function getActiveModal(): HTMLElement | null {
// 	return document.querySelector('.modal.show') as HTMLElement | null;
// }
