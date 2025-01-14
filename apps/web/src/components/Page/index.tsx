import { ReactNode } from 'react'

import Header from '@/components/Header'
import Menu from '@/components/Menu'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { Wizard, WrappedWithId } from 'types'
import { Timestamp } from 'firebase/firestore'

const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  title?: string
  versions?: { id: string; title?: string; publishedFrom?: Timestamp; publishedTo?: Timestamp }[]
  wizard?: WrappedWithId<Wizard>
}

export default function Page({ children, title, versions, wizard }: Props) {
  return (
    <main {...bem('')}>
      <Header title={title} versions={versions} wizard={wizard} />
      <Menu />
      {children}
    </main>
  )
}
