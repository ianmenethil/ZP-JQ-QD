# ZenPay jQuery Input Parameters

| Parameter                 | Supplied by?       | When      | Data                                                         |
| ------------------------- | ------------------ | --------- | ------------------------------------------------------------ |
| `customerName`            | Frontend           | /bookings | Lead passenger first name + last name                        |
| `customerReference`       | Frontend           | /bookings | Whatever                                                     |
| `paymentAmount`           | Frontend           | /bookings | Total price at the time of booking                           |
| `additionalReference`     | Frontend           | /bookings | TravellerInfo the additiona passenger first name + last name |
| `contactNumber`           | Frontend           | /bookings | obvious                                                      |
| `customerEmail`           | Frontend           | /bookings | obvious                                                      |
| `mode`                    | Frontend           | /payments | based on whats selected in settings                          |
| `displayMode`             | Frontend           | /payments | based on whats selected in settings                          |
| `userMode`                | Frontend           | /payments | based on whats selected in settings                          |
| `allowSaveCardUserOption` | Frontend           | /payments | based on whats selected in UI when clicking pay button       |
| `timestamp`               | Frontend + Backend | /payments | automatically sent with /payments call                       |

| Parameter                         | Supplied by?       | When      |
| --------------------------------- | ------------------ | --------- |
| `url`                             | Backend            | /payments |
| `merchantCode`                    | Backend            | /payments |
| `apiKey`                          | Backend            | /payments |
| `fingerprint`                     | Backend            | /payments |
| `redirectUrl`                     | Backend            | /payments |
| `merchantUniquePaymentId`         | Backend            | /payments |
| `allowPayToOneOffPayment`         | Backend            | /payments |
| `allowApplePayOneOffPayment`      | Backend            | /payments |
| `allowGooglePayOneOffPayment`     | Backend            | /payments |
| `callbackUrl`                     | Backend            | /payments |
| `hideTermsAndConditions`          | Backend            | /payments |
| `sendConfirmationEmailToMerchant` | Backend            | /payments |
| `overrideFeePayer`                | Backend            | /payments |
| `sendConfirmationEmailToCustomer` | Backend            | /payments |
| `timestamp`                       | Frontend + Backend | /payments |

| `allowBankAcOneOffPayment` | Not used | - |
| `allowPayIdOneOffPayment` | Not used | - |
| `allowLatitudePayOneOffPayment` | Not used | - |
| `showFeeOnTokenising` | Not used | - |
| `showFailedPaymentFeeOnTokenising` | Not used | - |
| `abn` | Not used | - |
| `companyName` | Not used | - |
| `title` | Not used | - |
| `hideHeader` | Not used | - |
| `hideMerchantLogo` | Not used | - |
| `cardProxy` | Not used | - |
| `minHeight` | Not used | - |
| `onPluginClose` | Not used | - |

