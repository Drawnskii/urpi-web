// Mirrors app/modules/tenant/api/schemas.py

// The tenant's number after connecting or retrying. No token, no PIN
export interface WhatsAppConnection {
  account_id: string
  waba_id: string
  phone_number_id: string
  phone_number: string           // E.164
  status: 'CONNECTING' | 'ACTIVE' // CONNECTING: a retry is still needed
}

// Mirrors ConnectWhatsAppIn: what Embedded Signup gave the browser. The tenant goes in the headers
export interface ConnectWhatsAppAccountInput {
  code: string // FB.login's authResponse.code: single use, valid about 30 s
  waba_id: string
  phone_number_id: string
  business_id: string
}
