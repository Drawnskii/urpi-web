import { useState, type ChangeEvent, type SubmitEvent } from 'react'

import { fieldErrorsFrom, isApiError } from '@/shared/api'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

import { useAddTenant } from '../api/tenant-mutations'
import { TENANT_NAME_MAX_LENGTH, type UserTenant } from '../model/tenant'

interface AddTenantFormProps {
  onAdded: (tenant: UserTenant) => void
}

function validateName(name: string) {
  if (!name.trim()) return 'Required'
  if (name.trim().length > TENANT_NAME_MAX_LENGTH) return `${TENANT_NAME_MAX_LENGTH} characters at most`
  return undefined
}

// Self-serve: the business's name; its time zone is the browser's. The user becomes its owner
export function AddTenantForm({ onAdded }: AddTenantFormProps) {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string>()
  const [formError, setFormError] = useState<string>()
  const addTenant = useAddTenant()

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value)
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validateName(name)
    setNameError(found)
    setFormError(undefined)
    if (found) return

    addTenant.mutate(
      { name: name.trim(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      {
        onSuccess: onAdded,
        onError: (error) => {
          // 409 TenantLimitReachedError: the backend says how many a user may own
          if (isApiError(error) && error.isConflict) setFormError(error.message)
          else if (isApiError(error) && error.isUnprocessable && fieldErrorsFrom(error).name) setNameError(fieldErrorsFrom(error).name)
          else setFormError('Something went wrong. Try again.')
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="business-name">Business name</Label>
        <Input
          id="business-name"
          value={name}
          onChange={handleNameChange}
          maxLength={TENANT_NAME_MAX_LENGTH}
          autoComplete="organization"
          required
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? 'business-name-error' : undefined}
        />
        {nameError && (
          <p id="business-name-error" role="alert" className="text-body-sm text-destructive">{nameError}</p>
        )}
      </div>
      {formError && <p role="alert" className="text-body-sm text-destructive">{formError}</p>}
      <Button type="submit" className="self-start" disabled={addTenant.isPending}>
        {addTenant.isPending ? 'Creating…' : 'Create'}
      </Button>
    </form>
  )
}