| Parameter                          | Type               | Required | Condition       | Description                                                      | Default           |
| ---------------------------------- | ------------------ | -------- | --------------- | ---------------------------------------------------------------- | ----------------- |
| `url`                              | string (uri)       | ✅       | -               | Plugin access URL (v4 recommended)                               | -                 |
| `merchantCode`                     | string             | ✅       | -               | As provided by Zenith                                            | -                 |
| `apiKey`                           | string             | ✅       | -               | As provided by Zenith                                            | -                 |
| `fingerprint`                      | string             | ✅       | -               | SHA3-512/SHA-512/SHA-1 hash of credential string                 | -                 |
| `redirectUrl`                      | string (uri)       | ✅       | -               | Redirect URL for result                                          | -                 |
| `merchantUniquePaymentId`          | string             | ✅       | -               | Unique payment ID from merchant                                  | -                 |
| `mode`                             | integer            | ❌       | -               | 0=Make Payment, 1=Tokenise, 2=Custom Payment, 3=Preauthorisation | 0                 |
| `displayMode`                      | integer            | ❌       | -               | 0=Modal (default), 1=Redirect URL                                | 0                 |
| `customerName`                     | string             | ✅       | mode 0/2        | Customer name                                                    | -                 |
| `customerReference`                | string             | ✅       | mode 0/2        | Customer reference                                               | -                 |
| `paymentAmount`                    | integer            | ✅       | mode 0/2        | Amount in cents (0 if mode=2)                                    | -                 |
| `allowBankAcOneOffPayment`         | boolean            | ✅       | mode 0/2        | Show bank account option                                         | -                 |
| `allowPayToOneOffPayment`          | boolean            | ✅       | mode 0/2        | Show PayTo option                                                | -                 |
| `allowPayIdOneOffPayment`          | boolean            | ✅       | mode 0/2        | Show PayID option                                                | -                 |
| `allowApplePayOneOffPayment`       | boolean            | ❌       | -               | Show Apple Pay option                                            | -                 |
| `allowGooglePayOneOffPayment`      | boolean            | ❌       | -               | Show Google Pay option                                           | -                 |
| `allowLatitudePayOneOffPayment`    | boolean            | ❌       | -               | Show Latitude Pay option                                         | -                 |
| `showFeeOnTokenising`              | boolean            | ✅       | mode 1          | Show applicable fees for token                                   | -                 |
| `showFailedPaymentFeeOnTokenising` | boolean            | ❌       | -               | Show failed payment fees for token                               | -                 |
| `timestamp`                        | string (date-time) | ❌       | required for v4 | UTC ISO 8601 timestamp                                           | -                 |
| `cardProxy`                        | string             | ❌       | -               | Card proxy for payment                                           | -                 |
| `callbackUrl`                      | string (uri)       | ❌       | -               | Callback URL for result POST                                     | -                 |
| `hideTermsAndConditions`           | boolean            | ❌       | -               | Hide Terms and Conditions                                        | false             |
| `sendConfirmationEmailToMerchant`  | boolean            | ❌       | -               | Send confirmation email to merchant                              | false             |
| `additionalReference`              | string             | ❌       | -               | Additional reference for reconciliation                          | -                 |
| `contactNumber`                    | string             | ❌       | -               | Customer contact number                                          | -                 |
| `customerEmail`                    | string (email)     | ❌       | required for v4 | Customer email address                                           | -                 |
| `abn`                              | string             | ❌       | -               | Australian Business Number                                       | -                 |
| `companyName`                      | string             | ❌       | -               | Customer company name                                            | -                 |
| `title`                            | string             | ❌       | -               | Plugin title                                                     | "Process Payment" |
| `hideHeader`                       | boolean            | ❌       | -               | Hide program header                                              | true              |
| `hideMerchantLogo`                 | boolean            | ❌       | -               | Hide merchant logo                                               | false             |
| `overrideFeePayer`                 | integer            | ❌       | -               | 0=Default, 1=Merchant, 2=Customer                                | 0                 |
| `userMode`                         | integer            | ❌       | -               | 0=Customer Facing, 1=Merchant Facing                             | 0                 |
| `minHeight`                        | integer            | ❌       | -               | Minimum height for UI                                            | -                 |
| `onPluginClose`                    | string             | ❌       | -               | JS callback on plugin close                                      | -                 |
| `sendConfirmationEmailToCustomer`  | boolean            | ❌       | -               | Send confirmation email to customer                              | false             |
| `allowSaveCardUserOption`          | boolean            | ❌       | -               | Allow save card option                                           | false             |

## Mode Values

- **0**: Make Payment
- **1**: Tokenise
- **2**: Custom Payment
- **3**: Preauthorisation

## Display Mode Values

- **0**: Modal (default)
- **1**: Redirect URL

## Override Fee Payer Values

- **0**: Default
- **1**: Merchant
- **2**: Customer

## User Mode Values

- **0**: Customer Facing
- **1**: Merchant Facing
