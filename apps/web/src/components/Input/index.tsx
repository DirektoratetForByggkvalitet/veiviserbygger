import { ChangeEvent, HTMLInputTypeAttribute, RefObject, useRef } from 'react'

import { useEditable } from '@/hooks/useEditable'
import { useValue } from '@/hooks/useValue'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

type Props<T extends HTMLInputTypeAttribute = 'text'> = {
  label: string
  header?: boolean
  type?: T
  value: T extends 'number' ? number | undefined : string | undefined
  placeholder?: string
  id?: string
  name?: string
  required?: boolean
  autoFocus?: boolean
  hideLabel?: boolean
  sentence?: boolean
  hideIfEmpty?: boolean
  forwardedRef?: RefObject<HTMLInputElement>
  forceAllowEdit?: boolean
  onChange: (v: T extends 'number' ? number | undefined : string | undefined) => void

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
  forceAllowEdit,
  ...props
}: Props<T>) {
  const internalRef = useRef<HTMLInputElement>(null)
  const isEditable = forceAllowEdit ? true : useEditable()

  const ref = forwardedRef || internalRef
  const { value, inSync, onChange } = useValue(
    props.value as string | number | undefined,
    props.onChange as (v: string | number | undefined) => void,
    ref,
    inputDebounceMs,
  )

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as Props<T>['value']
    onChange(type === 'number' ? (value === '' ? undefined : Number(value)) : value)
  }

  if (!isEditable && !value) {
    return null
  }

  // Convert undefined to empty string for controlled input
  const displayValue = value ?? ''

  return (
    <label
      {...bem('', {
        header,
        sentence,
        'hide-label': hideLabel,
        'hide-if-empty': hideIfEmpty && !value,
        dirty: !inSync,
        'read-only': !isEditable,
      })}
    >
      {!hideLabel && <span {...bem('label')}>{label}</span>}

      <input
        {...props}
        {...bem('input')}
        type={type}
        onChange={isEditable ? handleChange : undefined}
        disabled={!isEditable}
        readOnly={!isEditable}
        value={displayValue}
        ref={ref}
        aria-label={(hideLabel && label) || undefined}
      />
    </label>
  )
}
