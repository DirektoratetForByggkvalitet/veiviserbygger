import { ReactNode } from 'react'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  list?: boolean
  margins?: boolean
}

export default function ButtonBar({ children, list, margins }: Props) {
  return <div {...bem('', { list, margins })}>{children}</div>
}
