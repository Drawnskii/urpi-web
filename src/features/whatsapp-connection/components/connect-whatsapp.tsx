import { useQuery } from '@tanstack/react-query'

import { isApiError } from '@/shared/api'
import { Button } from '@/shared/components/ui/button'

import { useFinishWhatsAppConnection } from '../api/whatsapp-connection-mutations'
import { whatsAppConnectionQueries } from '../api/whatsapp-connection-queries'
import { useEmbeddedSignup, type SignupInterruption } from '../hooks/use-embedded-signup'

// Payment methods have no API: the business adds one in WhatsApp Manager (roadmap T8)
const WHATSAPP_MANAGER_URL = 'https://business.facebook.com/wa/manage/home/'

function interruptionText(interruption: SignupInterruption) {
  if (interruption.kind === 'incomplete') {
    return 'Signup finished without a phone number. Start again and pick or add one.'
  }
  return interruption.step
    ? `Signup was closed at "${interruption.step}". Start again whenever you're ready.`
    : "Signup was closed. Start again whenever you're ready."
}

export function ConnectWhatsApp() {
  const signup = useEmbeddedSignup()
  const finish = useFinishWhatsAppConnection()
  // The tenant's number, from the backend; connect and retry write their result here too.
  // If it can't be read, connecting stays possible: the backend still refuses a second number (409)
  const current = useQuery(whatsAppConnectionQueries.detail())
  const connection = current.data

  // The latest attempt: a retry, once there is one, replaces the popup's result
  const attempt = finish.isIdle ? signup.connection : finish
  const error = attempt.error
  const isBusy = signup.isInPopup || attempt.isPending
  const isConnected = connection?.status === 'ACTIVE'
  // CONNECTING: the number is saved and Meta's setup is unfinished: retry it, don't start over
  const isConnecting = connection?.status === 'CONNECTING'

  if (!signup.isConfigured) {
    return (
      <p role="alert">
        Embedded Signup isn't configured. Set VITE_WHATSAPP_APP_ID and VITE_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID in
        .env (the backend's Meta app and its Embedded Signup configuration).
      </p>
    )
  }

  const label = current.isPending
    ? 'Checking…'
    : isConnected
      ? 'WhatsApp connected'
      : signup.isInPopup
        ? 'Waiting for Meta…'
        : attempt.isPending
          ? 'Connecting…'
          : 'Connect WhatsApp'

  // Meta failed a step after the number was saved: a retry finishes it, no new popup
  const canRetry = isConnecting || (isApiError(error) && error.isBadGateway)

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        onClick={signup.start}
        disabled={current.isPending || isConnected || isConnecting || !signup.isReady || isBusy}
      >
        {label}
      </Button>

      {isConnected ? (
        <>
          <p>Connected: {connection.phone_number}</p>
          <p>
            To send templates or write after 24 hours, add a payment method in{' '}
            <a href={WHATSAPP_MANAGER_URL} target="_blank" rel="noreferrer">
              WhatsApp Manager
            </a>
            .
          </p>
        </>
      ) : (
        <>
          {!signup.isReady && !signup.sdkError && <p>Loading Meta's signup…</p>}
          {signup.sdkError && <p role="alert">{signup.sdkError}</p>}
          {signup.interruption && <p>{interruptionText(signup.interruption)}</p>}
          {isConnecting && <p>Your number {connection.phone_number} is saved, but Meta hasn't finished setting it up.</p>}
          {error && <p role="alert">{error.message}</p>}
        </>
      )}

      {canRetry && !isConnected && (
        <Button type="button" variant="outline" onClick={() => finish.mutate()} disabled={isBusy}>
          Retry
        </Button>
      )}
    </div>
  )
}
