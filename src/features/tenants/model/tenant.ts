// Mirrors app/modules/tenant/api/schemas.py. The user's word for a tenant is "business": say that in the UI

// What a member may do in a business. Only the OWNER disconnects the WhatsApp number (403 otherwise)
export type TenantMemberRole = 'OWNER' | 'MEMBER'

// Mirrors UserTenantOut: one of the signed-in user's businesses, for the picker.
// member_id is informative: the backend takes the member from the session, never from the browser
export interface UserTenant {
  tenant_id: string
  name: string
  member_id: string
  role: TenantMemberRole
}

// Mirrors AddTenantIn. The owner comes from the session, never the body
export interface AddTenantInput {
  name: string
  timezone: string // IANA name, the browser's own: Intl.DateTimeFormat().resolvedOptions().timeZone
}

// Limits copied from the backend (TENANT_NAME_MAX_LENGTH), for client-side checks
export const TENANT_NAME_MAX_LENGTH = 255

export function isOwner(tenant: UserTenant | null) {
  return tenant?.role === 'OWNER'
}

const ROLE_LABELS: Record<TenantMemberRole, string> = { OWNER: 'Owner', MEMBER: 'Member' }

export function roleLabel(role: TenantMemberRole) {
  return ROLE_LABELS[role]
}

// One letter standing in for the business's logo (businesses have none yet)
export function tenantInitial(tenant: UserTenant) {
  return tenant.name.trim().charAt(0).toUpperCase()
}
