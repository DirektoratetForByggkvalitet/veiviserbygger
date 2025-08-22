import Expression, { ExpressionProps } from '@/components/Expression'
import Icon from '@/components/Icon'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface Props {
  label?: string
  onRemove: () => void
}

export default function PageExpression({
  label = 'Vis siden hvis',
  onRemove,
  ...props
}: Props & Omit<ExpressionProps, 'property'>) {
  const contentActions: DropdownOptions = [
    {
      value: '0',
      icon: 'Trash',
      label: 'Fjern logikk',
      onClick: onRemove,
      styled: 'delete',
    },
  ]

  return (
    <section {...bem('')}>
      <header {...bem('header')}>
        <Icon name="EyeOff" size="20" {...bem('header-icon')} />
        <h2 {...bem('title')}>{label}</h2>
        <Dropdown
          icon="Ellipsis"
          direction="right"
          options={contentActions}
          label="Valg"
          iconOnly
        />
      </header>
      <div {...bem('content')}>
        <Expression {...props} property="show" />
      </div>
    </section>
  )
}
