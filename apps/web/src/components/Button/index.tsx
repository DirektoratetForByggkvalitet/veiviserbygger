import Icon from '@/components/Icon'
import BEMHelper from '@/lib/bem'
import { icons } from 'lucide-react'
import { MouseEventHandler, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface Props {
  children?: ReactNode
  type?: 'button' | 'submit'
  primary?: boolean
  subtle?: boolean
  list?: boolean
  warning?: boolean
  disabled?: boolean
  loading?: boolean
  to?: string
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  onClick?: MouseEventHandler
  icon?: keyof typeof icons
  iconOnlyOnMobile?: keyof typeof icons
  iconOnly?: boolean
  toggle?: boolean
  pressed?: boolean
  // full?: boolean
  size?: 'small' | 'large' | 'full'
  className?: string
  tooltip?: string
  badge?: string
}

export default function Button({
  children,
  type = 'button',
  primary,
  list,
  loading,
  subtle,
  warning,
  to,
  href,
  target,
  onClick,
  iconOnly,
  iconOnlyOnMobile,
  toggle,
  pressed,
  size,
  icon,
  disabled,
  className,
  tooltip,
  badge,
  ...props
}: Props) {
  const Element = to ? Link : href ? 'a' : 'button'

  const typeSpecificProps = {
    ...(to ? { to, target } : {}),
    ...(href ? { href } : {}),
    ...(onClick ? { onClick } : {}),
  }

  const iconSize = icon && size === 'small' ? 16 : undefined

  return (
    <Element
      {...props}
      {...bem(
        '',
        {
          primary,
          subtle,
          list,
          warning,
          [size ?? '']: size,
          'icon-only': iconOnly,
          loading,
          toggle,
          'only-on-mobile': iconOnlyOnMobile,
          tooltip: !!tooltip,
        },
        className,
      )}
      type={type}
      {...(typeSpecificProps as any)}
      aria-label={iconOnly || iconOnlyOnMobile ? (children as string) : undefined}
      title={iconOnly ? (children as string) : undefined}
      disabled={loading || disabled}
      aria-pressed={toggle ? pressed : undefined}
    >
      {iconOnlyOnMobile && (
        <span {...bem('icon', 'only-on-mobile')}>
          <Icon name={iconOnlyOnMobile} size={iconSize} />
        </span>
      )}
      {icon && (
        <span {...bem('icon')}>
          <Icon name={icon} size={iconSize} />
        </span>
      )}
      {!iconOnly && children && <span {...bem('text')}>{children}</span>}
      {!iconOnly && badge && (
        <span {...bem('badge')} title={badge}>
          {badge}
        </span>
      )}

      {tooltip && <span {...bem('tooltip')}>{tooltip}</span>}
    </Element>
  )
}
