// External libs, no jQuery

import type { Sha3HashFunction } from './types/globals.types.ts';

export const bootstrap = (() => {
  if (typeof window === 'undefined' || typeof window.bootstrap === 'undefined') {
    throw new Error('Bootstrap is not available. Ensure it is loaded before this module.');
  }
  return window.bootstrap;
})();

export const hljs = (() => {
  if (typeof window === 'undefined' || typeof window.hljs === 'undefined') {
    throw new Error('Highlight.js is not available. Ensure it is loaded before this module.');
  }
  return window.hljs;
})();

export const sha3_512: Sha3HashFunction = (data: string): string => {
  const fn = globalThis.sha3_512 ?? window.sha3_512;
  if (typeof fn !== 'function') {
    console.warn('sha3_512 function is not defined. Ensure the library is loaded.');
    return '';
  }

  // Handle different possible signatures of the sha3_512 function
  try {
    // Try calling with data parameter first (expected signature)
    return (fn as any)(data);
  } catch (error) {
    console.warn('sha3_512 function failed with data parameter, trying alternative signature:', error);

    // If that fails, try calling without parameters to get a hash function
    try {
      const hashFn = (fn as any)();
      if (typeof hashFn === 'function') {
        return hashFn(data);
      }
    } catch (fallbackError) {
      console.warn('sha3_512 function fallback also failed:', fallbackError);
    }

    return '';
  }
};


// Side-effects: V3 compat flags and help, as in original file
if (typeof window !== 'undefined') {
  window.zpV3CompatMode = window.zpV3CompatMode ?? {
    omitTimestampFromHash: false,
    omitMerchantCodeFromPayload: false,
  };

  window.zenhelp = function (): void {
    console.log('🔧 ZenPay Debug Commands');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📌 V3 Compatibility Mode:');
    console.log('  zpV3CompatMode.omitTimestampFromHash = true/false');
    console.log('  zpV3CompatMode.omitMerchantCodeFromPayload = true/false');
    console.log('');
    console.log('📋 Current Settings:');
    console.log('  Timestamp excluded:', window.zpV3CompatMode.omitTimestampFromHash);
    console.log('  MerchantCode excluded:', window.zpV3CompatMode.omitMerchantCodeFromPayload);
    console.log('');
    console.log('💡 Example Usage:');
    console.log('  zpV3CompatMode.omitTimestampFromHash = true');
    console.log('  // Then click \"Initialize Plugin\"');
    console.log('');
    console.log('🔄 Reset All:');
    console.log('  zpV3CompatMode.omitTimestampFromHash = false');
    console.log('  zpV3CompatMode.omitMerchantCodeFromPayload = false');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  };
}
// Defaults, session keys, tabs, and DOM helpers

import type {
    AdditionalOptions,
    CredentialsConfig,
    DefaultValues,
    ExtendedConfig,
    PaymentMethodOptions,
    SessionKeys,
} from './types/globals.types.ts';

export const SESSION_KEYS: SessionKeys = {
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
  ALLOWSLICEPAY: 'allowSlicePay',
  PAYMENT_AMOUNT: 'PaymentAmount',
} as const;

export const DEFAULT_VALUES: DefaultValues = {
  credentials: {
    apiKey: '<<API-KEY>>',
    username: '<<USERNAME>>',
    password: '<<PASSWORD>>',
    merchantCode: '<<MERCHANT-CODE>>',
    paymentAmount: '',
  },
  extended: {
    redirectUrl: `${window.location.origin}/redirect`,
    callbackUrl: '',
    customerName: '',
    customerReference: '',
    customerEmail: '',
    merchantUniquePaymentId: '',
    contactNumber: '0400001002',
  },
  paymentMethods: {
    allowBankAcOneOffPayment: false,
    allowPayToOneOffPayment: false,
    allowPayIdOneOffPayment: false,
    allowApplePayOneOffPayment: false,
    allowGooglePayOneOffPayment: false,
    allowSlicePayOneOffPayment: false,
    allowSaveCardUserOption: false,
  },
  options: {
    sendConfirmationEmailToCustomer: false,
    sendConfirmationEmailToMerchant: false,
    hideTermsAndConditions: false,
    hideMerchantLogo: false,
    userMode: 0,
    overrideFeePayer: 0,
    showFeeOnTokenising: false,
    showFailedPaymentFeeOnTokenising: false,
    minHeight: 925,
  },
  url: {
    subdomain: 'pay.sandbox',
    domain: 'travelpay',
    version: 'v5',
  },
} as const;

