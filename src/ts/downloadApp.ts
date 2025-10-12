/**
 * Download App Module
 * @file downloadApp.ts
 * @description Creates and downloads standalone ZenPay demo files with TypeScript type safety
 */

import { parseCodePreviewConfig } from './codePreview.ts';
import { DEFAULT_VALUES, DomUtils } from './globals.ts';
import { showError, showModal } from './modals/modal.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Download configuration interface
 */
interface DownloadConfig {
	apiKey: string;
	username: string;
	password: string;
	merchantCode: string;
	gateway: string;
	mode: string;
	codeSnippet: string;
}

/**
 * Parsed configuration options interface
 */
interface ConfigOptions {
	[key: string]: unknown;
	paymentAmount?: number;
	customerName?: string;
	customerEmail?: string;
	customerReference?: string;
	redirectUrl?: string;
	callbackUrl?: string;
	merchantUniquePaymentId?: string;
	contactNumber?: string;
	minHeight?: number;
	userMode?: number;
	overrideFeePayer?: number;
}

/**
 * Download error class
 */
class DownloadError extends Error {
	constructor(
		message: string,
		public readonly operation: string,
		public override readonly cause?: Error
	) {
		super(message);
		this.name = 'DownloadError';
	}
}

// ============================================================================
// DOWNLOAD FUNCTIONS
// ============================================================================

/**
 * Generate initialization script for standalone demo
 * @param config - Download configuration
 * @param configOptions - Parsed configuration options
 * @returns Generated initialization script
 */
function generateInitializationScript(
    config: DownloadConfig,
    _configOptions: ConfigOptions,
	inputParams: string,
	outputParams: string,
	errorCodes: string
): string {
	const { apiKey, username, password, merchantCode } = config;

	return `
<script>
// Inline data files to avoid fetch errors
window.__ZENPAY_DATA__ = {
  inputParameters: ${inputParams},
  outputParameters: ${outputParams},
  errorCodes: ${errorCodes}
};

// Intercept fetch calls to return inlined data
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (url === '/public/jq-input-parameters.json') {
    return Promise.resolve(new Response(JSON.stringify(window.__ZENPAY_DATA__.inputParameters), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  if (url === '/public/jq-output-parameters.json') {
    return Promise.resolve(new Response(JSON.stringify(window.__ZENPAY_DATA__.outputParameters), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  if (url === '/public/jq-error-codes.json') {
    return Promise.resolve(new Response(JSON.stringify(window.__ZENPAY_DATA__.errorCodes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  return originalFetch.apply(this, arguments);
};

document.addEventListener('DOMContentLoaded', function() {
  // Pre-fill ONLY credentials (4 fields)
  const apiKeyField = document.getElementById('apiKeyInput');
  if (apiKeyField) apiKeyField.value = "${apiKey}";

  const usernameField = document.getElementById('usernameInput');
  if (usernameField) usernameField.value = "${username}";

  const passwordField = document.getElementById('passwordInput');
  if (passwordField) passwordField.value = "${password}";

  const merchantCodeField = document.getElementById('merchantCodeInput');
  if (merchantCodeField) merchantCodeField.value = "${merchantCode}";

  console.log('ZenPay standalone configuration loaded successfully');
});
</script>`;
}

/**
 * Downloads the current ZenPay tester configuration as a standalone HTML file
 * @throws {DownloadError} When download preparation fails
 * @example
 * ```typescript
 * downloadStandaloneDemo();
 * ```
 */
