import { useMemo } from 'react'

import { cn } from '@/shared/lib/utils'

import { parseWhatsApp, type Block, type Inline } from '../model/whatsapp-format'

interface FormattedTextProps {
  text: string
  className?: string
}

// A message's text with WhatsApp's formatting, as the phone shows it. wrap-anywhere: a long word or
// link with no spaces wraps inside the bubble instead of widening it past 75%. Parsed once per text:
// the list renders every bubble again on each new message
export function FormattedText({ text, className }: FormattedTextProps) {
  const blocks = useMemo(() => parseWhatsApp(text), [text])

  return (
    <div className={cn('flex flex-col gap-1 text-body-sm wrap-anywhere', className)}>
      {blocks.map((block, index) => (
        <BlockNode key={index} block={block} />
      ))}
    </div>
  )
}

function BlockNode({ block }: { block: Block }) {
  switch (block.kind) {
    case 'paragraph':
      return <p className="whitespace-pre-wrap">{inlineNodes(block.content)}</p>
    case 'quote':
      return (
        <blockquote className="border-l-2 border-current/40 pl-2 whitespace-pre-wrap opacity-80">
          {inlineNodes(block.content)}
        </blockquote>
      )
    case 'bullets':
      return <ul className="list-disc pl-5">{listItems(block.items)}</ul>
    case 'numbered':
      return (
        <ol start={block.start} className="list-decimal pl-5">
          {listItems(block.items)}
        </ol>
      )
    case 'monospace':
      return <pre className="font-mono whitespace-pre-wrap">{block.text}</pre>
  }
}

function listItems(items: Inline[][]) {
  return items.map((item, index) => <li key={index}>{inlineNodes(item)}</li>)
}

// Keys by position: a message's text never changes once shown
function inlineNodes(nodes: Inline[]) {
  return nodes.map((node, index) => <InlineNode key={index} node={node} />)
}

function InlineNode({ node }: { node: Inline }) {
  switch (node.kind) {
    case 'text':
      return node.text
    case 'link':
      return (
        <a href={node.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          {node.text}
        </a>
      )
    case 'code':
      return <code className="font-mono">{node.text}</code>
    case 'bold':
      return <strong>{inlineNodes(node.children)}</strong>
    case 'italic':
      return <em>{inlineNodes(node.children)}</em>
    case 'strike':
      return <s>{inlineNodes(node.children)}</s>
  }
}
