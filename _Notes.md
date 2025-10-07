# Childcare easypay doesnt work, I get below in production.

https://pay.childcareeasypay.com.au/Online/v5/Menethil/ConfirmPayment
ProgramId=4&SiteId=4&MerchantId=95739&MerchantCode=Menethil&MerchantTradingName=Test+%26+Biller+-+Menethil&CustomerId=&CustomerReference=71038302-16d0-48ce-997f-a3b541c65a4e&CustomerName=Orgrim+Doomhammer&CustomerEmail=orgrim%40zenpay.com.au&ContactNumber=400001002&CompanyName=&AdditionalReference=&AustralianBusinessNumber=&LastDigits=&PaymentAmount=1&ProcessorName=TillPayments&ProcessorToken=&CardHolderName=&CardExpiry=&CardType=PayTo&ProcessingFee=0&TotalAmount=0&PricingProfileId=1873&RedirectUrl=https%3A%2F%2Fclient.zenithpayments.support%2Fresults&CallbackUrl=https%3A%2F%2Fserver.zenithpayments.support%2Fapi%2Fv1%2Fwebhooks%3Fk%3DVanish%26s%3DZPCallback%26e%3Dsandbox-callback%26mc%3D1337&MerchantUniquePaymentId=ba1d61a0-0273-4bec-8e7e-cdb980da9b51&Mode=1&Token=&ClientReference=&TermsandConditionsAgreement=True&Method=PayTo&AccountName=&BSB=&AccountNumber=&PayToAccountName=TokenApproved&PayToBsb=012204&PayToAccountNumber=417529874&Version=v5&SendConfirmationEmailToMerchant=False&ShowFeeOnTokenising=False&ShowFailedPaymentFeeOnTokenising=False&OverrideFeePayer=0&UserMode=0&Processor3DSPayload=&Enable3DSecureService=True&OAuthToken=&VerificationCode=&Username=S6BwYfESi1UZVyU5WEEKZqNwbcOPCB&CardHolderFirstName=&CardHolderLastName=&PayId=&PayIdName=&PayIdContactId=&PayIdReference=&PaymentReference=&RegionCode=AUS&Currency=AUD&ApplePayTokenBase64=&SubCardType=&RequestId=5654da78-d291-4cee-a612-3c7806554a7a&TransactionId=&Timestamp=2025-10-07T14%3A10%3A17&SendConfirmationEmailToCustomer=False&GooglePayTokenBase64=&isLatitudePayWarningAccepted=&LatPayProcessingStatusUrl=&ProgramType=ChildCareEasyPay&SaveCardInformation=False&PayToAgreementStatus=&PayToAgreementUId=&DepartureDate=&SlicePayPaymentLinkExpiresAt=&SlicePayMaximumAmount=&Sku1=&Sku2=&X-Requested-With=XMLHttpRequest

{"isSuccess":false,"message":"Creating PayTo mandate failed. Unauthorized"}

---

# Moving to travelpay

In TP https://pay.travelpay.com.au/Online/v5/testm/ConfirmPayment returns Req:

```plaintext
ProgramId=2&SiteId=2&MerchantId=100781&MerchantCode=testm&MerchantTradingName=Test+Biller+-+Menethil&CustomerId=&CustomerReference=cd5ec43e-1d2c-4b62-a477-e2ff37bcc3ba&CustomerName=Maiev+Shadowsong&CustomerEmail=maiev%40zenpay.com.au&ContactNumber=400001002&CompanyName=&AdditionalReference=&AustralianBusinessNumber=&LastDigits=&PaymentAmount=1&ProcessorName=TillPayments&ProcessorToken=&CardHolderName=&CardExpiry=&CardType=PayTo&ProcessingFee=0&TotalAmount=0&PricingProfileId=1870&RedirectUrl=https%3A%2F%2Fclient.zenithpayments.support%2Fresults&CallbackUrl=https%3A%2F%2Fserver.zenithpayments.support%2Fapi%2Fv1%2Fwebhooks%3Fk%3DVanish%26s%3DZPCallback%26e%3Dprod-callback%26mc%3D1337&MerchantUniquePaymentId=04bc422c-02dc-4831-b48a-a35e9724a32b&Mode=1&Token=&ClientReference=&TermsandConditionsAgreement=True&Method=PayTo&AccountName=&BSB=&AccountNumber=&PayToAccountName=AppToken&PayToBsb=012204&PayToAccountNumber=417529874&Version=v5&SendConfirmationEmailToMerchant=False&ShowFeeOnTokenising=False&ShowFailedPaymentFeeOnTokenising=False&OverrideFeePayer=0&UserMode=0&Processor3DSPayload=&Enable3DSecureService=True&OAuthToken=&VerificationCode=&Username=lbeRXxIc4G9zCi9RJVCiEJL5Fm5kmR&CardHolderFirstName=&CardHolderLastName=&PayId=&PayIdName=&PayIdContactId=&PayIdReference=&PaymentReference=&RegionCode=AUS&Currency=AUD&ApplePayTokenBase64=&SubCardType=&RequestId=fcd59106-6c72-405f-b2d1-157fab70fa71&TransactionId=&Timestamp=2025-10-07T14%3A20%3A49&SendConfirmationEmailToCustomer=False&GooglePayTokenBase64=&isLatitudePayWarningAccepted=&LatPayProcessingStatusUrl=&ProgramType=TravelPay&SaveCardInformation=False&PayToAgreementStatus=&PayToAgreementUId=&DepartureDate=&SlicePayPaymentLinkExpiresAt=&SlicePayMaximumAmount=&Sku1=&Sku2=&X-Requested-With=XMLHttpRequest
```

