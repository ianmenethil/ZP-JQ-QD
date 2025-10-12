/**
 * Email Confirmation Listeners Module
 * @module emailConfirmation
 * @description Handles email confirmation checkbox listeners
 * @version 1.0.0
 */

import { updateCodePreview } from './codePreview.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Event listener initialization error */
class EmailConfirmationError extends Error {
	constructor(
		message: string,
		public readonly listenerType: string,
		public override readonly cause?: Error
	) {
		super(message);
		this.name = 'EmailConfirmationError';
	}
}

// ============================================================================
// MAIN EXPORTS
// ============================================================================

/**
 * Initialize email confirmation listeners
 */
export function initEmailConfirmationListeners(): void {
	try {
		const merchantCb = document.getElementById(
			'sendEmailConfirmationToMerchant'
		) as HTMLInputElement | null;
		const customerCb = document.getElementById(
			'sendEmailConfirmationToCustomer'
		) as HTMLInputElement | null;

		const handler = () => {
			try {
				const paymentConfig = {
					sendEmailConfirmationToMerchant: Boolean(merchantCb?.checked),
					sendEmailConfirmationToCustomer: Boolean(customerCb?.checked),
				};
				console.log(
					`[initEmailConfirmationListeners] paymentConfig: ${JSON.stringify(paymentConfig)}`
				);
				updateCodePreview();
			} catch (error) {
				console.error(
					'[initEmailConfirmationListeners] Error handling email confirmation change:',
					error
				);
			}
		};

		merchantCb?.addEventListener('change', handler);
		customerCb?.addEventListener('change', handler);
	} catch (error) {
		throw new EmailConfirmationError(
			'Failed to initialize email confirmation listeners',
			'emailConfirmation',
			error instanceof Error ? error : undefined
		);
	}
}
