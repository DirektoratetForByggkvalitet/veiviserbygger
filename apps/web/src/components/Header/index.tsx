import { useAtom } from 'jotai'

import menuState from '@/store/menu'

import Button from '@/components/Button'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import { IconMenu } from '@/components/Icon'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

type Props = {
  title?: string
  versions?: DropdownOptions
  version?: string
}

export default function Header({ title = 'Losen', versions, version }: Props) {
  const [open, setOpen] = useAtom(menuState)

  const toggleMenu = () => {
    setOpen(!open)
  }

  return (
    <header {...bem('', { open })}>
      <button type="button" {...bem('toggle')} aria-label="Meny" onClick={toggleMenu}>
        <IconMenu />
      </button>

      <h1 {...bem('name')}>{title}</h1>

      <nav {...bem('actions')}>
        {versions && (
          <Dropdown
            options={versions}
            value={version || 'Velg versjon'}
            label="Versjoner"
            hideLabel
            simple
            direction="right"
          />
        )}
        <Button primary size="small">
          Publiser
        </Button>
      </nav>
    </header>
  )
}
