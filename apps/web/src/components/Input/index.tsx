import { ChangeEvent, HTMLInputTypeAttribute } from 'react'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

interface Props {
  label: string
  type?: HTMLInputTypeAttribute
  value: string
  placeholder?: string
  id?: string
  name?: string
  required?: boolean
  autoFocus?: boolean
  onChange: (value: string) => void
}

export default function Input({ label, type = 'text', onChange, ...props }: Props) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    onChange(value)
  }

  return (
    <label {...bem('')}>
      <span {...bem('label')}>{label}</span>
      <input {...props} type={type} {...bem('input')} onChange={handleChange} />
    </label>
  )
}
