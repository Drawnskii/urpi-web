import { FileTextIcon } from 'lucide-react'
import { useState, type ComponentProps, type ReactNode } from 'react'

import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'

import { TemplatePicker } from './template-picker'

interface SendTemplateDialogProps extends ComponentProps<typeof Button> {
  chatId: string
  label: string
}

// The button that sends a template (outside the service window, only a template reaches the
// client) and its dialog. The button is the icon alone on phones: the row's room goes to the chats
// picker
export function SendTemplateDialog({ chatId, label, children, ...props }: SendTemplateDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <TemplateDialog chatId={chatId} open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" aria-label={label} {...props}>
          <FileTextIcon data-icon="inline-start" aria-hidden="true" />
          <span className="hidden sm:inline">{label}</span>
          {children}
        </Button>
      </DialogTrigger>
    </TemplateDialog>
  )
}

interface TemplateDialogProps {
  chatId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCloseAutoFocus?: (event: Event) => void // opened without a DialogTrigger: where focus goes back
  children?: ReactNode // the DialogTrigger, if it has one
}

// The dialog alone, for whatever opens it. Its content exists only while it's open, so each opening
// starts afresh
export function TemplateDialog({ chatId, onCloseAutoFocus, children, ...dialog }: TemplateDialogProps) {
  return (
    <Dialog {...dialog}>
      {children}
      <DialogContent className="max-h-[85dvh] grid-cols-1 overflow-y-auto sm:max-w-md" onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader>
          <DialogTitle>Send a template</DialogTitle>
          <DialogDescription>
            WhatsApp bills your business for each delivered template, and marketing ones cost more. Sending one doesn't
            reopen the 24-hour window: the client's answer does.
          </DialogDescription>
        </DialogHeader>
        <TemplatePicker chatId={chatId} onSent={() => dialog.onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