Resp:

```json
{
	"isSuccess": true,
	"authoriseResponse": {
		"token": "d214f7f84d2b4df8be074a3ddc021621",
		"clientReference": null,
		"cardHolderName": null,
		"cardNumber": null,
		"cardExpiry": null,
		"cardType": "PayTo",
		"paymentDetail": {
			"customerFee": 0.0,
			"merchantFee": 0.0,
			"processingAmount": 1.0,
			"paymentAmount": 1.0
		},
		"isRestrictedCard": false,
		"accountName": "AppToken",
		"accountNumber": "******874",
		"doRedirect": true,
		"payId": null,
		"payIdName": null,
		"payIdReference": null,
		"threeDsStepUrl": null
	},
	"callbackUrl": "https://server.zenithpayments.support/api/v1/webhooks?k=Vanish&s=ZPCallback&e=prod-callback&mc=1337",
	"redirectUrl": "https://client.zenithpayments.support/results",
	"callbackStatus": "Successful"
}
```

## Uanpproved Token Stage:
## Unapproved stage after jquery tokenization

### Redirection query string

```plaintext
https://client.zenithpayments.support/results?Token=d214f7f84d2b4df8be074a3ddc021621&CardType=PayTo&AccountName=AppToken&AccountNumber=******874&ClientReference=null&IsRestrictedCard=false&CustomerFee=0&MerchantFee=0&ProcessingAmount=1&PaymentAmount=1&CallbackStatus=Successful
```

### Callback

```json
{
	"response": {
		"token": "d214f7f84d2b4df8be074a3ddc021621",
		"cardType": "PayTo",
		"paymentDetail": {
			"customerFee": 0,
			"merchantFee": 0,
			"processingAmount": 1,
			"paymentAmount": 1
		},
		"isRestrictedCard": false,
		"accountName": "AppToken",
		"accountNumber": "******874",
		"doRedirect": true
	},
	"validationCode": "71298341beee08281e25d5cd10c6bf300cf6ee30804cf8bb5253e869f9a9c1039b08e8bc42e92e249c27a18a3f6968bddd3e7378a00a70621a73a1e8a201cf24"
}
```

### Webhook

```json
{
	"Version": 1,
	"Event": "New",
	"PayloadType": "PayToProxy",
	"Payload": {
		"AccountType": "PayTo",
		"AccountName": "AppToken",
		"AccountNumber": "417529874",
		"BSB": "012204",
		"CardType": "PayTo",
		"PayToStatus": "Pending",
		"StatusDescription": "pending"
	}
}
```

### https://api.travelpay.com.au/v2/payments with unapproved token

Req:

```json
{
	"customerReference": "Test1",
	"paymentAmount": 0.1,
	"paymentAccountProxy": { "proxy": "d214f7f84d2b4df8be074a3ddc021621" }
}
```

Resp Status: 400

```json
{
	"message": "The request is invalid.",
	"modelState": {
		"cardProxy": ["PayTo Account Proxy provided is not Active."]
	}
}
```

### https://api.travelpay.com.au/v2/proxies/d214f7f84d2b4df8be074a3ddc021621 with unapproved token

Resp:

```json
{
	"accountType": "PayTo",
	"accountName": "AppToken",
	"accountNumber": "417529874",
	"bsb": "012204",
	"payToStatus": "Pending",
	"cardType": "PayTo",
	"uId": "6b26376a-ca87-4734-ab6b-10cfc8f1b3ca",
	"statusDescription": "pending"
}
```

## Approved Token Stage:
## After approving token in banking app

