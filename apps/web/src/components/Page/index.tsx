import { ReactNode } from 'react'

import Header from '@/components/Header'
import Menu from '@/components/Menu'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  title?: string
}

export default function Page({ children, title }: Props) {
  return (
    <main {...bem('')}>
      <Header title={title} />
      <Menu />
      {children}
    </main>
  )
}
