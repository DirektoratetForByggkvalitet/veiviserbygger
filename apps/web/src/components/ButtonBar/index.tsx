import { ReactNode } from 'react'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  list?: boolean
}

export default function ButtonBar({ children, list }: Props) {
  return <div {...bem('', { list })}>{children}</div>
}
