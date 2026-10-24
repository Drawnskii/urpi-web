export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? '/api',
  tenantId: import.meta.env.VITE_TENANT_ID,
  tenantMemberId: import.meta.env.VITE_TENANT_MEMBER_ID,
  // Public, as Meta's SDK needs them in the browser: the app and its Embedded Signup configuration
  whatsappAppId: import.meta.env.VITE_WHATSAPP_APP_ID,
  whatsappEmbeddedSignupConfigId: import.meta.env.VITE_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID,
  whatsappGraphApiVersion: import.meta.env.VITE_WHATSAPP_GRAPH_API_VERSION ?? 'v25.0',
} as const
