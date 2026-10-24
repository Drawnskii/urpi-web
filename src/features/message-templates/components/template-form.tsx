import { Link } from '@tanstack/react-router'
import { useState, type ChangeEvent, type FormEvent } from 'react'

import { fieldErrorsFrom, isApiError } from '@/shared/api'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/shared/components/ui/native-select'
import { Textarea } from '@/shared/components/ui/textarea'

import { useCreateMessageTemplate } from '../api/message-template-mutations'
import {
  checkTemplateDraft,
  hasDraftErrors,
  previewTemplate,
  templateVariables,
  toCreateInput,
  toTemplateName,
  TEMPLATE_BODY_MAX_LENGTH,
  type CreateMessageTemplateInput,
  type MessageTemplateCategory,
  type TemplateDraftErrors,
} from '../model/message-template'

const CATEGORIES: { value: MessageTemplateCategory; label: string }[] = [
  { value: 'UTILITY', label: 'Utility: about a booking or order' },
  { value: 'MARKETING', label: 'Marketing: promotions' },
]

const LANGUAGES = [
  { value: 'es', label: 'Spanish' },
  { value: 'es_MX', label: 'Spanish (Mexico)' },
  { value: 'en_US', label: 'English (US)' },
  { value: 'pt_BR', label: 'Portuguese (Brazil)' },
]

const emptyForm: CreateMessageTemplateInput = { name: '', language: 'es', category: 'UTILITY', body: '', examples: {} }

// The backend found the tenant without a connected number: the fix is on the home page
const NO_NUMBER_ERROR = 'TenantWhatsAppAccountNotFoundError'

export function TemplateForm() {
  const [values, setValues] = useState<CreateMessageTemplateInput>(emptyForm)
  const [errors, setErrors] = useState<TemplateDraftErrors>({})
  const [formError, setFormError] = useState<string>()
  const [hasNoNumber, setHasNoNumber] = useState(false)
  const createTemplate = useCreateMessageTemplate()

  // One example input per variable, as the tenant types the body
  const variables = templateVariables(values.body)

  function handleChange(field: 'language' | 'body') {
    return (event: ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues((current) => ({ ...current, [field]: event.target.value }))
  }

  function handleExampleChange(variable: string, value: string) {
    setValues((current) => ({ ...current, examples: { ...current.examples, [variable]: value } }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = checkTemplateDraft(values)
    setErrors(found)
    setFormError(undefined)
    setHasNoNumber(false)
    if (hasDraftErrors(found)) return

    createTemplate.mutate(toCreateInput(values), {
      onSuccess: () => setValues(emptyForm),
      onError: (error) => {
        if (isApiError(error) && error.code === NO_NUMBER_ERROR) setHasNoNumber(true)
        else if (isApiError(error) && error.isConflict) setErrors({ name: 'You already have a template with that name and language' })
        else if (isApiError(error) && error.isUnprocessable && error.issues.length > 0) setErrors(fieldErrorsFrom(error))
        // 502: Meta refused or failed; its reason is the message. 422 InvalidMessageTemplateError too
        else if (isApiError(error) && error.isBadGateway) setFormError(`Meta refused it: ${error.message}`)
        else setFormError(error.message)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="template-name">Name</Label>
        <Input
          id="template-name"
          value={values.name}
          onChange={(event) => setValues((current) => ({ ...current, name: toTemplateName(event.target.value) }))}
          placeholder="booking_confirmation"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'template-name-error' : 'template-name-hint'}
        />
        {errors.name ? (
          <p id="template-name-error" role="alert">{errors.name}</p>
        ) : (
          <p id="template-name-hint">Lowercase letters, digits and _. Spaces become _.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="template-category">Category</Label>
          <NativeSelect
            id="template-category"
            value={values.category}
            onChange={(event) =>
              setValues((current) => ({ ...current, category: event.target.value as MessageTemplateCategory }))
            }
          >
            {CATEGORIES.map((category) => (
              <NativeSelectOption key={category.value} value={category.value}>
                {category.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="template-language">Language</Label>
          <NativeSelect id="template-language" value={values.language} onChange={handleChange('language')}>
            {LANGUAGES.map((language) => (
              <NativeSelectOption key={language.value} value={language.value}>
                {language.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="template-body">Message</Label>
        <Textarea
          id="template-body"
          value={values.body}
          onChange={handleChange('body')}
          placeholder="Hola {{client_name}}, tu reserva quedó confirmada."
          maxLength={TEMPLATE_BODY_MAX_LENGTH}
          aria-invalid={Boolean(errors.body)}
          aria-describedby={errors.body ? 'template-body-error' : 'template-body-hint'}
        />
        {errors.body ? (
          <p id="template-body-error" role="alert">{errors.body}</p>
        ) : (
          <p id="template-body-hint">
            Write variables as {'{{client_name}}'}: lowercase and _. Not at the very start or end.
          </p>
        )}
      </div>

      {variables.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend>Examples for Meta's review</legend>
          {variables.map((variable) => {
            const error = errors.examples?.[variable]
            return (
              <div key={variable} className="flex flex-col gap-1">
                <Label htmlFor={`template-example-${variable}`}>{variable}</Label>
                <Input
                  id={`template-example-${variable}`}
                  value={values.examples[variable] ?? ''}
                  onChange={(event) => handleExampleChange(variable, event.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `template-example-${variable}-error` : undefined}
                />
                {error && <p id={`template-example-${variable}-error`} role="alert">{error}</p>}
              </div>
            )
          })}
        </fieldset>
      )}

      {values.body.trim() && (
        <div className="flex flex-col gap-1">
          <span>Preview</span>
          <p className="whitespace-pre-wrap">{previewTemplate(values.body.trim(), values.examples)}</p>
        </div>
      )}

      {hasNoNumber && (
        <p role="alert">
          Connect a WhatsApp number first: templates belong to it. <Link to="/">Go to the home page</Link>
        </p>
      )}
      {formError && <p role="alert">{formError}</p>}

      <Button type="submit" disabled={createTemplate.isPending} className="self-start">
        {createTemplate.isPending ? 'Sending to Meta…' : "Send to Meta's review"}
      </Button>
    </form>
  )
}
