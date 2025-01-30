import { useAtom } from 'jotai'

import menuState from '@/store/menu'

import Button from '@/components/Button'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import { IconMenu } from '@/components/Icon'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { useNavigate, useParams } from 'react-router'
import { Wizard, WrappedWithId } from 'types'
import { Timestamp } from 'firebase/firestore'
const bem = BEMHelper(styles)

type Props = {
  title?: string
  versions?: { id: string; title?: string; publishedFrom?: Timestamp; publishedTo?: Timestamp }[]
  wizard?: WrappedWithId<Wizard>
  hideMenu?: boolean
}

export default function Header({ title = 'Losen', versions, hideMenu }: Props) {
  if (hideMenu) {
    return (
      <header {...bem('')}>
        <h1 {...bem('name')}>{title}</h1>
      </header>
    )
  }

  const { version } = useParams()
  const { wizardId } = useParams()
  const navigate = useNavigate()
  const [open, setOpen] = useAtom(menuState)

  const activeVersion = versions?.find((v) => v.id === version)

  const toggleMenu = () => {
    setOpen(!open)
  }

  const wizardOptions = [
    {
      value: '1',
      label: 'Endre navn',
      onClick: () => console.log('Åpne en modal for dette. Samme?"'),
      disabled: true,
    },
    {
      value: '2',
      label: 'Dupliser veiviseren',
      onClick: () => console.log('Åpne en modal med bekreftelse."'),
      disabled: true,
    },
    {
      value: '3',
      label: 'Slett utkastet',
      styled: 'delete',
      onClick: () => console.log('Hvis den ikke er publisert'),
    },
  ] as DropdownOptions

  return (
    <header {...bem('', { open })}>
      <button type="button" {...bem('toggle')} aria-label="Meny" onClick={toggleMenu}>
        <IconMenu />
      </button>

      <h1 {...bem('name')}>{title}</h1>

      <nav {...bem('actions')}>
        {versions?.length ? (
          <Dropdown
            options={versions.map((v, i, arr) => ({
              label:
                v.title ||
                `Versjon ${arr.length - i} ${v.publishedFrom && !v.publishedTo ? '(publisert)' : ''}${!v.publishedFrom ? '(utkast)' : ''}`,
              value: v.id,
            }))}
            value={activeVersion?.id || 'Velg versjon'}
            onChange={(id) => navigate(`/wizard/${wizardId}/${id}`)}
            label="Versjoner"
            hideLabel
            simple
            direction="right"
          />
        ) : null}
        <Button size="small">Forhåndsvisning</Button>
        {!activeVersion?.publishedFrom ? (
          <Button primary size="small">
            Publiser
          </Button>
        ) : null}
        {activeVersion?.publishedFrom ? (
          <Button primary size="small">
            Publiser endringer
          </Button>
        ) : null}
        <Dropdown
          icon="Settings2"
          direction="right"
          options={wizardOptions}
          label={'Valg for veiviser'}
          iconOnly
        />
      </nav>
    </header>
  )
}
