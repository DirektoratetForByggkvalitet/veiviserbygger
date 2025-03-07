import { ChangeEvent } from 'react'

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
  forwardedRef?: any
  onChange: (v: Value) => void
}

export default function Range({ label, header, hideLabel, forwardedRef, ...props }: Props) {
  const {
    value: fromValue,
    inSync: fromInSync,
    onChange: onChangeFrom,
  } = useValue(props.value?.from || 0, (v) => props.onChange({ ...(props.value || {}), from: v }))
  const {
    value: toValue,
    inSync: toInSync,
    onChange: onChangeTo,
  } = useValue(props.value?.to || 0, (v) => props.onChange({ ...(props.value || {}), to: v }))

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
        })}
      >
        {!hideLabel && <span {...bem('label')}>{label}</span>}

        <input
          {...props}
          {...bem('input')}
          type="number"
          onChange={handleChange('from')}
          value={fromValue}
          ref={forwardedRef}
          aria-label={(hideLabel && label) || undefined}
        />
      </label>{' '}
      og{' '}
      <label
        {...bem('', {
          header,
          dirty: !toInSync,
        })}
      >
        {!hideLabel && <span {...bem('label')}>{label}</span>}

        <input
          {...props}
          {...bem('input')}
          type="number"
          onChange={handleChange('to')}
          value={toValue}
          ref={forwardedRef}
          aria-label={(hideLabel && label) || undefined}
        />
      </label>
    </>
  )
}
