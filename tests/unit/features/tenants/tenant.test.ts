import { describe, expect, it } from 'vitest'

import { isOwner, roleLabel, tenantInitial, type UserTenant } from '@/features/tenants/model/tenant'

const pizza: UserTenant = { tenant_id: 'tenant-1', name: '  panadería Lupita', member_id: 'member-1', role: 'MEMBER' }

describe('tenant labels', () => {
  it('says the role in words', () => {
    expect(roleLabel('OWNER')).toBe('Owner')
    expect(roleLabel('MEMBER')).toBe('Member')
  })

  it('stands in for a logo with the name’s first letter, uppercase', () => {
    expect(tenantInitial(pizza)).toBe('P')
  })

  it('knows the owner, and nobody without a business is one', () => {
    expect(isOwner({ ...pizza, role: 'OWNER' })).toBe(true)
    expect(isOwner(pizza)).toBe(false)
    expect(isOwner(null)).toBe(false)
  })
})
