/**
 * Zod Validation Schemas
 * @file validationSchemas.ts
 * @description Runtime validation schemas using Zod for type-safe data validation
 */

import { z } from 'zod';

// ============================================================================
// PAYMENT CONFIGURATION SCHEMAS
// ============================================================================

/**
 * Payment credentials schema with validation rules
 * @example
 * ```typescript
 * const credentials = PaymentCredentialsSchema.parse({
 *   apiKey: 'test-key-123',
 *   username: 'testuser',
 *   password: 'securepass',
 *   merchantCode: 'MERCHANT001'
 * });
 * ```
 */
export const PaymentCredentialsSchema = z.object({
    apiKey: z.string()
        .min(1, 'API key is required')
        .refine(val => val !== '<<API-KEY>>', 'Please provide a valid API key'),

    username: z.string()
        .min(1, 'Username is required')
        .refine(val => val !== '<<USERNAME>>', 'Please provide a valid username'),

    password: z.string()
        .min(1, 'Password is required')
        .refine(val => val !== '<<PASSWORD>>', 'Please provide a valid password'),

    merchantCode: z.string()
        .min(1, 'Merchant code is required')
        .refine(val => val !== '<<MERCHANT-CODE>>', 'Please provide a valid merchant code'),
});

/**
 * Payment amount schema with validation
 * @example
 * ```typescript
 * const amount = PaymentAmountSchema.parse(99.99);
 * ```
 */
export const PaymentAmountSchema = z.number()
    .positive('Payment amount must be positive')
    .max(999999.99, 'Payment amount too large')
    .refine(val => Number.isFinite(val), 'Payment amount must be a valid number');

/**
 * Payment mode schema
 * @example
 * ```typescript
 * const mode = PaymentModeSchema.parse('1');
 * ```
 */
export const PaymentModeSchema = z.enum(['0', '1', '2', '3'], {
    message: 'Payment mode must be 0, 1, 2, or 3'
});

/**
 * UUID validation schema
 * @example
 * ```typescript
 * const uuid = UUIDSchema.parse('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export const UUIDSchema = z.string()
    .uuid('Invalid UUID format')
    .describe('Universally Unique Identifier');

/**
 * ISO timestamp schema
 * @example
 * ```typescript
 * const timestamp = ISOTimestampSchema.parse('2023-12-01T14:30:45');
 * ```
 */
export const ISOTimestampSchema = z.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, 'Invalid ISO timestamp format (YYYY-MM-DDTHH:MM:SS)')
    .describe('ISO format timestamp without timezone');

/**
 * Email validation schema
 * @example
 * ```typescript
 * const email = EmailSchema.parse('user@example.com');
 * ```
 */
export const EmailSchema = z.string()
    .email('Invalid email format')
    .min(1, 'Email is required');

/**
 * URL validation schema
 * @example
 * ```typescript
 * const url = URLSchema.parse('https://example.com/callback');
 * ```
 */
export const URLSchema = z.string()
    .url('Invalid URL format')
    .min(1, 'URL is required');

// ============================================================================
// COMPLETE PAYMENT CONFIGURATION SCHEMA
// ============================================================================

/**
 * Complete ZenPay configuration schema
 * @example
 * ```typescript
 * const config = ZenPayConfigSchema.parse({
 *   apiKey: 'test-key',
 *   username: 'user',
 *   password: 'pass',
 *   merchantCode: 'MERCHANT',
 *   paymentAmount: 99.99,
 *   mode: '1',
 *   merchantUniquePaymentId: '550e8400-e29b-41d4-a716-446655440000',
 *   timestamp: '2023-12-01T14:30:45',
 *   fingerprint: 'abc123...'
 * });
 * ```
 */
