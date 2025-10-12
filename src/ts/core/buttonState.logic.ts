/**
 * Button State Logic Module
 * @module core/buttonState.logic
 * @description Pure validation logic for button state management (no DOM)
 * @version 1.0.0
 */

import { DomUtils } from '../globals.ts';
import { FIELD_IDS } from '../placeholders.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Event listener initialization error */
export class EventListenerError extends Error {
	constructor(
		message: string,
		public readonly listenerType: string,
		public override readonly cause?: Error
	) {
		super(message);
		this.name = 'EventListenerError';
	}
}

// ============================================================================
// PURE VALIDATION FUNCTIONS
// ============================================================================

/**
 * Gets the value of a form field by selector
 * @param selector - CSS selector for the field
 * @returns Field value as string
 */
function getFieldValue(selector: string): string {
	return DomUtils.getValue(selector);
}

/**
 * Checks if all required credential fields are filled
 * @returns True if all credentials are present
 */
export function areCredentialsFilled(): boolean {
	const apiKey = getFieldValue(FIELD_IDS.API_KEY);
	const username = getFieldValue(FIELD_IDS.USERNAME);
	const password = getFieldValue(FIELD_IDS.PASSWORD);
	const merchantCode = getFieldValue(FIELD_IDS.MERCHANT_CODE);
	return !!(apiKey && username && password && merchantCode);
}
