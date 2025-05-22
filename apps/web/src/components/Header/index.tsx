import { useAtom } from 'jotai'

import menuState from '@/store/menu'

import Button from '@/components/Button'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import { IconMenu } from '@/components/Icon'
import User from '@/components/User'
import useAuth from '@/hooks/auth'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { useNavigate, useParams } from 'react-router'
import { Wizard, WrappedWithId } from 'types'
import { Timestamp } from 'firebase/firestore'
import { siteName } from '@/constants'
import { useModal } from '@/hooks/useModal'
const bem = BEMHelper(styles)

type Props = {
  title?: string
  versions?: { id: string; title?: string; publishedFrom?: Timestamp; publishedTo?: Timestamp }[]
  wizard?: WrappedWithId<Wizard>
  hideMenu?: boolean
}

export default function Header({ title = siteName, versions, hideMenu, wizard }: Props) {
  const { logout, user } = useAuth()

  if (hideMenu) {
    return (
      <header {...bem('')}>
        <img src="/header-logo.svg" alt={title} {...bem('logo')} />
        <h1 {...bem('name')}>{title}</h1>

        {user && (
          <nav {...bem('actions')}>
            <User
              name={user?.displayName || user?.email}
              options={[{ value: '', label: 'Logg ut', onClick: logout }]}
            />
          </nav>
        )}
      </header>
    )
  }

  const { versionId } = useParams()
  const { wizardId } = useParams()
  const navigate = useNavigate()
  const [open, setOpen] = useAtom(menuState)
  const { setModal } = useModal()
  const activeVersion = versions?.find((v) => v.id === versionId)

  const toggleMenu = () => {
    setOpen(!open)
  }

  const wizardOptions = [
    { group: 'Versjoner' },
    ...(versions || []).map((v, i, arr) => ({
      label:
        v.title ||
        `Versjon ${arr.length - i} ${v.publishedFrom && !v.publishedTo ? '(publisert)' : ''}${!v.publishedFrom ? '(utkast)' : ''}`,
      value: v.id,
      selected: v.id === versionId,
      onClick: () => navigate(`/wizard/${wizardId}/${v.id}`),
    })),
    { group: 'Handlinger' },
    {
      value: '1',
      label: 'Endre navn',
      onClick: () => setModal('rename'),
    },
    {
      value: '2',
      label: 'Dupliser veiviseren',
      onClick: () => console.log('Åpne en modal med bekreftelse."'),
      disabled: true,
    },
    {
      value: '3',
      label: 'Slett veiviseren',
      styled: 'delete',
      disabled: !!wizard?.data.publishedVersion?.id,
      onClick: () => setModal('delete'),
    },
  ] as DropdownOptions

  return (
    <header {...bem('', { open })}>
      <button type="button" {...bem('toggle')} aria-label="Meny" onClick={toggleMenu}>
        <IconMenu />
      </button>

      <h1 {...bem('name')}>{title}</h1>

      <nav {...bem('actions')}>
        {activeVersion && (
          <>
            <Button size="small" to={`/wizard/${wizardId}/${versionId}/preview`}>
              Forhåndsvisning
            </Button>

            {/* A draft exist, but the user is on a different version */}
            {wizard?.data.draftVersion?.id !== activeVersion.id && wizard?.data.draftVersion ? (
              <Button size="small" to={`/wizard/${wizardId}/${wizard.data.draftVersion.id}`}>
                Gå til utkast
              </Button>
            ) : null}

            {/* The user is on the draft version */}
            {wizard?.data.draftVersion?.id === activeVersion.id ? (
              <>
                {/* The wizard has not been published before */}
                {!wizard?.data.publishedVersion &&
                wizard?.data.draftVersion?.id === activeVersion.id ? (
                  <Button size="small" primary onClick={() => setModal('publish')}>
                    Publiser
                  </Button>
                ) : null}

                {/* The wizard that has been published before */}
                {wizard?.data.publishedVersion &&
                wizard?.data.draftVersion?.id === activeVersion.id ? (
                  <>
                    <Button size="small" primary onClick={() => setModal('publish')}>
                      Publiser endringer
                    </Button>

                    <Button warning size="small" onClick={() => setModal('delete-draft')}>
                      Slett utkast
                    </Button>
                  </>
                ) : null}
              </>
            ) : null}

            {!wizard?.data.draftVersion ? (
              <Button size="small" primary onClick={() => setModal('draft')}>
                Lag nytt utkast
              </Button>
            ) : null}

            <div {...bem('settings')}>
              <Dropdown
                icon="Settings2"
                direction="right"
                options={wizardOptions}
                label={'Valg for veiviser'}
                iconOnly
              />
            </div>
          </>
        )}
        {user && (
          <User
            name={user?.displayName || user?.email}
            options={[{ value: '', label: 'Logg ut', onClick: logout }]}
          />
        )}
      </nav>
    </header>
  )
}
