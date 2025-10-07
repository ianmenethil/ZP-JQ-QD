/**
 * Event Listeners Module (no jQuery)
 * @module listener
 * @description Sets up UI event listeners for the ZenPay demo plugin page using native DOM APIs
 * @version 2.1.0
 */

import { copyCodeSnippetToClipboard as copyCodeToClipboard } from './utilities.ts';
import { updateCodePreview, updateMinHeightBasedOnMode } from './codePreview.ts';
import { additionalOptionsTab, DomUtils, extendedOptions, paymentMethodsTab, SESSION_KEYS } from './globals.ts';
import { formatPaymentAmount } from './utilities.ts';
import { initializeZenPayPlugin } from './initZP.ts';
import { saveToSession } from './session.ts';
// URL preview updates handled by paymentUrlBuilder.initializePaymentUrlBuilder(); no direct import needed here.

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Payment configuration interface for session storage */
export interface PaymentConfigUpdate {
  apiKey?: string;
  username?: string;
  password?: string;
  merchantCode?: string;
  mode?: number;
  domain?: string;
  subdomain?: string;
  version?: string;
  url?: string;
  sendEmailConfirmationToMerchant?: boolean;
  sendEmailConfirmationToCustomer?: boolean;
}

/** Button state configuration interface */
export interface ButtonStateConfig {
  element: HTMLElement | null;
  enabledTitle: string;
  disabledTitle: string;
  enabledClass?: string;
  disabledClass?: string;
}

/** Payment mode tooltip mapping interface */
export interface PaymentModeTooltips { [key: string]: string }

/** Form field to option mapping interface */
export interface FormFieldMapping { [inputId: string]: string }

