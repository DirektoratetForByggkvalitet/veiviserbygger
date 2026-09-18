import { ReactNode } from 'react'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  onSubmit?: (event: any) => void
}

export default function Form({ children, ...props }: Props) {
  return (
    <form {...props} {...bem('')}>
      <div {...bem('content')}>{children}</div>
    </form>
  )
}

interface FormSplitProps {
  children: ReactNode
}

Form.Split = function FormSplit({ children }: FormSplitProps) {
  return <div {...bem('split')}>{children}</div>
}

Form.Presentational = function FormPresentational({
  children,
  marginBottom,
}: {
  children: ReactNode
  marginBottom?: boolean
}) {
  return <div {...bem('content', { marginBottom })}>{children}</div>
}
