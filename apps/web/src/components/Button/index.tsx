import { ReactNode } from 'react'

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
    </button>
  )
}
