import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

import Icon from '@/components/Icon'

interface Props {
  className?: string
  label?: string
  name?: string
  id?: string
  checked: boolean
  required?: boolean
  toggle?: boolean
  disabled?: boolean
  large?: boolean
  ariaLabel?: string
  onChange: (checked: boolean) => void
}

export default function Checkbox({
  label,
  checked,
  onChange,
  className,
  toggle,
  disabled,
  large,
  ...props
}: Props) {
  const handleChange = () => {
    console.log(!checked)
    onChange(!checked)
  }

  return (
    <label {...bem('', { toggle, large, disabled }, className)}>
      <input
        {...props}
        {...bem('input')}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      <span {...bem('indicator')}>
        <Icon name="Check" size={toggle ? 16 : 22} {...bem('icon')} />
      </span>
      {label && <span {...bem('label')}>{label}</span>}
    </label>
  )
}
