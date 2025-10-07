/**
 * Keyboard Shortcuts Module
 * @file keyboardShortcuts.ts
 * @description Global keyboard shortcuts for development and debugging with TypeScript type safety
 */

import { updateCodePreview } from './codePreview.ts';
import { DomUtils } from './globals.ts';
import { showError, showSuccess } from './modal.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Keyboard shortcut configuration interface
 */
export interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    description: string;
    handler: (event: KeyboardEvent) => void;
}

/**
 * Code preview edit state interface
 */
export interface CodePreviewEditState {
    isEditable: boolean;
    blurHandler: ((this: HTMLElement, event: FocusEvent) => void) | null;
}

/**
 * Form field mapping interface for code preview editing
 */
export interface FormFieldMapping {
    [key: string]: {
        selector: string;
        isNumeric?: boolean;
    };
}

/**
 * Keyboard shortcut error class
 */
export class KeyboardShortcutError extends Error {
    constructor(
        message: string,
        public readonly shortcut?: string,
        public override readonly cause?: Error
    ) {
        super(message);
        this.name = 'KeyboardShortcutError';
    }
}

// ============================================================================
// CONSTANTS AND STATE
// ============================================================================

/**
 * Global state for code preview editing
 */
const codePreviewEditState: CodePreviewEditState = {
    isEditable: false,
    blurHandler: null,
};

/**
 * Form field mappings for code preview editing
 */
