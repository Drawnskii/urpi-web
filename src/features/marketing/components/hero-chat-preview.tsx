import type { CSSProperties } from 'react'

import { MessageBubble, TypingDots, type Message } from '@/features/chats'

// A made-up chat: the id only reaches media links, and these messages are text
const PREVIEW_CHAT_ID = 'hero-preview'

const HERO_MESSAGES: Message[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    sender_type: 'CLIENT',
    sender_tenant_member_id: null,
    content: 'Hey there!',
    type: 'TEXT',
    payload: {},
    status: null,
    failure_reason: null,
    created_at: '2026-11-22T17:14:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    sender_type: 'AGENT',
    sender_tenant_member_id: null,
    content: 'Hey! How can I help you today?',
    type: 'TEXT',
    payload: {},
    status: 'READ',
    failure_reason: null,
    created_at: '2026-11-22T17:14:03Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    sender_type: 'CLIENT',
    sender_tenant_member_id: null,
    content: 'I would like to book a product demo for my team',
    type: 'TEXT',
    payload: {},
    status: null,
    failure_reason: null,
    created_at: '2026-11-22T17:14:10Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    sender_type: 'CLIENT',
    sender_tenant_member_id: null,
    content: 'Could we do tomorrow at 2 PM?',
    type: 'TEXT',
    payload: {},
    status: null,
    failure_reason: null,
    created_at: '2026-11-22T17:14:13Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    sender_type: 'AGENT',
    sender_tenant_member_id: null,
    content: "All set! You're booked for tomorrow at 2:00 PM. I'll message you right here before we start.",
    type: 'TEXT',
    payload: {},
    status: 'READ',
    failure_reason: null,
    created_at: '2026-11-22T17:14:19Z',
  },
]

export function HeroChatPreview() {
  return (
    <div
      style={
        {
          '--secondary': 'var(--primary)',
          '--secondary-foreground': 'var(--primary-foreground)',
          '--muted': 'oklch(1 0 0 / 0.04)',
          '--card': 'oklch(1 0 0 / 0.04)',
          '--read': 'oklch(0.9570 0.1280 126.3000)',
        } as CSSProperties
      }
      className="pointer-events-none mx-auto flex w-full max-w-md flex-col select-none lg:mr-0 lg:ml-auto [&_li_li>div:first-child]:border [&_li_li>div:first-child]:border-border/50"
    >
      <ol className="flex flex-col gap-3 pt-2">
        <li>
          <ol>
            <MessageBubble
              chatId={PREVIEW_CHAT_ID}
              message={HERO_MESSAGES[0]}
            />
          </ol>
        </li>

        <li>
          <ol>
            <MessageBubble
              chatId={PREVIEW_CHAT_ID}
              message={HERO_MESSAGES[1]}
              author="Urpi"
            />
          </ol>
        </li>

        <li>
          <ol>
            <MessageBubble
              chatId={PREVIEW_CHAT_ID}
              message={HERO_MESSAGES[2]}
            />
            <MessageBubble
              chatId={PREVIEW_CHAT_ID}
              message={HERO_MESSAGES[3]}
              isContinued
            />
          </ol>
        </li>
      </ol>

      <div className="mt-3 flex flex-col items-end gap-1">
        <span className="flex h-9 items-center rounded-xl rounded-br-sm bg-secondary px-4 text-secondary-foreground">
          <TypingDots />
        </span>
        <span className="px-1 text-caption text-muted-foreground">
          Urpi is responding
        </span>
      </div>

      <ol className="mt-3 flex flex-col gap-3 pb-2">
        <li>
          <ol>
            <MessageBubble
              chatId={PREVIEW_CHAT_ID}
              message={HERO_MESSAGES[4]}
              author="Urpi"
              reaction="❤️"
            />
          </ol>
        </li>
      </ol>
    </div>
  )
}