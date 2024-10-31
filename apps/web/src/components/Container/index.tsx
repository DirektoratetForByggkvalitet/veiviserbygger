import { ReactNode } from 'react'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

interface Props {
  children?: ReactNode
  size?: 'full' | 'base' | 'medium' | 'tight'
  className?: string
  node?: keyof JSX.IntrinsicElements
  style?: React.CSSProperties
}

export default function Container({
  children,
  size,
  className,
  node: Node = 'div',
  ...props
}: Props) {
  return (
    <Node {...props} {...bem('', size, className)}>
      {children}
    </Node>
  )
}
