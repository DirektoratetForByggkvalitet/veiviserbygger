import Expression, { ExpressionProps } from '@/components/Expression'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface Props {
  label?: string
}

export default function PageExpression({ label = 'Vis siden', ...props }: Props & ExpressionProps) {
  return (
    <section {...bem('')}>
      <h3 {...bem('title')}>{label}</h3>
      <Expression {...props} property="show" />
    </section>
  )
}
