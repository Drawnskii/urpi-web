// Meta's JavaScript SDK, loaded once on demand. Only what Embedded Signup uses is typed

interface FacebookLoginResponse {
  authResponse?: { code?: string } | null // null: the popup was closed without finishing
}

interface FacebookLoginOptions {
  config_id: string
  response_type: 'code'
  override_default_response_type: true
  extras: Record<string, unknown>
}

export interface FacebookSdk {
  init(options: { appId: string; autoLogAppEvents: boolean; xfbml: boolean; version: string }): void
  login(callback: (response: FacebookLoginResponse) => void, options: FacebookLoginOptions): void
}

declare global {
  interface Window {
    FB?: FacebookSdk
    fbAsyncInit?: () => void
  }
}

const SDK_URL = 'https://connect.facebook.net/en_US/sdk.js'

let loading: Promise<FacebookSdk> | undefined

// Resolves once FB.init ran. A failed load (blocked, offline) can be tried again
export function loadFacebookSdk(options: { appId: string; version: string }) {
  loading ??= new Promise<FacebookSdk>((resolve, reject) => {
    window.fbAsyncInit = () => {
      const sdk = window.FB
      if (!sdk) return reject(new Error("Facebook's SDK didn't start"))
      sdk.init({ appId: options.appId, autoLogAppEvents: true, xfbml: false, version: options.version })
      resolve(sdk)
    }
    const script = document.createElement('script')
    script.src = SDK_URL
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    script.onerror = () => {
      script.remove()
      loading = undefined
      reject(new Error("Couldn't load Facebook's SDK (blocked by the browser or offline)"))
    }
    document.head.append(script)
  })
  return loading
}

// Opens the Embedded Signup popup. Call it straight from a click: browsers block popups opened later
export function openEmbeddedSignup(sdk: FacebookSdk, configId: string, onCode: (code: string | null) => void) {
  sdk.login((response) => onCode(response.authResponse?.code ?? null), {
    config_id: configId,
    response_type: 'code',
    override_default_response_type: true,
    extras: { setup: {} },
  })
}
