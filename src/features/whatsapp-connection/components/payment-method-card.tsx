import { useQuery } from '@tanstack/react-query'
import { CircleCheckIcon, LoaderCircleIcon } from 'lucide-react'
import { useId } from 'react'

import { Button } from '@/shared/components/ui/button'
import { formatDateTime } from '@/shared/lib'

import { useCheckPaymentMethod } from '../api/whatsapp-connection-mutations'
import { whatsAppConnectionQueries } from '../api/whatsapp-connection-queries'

// Payment methods have no API: the business adds one in WhatsApp Manager
const WHATSAPP_MANAGER_URL = 'https://business.facebook.com/wa/manage/home/'

// Shown wherever what Meta bills is at hand: why it needs a payment method, where to add one, and
// a check once it's added, which says what it found. Nothing without a connected number, or with a
// payment method nobody just checked for here
export function PaymentMethodCard() {
  const { data: connection } = useQuery(whatsAppConnectionQueries.detail())
  const check = useCheckPaymentMethod()
  const titleId = useId()

  if (connection?.status !== 'ACTIVE') return null
  const isReady = connection.payment_method_ready
  if (isReady && check.isIdle) return null
  // While this check runs, the live stream can say it first: the card waits for the answer
  if (isReady && !check.isPending) {
    return (
      <output className="flex w-full items-center gap-2 rounded-xl border bg-card p-4 text-body-sm">
        <CircleCheckIcon aria-hidden="true" className="size-5 shrink-0 text-primary" />
        Payment method confirmed.{connection.templates_enabled && ' You can send templates now.'}
      </output>
    )
  }

  const checkedAt = connection.payment_method_checked_at

  return (
    <section aria-labelledby={titleId} className="flex w-full flex-col items-start gap-2 rounded-xl border bg-card p-4">
      <h2 id={titleId} className="text-body font-medium">
        Add a payment method at Meta
      </h2>
      <p className="text-body-sm text-muted-foreground">
        WhatsApp bills your business directly for templates, and for other messages after the free 1,000 a month. The
        price depends on the message's category and your client's country. Without a payment method, templates can't be
        sent. In WhatsApp Manager's Overview, press “Add payment method”, then check again here.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <a href={WHATSAPP_MANAGER_URL} target="_blank" rel="noreferrer">
            Open WhatsApp Manager
          </a>
        </Button>
        <Button type="button" variant="outline" onClick={() => check.mutate()} disabled={check.isPending}>
          {check.isPending && <LoaderCircleIcon data-icon="inline-start" aria-hidden="true" className="animate-spin" />}
          {check.isPending ? 'Checking…' : 'Check again'}
        </Button>
      </div>
      {/* What this check answered, not the card's state: a refused send can bring the card back later */}
      {check.data?.payment_method_ready === false ? (
        <output className="text-body-sm">
          Meta shows no payment method yet. If you just added it, check again in a few minutes.
        </output>
      ) : (
        checkedAt && (
          <small className="text-muted-foreground">
            None found when last checked, <time dateTime={checkedAt}>{formatDateTime(checkedAt)}</time>
          </small>
        )
      )}
      {check.error && (
        <p role="alert" className="text-body-sm text-destructive">
          Couldn't check: {check.error.message}
        </p>
      )}
    </section>
  )
}
