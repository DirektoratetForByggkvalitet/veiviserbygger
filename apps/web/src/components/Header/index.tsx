import { IconMenu } from '@/components/Icon'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

export default function Header() {
  return (
    <header {...bem('')}>
      <button type="button" {...bem('toggle')}>
        <IconMenu />
      </button>

      <h1 {...bem('name')}>Losen</h1>
    </header>
  )
}
