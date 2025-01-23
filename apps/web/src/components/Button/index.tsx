import { ReactNode } from 'react'
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
  onClick?: () => void
  icon?: keyof typeof icons
  // full?: boolean
  size?: 'small' | 'large'
}

export default function Button({
  children,
  type = 'button',
  primary,
  subtle,
  onClick,
  size,
  icon,
  ...props
}: Props) {
  // TODO: Link button as well
  return (
    <button
      {...props}
      {...bem('', { primary, subtle, [size ?? '']: size })}
      type={type}
      onClick={onClick}
    >
      {children}
      {icon && (
        <span {...bem('icon')}>
          <Icon name={icon} />
        </span>
      )}
    </button>
  )
}
