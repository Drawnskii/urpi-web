import { useCallback, useState, type RefCallback } from 'react'

// How near the screen a bubble is when it counts as in view: its file starts loading a little early
const ROOT_MARGIN = '300px'

// One observer for every bubble: each element's callback is called once, then it's no longer watched
const onEnter = new WeakMap<Element, () => void>()
let observer: IntersectionObserver | undefined

function sharedObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) onEnter.get(entry.target)?.()
    },
    { rootMargin: ROOT_MARGIN },
  )
  return observer
}

// True once the element comes near the viewport, and true from then on. A ref callback, so it
// follows an element that mounts late; React runs its cleanup when the element goes
export function useInView<T extends Element>(): [RefCallback<T>, boolean] {
  const [inView, setInView] = useState(false)

  const ref = useCallback((element: T | null) => {
    if (!element) return
    const io = sharedObserver()
    const stop = () => {
      io.unobserve(element)
      onEnter.delete(element)
    }
    onEnter.set(element, () => {
      stop()
      setInView(true)
    })
    io.observe(element)
    return stop
  }, [])

  return [ref, inView]
}
