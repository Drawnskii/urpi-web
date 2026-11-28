import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'

// Long enough to move the pointer from the trigger into the content without it closing
const CLOSE_DELAY_MS = 150

// A Popover that opens when a mouse is over its trigger, and on a click (touch screens, keyboard).
// Spread root on Popover, trigger on its button and content on PopoverContent
export function useHoverPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const closeTimer = useRef<number | undefined>(undefined)
  const isHovering = useRef(false) // opened by the mouse alone: focus stays where the user had it

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  // Touch screens skip both: a tap enters and leaves around its click, which would undo it
  const pointer = {
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      window.clearTimeout(closeTimer.current)
      if (!isOpen) isHovering.current = true
      setIsOpen(true)
    },
    onPointerLeave: (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      window.clearTimeout(closeTimer.current)
      closeTimer.current = window.setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS)
    },
  }
  const keepFocus = (event: Event) => {
    if (isHovering.current) event.preventDefault()
  }

  return {
    root: { open: isOpen, onOpenChange: setIsOpen },
    trigger: {
      ...pointer,
      // Instead of Radix's toggle: a click on one the mouse just opened keeps it
      onClick: (event: MouseEvent) => {
        event.preventDefault()
        const wasHovering = isHovering.current
        isHovering.current = false
        setIsOpen((current) => wasHovering || !current)
      },
    },
    content: { ...pointer, onOpenAutoFocus: keepFocus, onCloseAutoFocus: keepFocus },
    close: () => setIsOpen(false),
  }
}
