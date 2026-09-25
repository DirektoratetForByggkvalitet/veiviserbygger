import { ReactNode } from 'react'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  gap: 'large' | 'small'
  onSubmit?: (event: any) => void
}

function Form({ children, gap, ...props }: Props) {
  return (
    <form {...props} {...bem('', { large: gap == 'large' })}>
      <div {...bem('content')}>{children}</div>
    </form>
  )
}

interface FormSplitProps {
  children: ReactNode
}

function FormSplit({ children }: FormSplitProps) {
  return <div {...bem('split')}>{children}</div>
}

function FormPresentational({
  children,
  marginBottom,
}: {
  children: ReactNode
  marginBottom?: boolean
}) {
  return <div {...bem('content', { marginBottom })}>{children}</div>
}

export default Object.assign(Form, {
  Split: FormSplit,
  Presentational: FormPresentational,
})
