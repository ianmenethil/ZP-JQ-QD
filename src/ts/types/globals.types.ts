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

declare global {
	interface Window {
		bootstrap: any;
		hljs: any;
		sha3_512?: Sha3HashFunction;
		zpV3CompatMode: V3CompatibilityMode;
		zenhelp: HelpFunction;
	}
}
