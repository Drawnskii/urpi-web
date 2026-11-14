import type { UserTenant } from './tenant'

// The business to work in: the remembered one while the user is still a member of it, else the
// first (the backend lists them oldest first), else none (the user has no business yet).
// The remembered id is a preference, not a permission: membership can end, and the backend
// would answer 404 for a business the user left
export function chooseTenant(tenants: UserTenant[], rememberedId: string | null): UserTenant | null {
  return tenants.find((tenant) => tenant.tenant_id === rememberedId) ?? tenants[0] ?? null
}
