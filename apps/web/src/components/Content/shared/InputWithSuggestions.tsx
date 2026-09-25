import { ComponentProps, HTMLInputTypeAttribute } from 'react'

import Dropdown from '@/components/Dropdown'
import Input from '@/components/Input'

type Suggestion = string | { value: string; label: string }

export const UNIT_SUGGESTIONS: Suggestion[] = ['m²', 'm³', 'm', 'kg', 'år', 'kr', '%', 'stk']

export const STEP_SUGGESTIONS: Suggestion[] = [
  { value: '1', label: 'Heltall (1)' },
  { value: '0.1', label: 'En desimal (0.1)' },
  { value: '0.01', label: 'To desimaler (0.01)' },
  { value: '10', label: 'Titall (10)' },
  { value: '100', label: 'Hundretall (100)' },
]

type Props<T extends HTMLInputTypeAttribute> = ComponentProps<typeof Input<T>> & {
  suggestions: Suggestion[]
  suggestionsLabel?: string
}

export default function InputWithSuggestions<T extends HTMLInputTypeAttribute = 'text'>({
  suggestions,
  suggestionsLabel = 'Forslag til enheter',
  ...props
}: Props<T>) {
  const handleSelect = (value: string) => {
    const parsed = props.type === 'number' ? Number(value) : value
    props.onChange(parsed as Parameters<typeof props.onChange>[0])
  }

  return (
    <Input<T>
      {...props}
      suffixAction={
        <Dropdown
          icon="Plus"
          direction="right"
          label={suggestionsLabel}
          options={suggestions.map((suggestion) =>
            typeof suggestion === 'string' ? { value: suggestion, label: suggestion } : suggestion,
          )}
          value={props.value === undefined ? undefined : String(props.value)}
          onChange={handleSelect}
          iconOnly
        />
      }
    />
  )
}
