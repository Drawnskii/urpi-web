export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? '/api',
  tenantId: import.meta.env.VITE_TENANT_ID,
  tenantMemberId: import.meta.env.VITE_TENANT_MEMBER_ID,
} as const
