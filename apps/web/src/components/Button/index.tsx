import { ReactNode, MouseEventHandler } from 'react'
import { icons } from 'lucide-react'
import Icon from '@/components/Icon'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { Link } from 'react-router-dom'

const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  type?: 'button' | 'submit'
  primary?: boolean
  subtle?: boolean
  warning?: boolean
  disabled?: boolean
  loading?: boolean
  to?: string
  href?: string
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
  to,
  href,
  onClick,
  iconOnly,
  size,
  icon,
  disabled,
  ...props
}: Props) {
  const Element = to ? Link : href ? 'a' : 'button'

  const typeSpecificProps = {
    ...(to ? { to } : {}),
    ...(href ? { href } : {}),
    ...(onClick ? { onClick } : {}),
  }

  return (
    <Element
      {...props}
      {...bem('', { primary, subtle, warning, [size ?? '']: size, 'icon-only': iconOnly, loading })}
      type={type}
      {...(typeSpecificProps as any)}
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
    </Element>
  )
}
