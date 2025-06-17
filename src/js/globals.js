/**
 * ZenPay Payment Plugin Demo - Global Variables and Default Values
 * @module globals
 * @description Centralizes all global objects, constants, and default values for the application
 */

// ============================================================================
// EXTERNAL LIBRARY REFERENCES
// ============================================================================

/**
 * Reference to the global jQuery object
 * @type {Object}
 */
export const jQuery = window.jQuery;

/**
 * Shorthand alias for jQuery
 * @type {Function}
 */
export const $ = jQuery;

/**
 * Reference to the Bootstrap library for UI components
 * @type {Object}
 */
export const bootstrap = window.bootstrap;

/**
 * Reference to the Highlight.js library for syntax highlighting
 * @type {Object}
 */
export const hljs = window.hljs;

/**
 * SHA-3-512 hashing function
 * Falls back to a warning function if not available in the global scope
 * @function sha3_512
 * @param {string} data - Input data to hash
 * @returns {string} Hex-encoded SHA-3-512 hash or empty string if unavailable
 */
export const sha3_512 =
	typeof globalThis.sha3_512 === 'function'
		? globalThis.sha3_512.bind(globalThis)
		: // eslint-disable-next-line no-unused-vars
			(data) => {
				console.warn('sha3_512 function is not defined. Ensure the library is loaded.');
				return '';
			};

// Session Keys
/**
 * Object containing session storage keys for various form fields and settings.
 * @constant {Object}
 */
export const SESSION_KEYS = {
	API_KEY: 'ApiKey',
	USERNAME: 'username',
	PASSWORD: 'password',
	MERCHANT_CODE: 'MerchantCode',
	REDIRECT_URL: 'redirectUrl',
	CALLBACK_URL: 'callbackUrl',
	MODE: 'mode',
	SUBDOMAIN: 'subdomain',
	DOMAIN: 'domain',
	VERSION: 'version',
	URL: 'url',
	MIN_HEIGHT: 'minHeight',
	SENDEMAILCONFIRMATIONTOMERCHANT: 'sendEmailConfirmationToMerchant',
	SENDEMAILCONFIRMATIONTOCUSTOMER: 'sendEmailConfirmationToCustomer',
	HIDETERMSANDCONDITIONS: 'hideTermsAndConditions',
	HIDEMERCHANTLOGO: 'hideMerchantLogo',
	USER_MODE: 'userMode',
	OVERRIDE_FEE_PAYER: 'overrideFeePayer',
	SHOWFEEONTOKENISING: 'showFeeOnTokenising',
	SHOWFAILED_PAYMENTFEEONTOKENISING: 'showFailedPaymentFeeOnTokenising',
	ALLOWBANKONEOFF: 'allowBankOneOff',
	ALLOWPAYTO: 'allowPayTo',
	ALLOWPAYID: 'allowPayID',
	ALLOWAPPLEPAY: 'allowApplePay',
	ALLOWGOOGLEPAY: 'allowGooglePay',
	ALLOWSAVECARDINFO: 'allowSaveCardInfo',
	ALLOWLATITUDEPAY: 'allowLatitudePay',
	PAYMENT_AMOUNT: 'PaymentAmount', // Un-commented this line
	// CUSTOMER_NAME: 'customerName',  // dump
	// CUSTOMER_REFERENCE: 'customerReference', // dump
	// CUSTOMER_EMAIL: 'customerEmail', // dump
	// MERCHANTUNIQUEPAYMENTID: 'merchantUniquePaymentId', // dump
	// CONTACT_NUMBER: 'contactNumber', // dump
};

// ============================================================================
// DEFAULT VALUES - Organized by UI tabs
// ============================================================================
/**
 * Centralized default values for the entire application
 * @type {Object}
 */
export const DEFAULT_VALUES = {
	// Credentials tab defaults
	credentials: {
		apiKey: '<<API-KEY>>',
		username: '<<USERNAME>>',
		password: '<<PASSWORD>>',
		merchantCode: '<<MERCHANT-CODE>>',
		paymentAmount: '',
	},

	// Extended tab defaults
	extended: {
		redirectUrl: `${window.location.origin}/redirect`,
		callbackUrl: '', // String - left blank
		customerName: '', // String - randomly generated
		customerReference: '', // String - randomly generated UUID
		customerEmail: '', // String - generated from name
		merchantUniquePaymentId: '', // String - randomly generated UUID
		contactNumber: '0400001002',
	},

	paymentMethods: {
		allowBankAcOneOffPayment: false,
		allowPayToOneOffPayment: false,
		allowPayIdOneOffPayment: false,
		allowApplePayOneOffPayment: false,
		allowGooglePayOneOffPayment: false,
		allowLatitudePayOneOffPayment: false,
		allowSaveCardUserOption: false,
	},

	options: {
		// Notification options
		sendConfirmationEmailToCustomer: false,
		sendConfirmationEmailToMerchant: false,
		// UI options
		hideTermsAndConditions: false,
		hideMerchantLogo: false,
		userMode: 0,
		overrideFeePayer: 0,
		// Tokenization options
		showFeeOnTokenising: false,
		showFailedPaymentFeeOnTokenising: false,
		// UI height options based on payment mode
		minHeight: 925,
	},

	// URL builder defaults
	url: {
		subdomain: 'payuat',
		domain: 'travelpay',
		version: 'v5',
	},
};

