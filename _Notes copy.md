# Jquery Mode 0: Payment Flow

Gives 20 minute timer -> Advises user to open bank app to make payment -> Starts pollng zenpay server
When payment is made -> Poll discovers the data -> Timer ends page redirects -> URL Query string includes information as well as callback is fired off with JSON data
**Note: This all happens after user approves mandage in banking app.**

## Redirection query string after transaction is completed from users banking app

```plaintext
https: //pay.travelpay.com.au/demo/?CustomerName=Baal%20Destruction&CustomerReference=e9bfb4a5-dffb-454c-aae8-8f10a46f3c5b&TransactionSourceString=Public_Customer_OnlineOneOffPayment&SettlementDate=2025-10-08T00:00:00&ProcessorReference=28528199&FailureCode=&FailureReason=&MerchantCode=testm&ProcessingDate=2025-10-07T17:14:54&BaseAmount=1&CustomerFee=0&AccountOrCardNo=417529874&AdditionalReference=&FundsToMerchant=1&IsPaymentSettledToMerchant=false&MerchantUniquePaymentId=5f223840-2099-48e7-b031-4b32abc3e56a&PaymentAccount=PayTo&PaymentCard=PayTo&Token=&CallbackStatus=Successful&CardCategory=PayTo&TransactionSource=36&PaymentReference=28528199&PaymentStatus=3&PaymentStatusString=Successful&ProcessedAmount=1
```

## Callback received after transaction is completed from users banking app

```json
{
	"response": {
		"paymentReference": "28528199",
		"customerName": "Baal Destruction",
		"customerReference": "e9bfb4a5-dffb-454c-aae8-8f10a46f3c5b",
		"paymentStatus": 3,
		"paymentStatusString": "Successful",
		"baseAmount": 1,
		"fundsToMerchant": 1,
		"accountOrCardNo": "417529874",
		"paymentAccount": "PayTo",
		"processingDate": "2025-10-07T17:14:54",
		"settlementDate": "2025-10-08T00:00:00",
		"processorReference": "28528199",
		"isPaymentSettledToMerchant": false,
		"failureCode": "",
		"failureReason": "",
		"paymentCard": "PayTo",
		"merchantUniquePaymentId": "5f223840-2099-48e7-b031-4b32abc3e56a",
		"merchantCode": "testm",
		"transactionSource": 36,
		"transactionSourceString": "Public_Customer_OnlineOneOffPayment",
		"customerFee": 0,
		"processedAmount": 1,
		"cardCategory": "PayTo",
		"cardInformationSaved": false
	},
	"validationCode": "57b584f2849a10cda1195b1ee796f6d8ce6168cc7ec5a9b7466c67115317a41536a2c29693ad0601dec235068b2887b3b16114254310b87e8c2c32130edbd9d1"
}
```

## Webhook received

```json
Webhook wasnt enabled at the time didn't capture this, will fix later.
```

# Tokenization Flow Version 2

# Webhook enabled / callback included

## Token created BSB using 444 444

## URL Query string after tokenization

```plaintext
https://client.zenithpayments.support/results?Token=7d56a90f06844bbc966e79d6201cb289&CardType=PayTo&AccountName=SixFours&AccountNumber=*****678&ClientReference=null&IsRestrictedCard=false&CustomerFee=0&MerchantFee=0&ProcessingAmount=356.43&PaymentAmount=356.43&CallbackStatus=Successful
```

## Callback

```json
{
    "response": {
        "token": "7d56a90f06844bbc966e79d6201cb289",
        "cardType": "PayTo",
        "paymentDetail": {
            "customerFee": 0,
            "merchantFee": 0,
            "processingAmount": 356.43,
            "paymentAmount": 356.43
        },
        "isRestrictedCard": false,
        "accountName": "SixFours",
        "accountNumber": "*****678",
        "doRedirect": true
    },
    "validationCode": "3234aec3caa6932471be1155105e2773b3d306a46a4abc7a8706783f856f4a1201ade5a54a4b4ba8084afe2f2a7d225a389b982286739123ebf0cb45487bfbf0"
},
```

## Webhook

```json
{
    "Version": 1,
    "Event": "New",
    "PayloadType": "PayToProxy",
    "Payload": {
        "AccountType": "PayTo",
        "AccountName": "SixFours",
        "AccountNumber": "12345678",
        "BSB": "444444",
        "CardType": "PayTo",
        "PayToStatus": "Pending",
        "StatusDescription": "pending"
    }
},
```

# Tokenization Flow

- After the bank detail submission, jquery modal closes, page redirects and url query string contains token.
- Callback is fired off and POST data thats received on server contains token
  **Note this all happens before user approves mandate banking app**
  - After mandate approval, cannot find webhook last one still shows "2025-10-07T06:19:12.104Z"

Unapproved token: 1bb1f9aeb5e44e0a8cc1d97a628d309b
Approved token: 276487f8a1cc45abb3562bb2782d2e06

## Unapproved token

### Example

endpoint: {{baseUrl}}/v2/payments

```json
{
	"customerReference": "Unapproved",
	"paymentAmount": 0.1,
	"overrideFeePayer": 0,
	"paymentAccountProxy": { "proxy": "1bb1f9aeb5e44e0a8cc1d97a628d309b" },
	"customerName": "IM",
	"sendPaymentConfirmation": true,
	"customerEmail": "ian@zenithpayments.com.au"
}
```

Code: 400

```json
{
	"message": "The request is invalid.",
	"modelState": {
		"cardProxy": ["PayTo Account Proxy provided is not Active."]
	}
}
```

## Approved token

### Example

endpoint: {{baseUrl}}/v2/payments

### API Request:

```json
{
	"customerReference": "Unapproved",
	"paymentAmount": 0.1,
	"overrideFeePayer": 0,
	"paymentAccountProxy": { "proxy": "276487f8a1cc45abb3562bb2782d2e06" },
	"customerName": "IM",
	"sendPaymentConfirmation": true,
	"customerEmail": "ian@zenithpayments.com.au"
}
```

### Response:

Code: 201

```json
{
	"paymentReference": "28528377",
	"customerName": "IM",
	"customerReference": "Unapproved",
	"paymentStatus": "Successful",
	"baseAmount": 0.1,
	"fundsToMerchant": 0.1,
	"customerFee": 0.0,
	"merchantFee": 0.0,
	"paymentAmount": 0.1,
	"accountOrCardNo": "******874",
	"paymentAccount": "PayTo",
	"processingDate": "2025-10-07T17:41:06",
	"settlementDate": "2025-10-08T00:00:00",
	"processorReference": "28528377",
	"isPaymentSettledToMerchant": false,
	"paymentCard": "PayTo",
	"merchantName": "Test Biller - Menethil",
	"merchantCode": "testm",
	"isPaymentRetryScheduled": false,
	"isPaymentRecalled": false,
	"isPaymentRefunded": false,
	"transactionType": 1,
	"transactionTypeDisplay": "Charge",
	"isPaymentChargeBacked": false,
	"paymentSourceDisplay": "Api Tokenised Payment"
}
```

### Callback when callbackUrl included in /v2/payments

### Webhook

# How to trigger errors

| BSB     | Result                                                                |
| ------- | --------------------------------------------------------------------- |
| 100-000 | Debtor branch code does not exist (ZPAGR14)                           |
| 100-001 | Error: Cannot create agreement with provided debtor account (ZPUNP01) |
