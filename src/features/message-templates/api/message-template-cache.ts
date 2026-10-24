import type { MessageTemplate } from '../model/message-template'

// Pure patches on the list query: no React, no network

// The backend's order: by name, then language
function byNameAndLanguage(a: MessageTemplate, b: MessageTemplate) {
  return a.name.localeCompare(b.name) || a.language.localeCompare(b.language)
}

// A created or reviewed template: replaced by id, or added in order. undefined stays undefined:
// the list isn't loaded, and it loads fresh when opened
export function upsertTemplate(templates: MessageTemplate[] | undefined, template: MessageTemplate) {
  if (!templates) return templates
  return [...templates.filter((current) => current.id !== template.id), template].sort(byNameAndLanguage)
}
