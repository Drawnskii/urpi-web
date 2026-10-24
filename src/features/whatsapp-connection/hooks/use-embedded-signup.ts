import { useCallback, useEffect, useRef, useState } from 'react'

import { env } from '@/shared/config'

import { loadFacebookSdk, openEmbeddedSignup, type FacebookSdk } from '../api/facebook-sdk'
import { useConnectWhatsAppAccount } from '../api/whatsapp-connection-mutations'
import { parseEmbeddedSignupMessage, type EmbeddedSignupIds, type EmbeddedSignupMessage } from '../model/embedded-signup'

const PLACEHOLDER = 'change-me' // .env.example's value until the Meta app is set up

const appId = env.whatsappAppId
const configId = env.whatsappEmbeddedSignupConfigId
const isConfigured = Boolean(appId && configId && appId !== PLACEHOLDER && configId !== PLACEHOLDER)

// Why the last popup ended without connecting
export type SignupInterruption = Exclude<EmbeddedSignupMessage, { kind: 'finished' }>

// Runs Embedded Signup: loads Meta's SDK ahead of the click (FB.login must run inside the click,
// or the browser blocks the popup), then waits for its two results, in any order: the code
// (FB.login's callback) and the ids (a postMessage). With both, it POSTs at once: the code lives 30 s
export function useEmbeddedSignup() {
  const connection = useConnectWhatsAppAccount()
  const { mutate: connect, reset: resetConnection } = connection
  const [sdk, setSdk] = useState<FacebookSdk | null>(null)
  const [sdkError, setSdkError] = useState<string | null>(null)
  const [isInPopup, setIsInPopup] = useState(false)
  const [interruption, setInterruption] = useState<SignupInterruption | null>(null)

  // This popup's results so far, and whether one is open (messages outside a popup are ignored)
  const pending = useRef<{ code?: string; ids?: EmbeddedSignupIds }>({})
  const isListening = useRef(false)

  useEffect(() => {
    if (!isConfigured || !appId) return
    let isMounted = true
    loadFacebookSdk({ appId, version: env.whatsappGraphApiVersion }).then(
      (loaded) => isMounted && setSdk(loaded),
      (error: Error) => isMounted && setSdkError(error.message),
    )
    return () => {
      isMounted = false
    }
  }, [])

  const end = useCallback(() => {
    isListening.current = false
    pending.current = {}
    setIsInPopup(false)
  }, [])

  const connectWhenComplete = useCallback(() => {
    const { code, ids } = pending.current
    if (!code || !ids) return
    end()
    connect({ code, ...ids })
  }, [connect, end])

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!isListening.current) return
      const message = parseEmbeddedSignupMessage(event.origin, event.data)
      if (!message) return
      if (message.kind === 'finished') {
        pending.current.ids = message.ids
        connectWhenComplete()
        return
      }
      end()
      setInterruption(message)
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [connectWhenComplete, end])

  const start = useCallback(() => {
    if (!sdk || !configId) return
    resetConnection()
    setInterruption(null)
    pending.current = {}
    isListening.current = true
    setIsInPopup(true)
    openEmbeddedSignup(sdk, configId, (code) => {
      if (!isListening.current) return
      // No code: the popup was closed without finishing (a CANCEL message may say where)
      if (!code) return end()
      pending.current.code = code
      connectWhenComplete()
    })
  }, [sdk, resetConnection, end, connectWhenComplete])

  return {
    isConfigured,
    isReady: sdk !== null,
    sdkError,
    isInPopup,
    interruption,
    start,
    connection,
  }
}
