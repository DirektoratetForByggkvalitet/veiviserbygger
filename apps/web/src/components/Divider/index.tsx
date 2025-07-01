import { ReactNode } from 'react'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface DividerProps {
  text?: ReactNode
  className?: string
}

export default function Divider({ text, className }: DividerProps) {
  return (
    <div {...bem('', '', className)}>
      <hr {...bem('line')} />
      {text && <span {...bem('text')}>{text}</span>}
    </div>
  )
}
