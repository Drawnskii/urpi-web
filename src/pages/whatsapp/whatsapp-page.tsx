import { ConnectWhatsApp } from '@/features/whatsapp-connection'

export function WhatsAppPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start gap-3 p-6">
      <h1>WhatsApp number</h1>
      <p className="text-muted-foreground">Connect your business's WhatsApp number through Meta.</p>
      <ConnectWhatsApp />
    </div>
  )
}
