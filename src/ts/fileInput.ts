/**
 * @module fileInput
 * @description Handles browsing and loading of JSON configuration files for the ZenPay demo plugin with TypeScript type safety
 */

import { updateCodePreview } from './codePreview.ts';
import { DomUtils } from './globals.ts';
import { showError, showSuccess } from './modals/modal.ts';
import { saveCredentials } from './session.ts';
import { updateActionButtonsState } from './ui/buttonState.ui.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Configuration schema interface for JSON file validation
 */
interface ConfigurationSchema {
	apiKey: string;
	username: string;
	password: string;
	merchantCode: string;
	[key: string]: unknown; // Allow additional properties
}

/**
 * File input configuration interface
 */
interface FileInputConfig {
	accept: string;
	multiple?: boolean;
	maxSize?: number; // in bytes
}

/**
 * File validation result interface
 */
interface FileValidationResult {
	isValid: boolean;
	error?: string;
	config?: ConfigurationSchema;
}

/**
 * File input error class
 */
class FileInputError extends Error {
	constructor(
		message: string,
		public readonly operation: 'read' | 'parse' | 'validate' | 'apply',
		public readonly fileName?: string,
		public override readonly cause?: Error
	) {
		super(message);
		this.name = 'FileInputError';
	}
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default file input configuration
 */
const DEFAULT_FILE_CONFIG: Required<FileInputConfig> = {
	accept: '.json',
	multiple: false,
	maxSize: 1024 * 1024, // 1MB
} as const;

/**
 * Required configuration fields for validation
 */
const REQUIRED_CONFIG_FIELDS: (keyof ConfigurationSchema)[] = [
	'apiKey',
	'username',
	'password',
	'merchantCode',
] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate file size and type
 * @param file - File to validate
 * @param config - File input configuration
 * @returns True if file is valid
 */
function validateFile(file: File, config: FileInputConfig = DEFAULT_FILE_CONFIG): boolean {
	const maxSize = config.maxSize || DEFAULT_FILE_CONFIG.maxSize;

	if (file.size > maxSize) {
		throw new FileInputError(
			`File size (${(file.size / 1024).toFixed(1)}KB) exceeds maximum allowed size (${(maxSize / 1024).toFixed(1)}KB)`,
			'validate',
			file.name
		);
	}

	if (config.accept && !file.name.toLowerCase().endsWith('.json')) {
		throw new FileInputError('Only JSON files are supported', 'validate', file.name);
	}

	return true;
}

/**
 * Parse JSON content safely with error handling
 * @param content - JSON string content
 * @param fileName - Name of the file being parsed
 * @returns Parsed configuration object
 * @throws {FileInputError} When JSON parsing fails
 */
function parseJsonContent(content: string, fileName: string): ConfigurationSchema {
	try {
		const parsed = JSON.parse(content);

		if (!parsed || typeof parsed !== 'object') {
			throw new FileInputError('Configuration must be a valid JSON object', 'parse', fileName);
		}

		return parsed as ConfigurationSchema;
	} catch (error) {
		if (error instanceof FileInputError) {
			throw error;
		}

		throw new FileInputError(
			`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
			'parse',
			fileName,
			error instanceof Error ? error : undefined
		);
	}
}

/**
 * Get form field element safely
 * @param selector - DOM selector for the field
 * @returns HTMLInputElement or null if not found
 */
function getFormField(selector: string): HTMLInputElement | null {
	const field = document.querySelector(selector) as HTMLInputElement;
	return field || null;
}

/**
 * Save credential fields to session storage
 * @throws {FileInputError} When session save fails
 */
function saveCredentialsToSession(): void {
	try {
		const apiKey = DomUtils.getValue('#apiKeyInput');
		const username = DomUtils.getValue('#usernameInput');
		const password = DomUtils.getValue('#passwordInput');
		const merchantCode = DomUtils.getValue('#merchantCodeInput');

		saveCredentials(
			apiKey.trim() || '',
			username.trim() || '',
			password.trim() || '',
			merchantCode.trim() || ''
		);
	} catch (error) {
		throw new FileInputError(
			'Failed to save credentials to session',
			'apply',
			undefined,
			error instanceof Error ? error : undefined
		);
	}
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate configuration object schema for required fields
 * @param config - Configuration object to validate
 * @returns Validation result with details
 * @example
 * ```typescript
 * const result = validateConfigurationSchema(config);
 * if (!result.isValid) {
 *   console.error('Validation failed:', result.error);
 * }
 * ```
 */
function validateConfigurationSchema(config: unknown): FileValidationResult {
	try {
		if (!config || typeof config !== 'object') {
			return {
				isValid: false,
				error: 'Configuration must be a valid object',
			};
		}

		const configObj = config as Record<string, unknown>;

		// Check for required fields
		for (const field of REQUIRED_CONFIG_FIELDS) {
			if (!Object.prototype.hasOwnProperty.call(configObj, field)) {
				return {
					isValid: false,
					error: `Missing required field: ${field}`,
				};
			}

			const value = configObj[field];
			if (typeof value !== 'string' || value.trim() === '') {
				return {
					isValid: false,
					error: `Field '${field}' must be a non-empty string`,
				};
			}
		}

		return {
			isValid: true,
			config: configObj as ConfigurationSchema,
		};
	} catch (error) {
		return {
			isValid: false,
			error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
}

/**
 * Apply configuration to form fields
 * @param config - Validated configuration object
 * @param fileName - Name of the source file
 * @throws {FileInputError} When configuration application fails
 */
function applyConfigurationToForm(config: ConfigurationSchema, fileName: string): void {
	try {
		const fieldMappings = [
			{ selector: '#apiKeyInput', value: config.apiKey },
			{ selector: '#usernameInput', value: config.username },
			{ selector: '#passwordInput', value: config.password },
			{ selector: '#merchantCodeInput', value: config.merchantCode },
		];

		let appliedFields = 0;

		fieldMappings.forEach(({ selector, value }) => {
			const field = getFormField(selector);
			if (field) {
				DomUtils.setValue(selector, value);
				appliedFields++;
			}
		});

		if (appliedFields !== fieldMappings.length) {
			throw new FileInputError(
				`Only ${appliedFields} of ${fieldMappings.length} fields could be populated`,
				'apply',
				fileName
			);
		}

		// Save to session and update UI
		saveCredentialsToSession();
		updateCodePreview();
		updateActionButtonsState();

		showSuccess(
			'Configuration Loaded',
			`Successfully loaded configuration from <strong>${fileName}</strong>`,
			true
		);
	} catch (error) {
		throw new FileInputError(
			'Failed to apply configuration to form',
			'apply',
			fileName,
			error instanceof Error ? error : undefined
		);
	}
}

/**
 * Process file content and apply configuration
 * @param content - File content as string
 * @param fileName - Name of the file being processed
 * @returns Promise that resolves when processing is complete
 */
async function processFileContent(content: string, fileName: string): Promise<void> {
	try {
		// Parse JSON content
		const config = parseJsonContent(content, fileName);

		// Validate configuration schema
		const validationResult = validateConfigurationSchema(config);
		if (!validationResult.isValid) {
			showError(
				'Invalid Configuration',
				`Configuration must include non-empty string values for: ${REQUIRED_CONFIG_FIELDS.join(', ')}.\n\nError: ${validationResult.error}`
			);
			return;
		}

		// Apply configuration to form
		applyConfigurationToForm(validationResult.config!, fileName);
	} catch (error) {
		console.error('[processFileContent] Error processing file:', error);

		if (error instanceof FileInputError) {
			showError('Load Failed', error.message);
		} else {
			showError(
				'Load Failed',
				`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}
}

/**
 * Handle file selection and reading
 * @param file - Selected file to process
 * @param config - File input configuration
 * @returns Promise that resolves when file is processed
 */
async function handleFileSelection(
	file: File,
	config: FileInputConfig = DEFAULT_FILE_CONFIG
): Promise<void> {
	try {
		// Validate file
		validateFile(file, config);

		// Read file content
		const content = await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (event) => {
				const result = event.target?.result;
				if (typeof result === 'string') {
					resolve(result);
				} else {
					reject(new Error('Failed to read file as text'));
				}
			};

			reader.onerror = () => {
				reject(new Error('File reading failed'));
			};

			reader.readAsText(file);
		});

		// Process file content
		await processFileContent(content, file.name);
	} catch (error) {
		console.error('[handleFileSelection] Error handling file selection:', error);

		if (error instanceof FileInputError) {
			showError('File Error', error.message);
		} else {
			showError(
				'File Error',
				`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}
}

// ============================================================================
// MAIN INITIALIZATION FUNCTION
// ============================================================================

/**
 * Initialize file input listener on the "Browse Configuration" button
 * Opens a file picker for JSON files, validates the loaded configuration,
 * populates corresponding input fields, saves session values, and updates the code preview
 * @param config - Optional file input configuration
 * @throws {FileInputError} When file input initialization fails
 * @example
 * ```typescript
 * // Initialize with default settings
 * initFileInputListener();
 *
 * // Initialize with custom configuration
 * initFileInputListener({
 *   accept: '.json',
 *   maxSize: 2 * 1024 * 1024 // 2MB
 * });
 * ```
 */
export function initFileInputListener(config: FileInputConfig = DEFAULT_FILE_CONFIG): void {
	try {
		// Attach to hidden file input (triggered by keyboard shortcut Ctrl+Alt+Shift+U)
		const fileInputConfig = document.getElementById('fileInputConfig') as HTMLInputElement;
		if (fileInputConfig) {
			fileInputConfig.addEventListener('change', async (event) => {
				const target = event.target as HTMLInputElement;
				const files = target.files;

				if (!files || files.length === 0) {
					console.log('[FileInput] No file selected');
					return;
				}

				const file = files[0];
				if (file) {
					console.log(`[FileInput] 📄 Processing file: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
					await handleFileSelection(file, config);
					// Reset file input so the same file can be selected again
					fileInputConfig.value = '';
					console.log('[FileInput] ✅ File input reset, ready for next import');
				}
			});
		}

		// Also support old browseConfigBtn if it exists (backward compatibility)
		const browseConfigBtn = document.getElementById('browseConfigBtn');
		if (browseConfigBtn) {
			browseConfigBtn.addEventListener('click', () => {
				try {
					const fileInput = document.createElement('input');
					fileInput.type = 'file';
					fileInput.accept = config.accept || DEFAULT_FILE_CONFIG.accept;
					fileInput.multiple = config.multiple || false;

					fileInput.addEventListener('change', async (event) => {
						const target = event.target as HTMLInputElement;
						const files = target.files;

						if (!files || files.length === 0) {
							return;
						}

						const file = files[0];
						if (file) {
							await handleFileSelection(file, config);
						}
					});

					fileInput.click();
				} catch (error) {
					console.error('[initFileInputListener] Error creating file input:', error);
					showError('File Input Error', 'Failed to create file input dialog');
				}
			});
		}

		console.log('[initFileInputListener] File input listener initialized successfully');
	} catch (error) {
		throw new FileInputError(
			'Failed to initialize file input listener',
			'read',
			undefined,
			error instanceof Error ? error : undefined
		);
	}
}
