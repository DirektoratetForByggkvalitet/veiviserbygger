import { ReactNode, MouseEventHandler } from 'react'
import { icons } from 'lucide-react'
import Icon from '@/components/Icon'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  type?: 'button' | 'submit'
  primary?: boolean
  subtle?: boolean
  warning?: boolean
  disabled?: boolean
  loading?: boolean
  onClick?: MouseEventHandler
  icon?: keyof typeof icons
  iconOnly?: boolean
  // full?: boolean
  size?: 'small' | 'large'
}

export default function Button({
  children,
  type = 'button',
  primary,
  loading,
  subtle,
  warning,
  onClick,
  iconOnly,
  size,
  icon,
  disabled,
  ...props
}: Props) {
  // TODO: Link button as well
  return (
    <button
      {...props}
      {...bem('', { primary, subtle, warning, [size ?? '']: size, 'icon-only': iconOnly, loading })}
      type={type}
      onClick={onClick}
      aria-label={iconOnly ? (children as string) : undefined}
      title={iconOnly ? (children as string) : undefined}
      disabled={loading || disabled}
    >
      {icon && (
        <span {...bem('icon')}>
          <Icon name={icon} />
        </span>
      )}
      {!iconOnly && children}
    </button>
  )
}
