/**
 * Keyboard shortcuts module
 * Ctrl+Alt+Shift+C - Clear session and local storage
 * Ctrl+Alt+Shift+U - Browse configuration (Upload JSON)
 */

// import { bootstrap } from './globals.ts';
import { showError, showSuccess } from './modals/modal.ts';
import { createAdvancedDebouncedFunction } from './utilities.ts';

/**
 * Handle storage clear shortcut
 */
function handleStorageClearShortcut(event: KeyboardEvent): void {
	// Only trigger on Ctrl+Alt+Shift+C
	if (event.ctrlKey && event.altKey && event.shiftKey && (event.key === 'c' || event.key === 'C')) {
		event.preventDefault();

		try {
			sessionStorage.clear();
			localStorage.clear();

			// Show success notification
			setTimeout(() => {
				try {
					showSuccess('Storage Cleared', 'Session and Local Storage cleared successfully.', true);
				} catch (modalError) {
					console.error('[KeyboardShortcuts] Modal error:', modalError);
					alert('Storage Cleared - Session and Local Storage cleared successfully.');
				}
			}, 100);
		} catch (error) {
			console.error('[KeyboardShortcuts] Error clearing storage:', error);
			try {
				showError('Error Clearing Storage', 'Failed to clear storage.', false);
			} catch (modalError) {
				console.error('[KeyboardShortcuts] Modal error:', modalError);
				alert('Error Clearing Storage - Failed to clear storage.');
			}
		}
	}
}

/**
 * Handle browse configuration shortcut (raw function)
 */
function triggerFileImport(): void {
	console.log('[KeyboardShortcuts] 📂 Ctrl+Alt+Shift+U pressed - Opening file picker...');

	// Trigger the browse config file input
	const fileInput = document.getElementById('fileInputConfig') as HTMLInputElement;
	if (fileInput) {
		fileInput.click();
	} else {
		console.error('[KeyboardShortcuts] File input element not found (#fileInputConfig)');
	}
}

/**
 * Debounced version of file import trigger (prevents rapid-fire triggers)
 */
const debouncedFileImport = createAdvancedDebouncedFunction(triggerFileImport, 500, true);

/**
 * Handle browse configuration shortcut
 */
function handleBrowseConfigShortcut(event: KeyboardEvent): void {
	// Only trigger on Ctrl+Alt+Shift+U
	if (event.ctrlKey && event.altKey && event.shiftKey && (event.key === 'u' || event.key === 'U')) {
		event.preventDefault();
		debouncedFileImport();
	}
}

/**
 * Initialize keyboard shortcuts (lazy loading)
 */
export function initKeyboardShortcuts(): void {
	document.addEventListener('keydown', handleStorageClearShortcut);
	document.addEventListener('keydown', handleBrowseConfigShortcut);
	console.log('[KeyboardShortcuts] ⌨️  Initialized:');
	console.log('  • Ctrl+Alt+Shift+C - Clear session and local storage');
	console.log('  • Ctrl+Alt+Shift+U - Upload/Import JSON config file');
}
