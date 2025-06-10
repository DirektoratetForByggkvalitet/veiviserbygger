import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)
import { useEditable } from '@/hooks/useEditable'
import Icon from '@/components/Icon'

interface Props {
  className?: string
  label?: string
  name?: string
  id?: string
  checked?: boolean
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
  const handleChange = () => onChange(!checked)
  const isEditable = useEditable()

  if (!isEditable && !checked) {
    return null
  }
  return (
    <label {...bem('', { toggle, large, disabled, 'read-only': !isEditable }, className)}>
      <input
        {...props}
        {...bem('input')}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled || !isEditable}
      />
      <span {...bem('indicator')}>
        <Icon name="Check" size={toggle ? 16 : 22} {...bem('icon')} />
      </span>
      {label && <span {...bem('label')}>{label}</span>}
    </label>
  )
}
