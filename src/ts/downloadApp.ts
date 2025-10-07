/**
 * Download App Module
 * @file downloadApp.ts
 * @description Creates and downloads standalone ZenPay demo files with TypeScript type safety
 */

import { parseCodePreviewConfig } from './codePreview.ts';
import { DEFAULT_VALUES, DomUtils } from './globals.ts';
import { showError } from './modal.ts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Download configuration interface
 */
export interface DownloadConfig {
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
export interface ConfigOptions {
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
export class DownloadError extends Error {
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
function generateInitializationScript(config: DownloadConfig, configOptions: ConfigOptions): string {
    const { apiKey, username, password, merchantCode, mode } = config;

    // Generate boolean option setters
    const booleanOptions = Object.entries(configOptions)
        .filter(([, value]) => typeof value === 'boolean' && value === true)
        .map(([key]) => `
    const ${key}Element = document.getElementById('${key}');
    if (${key}Element) {
      ${key}Element.checked = true;
      // Trigger change event to update UI
      const event = new Event('change', { bubbles: true });
      ${key}Element.dispatchEvent(event);
    }`)
        .join('\n');

    return `
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Pre-fill credentials
  const apiKeyInput = document.getElementById('apiKeyInput');
  if (apiKeyInput) apiKeyInput.value = "${apiKey}";

  const usernameInput = document.getElementById('usernameInput');
  if (usernameInput) usernameInput.value = "${username}";

  const passwordInput = document.getElementById('passwordInput');
  if (passwordInput) passwordInput.value = "${password}";

  const merchantCodeInput = document.getElementById('merchantCodeInput');
  if (merchantCodeInput) merchantCodeInput.value = "${merchantCode}";

  const paymentAmountInput = document.getElementById('paymentAmountInput');
  if (paymentAmountInput) paymentAmountInput.value = "${configOptions.paymentAmount || ''}";

  // Set URL
  const urlPreview = document.getElementById('urlPreview');
  if (urlPreview) urlPreview.value = "${config.gateway}";

  // Set payment mode
  const modeSelect = document.getElementById('modeSelect');
  if (modeSelect) modeSelect.value = "${mode}";

  // Set extended options
  const customerNameInput = document.getElementById('customerNameInput');
  if (customerNameInput) customerNameInput.value = "${configOptions.customerName || ''}";

  const customerEmailInput = document.getElementById('customerEmailInput');
  if (customerEmailInput) customerEmailInput.value = "${configOptions.customerEmail || ''}";

  const customerReferenceInput = document.getElementById('customerReferenceInput');
  if (customerReferenceInput) customerReferenceInput.value = "${configOptions.customerReference || ''}";

  const redirectUrlInput = document.getElementById('redirectUrlInput');
  if (redirectUrlInput) redirectUrlInput.value = "${configOptions.redirectUrl || ''}";

  const callbackUrlInput = document.getElementById('callbackUrlInput');
  if (callbackUrlInput) callbackUrlInput.value = "${configOptions.callbackUrl || ''}";

  const merchantUniquePaymentIdInput = document.getElementById('merchantUniquePaymentIdInput');
  if (merchantUniquePaymentIdInput) merchantUniquePaymentIdInput.value = "${configOptions.merchantUniquePaymentId || ''}";

  const contactNumberInput = document.getElementById('contactNumberInput');
  if (contactNumberInput) contactNumberInput.value = "${configOptions.contactNumber || ''}";

  // Set payment method toggles and additional options
  ${booleanOptions}

  // Set minHeight if it exists
  const minHeightInput = document.getElementById('minHeightInput');
  if (minHeightInput && ${configOptions.minHeight || 'false'}) {
    minHeightInput.value = "${configOptions.minHeight || ''}";
  }

  // Set userMode radio buttons
  if (${configOptions.userMode || 'false'}) {
    const userModeElement = document.querySelector('input[name="userMode"][value="${configOptions.userMode}"]');
    if (userModeElement) {
      userModeElement.checked = true;
      userModeElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // Set overrideFeePayer radio buttons
  if (${configOptions.overrideFeePayer || 'false'}) {
    const feePayerElement = document.querySelector('input[name="overrideFeePayer"][value="${configOptions.overrideFeePayer}"]');
    if (feePayerElement) {
      feePayerElement.checked = true;
      feePayerElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  console.log('ZenPay configuration loaded successfully');
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
export function downloadStandaloneDemo(): void {
    try {
        // Get current configuration from form inputs
        const apiKey = DEFAULT_VALUES.credentials.apiKey;
        const username = DEFAULT_VALUES.credentials.username;
        const password = DEFAULT_VALUES.credentials.password;
        const merchantCode = DEFAULT_VALUES.credentials.merchantCode;
        const gateway = 'https://sandbox.zenpay.com';
        const mode = 'test';
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
            codeSnippet
        };

        // Fetch the current page HTML
        fetch(window.location.href)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                // Create a DOM parser to modify the HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Remove the download button
                const downloadButton = doc.querySelector('#downloadDemoBtn');
                if (downloadButton) {
                    downloadButton.remove();
                }

                // Generate and inject initialization script
                const injectScript = generateInitializationScript(config, configOptions);

                // Insert the script right before the closing body tag
                const bodyCloseIndex = html.lastIndexOf('</body>');
                if (bodyCloseIndex === -1) {
                    throw new Error('Could not find </body> tag in HTML');
                }

                const modifiedHtml = html.substring(0, bodyCloseIndex) + injectScript + html.substring(bodyCloseIndex);

                // Create and trigger the download
                const blob = new Blob([modifiedHtml], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `ZenPay_Tester_${merchantCode || 'Demo'}.html`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                console.log('[downloadStandaloneDemo] Download completed successfully');
            })
            .catch(error => {
                console.error('[downloadStandaloneDemo] Error preparing download:', error);
                showError('Download Failed', 'Could not create standalone file.');
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
        const button = document.querySelector(buttonSelector);
        if (button) {
            // Remove hidden attribute to make button visible
            button.removeAttribute('hidden');

            DomUtils.on(buttonSelector, 'click', function () {
                if (DomUtils.hasClass(buttonSelector, 'btn-disabled')) {
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
