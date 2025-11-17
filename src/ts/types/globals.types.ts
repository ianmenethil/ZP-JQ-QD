// Types only

export interface SessionKeys {
	readonly API_KEY: string;
	readonly USERNAME: string;
	readonly PASSWORD: string;
	readonly MERCHANT_CODE: string;
	readonly REDIRECT_URL: string;
	readonly CALLBACK_URL: string;
	readonly MODE: string;
	readonly SUBDOMAIN: string;
	readonly DOMAIN: string;
	readonly VERSION: string;
	readonly URL: string;
	readonly MIN_HEIGHT: string;
	readonly SENDEMAILCONFIRMATIONTOMERCHANT: string;
	readonly SENDEMAILCONFIRMATIONTOCUSTOMER: string;
	readonly HIDETERMSANDCONDITIONS: string;
	readonly HIDEMERCHANTLOGO: string;
	readonly USER_MODE: string;
	readonly OVERRIDE_FEE_PAYER: string;
	readonly SHOWFEEONTOKENISING: string;
	readonly SHOWFAILED_PAYMENTFEEONTOKENISING: string;
	readonly ALLOWBANKONEOFF: string;
	readonly ALLOWPAYTO: string;
	readonly ALLOWPAYID: string;
	readonly ALLOWAPPLEPAY: string;
	readonly ALLOWGOOGLEPAY: string;
	readonly ALLOWSAVECARDINFO: string;
	readonly ALLOWSLICEPAY: string;
	readonly DEPARTURE_DATE: string;
	readonly PAYMENT_AMOUNT: string;
	readonly DISPLAY_MODE: string;
}

export interface CredentialsConfig {
	readonly apiKey: string;
	readonly username: string;
	readonly password: string;
	readonly merchantCode: string;
	readonly paymentAmount: string;
}

export interface ExtendedConfig {
	readonly redirectUrl: string;
	readonly callbackUrl: string;
	readonly customerName: string;
	readonly customerReference: string;
	readonly customerEmail: string;
	readonly merchantUniquePaymentId: string;
	readonly contactNumber: string;
}

export interface PaymentMethodOptions {
	readonly allowBankAcOneOffPayment: boolean;
	readonly allowPayToOneOffPayment: boolean;
	readonly allowPayIdOneOffPayment: boolean;
	readonly allowApplePayOneOffPayment: boolean;
	readonly allowGooglePayOneOffPayment: boolean;
	readonly allowSlicePayOneOffPayment: boolean;
	readonly allowSaveCardUserOption: boolean;
}

export interface AdditionalOptions {
	readonly sendConfirmationEmailToCustomer: boolean;
	readonly sendConfirmationEmailToMerchant: boolean;
	readonly hideTermsAndConditions: boolean;
	readonly hideMerchantLogo: boolean;
	readonly userMode: number;
	readonly overrideFeePayer: number;
	readonly showFeeOnTokenising: boolean;
	readonly showFailedPaymentFeeOnTokenising: boolean;
	readonly minHeight: number;
	readonly displayMode: number;
}

interface UrlConfig {
	readonly subdomain: string;
	readonly domain: string;
	readonly version: string;
}

export interface DefaultValues {
	readonly credentials: CredentialsConfig;
	readonly extended: ExtendedConfig;
	readonly paymentMethods: PaymentMethodOptions;
	readonly options: AdditionalOptions;
	readonly url: UrlConfig;
}

interface V3CompatibilityMode {
	omitTimestampFromHash: boolean;
	omitMerchantCodeFromPayload: boolean;
}

export type Sha3HashFunction = (data: string) => string;
type HelpFunction = () => void;

// Bootstrap types
export interface BootstrapModal {
	show(): void;
	hide(): void;
	toggle(): void;
	dispose(): void;
	handleUpdate(): void;
}

export interface BootstrapModalConstructor {
	new (element: HTMLElement, options?: Record<string, unknown>): BootstrapModal;
	getInstance(element: HTMLElement): BootstrapModal | null;
	getOrCreateInstance(element: HTMLElement, options?: Record<string, unknown>): BootstrapModal;
}

export interface BootstrapTooltip {
	show(): void;
	hide(): void;
	toggle(): void;
	dispose(): void;
	enable(): void;
	disable(): void;
	toggleEnabled(): void;
	update(): void;
}

export interface BootstrapTooltipConstructor {
	new (element: HTMLElement, options?: Record<string, unknown>): BootstrapTooltip;
	getInstance(element: HTMLElement): BootstrapTooltip | null;
	getOrCreateInstance(element: HTMLElement, options?: Record<string, unknown>): BootstrapTooltip;
}

export interface BootstrapNamespace {
	Modal: BootstrapModalConstructor;
	Tooltip: BootstrapTooltipConstructor;
}

// Highlight.js types
export interface HljsHighlightResult {
	language?: string;
	relevance: number;
	value: string;
	second_best?: {
		language?: string;
		relevance: number;
		value: string;
	};
}

export interface HljsNamespace {
	highlight(code: string, options: { language: string }): HljsHighlightResult;
	highlightAuto(code: string, languageSubset?: string[]): HljsHighlightResult;
	highlightElement(element: HTMLElement): void;
	configure(options: Record<string, unknown>): void;
	initHighlighting(): void;
	initHighlightingOnLoad(): void;
	registerLanguage(name: string, language: unknown): void;
	listLanguages(): string[];
	getLanguage(name: string): unknown;
	autoDetection(name: string): boolean;
}

// Window extensions for modal state management
export interface ModalStateExtension {
	errorCodesRerender?: () => Promise<void>;
	errorCodesModal?: BootstrapModal;
	errorCodesSearchInput?: HTMLInputElement;
	inputParametersRerender?: () => Promise<void>;
	inputParametersModal?: BootstrapModal;
	inputParametersSearchInput?: HTMLInputElement;
	outputParametersRerender?: () => Promise<void>;
	outputParametersModal?: BootstrapModal;
	outputParametersSearchInput?: HTMLInputElement;
	showParameterModal?: (searchTerm: string) => void;
}

declare global {
	interface Window extends ModalStateExtension {
		bootstrap: BootstrapNamespace;
		hljs: HljsNamespace;
		sha3_512?: Sha3HashFunction;
		zpV3CompatMode: V3CompatibilityMode;
		zenhelp: HelpFunction;
	}

	// Element extensions for storing event handlers
	interface HTMLElement {
		_extendedOptionsHandler?: EventListener;
		_extendedOptionsDomainHandler?: EventListener;
	}
}
