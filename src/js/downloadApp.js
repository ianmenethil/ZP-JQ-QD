// import { DEFAULT_VALUES } from './globals.js';
// import { $ } from './globals.js';
// import { showError } from './modal.js'; // Import showError
// import { applogger } from './applogger.js';

// /**
//  * Downloads a standalone version of the ZenPay tester with current configuration
//  */
// export function downloadStandaloneDemo() {
// 	try {
// 		// Gather current configuration
// 		const apiKey = $('#apiKeyInput').val() || DEFAULT_VALUES.credentials.apiKey;
// 		const username = $('#usernameInput').val() || DEFAULT_VALUES.credentials.username;
// 		const password = $('#passwordInput').val() || DEFAULT_VALUES.credentials.password;
// 		const merchantCode = $('#merchantCodeInput').val() || DEFAULT_VALUES.credentials.merchantCode;
// 		const gateway = $('#urlPreview').val();
// 		const mode = $('#modeSelect').val();
// 		const codeSnippet = $('#codePreview').text();
// 		let subdomain = 'payuat';
// 		let domain = 'travelpay';
// 		let version = 'v5';

// 		try {
// 			if (gateway) {
// 				const urlRegex = /https?:\/\/([^.]+)\.([^.]+)\.com\.au\/Online\/([^/]+)/;
// 				const match = gateway.match(urlRegex);

// 				if (match && match.length >= 4) {
// 					subdomain = match[1];
// 					domain = match[2];
// 					version = match[3];
// 				}
// 			}
// 		} catch (parseError) {
// 			console.error('Error parsing URL:', parseError);
// 		}

// 		// Fetch template HTML
// 		fetch('public/Template.html')
// 			.then(response => {
// 				if (!response.ok) {
// 					throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
// 				}
// 				return response.text();
// 			})
// 			.then(templateHtml => {
// 				// Process inline resources
// 				const parser = new DOMParser();
// 				const doc = parser.parseFromString(templateHtml, 'text/html');

// 				// Find all elements with inline attribute
// 				const inlineElements = doc.querySelectorAll('[inline]');

// 				// If no inline elements, proceed with original HTML
// 				if (inlineElements.length === 0) {
// 					processTemplateHtml(templateHtml);
// 					return;
// 				}

// 				// Create an array of promises to fetch all inline resources
// 				const fetchPromises = [];

// 				inlineElements.forEach(element => {
// 					const src = element.getAttribute('src') || element.getAttribute('href');
// 					if (src) {
// 						const promise = fetch('public/' + src.replace('./', ''))
// 							.then(response => {
// 								if (!response.ok) {
// 									throw new Error(`Failed to fetch ${src}`);
// 								}
// 								return response.text();
// 							})
// 							.then(content => {
// 								return { element, content };
// 							})
// 							.catch(err => {
// 								console.error(`Error fetching resource ${src}:`, err);
// 								return null;
// 							});

// 						fetchPromises.push(promise);
// 					}
// 				});

// 				Promise.all(fetchPromises)
// 					.then(results => {
// 						results.forEach(result => {
// 							if (!result) return;

// 							const { element, content } = result;
// 							if (element.tagName === 'LINK' && element.getAttribute('rel') === 'stylesheet') {
// 								const style = doc.createElement('style');
// 								for (const attr of element.attributes) {
// 									if (attr.name !== 'href' && attr.name !== 'inline' && attr.name !== 'rel') {
// 										style.setAttribute(attr.name, attr.value);
// 									}
// 								}
// 								style.textContent = content;
// 								element.parentNode.replaceChild(style, element);
// 							}
// 							// For script elements
// 							else if (element.tagName === 'SCRIPT') {
// 								const script = doc.createElement('script');
// 								for (const attr of element.attributes) {
// 									if (attr.name !== 'src' && attr.name !== 'inline') {
// 										script.setAttribute(attr.name, attr.value);
// 									}
// 								}
// 								script.textContent = content;
// 								element.parentNode.replaceChild(script, element);
// 							}
// 						});

// 						const serializer = new XMLSerializer();
// 						const modifiedHtml = serializer.serializeToString(doc);

// 						processTemplateHtml(modifiedHtml);
// 					})
// 					.catch(error => {
// 						console.error('Error processing inline resources:', error);
// 						processTemplateHtml(templateHtml);
// 					});
// 			})
// 			.catch(error => {
// 				console.error('Error fetching template:', error);
// 				showError('Download Failed', 'Could not fetch template file.');
// 			});

