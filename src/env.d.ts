/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_TENANT_ID?: string
  readonly VITE_TENANT_MEMBER_ID?: string
  readonly VITE_WHATSAPP_APP_ID?: string
  readonly VITE_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID?: string
  readonly VITE_WHATSAPP_GRAPH_API_VERSION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
