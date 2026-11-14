import { describe, expect, it } from 'vitest'

import { chooseTenant } from '@/features/tenants/model/choose-tenant'
import type { UserTenant } from '@/features/tenants/model/tenant'

function tenant(id: string): UserTenant {
  return { tenant_id: id, name: `Business ${id}`, member_id: `member-${id}`, role: 'OWNER' }
}

const older = tenant('older')
const newer = tenant('newer')

describe('chooseTenant', () => {
  it('keeps the remembered business while the user is still a member', () => {
    expect(chooseTenant([older, newer], 'newer')).toBe(newer)
  })

  it('falls back to the first (the oldest) when the remembered one is gone', () => {
    expect(chooseTenant([older, newer], 'left-it')).toBe(older)
  })

  it('picks the first when nothing is remembered', () => {
    expect(chooseTenant([older, newer], null)).toBe(older)
  })

  it('is null when the user has no business yet', () => {
    expect(chooseTenant([], 'newer')).toBeNull()
  })
})