const FORM_FIELD_MAPPINGS: FormFieldMapping = {
    timeStamp: { selector: '#timeStampInput' },
    merchantCode: { selector: '#merchantCodeInput' },
    apiKey: { selector: '#apiKeyInput' },
    fingerprint: { selector: '#fingerprintInput' },
    paymentAmount: { selector: '#paymentAmountInput', isNumeric: true },
    merchantUniquePaymentId: { selector: '#merchantUniquePaymentIdInput' },
    mode: { selector: '#modeSelect', isNumeric: true },
    redirectUrl: { selector: '#redirectUrlInput' },
    callbackUrl: { selector: '#callbackUrlInput' },
    customerReference: { selector: '#customerReferenceInput' },
    customerName: { selector: '#customerNameInput' },
    customerEmail: { selector: '#customerEmailInput' },
    url: { selector: '#urlInput' },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a keyboard event matches a shortcut configuration
 * @param event - Keyboard event
 * @param shortcut - Shortcut configuration
 * @returns True if the event matches the shortcut
 */
function matchesShortcut(event: KeyboardEvent, shortcut: Partial<KeyboardShortcut>): boolean {
    return (
        event.key.toLowerCase() === shortcut.key?.toLowerCase() &&
        !!event.ctrlKey === !!shortcut.ctrlKey &&
        !!event.shiftKey === !!shortcut.shiftKey &&
        !!event.altKey === !!shortcut.altKey &&
        !!event.metaKey === !!shortcut.metaKey
    );
}

/**
 * Create CSS styles for editable code preview
 */
function createEditableCodeStyles(): void {
    if (document.getElementById('edit-code-styles')) {
        return; // Styles already exist
    }

    const styleTag = document.createElement('style');
    styleTag.id = 'edit-code-styles';
    styleTag.textContent = `
    .editable-code {
      border: 2px solid #4CAF50 !important;
      background-color: rgba(76, 175, 80, 0.05) !important;
      cursor: text !important;
    }
    .editable-code:focus {
      outline: none !important;
      box-shadow: 0 0 5px #4CAF50 !important;
    }
  `;
    document.head.appendChild(styleTag);
}

/**
 * Parse value from code preview content
 * @param content - Code preview content
 * @param fieldName - Field name to extract
 * @param isNumeric - Whether the field should be parsed as a number
 * @returns Parsed value or null if not found
 */
function parseFieldFromCode(content: string, fieldName: string, isNumeric: boolean = false): string | number | null {
    try {
        // Build regex that matches either "key":"value" or key:1234
        const regex = new RegExp(`${fieldName}\\s*:\\s*(?:"([^"]*)"|([0-9.]+))`);
        const match = content.match(regex);

        if (match) {
            // Pick whichever capture group matched
            const rawValue = match[1] ?? match[2];

            if (rawValue && isNumeric && /^[0-9.]+$/.test(rawValue)) {
                return parseFloat(rawValue);
            }

            return rawValue ?? null;
        }

        return null;
    } catch (error) {
        console.warn(`[parseFieldFromCode] Error parsing field ${fieldName}:`, error);
        return null;
    }
}

/**
 * Update form fields from code preview content
 * @param content - Code preview content
 * @returns Array of updated field names
 */
function updateFormFieldsFromCode(content: string): string[] {
    const updatedFields: string[] = [];

    Object.entries(FORM_FIELD_MAPPINGS).forEach(([fieldName, config]) => {
        try {
            const value = parseFieldFromCode(content, fieldName, config.isNumeric);

            if (value !== null) {
                try {
                    DomUtils.setValue(config.selector, String(value));
                    updatedFields.push(fieldName);
                } catch (error) {
                    console.warn(`[updateFormFieldsFromCode] Could not update field ${fieldName}:`, error);
                }
            }
        } catch (error) {
            console.warn(`[updateFormFieldsFromCode] Error updating field ${fieldName}:`, error);
        }
    });

    return updatedFields;
}

// ============================================================================
// SHORTCUT HANDLERS
// ============================================================================

/**
 * Handle storage clear shortcut (Ctrl+Alt+Shift+C)
 * @param event - Keyboard event
 */
function handleStorageClearShortcut(event: KeyboardEvent): void {
    try {
        event.preventDefault();

        sessionStorage.clear();
        localStorage.clear();

        console.info('[KeyboardShortcuts] Session and Local Storage cleared via Ctrl+Alt+Shift+C');

        showSuccess(
            'Storage Cleared',
            'Session and Local Storage have been successfully cleared.',
            true
        );
    } catch (error) {
        console.error('[KeyboardShortcuts] Error clearing storage:', error);

        showError(
            'Error Clearing Storage',
            `An error occurred while clearing storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
            false
        );
    }
}

/**
 * Create blur handler for code preview editing
 * @returns Blur event handler function
 */
function createCodePreviewBlurHandler(): (this: HTMLElement, event: FocusEvent) => void {
    return function (this: HTMLElement, _event: FocusEvent): void {
        try {
            if (this.contentEditable === 'true') {
                const currentCode = this.textContent || '';
                const updatedFields = updateFormFieldsFromCode(currentCode);

                if (updatedFields.length > 0) {
                    console.info('[KeyboardShortcuts] Form updated from edited code preview:', updatedFields.join(', '));

                    // Trigger blur events on updated fields
                    updatedFields.forEach(fieldName => {
                        const config = FORM_FIELD_MAPPINGS[fieldName];
                        if (config) {
                            const element = document.querySelector(config.selector) as HTMLInputElement;
                            if (element) {
                                element.dispatchEvent(new Event('blur', { bubbles: true }));
                            }
                        }
                    });
                }

                updateCodePreview();
            }
        } catch (error) {
            console.error('[KeyboardShortcuts] Error in code preview blur handler:', error);
        }
    };
}

/**
 * Enable code preview editing
 * @param codePreview - Code preview element
 */
function enableCodePreviewEditing(codePreview: HTMLElement): void {
    try {
        codePreview.contentEditable = 'true';
        codePreview.classList.add('editable-code');
        codePreview.spellcheck = true;
        codePreview.tabIndex = 0;

        // Create and add blur handler
        if (!codePreviewEditState.blurHandler) {
            codePreviewEditState.blurHandler = createCodePreviewBlurHandler();
            codePreview.addEventListener('blur', codePreviewEditState.blurHandler);
        }

        codePreview.focus();
        createEditableCodeStyles();
        codePreviewEditState.isEditable = true;

        showSuccess(
            'Code Preview Unlocked',
            'You can now edit the code preview directly. Blur to attempt updating form fields. Press Ctrl+Alt+Shift+J again to lock it.',
            true
        );

        console.info('[KeyboardShortcuts] Code preview unlocked for editing');
    } catch (error) {
        throw new KeyboardShortcutError(
            'Failed to enable code preview editing',
            'Ctrl+Alt+Shift+J',
            error instanceof Error ? error : undefined
        );
    }
}

/**
 * Disable code preview editing
 * @param codePreview - Code preview element
 */
function disableCodePreviewEditing(codePreview: HTMLElement): void {
    try {
        codePreview.contentEditable = 'false';
        codePreview.classList.remove('editable-code');
        codePreview.spellcheck = false;
        codePreview.tabIndex = -1;

        // Remove blur handler
        if (codePreviewEditState.blurHandler) {
            codePreview.removeEventListener('blur', codePreviewEditState.blurHandler);
            codePreviewEditState.blurHandler = null;
        }

        codePreviewEditState.isEditable = false;
        updateCodePreview(); // Reset preview based on current form values

        showSuccess('Code Preview Locked', 'The code preview is now locked for editing.', true);
        console.info('[KeyboardShortcuts] Code preview locked for editing');
    } catch (error) {
        throw new KeyboardShortcutError(
            'Failed to disable code preview editing',
            'Ctrl+Alt+Shift+J',
            error instanceof Error ? error : undefined
        );
    }
}

/**
 * Handle code preview toggle shortcut (Ctrl+Alt+Shift+J)
 * @param event - Keyboard event
 */
function handleCodePreviewToggleShortcut(event: KeyboardEvent): void {
    try {
        event.preventDefault();

        const codePreview = document.getElementById('codePreview');

        if (!codePreview) {
            showError(
                'Code Preview Not Found',
                'Could not find the code preview element to unlock.',
                false
            );
            console.error('[KeyboardShortcuts] Code preview element not found');
            return;
        }

        const isCurrentlyEditable = codePreview.contentEditable === 'true';

        if (isCurrentlyEditable) {
            disableCodePreviewEditing(codePreview);
        } else {
            enableCodePreviewEditing(codePreview);
        }
    } catch (error) {
        console.error('[KeyboardShortcuts] Error toggling code preview editability:', error);

        showError(
            'Error Unlocking Code Preview',
            `An error occurred while trying to make the code preview editable: ${error instanceof Error ? error.message : 'Unknown error'}`,
            false
        );
    }
}

// ============================================================================
// MAIN KEYBOARD SHORTCUT SYSTEM
// ============================================================================

/**
 * Available keyboard shortcuts configuration
 */
const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
    {
        key: 'c',
        ctrlKey: true,
        shiftKey: true,
        altKey: true,
        description: 'Clear session and local storage',
        handler: handleStorageClearShortcut,
    },
    {
        key: 'j',
        ctrlKey: true,
        shiftKey: true,
        altKey: true,
        description: 'Toggle code preview editing mode',
        handler: handleCodePreviewToggleShortcut,
    },
];

/**
 * Global keyboard event handler
 * @param event - Keyboard event
 */
function handleGlobalKeyboardEvent(event: KeyboardEvent): void {
    try {
        for (const shortcut of KEYBOARD_SHORTCUTS) {
            if (matchesShortcut(event, shortcut)) {
                shortcut.handler(event);
                break; // Only handle the first matching shortcut
            }
        }
    } catch (error) {
        console.error('[KeyboardShortcuts] Error handling keyboard event:', error);
    }
}

/**
 * Initialize keyboard shortcuts system
 * @returns Cleanup function to remove event listeners
 * @example
 * ```typescript
 * // Initialize keyboard shortcuts
 * const cleanup = initKeyboardShortcuts();
 *
 * // Later, remove event listeners
 * cleanup();
 * ```
 */
export function initKeyboardShortcuts(): () => void {
    try {
        document.addEventListener('keydown', handleGlobalKeyboardEvent);

        console.log('[KeyboardShortcuts] Keyboard shortcuts initialized');
        console.log('[KeyboardShortcuts] Available shortcuts:');
        KEYBOARD_SHORTCUTS.forEach(shortcut => {
            const keys = [
                shortcut.ctrlKey && 'Ctrl',
                shortcut.shiftKey && 'Shift',
                shortcut.altKey && 'Alt',
                shortcut.metaKey && 'Meta',
                shortcut.key.toUpperCase()
            ].filter(Boolean).join('+');

            console.log(`  ${keys}: ${shortcut.description}`);
        });

        // Return cleanup function
        return () => {
            document.removeEventListener('keydown', handleGlobalKeyboardEvent);
            console.log('[KeyboardShortcuts] Keyboard shortcuts cleanup completed');
        };
    } catch (error) {
        console.error('[KeyboardShortcuts] Error initializing keyboard shortcuts:', error);
        throw new KeyboardShortcutError(
            'Failed to initialize keyboard shortcuts',
            undefined,
            error instanceof Error ? error : undefined
        );
    }
}

/**
 * Get information about available keyboard shortcuts
 * @returns Array of shortcut information
 */
export function getAvailableShortcuts(): Array<{
    keys: string;
    description: string;
}> {
    return KEYBOARD_SHORTCUTS.map(shortcut => {
        const keys = [
            shortcut.ctrlKey && 'Ctrl',
            shortcut.shiftKey && 'Shift',
            shortcut.altKey && 'Alt',
            shortcut.metaKey && 'Meta',
            shortcut.key.toUpperCase()
        ].filter(Boolean).join('+');

        return {
            keys,
            description: shortcut.description
        };
    });
}

/**
 * Check if code preview is currently in edit mode
 * @returns True if code preview is editable
 */
export function isCodePreviewEditable(): boolean {
    return codePreviewEditState.isEditable;
}

// Initialize keyboard shortcuts when module is loaded
initKeyboardShortcuts();
