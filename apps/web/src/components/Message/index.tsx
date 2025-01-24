import { ReactNode } from 'react'

import BEMHelper from '@/lib/bem'
import Icon from '@/components/Icon'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface Props {
  title: string
  children: ReactNode
}

export default function Message({ title, children }: Props) {
  return (
    <section role="alert" {...bem('')}>
      <p {...bem('title')}>
        <Icon name="Info" />
        {title}
      </p>
      {children}
    </section>
  )
}
