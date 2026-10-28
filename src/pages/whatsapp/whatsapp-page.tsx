import { ConnectWhatsApp } from '@/features/whatsapp-connection'

export function WhatsAppPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start gap-3 p-6">
      <h2>WhatsApp number</h2>
      <p>Connect your business's WhatsApp number through Meta.</p>
      <ConnectWhatsApp />
    </div>
  )
}
