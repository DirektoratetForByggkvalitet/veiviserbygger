import { ChangeEvent, HTMLInputTypeAttribute, RefObject, useRef } from 'react'

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
  forwardedRef?: RefObject<HTMLInputElement>
  onChange: (v: T extends 'number' ? number : string) => void

  /**
   * The number of milliseconds to debounce the input before calling the onChange
   * function. Defaults to the 150ms that is used in the useValue hook, but can be
   * overridden if needed.
   *
   * @see useValue
   */
  inputDebounceMs?: number
}

export default function Input<T extends HTMLInputTypeAttribute = 'text'>({
  label,
  type,
  header,
  hideLabel,
  sentence,
  hideIfEmpty,
  forwardedRef,
  inputDebounceMs,
  ...props
}: Props<T>) {
  const internalRef = useRef<HTMLInputElement>(null)

  const ref = forwardedRef || internalRef
  const { value, inSync, onChange } = useValue(props.value, props.onChange, ref, inputDebounceMs)

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
        ref={ref}
        aria-label={(hideLabel && label) || undefined}
      />
    </label>
  )
}