// 		// Process the template HTML and inject the initialization script
// 		function processTemplateHtml(html) {
// 			const injectScript = `
// <script>
// document.addEventListener('DOMContentLoaded', function() {
//   // Set credentials
//   document.getElementById('apiKey').value = "${apiKey}";
//   document.getElementById('username').value = "${username}";
//   document.getElementById('password').value = "${password}";
//   document.getElementById('merchantCode').value = "${merchantCode}";

//   // Set URL dropdown components
//   const subdomainDropdown = document.querySelectorAll('.dropdown-menu[aria-labelledby="subdomainText"] .dropdown-item');
//   if (subdomainDropdown.length) {
//     subdomainDropdown.forEach(item => {
//       if (item.dataset.value === "${subdomain}") {
//         item.click();
//       }
//     });
//   }

//   const domainDropdown = document.querySelectorAll('.dropdown-menu[aria-labelledby="domainText"] .dropdown-item');
//   if (domainDropdown.length) {
//     domainDropdown.forEach(item => {
//       if (item.dataset.value === "${domain}") {
//         item.click();
//       }
//     });
//   }

//   const versionDropdown = document.querySelectorAll('.dropdown-menu[aria-labelledby="versionText"] .dropdown-item');
//   if (versionDropdown.length) {
//     versionDropdown.forEach(item => {
//       if (item.dataset.value === "${version}") {
//         item.click();
//       }
//     });
//   }

//   // Set mode via dropdown
//   const modeDropdown = document.querySelectorAll('.dropdown-menu a[data-value]');
//   if (modeDropdown.length) {
//     modeDropdown.forEach(item => {
//       if (item.dataset.value === "${mode}") {
//         item.click();
//       }
//     });
//   }

//   // Set up process payment button to initialize the plugin
//   document.getElementById('processPaymentBtn').addEventListener('click', function() {
//     try {
//       // Show/hide the appropriate button for initialization
//       const initBtn = document.getElementById('initializePlugin');
//       if (initBtn) {
//         initBtn.click();
//       } else {
//         console.error('Initialize plugin button not found');
//       }
//     } catch(error) {
//       console.error('Error processing payment:', error);
//       alert('Error processing payment. See console for details.');
//     }
//   });

//   // Initialize plugin button handling
//   document.getElementById('initializePlugin').addEventListener('click', function() {
//     try {
//       ${codeSnippet.trim()}
//     } catch(error) {
//       console.error('Error initializing payment:', error);
//       alert('Error initializing payment. See console for details.');
//     }
//   });

//   console.log('ZenPay Tester initialized successfully');
// });
// </script>
// 			`;

// 			// Insert the script just before the closing body tag
// 			const modifiedTemplate = html.replace('</body>', `${injectScript}\n</body>`);

// 			// Create and trigger the download
// 			const blob = new Blob([modifiedTemplate], { type: 'text/html' });
// 			const url = URL.createObjectURL(blob);
// 			const link = document.createElement('a');
// 			link.href = url;
// 			link.download = `ZenPay_Tester_${merchantCode || 'Demo'}.html`;
// 			document.body.appendChild(link);
// 			link.click();
// 			document.body.removeChild(link);
// 			URL.revokeObjectURL(url);
// 		}
// 	} catch (error) {
// 		console.error('Error preparing download:', error);
// 		showError('Download Failed', 'An error occurred while preparing the download.');
// 	}
// }

// export function initDownloadFunctionality(buttonSelector) {
// 	const button = $(buttonSelector);
// 	if (button.length) {
// 		// Remove hidden attribute to make button visible
// 		button.removeAttr('hidden');

// 		button.on('click', function () {
// 			if ($(this).hasClass('btn-disabled')) {
// 				showError('Missing Credentials', 'Please fill in API Key, Username, Password, and Merchant Code to download the demo.');
// 			} else {
// 				downloadStandaloneDemo();
// 			}
// 		});
// 	} else {
// 		console.warn(`Download button with selector "${buttonSelector}" not found for initialization.`);
// 	}
// }
import { DEFAULT_VALUES } from './globals.js';
import { $ } from './globals.js';
import { showError } from './modal.js';
import { applogger } from './applogger.js';
import { parseCodePreviewConfig } from './codePreview.js';

/**
 * Downloads the current ZenPay tester configuration as a standalone HTML file
 */
