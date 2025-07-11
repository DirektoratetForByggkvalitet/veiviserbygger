import { ReactNode } from 'react'

import Header from '@/components/Header'
import Container from '@/components/Container'
import Meta from '@/components/Meta'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import Modals from '@/modals'
import GlobalStyles from '../GlobalStyles'

const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  title?: string
  /**
   * Whether or not to apply global styles to the page. Defaults to true.
   */
  globalStyles?: boolean
}

export default function PageSimple({ children, title, globalStyles = true }: Props) {
  return (
    <>
      {globalStyles && <GlobalStyles />}

      <Meta title={title} />
      <Header hideMenu />
      <main {...bem('')}>
        <Container size="tight">
          <h1 {...bem('title')}>{title}</h1>
          {children}
        </Container>
      </main>

      <Modals />
    </>
  )
}
