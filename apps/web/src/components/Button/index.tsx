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
  disabled?: boolean
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
  subtle,
  onClick,
  iconOnly,
  size,
  icon,
  ...props
}: Props) {
  // TODO: Link button as well
  return (
    <button
      {...props}
      {...bem('', { primary, subtle, [size ?? '']: size, 'icon-only': iconOnly })}
      type={type}
      onClick={onClick}
      aria-label={iconOnly ? (children as string) : undefined}
      title={iconOnly ? (children as string) : undefined}
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