### Webhook received

**Note the event is `Edit` **

```json
{
	"Version": 1,
	"Event": "Edit",
	"PayloadType": "PayToProxy",
	"Payload": {
		"AccountType": "PayTo",
		"AccountName": "AppToken",
		"AccountNumber": "417529874",
		"BSB": "012204",
		"CardType": "PayTo",
		"PayToStatus": "Active",
		"StatusDescription": null
	}
}
```

### https://api.travelpay.com.au/v2/proxies/d214f7f84d2b4df8be074a3ddc021621 After approval

Resp:

```json
{
	"accountType": "PayTo",
	"accountName": "AppToken",
	"accountNumber": "417529874",
	"bsb": "012204",
	"payToStatus": "Active",
	"cardType": "PayTo",
	"uId": "6b26376a-ca87-4734-ab6b-10cfc8f1b3ca"
}
```


### https://api.travelpay.com.au/v2/payments After approval

Req:

```json
{
	"customerReference": "Test1",
	"paymentAmount": 0.1,
	"paymentAccountProxy": { "proxy": "d214f7f84d2b4df8be074a3ddc021621" }
}
```

Resp Status: 201

```json
{
    "paymentReference": "28530405",
    "customerReference": "Test1",
    "paymentStatus": "Successful",
    "baseAmount": 0.1,
    "fundsToMerchant": 0.1,
    "customerFee": 0.00,
    "merchantFee": 0.0,
    "paymentAmount": 0.10,
    "accountOrCardNo": "******874",
    "paymentAccount": "PayTo",
    "processingDate": "2025-10-08T01:40:46",
    "settlementDate": "2025-10-08T00:00:00",
    "processorReference": "28530405",
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

## Paused Mandate Stage:

Setting a mandate to `PAUSED` in banking app does not trigger webhooks.

### https://api.travelpay.com.au/v2/proxies/d214f7f84d2b4df8be074a3ddc021621 After pause

Resp:

```json
{
    "accountType": "PayTo",
    "accountName": "AppToken",
    "accountNumber": "417529874",
    "bsb": "012204",
    "payToStatus": "Active",
    "cardType": "PayTo",
    "uId": "6b26376a-ca87-4734-ab6b-10cfc8f1b3ca"
}
```

**NOTE THAT EVEN THOUGH MANDATE IS PAUSED, API STILL RETURNS ACTIVE**



### https://api.travelpay.com.au/v2/payments After **PAUSE**
**NOTE: Bug Discovered - Server does not handle **PAUSED** mandates and backend breaks with status code 500 - Regardless of what message is contained in the body, 500 is not the correct response here.**
Req:

```json
{"customerReference": "Test1","paymentAmount": 0.1,"paymentAccountProxy": {"proxy": "d214f7f84d2b4df8be074a3ddc021621"}}
```

**Resp Status: 500**

```json
{
    "message": "An error has occurred.",
    "exceptionMessage": "PayTo account is not valid. Mandate Status: Paused",
    "exceptionType": "System.InvalidOperationException",
    "stackTrace": "   at Payments.Services.Command.AbstractPayToPaymentCommand.Execute(IPaymentsDataContext context) in D:\\a\\9\\s\\Payments.Services\\Command\\AbstractPayToPaymentCommand.cs:line 159\r\n   at Payments.Services.Impl.PaymentService.Execute(ICommand command) in D:\\a\\9\\s\\Payments.Services\\Impl\\PaymentService.cs:line 188\r\n   at Payments.WebApi.Controllers.V2.PaymentsController.Post(PaymentRequest request) in D:\\a\\9\\s\\Payments.WebApi\\Controllers\\V2\\PaymentsController.cs:line 447"
}
```


500 Resp for cancelled
```json
{
    "message": "An error has occurred.",
    "exceptionMessage": "PayTo account is not valid. Mandate Status: Cancelled",
    "exceptionType": "System.InvalidOperationException",
    "stackTrace": "   at Payments.Services.Command.AbstractPayToPaymentCommand.Execute(IPaymentsDataContext context) in D:\\a\\9\\s\\Payments.Services\\Command\\AbstractPayToPaymentCommand.cs:line 159\r\n   at Payments.Services.Impl.PaymentService.Execute(ICommand command) in D:\\a\\9\\s\\Payments.Services\\Impl\\PaymentService.cs:line 188\r\n   at Payments.WebApi.Controllers.V2.PaymentsController.Post(PaymentRequest request) in D:\\a\\9\\s\\Payments.WebApi\\Controllers\\V2\\PaymentsController.cs:line 447"
}
```
