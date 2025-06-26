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
    <div {...bem('')}>
      {options && (
        <Dropdown
          icon="Ellipsis"
          direction="right"
          position="above"
          options={name ? [{ group: name }, ...options] : options}
          label="Valg"
          trigger={({ onClick }) => (
            <button
              type="button"
              onClick={onClick}
              {...bem('avatar')}
              title={name || undefined}
              aria-label="Bruker"
            >
              {name?.charAt(0) || ''}
            </button>
          )}
          iconOnly
        />
      )}
    </div>
  )
}
