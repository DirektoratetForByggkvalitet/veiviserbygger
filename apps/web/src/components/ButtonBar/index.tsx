import { ReactNode } from 'react'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  list?: boolean
  align?: 'left' | 'right'
  marginBottom?: boolean
  hideMarginTop?: boolean
}

export default function ButtonBar({
  children,
  list,
  marginBottom,
  hideMarginTop,
  align = 'left',
}: Props) {
  return <div {...bem('', { list, marginBottom, hideMarginTop, [align]: true })}>{children}</div>
}
