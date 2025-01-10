import { ReactNode } from 'react'

import Header from '@/components/Header'
import Menu from '@/components/Menu'
import { DropdownOptions } from '@/components/Dropdown'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  title?: string
  versions?: DropdownOptions
  version?: string
}

export default function Page({ children, title, versions, version }: Props) {
  return (
    <main {...bem('')}>
      <Header title={title} versions={versions} version={version} />
      <Menu />
      {children}
    </main>
  )
}