export const ZenPayConfigSchema = z.object({
    // Required credentials
    apiKey: PaymentCredentialsSchema.shape.apiKey,
    username: PaymentCredentialsSchema.shape.username,
    password: PaymentCredentialsSchema.shape.password,
    merchantCode: PaymentCredentialsSchema.shape.merchantCode,

    // Payment details
    paymentAmount: PaymentAmountSchema,
    mode: PaymentModeSchema,
    merchantUniquePaymentId: UUIDSchema,
    timestamp: ISOTimestampSchema,
    fingerprint: z.string().min(1, 'Fingerprint is required'),

    // Optional fields
    redirectUrl: URLSchema.optional(),
    callbackUrl: URLSchema.optional(),
    customerName: z.string().optional(),
    customerEmail: EmailSchema.optional(),
    customerReference: z.string().optional(),
    contactNumber: z.string().optional(),
    minHeight: z.number().int().positive().optional(),

    // Boolean options
    sendConfirmationEmailToCustomer: z.boolean().optional(),
    sendConfirmationEmailToMerchant: z.boolean().optional(),
    hideTermsAndConditions: z.boolean().optional(),
    hideMerchantLogo: z.boolean().optional(),

    // Payment method options
    allowBankAcOneOffPayment: z.boolean().optional(),
    allowPayToOneOffPayment: z.boolean().optional(),
    allowPayIdOneOffPayment: z.boolean().optional(),
    allowApplePayOneOffPayment: z.boolean().optional(),
    allowGooglePayOneOffPayment: z.boolean().optional(),
    allowLatitudePayOneOffPayment: z.boolean().optional(),
    allowSaveCardUserOption: z.boolean().optional(),

    // Advanced options
    userMode: z.number().int().min(0).max(2).optional(),
    overrideFeePayer: z.number().int().min(0).max(2).optional(),
    showFeeOnTokenising: z.boolean().optional(),
    showFailedPaymentFeeOnTokenising: z.boolean().optional(),
});

// ============================================================================
// FILE CONFIGURATION SCHEMA
// ============================================================================

/**
 * Configuration file schema for JSON imports
 * @example
 * ```typescript
 * const fileConfig = ConfigurationFileSchema.parse(jsonData);
 * ```
 */
export const ConfigurationFileSchema = z.object({
    apiKey: PaymentCredentialsSchema.shape.apiKey,
    username: PaymentCredentialsSchema.shape.username,
    password: PaymentCredentialsSchema.shape.password,
    merchantCode: PaymentCredentialsSchema.shape.merchantCode,
}).strict(); // Only allow these specific fields

// ============================================================================
// SESSION STORAGE SCHEMA
// ============================================================================

/**
 * Session storage data schema
 * @example
 * ```typescript
 * const sessionData = SessionStorageSchema.parse(storageData);
 * ```
 */
export const SessionStorageSchema = z.record(z.string(), z.unknown())
    .describe('Session storage key-value pairs');

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type PaymentCredentials = z.infer<typeof PaymentCredentialsSchema>;
export type ZenPayConfig = z.infer<typeof ZenPayConfigSchema>;
export type ConfigurationFile = z.infer<typeof ConfigurationFileSchema>;
export type SessionStorageData = z.infer<typeof SessionStorageSchema>;

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Validate payment credentials with detailed error reporting
 * @param data - Data to validate
 * @returns Validation result with parsed data or errors
 * @example
 * ```typescript
 * const result = validatePaymentCredentials(formData);
 * if (result.success) {
 *   console.log('Valid credentials:', result.data);
 * } else {
 *   console.error('Validation errors:', result.error.issues);
 * }
 * ```
 */
export function validatePaymentCredentials(data: unknown) {
    return PaymentCredentialsSchema.safeParse(data);
}

/**
 * Validate complete ZenPay configuration
 * @param data - Data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateZenPayConfig(data: unknown) {
    return ZenPayConfigSchema.safeParse(data);
}

/**
 * Validate configuration file data
 * @param data - Data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateConfigurationFile(data: unknown) {
    return ConfigurationFileSchema.safeParse(data);
}
