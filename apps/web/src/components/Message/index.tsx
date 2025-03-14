import { ReactNode } from 'react'

import BEMHelper from '@/lib/bem'
import Icon from '@/components/Icon'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface Props {
  title: string
  children?: ReactNode
  subtle?: boolean
}

export default function Message({ title, children, subtle }: Props) {
  return (
    <section role="alert" {...bem('', { subtle })}>
      <p {...bem('title')}>
        <Icon name="MessageCircleWarning" size="22" {...bem('icon')} />
        {title}
      </p>
      {children}
    </section>
  )
}
