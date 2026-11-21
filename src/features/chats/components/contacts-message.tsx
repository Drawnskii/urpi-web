import { UserIcon } from 'lucide-react'

import type { MessageOf } from '../model/chat'

interface ContactsMessageProps {
  message: MessageOf<'CONTACTS'>
}

// Contact cards the client shared: each name with its phones, which call when tapped
export function ContactsMessage({ message }: ContactsMessageProps) {
  return (
    <ul className="flex min-w-0 flex-col gap-2">
      {message.payload.contacts.map((contact, index) => (
        // Contacts have no id and never reorder: the index is stable
        <li key={index} className="flex min-w-0 items-start gap-2">
          <UserIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 opacity-70" />
          <div className="flex min-w-0 flex-col">
            <span className="text-body-sm font-medium wrap-anywhere">{contact.name}</span>
            {contact.phones.map((phone) => (
              <a key={phone.phone} href={`tel:${phone.phone.replace(/[^\d+]/g, '')}`} className="text-body-sm underline underline-offset-2">
                {phone.phone}
              </a>
            ))}
          </div>
        </li>
      ))}
    </ul>
  )
}
