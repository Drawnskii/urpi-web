// Just enough of EventSource: listeners by event name, readyState and onerror
export class FakeEventSource {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSED = 2
  static last: FakeEventSource

  readyState = FakeEventSource.CONNECTING
  onerror: (() => void) | null = null
  private listeners = new Map<string, ((event: { data: string }) => void)[]>()

  constructor() {
    FakeEventSource.last = this
  }

  addEventListener(name: string, listener: (event: { data: string }) => void) {
    this.listeners.set(name, [...(this.listeners.get(name) ?? []), listener])
  }

  close() {
    this.readyState = FakeEventSource.CLOSED
  }

  emit(name: string, data: unknown = {}) {
    for (const listener of this.listeners.get(name) ?? []) listener({ data: JSON.stringify(data) })
  }

  fail(readyState: number) {
    this.readyState = readyState
    this.onerror?.()
  }
}