// ============================================================================
// PAYMENT METHOD OPTIONS
// ============================================================================

/**
 * Default payment method toggles from the Payment Methods tab
 * All default to false (disabled) until explicitly enabled by the user
 * @type {Object}
 */
export const paymentMethodsTab = {
	allowBankAcOneOffPayment: DEFAULT_VALUES.paymentMethods.allowBankAcOneOffPayment,
	allowPayToOneOffPayment: DEFAULT_VALUES.paymentMethods.allowPayToOneOffPayment,
	allowPayIdOneOffPayment: DEFAULT_VALUES.paymentMethods.allowPayIdOneOffPayment,
	allowApplePayOneOffPayment: DEFAULT_VALUES.paymentMethods.allowApplePayOneOffPayment,
	allowGooglePayOneOffPayment: DEFAULT_VALUES.paymentMethods.allowGooglePayOneOffPayment,
	allowLatitudePayOneOffPayment: DEFAULT_VALUES.paymentMethods.allowLatitudePayOneOffPayment,
	allowSaveCardUserOption: DEFAULT_VALUES.paymentMethods.allowSaveCardUserOption,
};
export const paymentMethodOptions = paymentMethodsTab;
// ============================================================================
// ADDITIONAL OPTIONS
// ============================================================================

/**
 * Default additional display and behavior options from the Options tab
 * @type {Object}
 */
export const additionalOptionsTab = {
	// Notification options
	sendConfirmationEmailToCustomer: DEFAULT_VALUES.options.sendConfirmationEmailToCustomer,
	sendConfirmationEmailToMerchant: DEFAULT_VALUES.options.sendConfirmationEmailToMerchant,

	// UI options
	hideTermsAndConditions: DEFAULT_VALUES.options.hideTermsAndConditions,
	hideMerchantLogo: DEFAULT_VALUES.options.hideMerchantLogo,

	// User mode and fee payer options
	userMode: DEFAULT_VALUES.options.userMode,
	overrideFeePayer: DEFAULT_VALUES.options.overrideFeePayer,

	// Tokenization options
	showFeeOnTokenising: DEFAULT_VALUES.options.showFeeOnTokenising,
	showFailedPaymentFeeOnTokenising: DEFAULT_VALUES.options.showFailedPaymentFeeOnTokenising,
	// UI settings
	minHeight: DEFAULT_VALUES.options.minHeight,
};
export const additionalOptions = additionalOptionsTab;

// ============================================================================
// CREDENTIAL VALUES
// ============================================================================

/**
 * Values from the Credentials tab
 * @type {Object}
 */
export const credentialsTab = {
	apiKey: DEFAULT_VALUES.credentials.apiKey,
	username: DEFAULT_VALUES.credentials.username,
	password: DEFAULT_VALUES.credentials.password,
	merchantCode: DEFAULT_VALUES.credentials.merchantCode,
	paymentAmount: DEFAULT_VALUES.credentials.paymentAmount,
};
// ============================================================================
// EXTENDED OPTIONS
// ============================================================================

/**
 * Values from the Extended tab
 * @type {Object}
 */
export const extendedOptionsTab = {
	// URL settings
	redirectUrl: DEFAULT_VALUES.extended.redirectUrl,
	callbackUrl: DEFAULT_VALUES.extended.callbackUrl,

	// Customer information - all populated in initExtendedOptions
	customerName: DEFAULT_VALUES.extended.customerName,
	customerReference: DEFAULT_VALUES.extended.customerReference,
	customerEmail: DEFAULT_VALUES.extended.customerEmail,

	// Payment information
	merchantUniquePaymentId: DEFAULT_VALUES.extended.merchantUniquePaymentId,

	// Contact information
	contactNumber: DEFAULT_VALUES.extended.contactNumber,

	// UI settings - populated based on mode
	minHeight: DEFAULT_VALUES.options.minHeight,
};
export const extendedOptions = extendedOptionsTab;

// ============================================================================
// V3 COMPATIBILITY MODE
// ============================================================================

/**
 * V3 compatibility mode for testing older API versions
 * @type {Object}
 */
window.zpV3CompatMode = {
	omitTimestampFromHash: false,
	omitMerchantCodeFromPayload: false
};

/**
 * Help function to display available debug commands
 */
window.zenhelp = function() {
	console.log('🔧 ZenPay Debug Commands');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('');
	console.log('📌 V3 Compatibility Mode:');
	console.log('  zpV3CompatMode.omitTimestampFromHash = true/false');
	console.log('    → Excludes timestamp from fingerprint hash calculation');
	console.log('  zpV3CompatMode.omitMerchantCodeFromPayload = true/false');
	console.log('    → Excludes merchantCode from plugin initialization payload');
	console.log('');
	console.log('📋 Current Settings:');
	console.log('  Timestamp excluded:', window.zpV3CompatMode.omitTimestampFromHash);
	console.log('  MerchantCode excluded:', window.zpV3CompatMode.omitMerchantCodeFromPayload);
	console.log('');
	console.log('💡 Example Usage:');
	console.log('  // Test v3 without timestamp');
	console.log('  zpV3CompatMode.omitTimestampFromHash = true');
	console.log('  // Then click "Initialize Plugin" button');
	console.log('');
	console.log('🔄 Reset All:');
	console.log('  zpV3CompatMode.omitTimestampFromHash = false');
	console.log('  zpV3CompatMode.omitMerchantCodeFromPayload = false');
	console.log('');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};