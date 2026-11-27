import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

interface VariableFieldsProps {
  idPrefix: string // each input's id: <idPrefix>-<variable>
  variables: string[]
  values: Record<string, string>
  errors?: Record<string, string> // by variable
  placeholders?: Record<string, string> // by variable
  onChange: (variable: string, value: string) => void
}

// One labelled input per variable of a template, with its error under it: the examples given to
// Meta's reviewer, or the values a member sends
export function VariableFields({ idPrefix, variables, values, errors, placeholders, onChange }: VariableFieldsProps) {
  return variables.map((variable) => {
    const id = `${idPrefix}-${variable}`
    const error = errors?.[variable]
    return (
      <div key={variable} className="flex flex-col gap-1">
        <Label htmlFor={id}>{variable}</Label>
        <Input
          id={id}
          value={values[variable] ?? ''}
          onChange={(event) => onChange(variable, event.target.value)}
          placeholder={placeholders?.[variable]}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {error && (
          <p id={`${id}-error`} role="alert" className="text-body-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    )
  })
}
