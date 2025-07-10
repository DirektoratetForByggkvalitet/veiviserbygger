import { ReactNode } from 'react'

import BEMHelper from '@/lib/bem'
import Icon from '@/components/Icon'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface Props {
  title: string
  children?: ReactNode
  subtle?: boolean
  className?: string
}

export default function Message({ title, children, subtle, className }: Props) {
  return (
    <section role="alert" {...bem('', { subtle }, className)}>
      <p {...bem('title')}>
        <Icon name="Info" size="22" {...bem('icon')} />
        {title}
      </p>
      {children}
    </section>
  )
}
