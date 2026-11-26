// WhatsApp's own markup, as the phone shows it (WhatsApp's help center, "How to format your
// messages"): never Markdown, which has syntax WhatsApp doesn't. A pure parse into a tree, so React
// renders it as text (no HTML string, no injection)

export type Inline =
  | { kind: 'text'; text: string }
  | { kind: 'link'; text: string; href: string }
  | { kind: 'code'; text: string }
  | { kind: 'bold' | 'italic' | 'strike'; children: Inline[] }

export type Block =
  | { kind: 'paragraph'; content: Inline[] }
  | { kind: 'quote'; content: Inline[] }
  | { kind: 'bullets'; items: Inline[][] }
  | { kind: 'numbered'; start: number; items: Inline[][] }
  | { kind: 'monospace'; text: string }

const STYLES = { '*': 'bold', _: 'italic', '~': 'strike' } as const

// A marker counts only at a word's edge, as on the phone: "2*3*4" and snake_case stay as written.
// The text inside starts and ends with a non-space that isn't the marker, on one line
function spanPattern(marker: keyof typeof STYLES): RegExp {
  const m = marker === '*' ? '\\*' : marker // the u flag refuses \_ and \~
  return new RegExp(`(?<![\\p{L}\\p{N}${m}])${m}(?![\\s${m}])([^\\n]*?[^\\s${m}])${m}(?![\\p{L}\\p{N}${m}])`, 'gu')
}

const LINK = /\b(?:https?:\/\/|www\.)[^\s<>]+/giu

// What ends a link but is the sentence's: "see https://urpi.app." links without the dot
const LINK_TRAILING = /[.,;:!?)\]'"»”*_~]+$/u

// Every marked token: its marker, then its own pattern; the earliest match in the text wins. The
// patterns are shared (global, so their lastIndex moves): set lastIndex before each use
const MARKED = [
  ['monospace', '`', /```([^\n]+?)```/gu], // inside a line; a fenced block across lines is a Block
  ['code', '`', /(?<![\p{L}\p{N}`])`([^`\n]+)`(?![\p{L}\p{N}`])/gu],
  ['*', '*', spanPattern('*')],
  ['_', '_', spanPattern('_')],
  ['~', '~', spanPattern('~')],
] as const

type Marked = (typeof MARKED)[number]
type Token = 'link' | Marked[0]

interface Found {
  token: Token
  index: number
  length: number
  inner: string // what's between the markers; a link's own text
}

const QUOTE = /^> ?(.*)$/u
const BULLET = /^[*-] (.*)$/u
const NUMBERED = /^(\d{1,3})\. (.*)$/u
const FENCE = '```'

export function parseWhatsApp(text: string): Block[] {
  const blocks: Block[] = []
  const lines = text.split('\n')
  let paragraph: string[] = []
  let quote: string[] = []

  // Consecutive plain lines are one paragraph, consecutive quoted lines one quote
  function flush() {
    if (paragraph.length > 0) blocks.push({ kind: 'paragraph', content: parseInline(paragraph.join('\n')) })
    if (quote.length > 0) blocks.push({ kind: 'quote', content: parseInline(quote.join('\n')) })
    paragraph = []
    quote = []
  }

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    const closing = fenceEnd(lines, index)
    if (closing !== -1) {
      flush()
      const fenced = lines.slice(index, closing + 1).join('\n')
      blocks.push({ kind: 'monospace', text: fenced.slice(FENCE.length, -FENCE.length) })
      index = closing
      continue
    }

    const quoted = QUOTE.exec(line)
    const bullet = BULLET.exec(line)
    const numbered = NUMBERED.exec(line)
    if (quoted) {
      if (paragraph.length > 0) flush()
      quote.push(quoted[1])
    } else if (bullet) {
      flush()
      addItem(blocks, parseInline(bullet[1]), null)
    } else if (numbered) {
      flush()
      addItem(blocks, parseInline(numbered[2]), Number(numbered[1]))
    } else {
      if (quote.length > 0) flush()
      paragraph.push(line)
    }
  }
  flush()
  return blocks
}

// The line that closes a fenced block opened on this line, across lines; -1 when it isn't one (a
// ```word``` inside one line is inline)
function fenceEnd(lines: string[], index: number): number {
  const line = lines[index]
  if (!line.startsWith(FENCE) || line.slice(FENCE.length).includes(FENCE)) return -1
  return lines.findIndex((other, at) => at > index && other.endsWith(FENCE))
}

// The item joins the list right above it when that list is of its kind; otherwise it starts one
function addItem(blocks: Block[], item: Inline[], number: number | null) {
  const last = blocks.at(-1)
  if (number === null) {
    if (last?.kind === 'bullets') last.items.push(item)
    else blocks.push({ kind: 'bullets', items: [item] })
  } else if (last?.kind === 'numbered') {
    last.items.push(item)
  } else {
    blocks.push({ kind: 'numbered', start: number, items: [item] })
  }
}

function parseInline(text: string): Inline[] {
  const links = findLinks(text)
  const marked = MARKED.filter(([, marker]) => text.includes(marker)) // most text has no markers: no scans
  const nodes: Inline[] = []
  let position = 0

  for (let next = nextToken(text, position, links, marked); next; next = nextToken(text, position, links, marked)) {
    if (next.index > position) nodes.push({ kind: 'text', text: text.slice(position, next.index) })
    nodes.push(toInline(next.token, text.slice(next.index, next.index + next.length), next.inner))
    position = next.index + next.length
  }
  if (position < text.length) nodes.push({ kind: 'text', text: text.slice(position) })
  return nodes
}

function findLinks(text: string): Found[] {
  return Array.from(text.matchAll(LINK), (match) => {
    const link = match[0].replace(LINK_TRAILING, '')
    return { token: 'link' as const, index: match.index, length: link.length, inner: link }
  })
}

// The earliest token from position; a link wins a tie, and a style never cuts a link in two
function nextToken(text: string, position: number, links: Found[], marked: Marked[]): Found | null {
  let best = links.find((link) => link.index >= position) ?? null
  for (const [token, , pattern] of marked) {
    pattern.lastIndex = position
    for (let match = pattern.exec(text); match && (!best || match.index < best.index); match = pattern.exec(text)) {
      const found = { token, index: match.index, length: match[0].length, inner: match[1] }
      if (!cutsLink(found, links)) {
        best = found
        break
      }
      pattern.lastIndex = match.index + 1 // a later marker may still open a span that fits
    }
  }
  return best
}

function cutsLink(found: Found, links: Found[]): boolean {
  const end = found.index + found.length
  return links.some((link) => {
    const linkEnd = link.index + link.length
    return (link.index < found.index && found.index < linkEnd) || (link.index < end && end < linkEnd)
  })
}

function toInline(token: Token, text: string, inner: string): Inline {
  switch (token) {
    case 'link':
      return { kind: 'link', text, href: text.startsWith('www.') ? `https://${text}` : text }
    case 'monospace':
    case 'code':
      return { kind: 'code', text: inner }
    default:
      return { kind: STYLES[token], children: parseInline(inner) }
  }
}
