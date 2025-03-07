import { ChangeEvent, HTMLInputTypeAttribute } from 'react'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { useValue } from '@/hooks/useValue'
const bem = BEMHelper(styles)

type Props<T extends HTMLInputTypeAttribute = 'text'> = {
  label: string
  header?: boolean
  type?: T
  value: T extends 'number' ? number : string
  placeholder?: string
  id?: string
  name?: string
  required?: boolean
  autoFocus?: boolean
  hideLabel?: boolean
  sentence?: boolean
  hideIfEmpty?: boolean
  forwardedRef?: any
  onChange: (v: T extends 'number' ? number : string) => void
}

export default function Input<T extends HTMLInputTypeAttribute = 'text'>({
  label,
  type,
  header,
  hideLabel,
  sentence,
  hideIfEmpty,
  forwardedRef,
  ...props
}: Props<T>) {
  const { value, inSync, onChange } = useValue(props.value, props.onChange)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as Props<T>['value']
    onChange(value)
  }

  return (
    <label
      {...bem('', {
        header,
        sentence,
        'hide-label': hideLabel,
        'hide-if-empty': hideIfEmpty && !value,
        dirty: !inSync,
      })}
    >
      {!hideLabel && <span {...bem('label')}>{label}</span>}
      <input
        {...props}
        {...bem('input')}
        type={type}
        onChange={handleChange}
        value={value}
        ref={forwardedRef}
        aria-label={(hideLabel && label) || undefined}
      />
    </label>
  )
}