export function downloadStandaloneDemo() {
	try {
		// Get current configuration from form inputs
		const apiKey = $('#apiKeyInput').val() || DEFAULT_VALUES.credentials.apiKey;
		const username = $('#usernameInput').val() || DEFAULT_VALUES.credentials.username;
		const password = $('#passwordInput').val() || DEFAULT_VALUES.credentials.password;
		const merchantCode = $('#merchantCodeInput').val() || DEFAULT_VALUES.credentials.merchantCode;
		const gateway = $('#urlPreview').val();
		const mode = $('#modeSelect').val();
		const codeSnippet = $('#codePreview').text();

		// Get all config options from code preview
		const configOptions = parseCodePreviewConfig();

		// Fetch the existing index.html (which we're viewing)
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
					downloadButton.parentElement.removeChild(downloadButton);
				}

				// Inject initialization script right before </body>
				const injectScript = `
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Pre-fill credentials
  document.getElementById('apiKeyInput').value = "${apiKey}";
  document.getElementById('usernameInput').value = "${username}";
  document.getElementById('passwordInput').value = "${password}";
  document.getElementById('merchantCodeInput').value = "${merchantCode}";
  document.getElementById('paymentAmountInput').value = "${configOptions.paymentAmount || ''}";
  
  // Set URL
  document.getElementById('urlPreview').value = "${gateway}";
  
  // Set payment mode
  const modeSelect = document.getElementById('modeSelect');
  if (modeSelect) {
    modeSelect.value = "${mode}";
  }
  
  // Set extended options
  if (document.getElementById('customerNameInput')) {
    document.getElementById('customerNameInput').value = "${configOptions.customerName || ''}";
  }
  if (document.getElementById('customerEmailInput')) {
    document.getElementById('customerEmailInput').value = "${configOptions.customerEmail || ''}";
  }
  if (document.getElementById('customerReferenceInput')) {
    document.getElementById('customerReferenceInput').value = "${configOptions.customerReference || ''}";
  }
  if (document.getElementById('redirectUrlInput')) {
    document.getElementById('redirectUrlInput').value = "${configOptions.redirectUrl || ''}";
  }
  if (document.getElementById('callbackUrlInput')) {
    document.getElementById('callbackUrlInput').value = "${configOptions.callbackUrl || ''}";
  }
  if (document.getElementById('merchantUniquePaymentIdInput')) {
    document.getElementById('merchantUniquePaymentIdInput').value = "${configOptions.merchantUniquePaymentId || ''}";
  }
  if (document.getElementById('contactNumberInput')) {
    document.getElementById('contactNumberInput').value = "${configOptions.contactNumber || ''}";
  }
  
  // Set payment method toggles
  ${Object.entries(configOptions)
		.filter(([key, value]) => typeof value === 'boolean' && value === true)
		.map(
			([key]) => `
    const ${key}Element = document.getElementById('${key}');
    if (${key}Element) {
      ${key}Element.checked = true;
      // Trigger change event to update UI
      const event = new Event('change', { bubbles: true });
      ${key}Element.dispatchEvent(event);
    }`
		)
		.join('\n')}
  
  // Set minHeight if it exists
  if (document.getElementById('minHeightInput') && ${configOptions.minHeight || 'false'}) {
    document.getElementById('minHeightInput').value = "${configOptions.minHeight || ''}";
  }
  
  // Set userMode and overrideFeePayer radio buttons
  if (${configOptions.userMode || 'false'}) {
    const userModeElement = document.querySelector('input[name="userMode"][value="${configOptions.userMode}"]');
    if (userModeElement) {
      userModeElement.checked = true;
      userModeElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  
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

				// Insert the script right before the closing body tag
				const bodyCloseIndex = html.lastIndexOf('</body>');
				if (bodyCloseIndex !== -1) {
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
				} else {
					throw new Error('Could not find </body> tag in HTML');
				}
			})
			.catch(error => {
				console.error('Error preparing download:', error);
				showError('Download Failed', 'Could not create standalone file.');
			});
	} catch (error) {
		console.error('Error preparing download:', error);
		showError('Download Failed', 'An error occurred while preparing the download.');
	}
}

export function initDownloadFunctionality(buttonSelector) {
	const button = $(buttonSelector);
	if (button.length) {
		// Remove hidden attribute to make button visible
		button.removeAttr('hidden');

		button.on('click', function () {
			if ($(this).hasClass('btn-disabled')) {
				showError('Missing Credentials', 'Please fill in API Key, Username, Password, and Merchant Code to download the demo.');
			} else {
				downloadStandaloneDemo();
			}
		});
	} else {
		console.warn(`Download button with selector "${buttonSelector}" not found for initialization.`);
	}
}
