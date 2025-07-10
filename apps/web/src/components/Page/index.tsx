import { ReactNode } from 'react'

import Header from '@/components/Header'
import Menu from '@/components/Menu'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { Wizard, WrappedWithId } from 'types'
import { Timestamp } from 'firebase/firestore'
import Modals from '@/modals'
import GlobalStyles from '../GlobalStyles'

const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  title?: string
  light?: boolean
  hideMenu?: boolean
  versions?: { id: string; title?: string; publishedFrom?: Timestamp; publishedTo?: Timestamp }[]
  wizard?: WrappedWithId<Wizard>
  /**
   * Whether or not to apply global styles to the page. Defaults to true.
   */
  globalStyles?: boolean
}

export default function Page({
  children,
  title,
  light,
  hideMenu,
  versions,
  wizard,
  globalStyles = true,
}: Props) {
  return (
    <>
      {globalStyles && <GlobalStyles />}

      <main {...bem('', { light })}>
        <Header title={title} versions={versions} wizard={wizard} hideMenu={hideMenu} />
        <Menu />
        {children}
      </main>

      <Modals />
    </>
  )
}
