import { ReactNode } from 'react'

import Header from '@/components/Header'
import Menu from '@/components/Menu'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
}

export default function Page({ children }: Props) {
  return (
    <main {...bem('')}>
      <Header />
      <Menu />
      {children}
    </main>
  )
}
