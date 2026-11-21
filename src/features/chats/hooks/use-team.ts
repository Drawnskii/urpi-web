import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { tenantQueries, useCurrentTenant } from '@/features/tenants'

import type { Team } from '../model/message-author'

// Who "You" is and every teammate's name, to say who wrote each reply and who is writing one.
// The chats route loads the team with the list, so this never waits
export function useTeam(): Team {
  const myMemberId = useCurrentTenant()?.member_id ?? null
  const { data: members } = useSuspenseQuery(tenantQueries.members())
  return useMemo(
    () => ({ myMemberId, members: new Map(members.map((member) => [member.member_id, member])) }),
    [myMemberId, members],
  )
}
