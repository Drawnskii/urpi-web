// Why a message of ours failed, as the member reads it, and what they can do about it. The reasons
// are the backend's (SendFailure); which ones may be sent again is its rule too
import type { Message, SendFailure } from './chat'

// retry: send the same text again. template: choose one and send it. The others lead to the page
// that fixes it
export type FailureAction = 'retry' | 'template' | 'payment' | 'number' | 'templates'

interface FailureNotice {
  reason: string
  action?: FailureAction
}

// REJECTED isn't here: its words carry Meta's code
const NOTICES: Record<Exclude<SendFailure, 'REJECTED'>, FailureNotice> = {
  OUTSIDE_WINDOW: {
    reason: 'Not delivered: this client last wrote over 24 hours ago. Only a template reaches them.',
    action: 'template',
  },
  PAYMENT_METHOD: { reason: "Not delivered: WhatsApp couldn't bill your business.", action: 'payment' },
  UNDELIVERABLE: {
    reason: "Not delivered: this number can't receive it. It may not be on WhatsApp, or needs to update it.",
  },
  MARKETING_STOPPED: { reason: 'Not delivered: this client stopped your marketing messages.' },
  MARKETING_LIMITED: {
    reason: 'Not delivered: WhatsApp limits how many marketing messages a person gets. Try another day.',
  },
  SPAM_LIMITED: {
    reason:
      'Not delivered: WhatsApp is limiting your number because messages were blocked or reported. Check its quality in WhatsApp Manager.',
  },
  TEMPLATE: { reason: 'Not delivered: WhatsApp refused this template.', action: 'templates' },
  NOT_CONNECTED: { reason: "Not delivered: WhatsApp isn't accepting your number's connection.", action: 'number' },
  NO_RECIPIENT: { reason: 'Not delivered: this client was deleted.' },
  RATE_LIMITED: { reason: 'Not sent: too many messages in a short time.', action: 'retry' },
  UNAVAILABLE: { reason: "Not sent: WhatsApp couldn't be reached.", action: 'retry' },
  OUTCOME_UNKNOWN: {
    reason: "WhatsApp didn't confirm this one, so it may have arrived. Ask the client before sending it again.",
  },
}

// undefined for a message that didn't fail. A reason this list doesn't name yet (a newer backend)
// reads as a plain refusal. Only a text is sent again as it is: a template is chosen afresh, which
// checks it may still go
export function failureNotice({
  type,
  failure_reason,
  failure_code,
}: Pick<Message, 'type' | 'failure_reason' | 'failure_code'>): FailureNotice | undefined {
  if (failure_reason === null) return undefined
  if (failure_reason === 'REJECTED' || !(failure_reason in NOTICES)) {
    const code = failure_code === null ? '' : ` (error ${failure_code})`
    return { reason: `Not delivered: WhatsApp refused it${code}.` }
  }
  const notice = NOTICES[failure_reason]
  return notice.action === 'retry' && type !== 'TEXT' ? { ...notice, action: 'template' } : notice
}
