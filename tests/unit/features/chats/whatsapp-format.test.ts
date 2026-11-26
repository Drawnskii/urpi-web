import { describe, expect, it } from 'vitest'

import { parseWhatsApp, type Inline } from '@/features/chats/model/whatsapp-format'

const text = (value: string): Inline => ({ kind: 'text', text: value })

// One line's inline nodes: the paragraph it becomes
function parseInline(line: string): Inline[] {
  const [block] = parseWhatsApp(line)
  return block.kind === 'paragraph' ? block.content : []
}

describe('inline formatting', () => {
  it.each<[string, string, Inline[]]>([
    ['bold', '*Saturday* 9 to 1', [{ kind: 'bold', children: [text('Saturday')] }, text(' 9 to 1')]],
    ['italic', 'it is _ready_', [text('it is '), { kind: 'italic', children: [text('ready')] }]],
    ['strikethrough', '~$20~ $15', [{ kind: 'strike', children: [text('$20')] }, text(' $15')]],
    ['inline code', 'code `A-12`', [text('code '), { kind: 'code', text: 'A-12' }]],
    ['monospace in a line', 'id ```X 9```', [text('id '), { kind: 'code', text: 'X 9' }]],
    ['nested styles', '*_new_*', [{ kind: 'bold', children: [{ kind: 'italic', children: [text('new')] }] }]],
    ['punctuation around a marker', '(*yes*).', [text('('), { kind: 'bold', children: [text('yes')] }, text(').')]],
  ])('reads %s', (_, input, expected) => {
    expect(parseInline(input)).toEqual(expected)
  })

  it.each([
    ['a marker inside a word', '2*3*4'],
    ['snake_case', 'send_order_now'],
    ['a space after the opening marker', 'so * not bold*'],
    ['a space before the closing marker', '*not bold *'],
    ['a stray asterisk', 'price: 5* each'],
    ['doubled markers', '**not bold**'],
    ['a marker across lines', '*one\ntwo*'],
    ['an empty span', '**'],
  ])('leaves %s as written', (_, input) => {
    expect(parseInline(input)).toEqual([text(input)])
  })

  it('links a URL, without the sentence\'s dot', () => {
    expect(parseInline('see https://urpi.app/a_b_c.')).toEqual([
      text('see '),
      { kind: 'link', text: 'https://urpi.app/a_b_c', href: 'https://urpi.app/a_b_c' },
      text('.'),
    ])
  })

  it('links www. addresses over https', () => {
    expect(parseInline('www.urpi.app')).toEqual([{ kind: 'link', text: 'www.urpi.app', href: 'https://www.urpi.app' }])
  })

  it('links inside a style, and never lets a style cut a link', () => {
    expect(parseInline('*see https://urpi.app*')).toEqual([
      { kind: 'bold', children: [text('see '), { kind: 'link', text: 'https://urpi.app', href: 'https://urpi.app' }] },
    ])
    expect(parseInline('_go https://x.app/_a')).toEqual([
      text('_go '),
      { kind: 'link', text: 'https://x.app/_a', href: 'https://x.app/_a' },
    ])
  })

  it.each(['javascript:alert(1)', 'data:text/html,hi'])('never links %s', (input) => {
    expect(parseInline(input)).toEqual([text(input)])
  })
})

describe('parseWhatsApp', () => {
  it('keeps plain lines together as one paragraph', () => {
    expect(parseWhatsApp('Hi\nthere')).toEqual([{ kind: 'paragraph', content: [text('Hi\nthere')] }])
  })

  it('reads a quote, bullets with - or *, and a numbered list from its first number', () => {
    expect(parseWhatsApp('> said so\n- cake\n* bread\n3. one\n4. two\nThanks')).toEqual([
      { kind: 'quote', content: [text('said so')] },
      { kind: 'bullets', items: [[text('cake')], [text('bread')]] },
      { kind: 'numbered', start: 3, items: [[text('one')], [text('two')]] },
      { kind: 'paragraph', content: [text('Thanks')] },
    ])
  })

  it('formats inside list items', () => {
    expect(parseWhatsApp('- *Cake* $20')).toEqual([
      { kind: 'bullets', items: [[{ kind: 'bold', children: [text('Cake')] }, text(' $20')]] },
    ])
  })

  it('keeps a fenced block across lines as written, markers and all', () => {
    expect(parseWhatsApp('Code:\n```\n*a*\n- b\n```')).toEqual([
      { kind: 'paragraph', content: [text('Code:')] },
      { kind: 'monospace', text: '\n*a*\n- b\n' },
    ])
  })

  it('reads an unclosed fence as text', () => {
    expect(parseWhatsApp('```\nopen')).toEqual([{ kind: 'paragraph', content: [text('```\nopen')] }])
  })

  it('needs the space after a list marker', () => {
    expect(parseWhatsApp('-5 degrees\n1.5 kg')).toEqual([{ kind: 'paragraph', content: [text('-5 degrees\n1.5 kg')] }])
  })
})
