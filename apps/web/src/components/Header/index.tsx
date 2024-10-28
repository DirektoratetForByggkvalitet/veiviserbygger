import Button from '@/components/Button'
import { IconMenu } from '@/components/Icon'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

export default function Header() {
  return (
    <header {...bem('')}>
      <button type="button" {...bem('toggle')} aria-label="Meny">
        <IconMenu />
      </button>

      <h1 {...bem('name')}>Losen</h1>

      <nav {...bem('actions')}>
        <Button primary>Publiser</Button>
      </nav>
    </header>
  )
}
