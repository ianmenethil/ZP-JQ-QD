# ZenPay Plugin Configuration Form Elements

## 📋 Complete Form Structure

### 1. **Top Configuration Section**

| Element      | ID           | Type           | Description                       |
| ------------ | ------------ | -------------- | --------------------------------- |
| API Endpoint | `urlPreview` | Read-only text | API endpoint URL                  |
| Payment Mode | `modeSelect` | Dropdown       | Payment processing mode selection |

### 2. **Credentials Section**

| Element             | ID                             | Type         | Description               |
| ------------------- | ------------------------------ | ------------ | ------------------------- |
| API Key             | `apiKeyInput`                  | Text input   | Authentication key        |
| Merchant Code       | `merchantCodeInput`            | Text input   | Merchant identifier       |
| Username            | `usernameInput`                | Text input   | Login username            |
| Password            | `passwordInput`                | Text input   | Login password            |
| Payment Amount      | `paymentAmountInput`           | Number input | Transaction amount        |
| Redirect URL        | `redirectUrlInput`             | Text input   | Post-payment redirect     |
| Callback URL        | `callbackUrlInput`             | Text input   | Server callback endpoint  |
| Customer Name       | `customerNameInput`            | Text input   | Customer's full name      |
| Contact Number      | `contactNumberInput`           | Tel input    | Customer phone number     |
| Customer Email      | `customerEmailInput`           | Email input  | Customer email address    |
| Customer Reference  | `customerReferenceInput`       | Text input   | Unique customer ID        |
| Merchant Payment ID | `merchantUniquePaymentIdInput` | Text input   | Unique payment identifier |

### 3. **Payment Methods (Left Side)**

| Element    | ID                            | Type     | Description            |
| ---------- | ----------------------------- | -------- | ---------------------- |
| Bank       | `allowBankAcOneOffPayment`    | Checkbox | Bank account payments  |
| PayTo      | `allowPayToOneOffPayment`     | Checkbox | PayTo payment method   |
| PayID      | `allowPayIdOneOffPayment`     | Checkbox | PayID payment method   |
| Apple Pay  | `allowApplePayOneOffPayment`  | Checkbox | Apple Pay integration  |
| Google Pay | `allowGooglePayOneOffPayment` | Checkbox | Google Pay integration |
| Slice Pay  | `allowSlicePayOneOffPayment`  | Checkbox | Slice Pay integration  |
| Save Card  | `allowSaveCardUserOption`     | Checkbox | Save card option       |

### 4. **Options (Right Side)**

| Element            | ID                                | Type     | Description                |
| ------------------ | --------------------------------- | -------- | -------------------------- |
| Email Customer     | `sendConfirmationEmailToCustomer` | Checkbox | Send customer confirmation |
| Email Merchant     | `sendConfirmationEmailToMerchant` | Checkbox | Send merchant confirmation |
| Hide Terms         | `hideTermsAndConditions`          | Checkbox | Hide terms section         |
| Hide Logo          | `hideMerchantLogo`                | Checkbox | Hide merchant logo         |
| User Mode Customer | `selectUserModeCustomer`          | Radio    | Customer-facing mode       |
| User Mode Merchant | `selectUserModeMerchant`          | Radio    | Merchant-facing mode       |
| Fee Payer Default  | `overrideFeePayerDefault`         | Radio    | Default fee payer          |
| Fee Payer Customer | `overrideFeePayerCustomer`        | Radio    | Customer pays fees         |
| Fee Payer Merchant | `overrideFeePayerMerchant`        | Radio    | Merchant pays fees         |

## 📊 Summary

| Category                      | Count | Elements                                                                                                                                                                       |
| ----------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Text/Number/Email Inputs**  | 12    | API Key, Merchant Code, Username, Password, Payment Amount, Redirect URL, Callback URL, Customer Name, Contact Number, Customer Email, Customer Reference, Merchant Payment ID |
| **Payment Method Checkboxes** | 7     | Bank, PayTo, PayID, Apple Pay, Google Pay, Slice Pay, Save Card                                                                                                                |
| **Option Checkboxes**         | 4     | Email Customer, Email Merchant, Hide Terms, Hide Logo                                                                                                                          |
| **Radio Button Groups**       | 2     | User Mode (2 options), Fee Payer (3 options)                                                                                                                                   |
| **Dropdown**                  | 1     | Payment Mode                                                                                                                                                                   |
| **Read-only Input**           | 1     | API Endpoint                                                                                                                                                                   |

**Total Form Elements: 25**
