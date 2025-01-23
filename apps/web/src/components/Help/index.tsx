import { ReactNode } from 'react'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

interface Props {
  description?: ReactNode | string
}
export default function Help({ description }: Props) {
  return <p {...bem('')}>{description}</p>
}
