import { ChangeEvent, useRef } from 'react'

import { useEditable } from '@/hooks/useEditable'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { useValue } from '@/hooks/useValue'

const bem = BEMHelper(styles)

type Value = { from?: number; to?: number }

type Props = {
  label: string
  header?: boolean
  value: Value
  id?: string
  name?: string
  required?: boolean
  autoFocus?: boolean
  hideLabel?: boolean
  onChange: (v: Value) => void
}

export default function Range({ label, header, hideLabel, ...props }: Props) {
  const fromRef = useRef<HTMLInputElement>(null)
  const toRef = useRef<HTMLInputElement>(null)
  const isEditable = useEditable()

  const {
    value: fromValue,
    inSync: fromInSync,
    onChange: onChangeFrom,
  } = useValue(
    props.value?.from || 0,
    (v) => props.onChange({ ...(props.value || {}), from: v }),
    fromRef,
  )

  const {
    value: toValue,
    inSync: toInSync,
    onChange: onChangeTo,
  } = useValue(
    props.value?.to || 0,
    (v) => props.onChange({ ...(props.value || {}), to: v }),
    toRef,
  )

  const handleChange = (property: 'from' | 'to') => (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    property === 'from' ? onChangeFrom(value) : onChangeTo(value)
  }

  return (
    <>
      <label
        {...bem('', {
          header,
          dirty: !fromInSync,
          'read-only': !isEditable,
        })}
      >
        {!hideLabel && <span {...bem('label')}>{label}</span>}

        <input
          {...props}
          {...bem('input')}
          type="number"
          onChange={handleChange('from')}
          disabled={!isEditable}
          readOnly={!isEditable}
          value={fromValue}
          ref={fromRef}
          aria-label={(hideLabel && label) || undefined}
        />
      </label>{' '}
      og{' '}
      <label
        {...bem('', {
          header,
          dirty: !toInSync,
          'read-only': !isEditable,
        })}
      >
        {!hideLabel && <span {...bem('label')}>{label}</span>}

        <input
          {...props}
          {...bem('input')}
          type="number"
          onChange={handleChange('to')}
          disabled={!isEditable}
          readOnly={!isEditable}
          value={toValue}
          ref={toRef}
          aria-label={(hideLabel && label) || undefined}
        />
      </label>
    </>
  )
}
