/**
 * Type definitions for external libraries used in the ZenPay application
 * @file external-libs.d.ts
 */

// ============================================================================
// JQUERY EXTENSIONS
// ============================================================================

/**
 * ZenPay plugin configuration interface
 */
export interface ZenPayConfig {
    apiKey: string;
    username: string;
    password: string;
    merchantCode: string;
    paymentAmount: number;
    mode: number;
    fingerprint: string;
    timestamp: string;
    redirectUrl: string;
    callbackUrl?: string;
    customerName?: string;
    customerReference?: string;
    customerEmail?: string;
    merchantUniquePaymentId: string;
    contactNumber?: string;
    sendConfirmationEmailToCustomer?: boolean;
    sendConfirmationEmailToMerchant?: boolean;
    hideTermsAndConditions?: boolean;
    hideMerchantLogo?: boolean;
    userMode?: number;
    overrideFeePayer?: number;
    showFeeOnTokenising?: boolean;
    showFailedPaymentFeeOnTokenising?: boolean;
    allowBankAcOneOffPayment?: boolean;
    allowPayToOneOffPayment?: boolean;
    allowPayIdOneOffPayment?: boolean;
    allowApplePayOneOffPayment?: boolean;
    allowGooglePayOneOffPayment?: boolean;
    allowSlicePayOneOffPayment?: boolean;
    allowSaveCardUserOption?: boolean;
    minHeight?: number;
    url: string;
    displayMode?: number;
    customerNameLabel?: string;
    customerReferenceLabel?: string;
    paymentAmountLabel?: string;
    allowLatitudePayOneOffPayment?: boolean;
    cardProxy?: string;
    additionalReference?: string;
    abn?: string;
    companyName?: string;
    title?: string;
    hideHeader?: boolean;
    onPluginClose?: string;
    departureDate?: string;
}

/**
 * ZenPay plugin instance interface
 */
export interface ZenPayPlugin {
    init(): void;
    options: ZenPayConfig;
}


declare module 'bootstrap' {
    export interface Modal {
        show(): void;
        hide(): void;
        toggle(): void;
        dispose(): void;
    }

    export interface Tooltip {
        show(): void;
        hide(): void;
        toggle(): void;
        dispose(): void;
    }
}

declare module 'highlight.js' {
    export interface HLJSApi {
        highlight( ): { value: string };
        highlightAuto(): { value: string; language?: string };
        highlightElement(): void;
        configure(): void;
    }
}

/**
 * SHA-3-512 hash function type
 */
declare global {
    /**
     * SHA-3-512 hashing function. Some builds expose a direct function, others expose a factory.
     */
    function sha3_512(data: string): string;
    function sha3_512(): (data: string) => string;
}

export { };
