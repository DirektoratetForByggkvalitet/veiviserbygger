import { ReactNode } from 'react'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  type?: 'button' | 'submit'
  primary?: boolean
  onClick?: () => void
  // full?: boolean
  // size?: 'small' | 'large'
}

export default function Button({ children, type = 'button', primary, onClick }: Props) {
  // TODO: Link button as well
  return (
    <button {...bem('', { primary })} type={type} onClick={onClick}>
      {children}
    </button>
  )
}
