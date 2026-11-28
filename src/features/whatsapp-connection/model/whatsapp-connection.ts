// Mirrors app/modules/tenant/api/schemas.py

// The tenant's number, and whether it can send templates. No token, no PIN
export interface WhatsAppConnection {
  account_id: string
  waba_id: string
  phone_number_id: string
  phone_number: string           // E.164
  status: 'CONNECTING' | 'ACTIVE' // CONNECTING: a retry is still needed
  payment_method_ready: boolean  // Meta shows a payment method on the account, as last seen
  payment_method_checked_at: string | null // null: never checked
  templates_enabled: boolean     // follows the payment method unless Urpi's staff set it
}

// Mirrors WhatsAppConnectionStateOut: the data of whatsapp_connection.updated (GET /events).
// The number now; null where GET /whatsapp/connections answers 404
export interface WhatsAppConnectionEvent {
  connection: WhatsAppConnection | null
}

// Mirrors ConnectWhatsAppIn: what Embedded Signup gave the browser. The tenant goes in the headers
export interface ConnectWhatsAppAccountInput {
  code: string // FB.login's authResponse.code: single use, valid about 30 s
  waba_id: string
  phone_number_id: string
  business_id: string
}
