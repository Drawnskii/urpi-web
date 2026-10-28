import { createCn } from 'cn/config'

// The type scale's classes (app/styles/index.css). Without them, cn reads text-caption as a text
// color and drops it next to a real one (text-primary-foreground), so a badge falls back to 16px
const TYPE_SCALE = ['display', 'h1', 'h2', 'h3', 'h4', 'body-lg', 'body', 'body-sm', 'label', 'caption']

// shadcn's components import cn from here, not from the "cn" package, so they merge with this config
export const cn = createCn({
  extend: { classGroups: { 'font-size': [{ text: TYPE_SCALE }] } },
})
