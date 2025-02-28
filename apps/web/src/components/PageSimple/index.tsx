import { ReactNode } from 'react'

import Header from '@/components/Header'
import Container from '@/components/Container'
import Meta from '@/components/Meta'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  title?: string
}

export default function PageSimple({ children, title }: Props) {
  return (
    <>
      <Meta title={title} />
      <Header hideMenu />
      <main {...bem('')}>
        <Container size="tight">
          <h1 {...bem('title')}>{title}</h1>
          {children}
        </Container>
      </main>
    </>
  )
}
