import Dropdown, { DropdownOptions } from '@/components/Dropdown'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

type Props = {
  name?: string | null
  options?: DropdownOptions
}

export default function User({ name, options }: Props) {
  return (
    <div {...bem()}>
      <span {...bem('avatar')} role="presentation">
        {name?.charAt(0) || ''}
      </span>
      <span {...bem('name')}>{name || 'Ukjent'}</span>
      {options && (
        <Dropdown
          icon="Ellipsis"
          direction="right"
          position="above"
          options={options}
          label="Valg"
          iconOnly
        />
      )}
    </div>
  )
}