export const paymentMethodsTab: PaymentMethodOptions = {
  allowBankAcOneOffPayment: DEFAULT_VALUES.paymentMethods.allowBankAcOneOffPayment,
  allowPayToOneOffPayment: DEFAULT_VALUES.paymentMethods.allowPayToOneOffPayment,
  allowPayIdOneOffPayment: DEFAULT_VALUES.paymentMethods.allowPayIdOneOffPayment,
  allowApplePayOneOffPayment: DEFAULT_VALUES.paymentMethods.allowApplePayOneOffPayment,
  allowGooglePayOneOffPayment: DEFAULT_VALUES.paymentMethods.allowGooglePayOneOffPayment,
  allowSlicePayOneOffPayment: DEFAULT_VALUES.paymentMethods.allowSlicePayOneOffPayment,
  allowSaveCardUserOption: DEFAULT_VALUES.paymentMethods.allowSaveCardUserOption,
};

export const additionalOptionsTab: AdditionalOptions = {
  sendConfirmationEmailToCustomer: DEFAULT_VALUES.options.sendConfirmationEmailToCustomer,
  sendConfirmationEmailToMerchant: DEFAULT_VALUES.options.sendConfirmationEmailToMerchant,
  hideTermsAndConditions: DEFAULT_VALUES.options.hideTermsAndConditions,
  hideMerchantLogo: DEFAULT_VALUES.options.hideMerchantLogo,
  userMode: DEFAULT_VALUES.options.userMode,
  overrideFeePayer: DEFAULT_VALUES.options.overrideFeePayer,
  showFeeOnTokenising: DEFAULT_VALUES.options.showFeeOnTokenising,
  showFailedPaymentFeeOnTokenising: DEFAULT_VALUES.options.showFailedPaymentFeeOnTokenising,
  minHeight: DEFAULT_VALUES.options.minHeight,
};

export const credentialsTab: CredentialsConfig = {
  apiKey: DEFAULT_VALUES.credentials.apiKey,
  username: DEFAULT_VALUES.credentials.username,
  password: DEFAULT_VALUES.credentials.password,
  merchantCode: DEFAULT_VALUES.credentials.merchantCode,
  paymentAmount: DEFAULT_VALUES.credentials.paymentAmount,
} as const;

export const extendedOptionsTab: ExtendedConfig & { minHeight: number } = {
  redirectUrl: DEFAULT_VALUES.extended.redirectUrl,
  callbackUrl: DEFAULT_VALUES.extended.callbackUrl,
  customerName: DEFAULT_VALUES.extended.customerName,
  customerReference: DEFAULT_VALUES.extended.customerReference,
  customerEmail: DEFAULT_VALUES.extended.customerEmail,
  merchantUniquePaymentId: DEFAULT_VALUES.extended.merchantUniquePaymentId,
  contactNumber: DEFAULT_VALUES.extended.contactNumber,
  minHeight: DEFAULT_VALUES.options.minHeight,
} as const;

// Export the main extended options object
export const extendedOptions = extendedOptionsTab;

export const DomUtils = {
  getValue(selector: string | Element): string {
    const el =
      typeof selector === 'string'
        ? (document.querySelector(selector) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null)
        : (selector as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null);
    return el?.value?.trim() ?? '';
  },
  setValue(selector: string | Element, value: string): void {
    const el =
      typeof selector === 'string'
        ? (document.querySelector(selector) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null)
        : (selector as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null);
    if (el) el.value = value;
  },
  getText(selector: string | Element): string {
    const el = typeof selector === 'string' ? document.querySelector(selector) : (selector as Element | null);
    return el?.textContent?.trim() ?? '';
  },
  setText(selector: string | Element, text: string): void {
    const el = typeof selector === 'string' ? document.querySelector(selector) : (selector as Element | null);
    if (el) el.textContent = text;
  },
  hasClass(selector: string | Element, className: string): boolean {
    const el = typeof selector === 'string' ? document.querySelector(selector) : (selector as Element | null);
    return el?.classList.contains(className) ?? false;
  },
  addClass(selector: string | Element, className: string): void {
    const el = typeof selector === 'string' ? document.querySelector(selector) : (selector as Element | null);
    el?.classList.add(className);
  },
  removeClass(selector: string | Element, className: string): void {
    const el = typeof selector === 'string' ? document.querySelector(selector) : (selector as Element | null);
    el?.classList.remove(className);
  },
  toggleClass(selector: string | Element, className: string): void {
    const el = typeof selector === 'string' ? document.querySelector(selector) : (selector as Element | null);
    el?.classList.toggle(className);
  },
  on(selector: string | Element, event: string, handler: EventListener): void {
    const el = typeof selector === 'string' ? document.querySelector(selector) : (selector as Element | null);
    el?.addEventListener(event, handler);
  },
  off(selector: string | Element, event: string, handler: EventListener): void {
    const el = typeof selector === 'string' ? document.querySelector(selector) : (selector as Element | null);
    el?.removeEventListener(event, handler);
  },
} as const;
