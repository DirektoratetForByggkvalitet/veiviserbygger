import { ComponentProps } from 'react'

import Dropdown from '@/components/Dropdown'
import Input from '@/components/Input'

export const UNIT_SUGGESTIONS = ['m²', 'm³', 'm', 'kg', 'år', 'kr', '%', 'stk']

type Props = ComponentProps<typeof Input<'text'>> & {
  suggestions: string[]
  suggestionsLabel?: string
}

export default function InputWithSuggestions({
  suggestions,
  suggestionsLabel = 'Forslag til enheter',
  ...props
}: Props) {
  return (
    <Input
      {...props}
      suffixAction={
        <Dropdown
          icon="Plus"
          direction="right"
          label={suggestionsLabel}
          options={suggestions.map((value) => ({ value, label: value }))}
          value={props.value}
          onChange={(v) => props.onChange(v)}
          iconOnly
        />
      }
    />
  )
}
