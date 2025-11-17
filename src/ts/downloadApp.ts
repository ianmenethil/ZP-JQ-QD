/**
 * Download App Module
 * @file downloadApp.ts
 * @description Creates and downloads standalone ZenPay demo files with TypeScript type safety
 */

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
 * Collects download configuration from form inputs
 * @returns Download configuration object
 */
function collectDownloadConfiguration(): DownloadConfig {
	const apiKeyInput = document.getElementById('apiKeyInput') as HTMLInputElement;
	const usernameInput = document.getElementById('usernameInput') as HTMLInputElement;
	const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
	const merchantCodeInput = document.getElementById('merchantCodeInput') as HTMLInputElement;
	const urlPreview = document.getElementById('urlPreview') as HTMLInputElement;
	const modeSelect = document.getElementById('modeSelect') as HTMLSelectElement;

	return {
		apiKey: apiKeyInput?.value || DEFAULT_VALUES.credentials.apiKey,
		username: usernameInput?.value || DEFAULT_VALUES.credentials.username,
		password: passwordInput?.value || DEFAULT_VALUES.credentials.password,
		merchantCode: merchantCodeInput?.value || DEFAULT_VALUES.credentials.merchantCode,
		gateway: urlPreview?.value || 'https://sandbox.zenpay.com',
		mode: modeSelect?.value,
		codeSnippet: '',
	};
}

/**
 * Checks if build files exist
 * @returns True if build exists, false otherwise
 */
async function checkBuildExists(): Promise<boolean> {
	try {
		const buildCheck = await fetch('/build/index.html', { method: 'HEAD' });
		return buildCheck.ok;
	} catch {
		return false;
	}
}

/**
 * Fetches all required build assets
 * @returns Promise resolving to array of [html, css, js, inputParams, outputParams, errorCodes]
 */
async function fetchAllBuildAssets(): Promise<[string, string, string, string, string, string]> {
	return Promise.all([
		fetch('/build/index.html').then(r => {
			if (!r.ok) throw new Error('Failed to load index.html');
			return r.text();
		}),
		fetch('/build/css/bundle.min.css').then(r => {
			if (!r.ok) throw new Error('Failed to load CSS');
			return r.text();
		}),
		fetch('/build/js/bundle.min.js').then(r => {
			if (!r.ok) throw new Error('Failed to load JS');
			return r.text();
		}),
		fetch('/public/jq-input-parameters.json')
			.then(r => r.text())
			.catch(() => '[]'),
		fetch('/public/jq-output-parameters.json')
			.then(r => r.text())
			.catch(() => '{}'),
		fetch('/public/jq-error-codes.json')
			.then(r => r.text())
			.catch(() => '[]'),
	]);
}

/**
 * Removes Vite development scripts and references from HTML
 * @param html - Source HTML content
 * @returns Cleaned HTML content
 */
function cleanupHtmlForStandalone(html: string): string {
	let cleaned = html;

	cleaned = cleaned.replace(/<script[^>]*src="[^"]*\/@vite\/client[^"]*"[^>]*><\/script>/gi, '');
	cleaned = cleaned.replace(/<script[^>]*src="[^"]*\/src\/ts\/index\.ts[^"]*"[^>]*><\/script>/gi, '');
	cleaned = cleaned.replace(/<link[^>]*href="[^"]*\/css\/bundle(?:\.min)?\.css"[^>]*>/gi, '');
	cleaned = cleaned.replace(/<script[^>]*src="[^"]*\/js\/bundle(?:\.min)?\.js"[^>]*><\/script>/gi, '');
	cleaned = cleaned.replace(/<link[^>]*href="[^"]*favicon[^"]*"[^>]*>/gi, '');
	cleaned = cleaned.replace(/<!--\s*Custom CSS is imported via TypeScript[^>]*-->/gi, '');
	cleaned = cleaned.replace(/^\s*[\r\n]/gm, '');

	return cleaned;
}

/**
 * Injects CSS into HTML head tag
 * @param html - Source HTML content
 * @param css - CSS content to inject
 * @returns HTML with injected CSS
 */
function injectCssIntoHead(html: string, css: string): string {
	const headCloseIndex = html.indexOf('</head>');
	if (headCloseIndex === -1) {
		return html;
	}

	return html.substring(0, headCloseIndex) + `\n<style>\n${css}\n</style>\n` + html.substring(headCloseIndex);
}

/**
 * Injects JavaScript and initialization script into HTML body tag
 * @param html - Source HTML content
 * @param js - JavaScript content to inject
 * @param initScript - Initialization script to inject
 * @returns HTML with injected scripts
 * @throws {Error} If body tag not found
 */
function injectScriptsIntoBody(html: string, js: string, initScript: string): string {
	const bodyCloseIndex = html.lastIndexOf('</body>');
	if (bodyCloseIndex === -1) {
		throw new Error('Could not find </body> tag in HTML');
	}

	return (
		html.substring(0, bodyCloseIndex) +
		`\n<script>\n${js}\n</script>\n` +
		initScript +
		'\n' +
		html.substring(bodyCloseIndex)
	);
}

/**
 * Triggers browser download of content as file
 * @param content - File content
 * @param filename - Download filename
 */
function triggerFileDownload(content: string, filename: string): void {
	const blob = new Blob([content], { type: 'text/html' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Generates data intercept script for inlined JSON data
 * @param inputParams - Input parameters JSON
 * @param outputParams - Output parameters JSON
 * @param errorCodes - Error codes JSON
 * @returns Data intercept script content
 */
function generateDataInterceptScript(inputParams: string, outputParams: string, errorCodes: string): string {
	return `// Inline data files to avoid fetch errors
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
};`;
}

/**
 * Generates credential pre-fill script for DOMContentLoaded
 * @param config - Download configuration
 * @returns Credential pre-fill script content
 */
function generateCredentialPreFillScript(config: DownloadConfig): string {
	const { apiKey, username, password, merchantCode } = config;

	return `document.addEventListener('DOMContentLoaded', function() {
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
});`;
}

/**
 * Generate initialization script for standalone demo
 * @param config - Download configuration
 * @param inputParams - Input parameters JSON
 * @param outputParams - Output parameters JSON
 * @param errorCodes - Error codes JSON
 * @returns Generated initialization script
 */
function generateInitializationScript(
	config: DownloadConfig,
	inputParams: string,
	outputParams: string,
	errorCodes: string
): string {
	const dataInterceptScript = generateDataInterceptScript(inputParams, outputParams, errorCodes);
	const credentialPreFillScript = generateCredentialPreFillScript(config);

	return `
<script>
${dataInterceptScript}

${credentialPreFillScript}
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
		const config = collectDownloadConfiguration();

		const buildExists = await checkBuildExists();
		if (!buildExists) {
			showModal(
				'Build Required',
				'Please run "npm run build" before downloading the standalone demo.',
				'warning'
			);
			return;
		}

		const [currentHtml, bundledCSS, bundledJS, inputParams, outputParams, errorCodes] =
			await fetchAllBuildAssets();

		const initScript = generateInitializationScript(config, inputParams, outputParams, errorCodes);

		let modifiedHtml = cleanupHtmlForStandalone(currentHtml);
		modifiedHtml = injectCssIntoHead(modifiedHtml, bundledCSS);
		modifiedHtml = injectScriptsIntoBody(modifiedHtml, bundledJS, initScript);

		const filename = `ZenPay-Singlefile-${config.merchantCode || 'Demo'}.html`;
		triggerFileDownload(modifiedHtml, filename);

		console.log('[downloadStandaloneDemo] Download completed successfully');
	} catch (error) {
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
