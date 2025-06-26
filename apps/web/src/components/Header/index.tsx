import menuState from '@/store/menu'
import { useAtom } from 'jotai'

import Button from '@/components/Button'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import Icon, { IconMenu } from '@/components/Icon'
import User from '@/components/User'
import { siteName } from '@/constants'
import { EditableContext } from '@/context/EditableContext'
import useAuth from '@/hooks/auth'
import { useEditable } from '@/hooks/useEditable'
import { useModal } from '@/hooks/useModal'
import BEMHelper from '@/lib/bem'
import { Timestamp } from 'firebase/firestore'
import { useParams } from 'react-router'
import { getVersionTitle } from '@/lib/versions'
import { Wizard, WrappedWithId } from 'types'
import styles from './Styles.module.scss'
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
        <div {...bem('wrapper')}>
          <img src="/header-logo.svg" alt={title} {...bem('logo')} />
          <h1 {...bem('name')}>{title}</h1>

          {user && (
            <nav {...bem('actions')}>
              <User
                name={user?.displayName || user?.email}
                options={[{ value: '', icon: 'LogOut', label: 'Logg ut', onClick: logout }]}
              />
            </nav>
          )}
        </div>
      </header>
    )
  }

  const { versionId } = useParams()
  const { wizardId } = useParams()
  const [open, setOpen] = useAtom(menuState)
  const { setModal } = useModal()
  const isEditable = useEditable()
  const activeVersion = versions?.find((v) => v.id === versionId)
  const activeVersionIndex = versions?.findIndex((v) => v.id === versionId) || 0
  const wizardIsPublished = activeVersion && !isEditable

  const toggleMenu = () => {
    setOpen(!open)
  }

  const wizardOptions = [
    { group: 'Veiviser' },
    {
      value: '1',
      icon: 'Pencil',
      label: 'Endre navn',
      onClick: () => setModal('rename'),
    } /*
    {
      value: '2',
      icon: 'Copy',
      label: 'Dupliser veiviseren',
      onClick: () => console.log('Åpne en modal med bekreftelse."'),
      disabled: true,
    },*/,
    {
      value: '3',
      icon: 'Trash',
      label: 'Slett veiviseren',
      styled: 'delete',
      disabled: !!wizard?.data.publishedVersion?.id,
      onClick: () => setModal('delete'),
    },
  ] as DropdownOptions

  return (
    <header {...bem('', { open, 'show-message': wizardIsPublished })}>
      <div {...bem('wrapper')}>
        <button type="button" {...bem('toggle')} aria-label="Meny" onClick={toggleMenu}>
          <IconMenu />
        </button>

        <h1 {...bem('name')}>{title}</h1>
        <EditableContext.Provider value={true}>
          <nav {...bem('actions')}>
            {activeVersion && (
              <>
                <Button size="small" subtle icon="Calendar" onClick={() => setModal('versions')}>
                  {activeVersion
                    ? getVersionTitle(
                        activeVersion,
                        (versions?.length || 0) - activeVersionIndex,
                        'short',
                      )
                    : 'Versjon mangler'}
                </Button>
                <Button
                  size="small"
                  iconOnlyOnMobile="SendHorizontal"
                  to={`/wizard/${wizardId}/${versionId}/preview`}
                >
                  {/* The user is on the draft version */}
                  Forhåndsvisning
                </Button>

                {/* The user is on the draft version */}
                {wizard?.data.draftVersion?.id === activeVersion.id ? (
                  <Button
                    size="small"
                    iconOnlyOnMobile="CloudUpload"
                    primary
                    onClick={() => setModal('publish')}
                  >
                    Publiser
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
                options={[{ value: '', icon: 'LogOut', label: 'Logg ut', onClick: logout }]}
              />
            )}
          </nav>
        </EditableContext.Provider>
      </div>
      {wizardIsPublished && (
        <div {...bem('message')}>
          <span {...bem('message-title')}>
            <Icon name="Info" /> Denne versjonen er publisert og kan ikke endres direkte.
          </span>
          {/* A draft exist, but the user is on a different version */}
          {wizard?.data.draftVersion?.id !== activeVersion.id && wizard?.data.draftVersion ? (
            <Button
              size="small"
              iconOnlyOnMobile="Pencil"
              primary
              to={`/wizard/${wizardId}/${wizard.data.draftVersion.id}`}
            >
              Gå til siste utkast
            </Button>
          ) : null}
          {/* No draft exist, so the user can create a new one */}
          {!wizard?.data.draftVersion ? (
            <Button
              size="small"
              iconOnlyOnMobile="Pencil"
              primary
              onClick={() => setModal('draft')}
            >
              Lag nytt utkast
            </Button>
          ) : null}
        </div>
      )}
    </header>
  )
}
