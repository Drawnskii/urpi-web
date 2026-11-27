import type { MessageTemplate } from '../model/message-template'

// Pure patches on the list query: no React, no network

// The backend's order: by name, then language
function byNameAndLanguage(a: MessageTemplate, b: MessageTemplate) {
  return a.name.localeCompare(b.name) || a.language.localeCompare(b.language)
}

// A created or reviewed template: replaced by id, or added in order; a deleted one leaves, as the
// backend's list leaves it out. undefined stays undefined: the list isn't loaded, and it loads
// fresh when opened
export function upsertTemplate(templates: MessageTemplate[] | undefined, template: MessageTemplate) {
  if (!templates) return templates
  const others = templates.filter((current) => current.id !== template.id)
  return template.status === 'DELETED' ? others : [...others, template].sort(byNameAndLanguage)
}