async function downloadStandaloneDemo(): Promise<void> {
	try {
		// Get current configuration from form inputs
		const apiKeyInput = document.getElementById('apiKeyInput') as HTMLInputElement;
		const usernameInput = document.getElementById('usernameInput') as HTMLInputElement;
		const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
		const merchantCodeInput = document.getElementById('merchantCodeInput') as HTMLInputElement;
		const urlPreview = document.getElementById('urlPreview') as HTMLInputElement;
		const modeSelect = document.getElementById('modeSelect') as HTMLSelectElement;

		const apiKey = apiKeyInput?.value || DEFAULT_VALUES.credentials.apiKey;
		const username = usernameInput?.value || DEFAULT_VALUES.credentials.username;
		const password = passwordInput?.value || DEFAULT_VALUES.credentials.password;
		const merchantCode = merchantCodeInput?.value || DEFAULT_VALUES.credentials.merchantCode;
		const gateway = urlPreview?.value || 'https://sandbox.zenpay.com';
		const mode = modeSelect?.value;
		const codeSnippet = '';

		// Get all config options from code preview
		const configOptions = parseCodePreviewConfig();

		const config: DownloadConfig = {
			apiKey,
			username,
			password,
			merchantCode,
			gateway,
			mode,
			codeSnippet,
		};

		// Show modal to inform user to build first
		const buildCheck = await fetch('/build/index.html', { method: 'HEAD' }).catch(() => null);
		if (!buildCheck || !buildCheck.ok) {
			showModal(
				'Build Required',
				'Please run "npm run build" before downloading the standalone demo.',
				'warning'
			);
			return;
		}

		// Fetch built files (middleware serves them raw without Vite transformation)
		Promise.all([
			fetch('/build/index.html').then((r) => {
				if (!r.ok) throw new Error('Failed to load index.html');
				return r.text();
			}),
			fetch('/build/css/bundle.min.css').then((r) => {
				if (!r.ok) throw new Error('Failed to load CSS');
				return r.text();
			}),
			fetch('/build/js/bundle.min.js').then((r) => {
				if (!r.ok) throw new Error('Failed to load JS');
				return r.text();
			}),
			fetch('/public/jq-input-parameters.json')
				.then((r) => r.text())
				.catch(() => '[]'),
			fetch('/public/jq-output-parameters.json')
				.then((r) => r.text())
				.catch(() => '{}'),
			fetch('/public/jq-error-codes.json')
				.then((r) => r.text())
				.catch(() => '[]'),
		])
			.then(([currentHtml, bundledCSS, bundledJS, inputParams, outputParams, errorCodes]) => {
				// Generate initialization script
				const initScript = generateInitializationScript(
					config,
					configOptions,
					inputParams,
					outputParams,
					errorCodes
				);

				let modifiedHtml = currentHtml;

				// Remove ALL Vite dev server scripts and module references (with any attributes/whitespace)
				modifiedHtml = modifiedHtml.replace(
					/<script[^>]*src="[^"]*\/@vite\/client[^"]*"[^>]*><\/script>/gi,
					''
				);
				modifiedHtml = modifiedHtml.replace(
					/<script[^>]*src="[^"]*\/src\/ts\/index\.ts[^"]*"[^>]*><\/script>/gi,
					''
				);

				// Remove any existing CSS/JS bundle links
				modifiedHtml = modifiedHtml.replace(
					/<link[^>]*href="[^"]*\/css\/bundle(?:\.min)?\.css"[^>]*>/gi,
					''
				);
				modifiedHtml = modifiedHtml.replace(
					/<script[^>]*src="[^"]*\/js\/bundle(?:\.min)?\.js"[^>]*><\/script>/gi,
					''
				);

				// Remove favicon reference
				modifiedHtml = modifiedHtml.replace(
					/<link[^>]*href="[^"]*favicon[^"]*"[^>]*>/gi,
					''
				);

				// Remove dev mode comments
				modifiedHtml = modifiedHtml.replace(
					/<!--\s*Custom CSS is imported via TypeScript[^>]*-->/gi,
					''
				);

				// Remove empty lines left by removals
				modifiedHtml = modifiedHtml.replace(/^\s*[\r\n]/gm, '');

				// Find the closing </head> tag and inject inlined CSS
				const headCloseIndex = modifiedHtml.indexOf('</head>');
				if (headCloseIndex !== -1) {
					modifiedHtml =
						modifiedHtml.substring(0, headCloseIndex) +
						`\n<style>\n${bundledCSS}\n</style>\n` +
						modifiedHtml.substring(headCloseIndex);
				}

				// Find the closing </body> tag and inject inlined JS and initialization script
				const bodyCloseIndex = modifiedHtml.lastIndexOf('</body>');
				if (bodyCloseIndex === -1) {
					throw new Error('Could not find </body> tag in HTML');
				}

				modifiedHtml =
					modifiedHtml.substring(0, bodyCloseIndex) +
					`\n<script>\n${bundledJS}\n</script>\n` +
					initScript +
					'\n' +
					modifiedHtml.substring(bodyCloseIndex);

				// Create and trigger the download
				const blob = new Blob([modifiedHtml], { type: 'text/html' });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = `ZenPay-Singlefile-${merchantCode || 'Demo'}.html`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);

				console.log('[downloadStandaloneDemo] Download completed successfully');
			})
			.catch((error) => {
				console.error('[downloadStandaloneDemo] Error preparing download:', error);
				showError(
					'Download Failed',
					'Could not create standalone file. Please ensure the application is running properly.'
				);
				throw new DownloadError(
					'Failed to prepare download',
					'downloadStandaloneDemo',
					error instanceof Error ? error : undefined
				);
			});
	} catch (error) {
		console.error('[downloadStandaloneDemo] Error preparing download:', error);
		showError('Download Failed', 'An error occurred while preparing the download.');
		throw new DownloadError(
			'Failed to prepare download',
			'downloadStandaloneDemo',
			error instanceof Error ? error : undefined
		);
	}
}

/**
 * Initialize download functionality for a button
 * @param buttonSelector - CSS selector for the download button
 * @example
 * ```typescript
 * initDownloadFunctionality('#downloadDemoBtn');
 * ```
 */
export function initDownloadFunctionality(buttonSelector: string): void {
	try {
		const button = document.querySelector(buttonSelector) as HTMLButtonElement;
		if (button) {
			DomUtils.on(buttonSelector, 'click', function () {
				if (button.disabled) {
					showError(
						'Missing Credentials',
						'Please fill in API Key, Username, Password, and Merchant Code to download the demo.'
					);
				} else {
					downloadStandaloneDemo();
				}
			});

			console.log(`[initDownloadFunctionality] Download button initialized: ${buttonSelector}`);
		} else {
			console.warn(`[initDownloadFunctionality] Download button not found: ${buttonSelector}`);
		}
	} catch (error) {
		console.error('[initDownloadFunctionality] Error initializing download functionality:', error);
		throw new DownloadError(
			'Failed to initialize download functionality',
			'initDownloadFunctionality',
			error instanceof Error ? error : undefined
		);
	}
}