/** Event listener initialization error */
export class EventListenerError extends Error {
  constructor(
    message: string,
    public readonly listenerType: string,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = 'EventListenerError';
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYMENT_MODE_TOOLTIPS: PaymentModeTooltips = {
  '0': 'Payment mode using a static payment amount supplied via the payload, which cannot be changed after plugin initialization.',
  '1': 'Tokenization mode, suitable for building wallets.',
  '2': 'Dynamic payment mode, allowing the payment amount to be changed after plugin initialization.',
  '3': 'Preauth mode for authorizing payments without immediate capture.',
} as const;

const DEFAULT_MODE_TOOLTIP = 'Select the payment processing mode';

// ============================================================================
// UTILITIES
// ============================================================================

function getFieldValue(selector: string): string {
  return DomUtils.getValue(selector);
}

function updateButtonState(config: ButtonStateConfig, isEnabled: boolean): void {
  const { element, enabledTitle, disabledTitle, enabledClass = '', disabledClass = 'btn-disabled' } = config;
  if (!element) {
    console.warn('[updateButtonState] Button element not found');
    return;
  }
  if (isEnabled) {
    DomUtils.removeClass(element, disabledClass);
    if (enabledClass) DomUtils.addClass(element, enabledClass);
    element.setAttribute('title', enabledTitle);
  } else {
    DomUtils.addClass(element, disabledClass);
    if (enabledClass) DomUtils.removeClass(element, enabledClass);
    element.setAttribute('title', disabledTitle);
  }
}

function areCredentialsFilled(): boolean {
  const apiKey = getFieldValue('#apiKeyInput');
  const username = getFieldValue('#usernameInput');
  const password = getFieldValue('#passwordInput');
  const merchantCode = getFieldValue('#merchantCodeInput');
  return !!(apiKey && username && password && merchantCode);
}

// Bootstrap helpers (typed as any to avoid adding type deps)

declare const bootstrap: any;

function hidePaymentModeTooltips(): void {
  document.querySelectorAll<HTMLElement>('.payment-mode-info').forEach((el) => {
    const inst = bootstrap?.Tooltip?.getInstance?.(el);
    inst?.hide?.();
  });
}

// ============================================================================
// MAIN EXPORTS (no jQuery; same function names)
// ============================================================================

export function updateActionButtonsState(): void {
  try {
    const credentialsFilled = areCredentialsFilled();

    const downloadButtonConfig: ButtonStateConfig = {
      element: document.querySelector('#downloadDemoBtn'),
      enabledTitle: 'Download Standalone Demo',
      disabledTitle: 'Please fill in API Key, Username, Password, and Merchant Code to enable download.',
    };

    const initializeButtonConfig: ButtonStateConfig = {
      element: document.querySelector('#initializePlugin'),
      enabledTitle: 'Initialize Plugin',
      disabledTitle: 'Please fill in API Key, Username, Password, and Merchant Code to initialize plugin.',
    };

    updateButtonState(downloadButtonConfig, credentialsFilled);
    updateButtonState(initializeButtonConfig, credentialsFilled);
  } catch (error) {
    throw new EventListenerError('Failed to update action button states', 'buttonState', error instanceof Error ? error : undefined);
  }
}

export function initCredentialsListeners(): void {
  try {
    const selectors = ['#apiKeyInput', '#usernameInput', '#passwordInput', '#merchantCodeInput'];

    const handleBlur = (_e: Event) => {
      try {
        // Session save removed - only saved on browse config or initialize plugin
        updateCodePreview();
        updateActionButtonsState();
      } catch (error) {
        console.error('[initCredentialsListeners] Error handling credential blur:', error);
      }
    };

    selectors.forEach((sel) => {
      const el = document.querySelector<HTMLElement>(sel);
      if (el) el.addEventListener('blur', handleBlur);
      else console.warn(`[initCredentialsListeners] Element not found: ${sel}`);
    });

    updateActionButtonsState();
  } catch (error) {
    throw new EventListenerError('Failed to initialize credential listeners', 'credentials', error instanceof Error ? error : undefined);
  }
}

export function initPaymentMethodToggleListeners(): void {
  try {
    document.querySelectorAll<HTMLInputElement>('.payment-method-toggle').forEach((el) => {
      el.addEventListener('change', function (this: HTMLInputElement) {
        try {
          const option = this.dataset['option'] ?? '';
          const isChecked = this.checked;
          if (option && paymentMethodsTab && option in paymentMethodsTab) {
            (paymentMethodsTab as unknown as Record<string, unknown>)[option] = isChecked;
          }
          // Session save removed - only saved on initialize plugin
          updateCodePreview();
        } catch (error) {
          console.error('[initPaymentMethodToggleListeners] Error handling payment method change:', error);
        }
      });
    });
  } catch (error) {
    throw new EventListenerError('Failed to initialize payment method toggle listeners', 'paymentMethods', error instanceof Error ? error : undefined);
  }
}

export function initAdditionalOptionsListeners(): void {
  try {
    document.querySelectorAll<HTMLInputElement>('.option-toggle').forEach((el) => {
      el.addEventListener('change', function (this: HTMLInputElement) {
        try {
          const option = this.dataset['option'] ?? '';
          const isChecked = this.checked;
          if (option && additionalOptionsTab && option in additionalOptionsTab) {
            (additionalOptionsTab as unknown as Record<string, unknown>)[option] = isChecked;
          }
          // Session save removed - only saved on initialize plugin
          updateCodePreview();
        } catch (error) {
          console.error('[initAdditionalOptionsListeners] Error handling additional option change:', error);
        }
      });
    });
  } catch (error) {
    throw new EventListenerError('Failed to initialize additional options listeners', 'additionalOptions', error instanceof Error ? error : undefined);
  }
}

export function initUiMinHeightListener(): void {
  try {
    const el = document.getElementById('minHeightInput');
    el?.addEventListener('blur', () => {
      try { updateCodePreview(); } catch (error) { console.error('[initUiMinHeightListener] Error updating code preview:', error); }
    });
  } catch (error) {
    throw new EventListenerError('Failed to initialize UI min-height listener', 'minHeight', error instanceof Error ? error : undefined);
  }
}

export function initPaymentAmountListener(): void {
  try {
    const el = document.getElementById('paymentAmountInput') as HTMLInputElement | null;
    el?.addEventListener('blur', function (this: HTMLInputElement) {
      try {
        const rawValue = this.value ?? '';
        const numericValue = Number.parseFloat(rawValue || '0');
        const formatted = formatPaymentAmount(numericValue);
        this.value = formatted;
        console.log(`[initPaymentAmountListener] Payment amount changed to: ${formatted}`);
        updateCodePreview();
      } catch (error) {
        console.error('[initPaymentAmountListener] Error formatting payment amount:', error);
      }
    });
  } catch (error) {
    throw new EventListenerError('Failed to initialize payment amount listener', 'paymentAmount', error instanceof Error ? error : undefined);
  }
}

export function initModeSelectListener(): void {
  try {
    const sel = document.getElementById('modeSelect') as HTMLSelectElement | null;
    sel?.addEventListener('change', function (this: HTMLSelectElement) {
      try {
        const mode = this.value;
        const tokenOpts = document.getElementById('tokenizationOptions');
        if (tokenOpts) {
          if (mode === '1') tokenOpts.classList.remove('d-none');
          else tokenOpts.classList.add('d-none');
        }
        updateMinHeightBasedOnMode();
        // Session save removed - only saved on initialize plugin
        updateCodePreview();
      } catch (error) {
        console.error('[initModeSelectListener] Error handling mode change:', error);
      }
    });
  } catch (error) {
    throw new EventListenerError('Failed to initialize mode select listener', 'modeSelect', error instanceof Error ? error : undefined);
  }
}

export function initUserModeToggle(): void {
  try {
    document.querySelectorAll<HTMLInputElement>('input[name="userMode"]').forEach((el) => {
      el.addEventListener('change', function (this: HTMLInputElement) {
        try {
          const numValue = Number(this.value);
          console.debug(`[initUserModeToggle] User mode changed to: ${numValue}`);
          if (additionalOptionsTab) (additionalOptionsTab as unknown as Record<string, unknown>)['userMode'] = numValue;
          if (extendedOptions) (extendedOptions as unknown as Record<string, unknown>)['userMode'] = numValue;
          saveToSession(SESSION_KEYS.USER_MODE, numValue);
          updateCodePreview();
        } catch (error) {
          console.error('[initUserModeToggle] Error handling user mode change:', error);
        }
      });
    });
  } catch (error) {
    throw new EventListenerError('Failed to initialize user mode toggle', 'userMode', error instanceof Error ? error : undefined);
  }
}

export function initOverrideFeePayerToggle(): void {
  try {
    document.querySelectorAll<HTMLInputElement>('input[name="overrideFeePayer"]').forEach((el) => {
      el.addEventListener('change', function (this: HTMLInputElement) {
        try {
          const numValue = Number(this.value);
          console.debug(`[initOverrideFeePayerToggle] Override fee payer changed to: ${numValue}`);
          if (additionalOptionsTab) (additionalOptionsTab as unknown as Record<string, unknown>)['overrideFeePayer'] = numValue;
          if (extendedOptions) (extendedOptions as unknown as Record<string, unknown>)['overrideFeePayer'] = numValue;
          saveToSession(SESSION_KEYS.OVERRIDE_FEE_PAYER, numValue);
          updateCodePreview();
        } catch (error) {
          console.error('[initOverrideFeePayerToggle] Error handling override fee payer change:', error);
        }
      });
    });
  } catch (error) {
    throw new EventListenerError('Failed to initialize override fee payer toggle', 'overrideFeePayer', error instanceof Error ? error : undefined);
  }
}

export function initInitializePluginListener(): void {
  try {
    const btn = document.getElementById('initializePlugin');
    btn?.addEventListener('click', () => {
      try { initializeZenPayPlugin(); }
      catch (error) { console.error('[initInitializePluginListener] Error initializing ZenPay plugin:', error); }
    });
  } catch (error) {
    throw new EventListenerError('Failed to initialize plugin listener', 'initializePlugin', error instanceof Error ? error : undefined);
  }
}

export function initCopyCodeListener(): void {
  try {
    const btn = document.getElementById('copyCodeBtn');
    btn?.addEventListener('click', () => {
      try { copyCodeToClipboard(); }
      catch (error) { console.error('[initCopyCodeListener] Error copying code to clipboard:', error); }
    });
  } catch (error) {
    throw new EventListenerError('Failed to initialize copy code listener', 'copyCode', error instanceof Error ? error : undefined);
  }
}

export function initOptionTooltips(): void {
  try {
    const select = document.getElementById('modeSelect') as HTMLSelectElement | null;
    if (!select) return;
    select.querySelectorAll('option').forEach((opt) => {
      const optionElem = opt as HTMLOptionElement;
      const tooltipText = optionElem.dataset['tooltip'] ?? optionElem.getAttribute('data-tooltip') ?? '';
      if (tooltipText) optionElem.setAttribute('title', tooltipText);
    });
  } catch (error) {
    throw new EventListenerError('Failed to initialize option tooltips', 'optionTooltips', error instanceof Error ? error : undefined);
  }
}

export function initPaymentModeHoverTooltip(): void {
  try {
    document.querySelectorAll<HTMLElement>('.payment-mode-info').forEach((el) => {
      const onEnter = () => {
        try {
          const mode = (document.getElementById('modeSelect') as HTMLSelectElement | null)?.value ?? '';
          const text = PAYMENT_MODE_TOOLTIPS[mode] ?? DEFAULT_MODE_TOOLTIP;
          let tip = bootstrap?.Tooltip?.getInstance?.(el);
          if (!tip) tip = new bootstrap.Tooltip(el, { title: text, trigger: 'manual' });
          else if (typeof tip.setContent === 'function') tip.setContent({ '.tooltip-inner': text });
          else el.setAttribute('data-bs-original-title', text);
          tip.show();
        } catch (error) {
          console.error('[initPaymentModeHoverTooltip] Error showing payment mode tooltip:', error);
        }
      };
      const onLeave = () => { try { bootstrap?.Tooltip?.getInstance?.(el)?.hide?.(); } catch { /* noop */ } };
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });
  } catch (error) {
    throw new EventListenerError('Failed to initialize payment mode hover tooltip', 'paymentModeHover', error instanceof Error ? error : undefined);
  }
}

export function initPaymentModeChangeTooltip(): void {
  try {
    const sel = document.getElementById('modeSelect');
    sel?.addEventListener('change', () => {
      try { hidePaymentModeTooltips(); }
      catch (error) { console.error('[initPaymentModeChangeTooltip] Error hiding payment mode tooltip:', error); }
    });
  } catch (error) {
    throw new EventListenerError('Failed to initialize payment mode change tooltip', 'paymentModeChange', error instanceof Error ? error : undefined);
  }
}

// Removed duplicate URL builder listeners; use paymentUrlBuilder.initializePaymentUrlBuilder instead.

export function initEmailConfirmationListeners(): void {
  try {
    const merchantCb = document.getElementById('sendEmailConfirmationToMerchant') as HTMLInputElement | null;
    const customerCb = document.getElementById('sendEmailConfirmationToCustomer') as HTMLInputElement | null;

    const handler = () => {
      try {
        const paymentConfig: PaymentConfigUpdate = {
          sendEmailConfirmationToMerchant: Boolean(merchantCb?.checked),
          sendEmailConfirmationToCustomer: Boolean(customerCb?.checked),
        };
        console.log(`[initEmailConfirmationListeners] paymentConfig: ${JSON.stringify(paymentConfig)}`);
        // Session save removed - only saved on initialize plugin
        updateCodePreview();
      } catch (error) {
        console.error('[initEmailConfirmationListeners] Error handling email confirmation change:', error);
      }
    };

    merchantCb?.addEventListener('change', handler);
    customerCb?.addEventListener('change', handler);
  } catch (error) {
    throw new EventListenerError('Failed to initialize email confirmation listeners', 'emailConfirmation', error instanceof Error ? error : undefined);
  }
}
