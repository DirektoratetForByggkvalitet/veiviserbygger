import { useAtom } from 'jotai'

import menuState from '@/store/menu'

import Button from '@/components/Button'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import Icon, { IconMenu } from '@/components/Icon'
import User from '@/components/User'
import useAuth from '@/hooks/auth'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { useNavigate, useParams } from 'react-router'
import { Wizard, WrappedWithId } from 'types'
import { Timestamp } from 'firebase/firestore'
import { siteName } from '@/constants'
import { useModal } from '@/hooks/useModal'
import { EditableContext } from '@/context/EditableContext'
import { useEditable } from '@/hooks/useEditable'
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
                options={[{ value: '', label: 'Logg ut', onClick: logout }]}
              />
            </nav>
          )}
        </div>
      </header>
    )
  }

  const { versionId } = useParams()
  const { wizardId } = useParams()
  const navigate = useNavigate()
  const [open, setOpen] = useAtom(menuState)
  const { setModal } = useModal()
  const isEditable = useEditable()
  const activeVersion = versions?.find((v) => v.id === versionId)
  const activeVersionIndex = versions?.findIndex((v) => v.id === versionId) || 0
  const wizardIsPublished = activeVersion && !isEditable

  const toggleMenu = () => {
    setOpen(!open)
  }

  const getVersionTitle = (
    v: { title?: string; publishedFrom?: Timestamp; publishedTo?: Timestamp },
    index: number,
  ) => {
    return v.title
      ? `${index}. ${v.title}`
      : `${index}. ${v.publishedFrom && !v.publishedTo ? 'Publisert' : ''}${!v.publishedFrom ? 'Siste utkast' : ''}`
  }

  const versionOptions = [
    { group: 'Versjoner' },
    ...(versions || []).map((v, i) => ({
      label: getVersionTitle(v, i + 1),
      value: v.id,
      disabled: v.id === versionId,
      onClick: () => navigate(`/wizard/${wizardId}/${v.id}`),
    })),
    ...(wizard?.data.publishedVersion && wizard?.data.draftVersion?.id === activeVersion?.id
      ? [
          { group: 'Utkast' },
          {
            value: '4',
            label: 'Slett dette utkastet',
            styled: 'delete',
            onClick: () => setModal('delete-draft'),
          },
        ]
      : []),
  ] as DropdownOptions

  const wizardOptions = [
    { group: 'Veiviser' },
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
    <header {...bem('', { open, 'show-message': wizardIsPublished })}>
      <div {...bem('wrapper')}>
        <button type="button" {...bem('toggle')} aria-label="Meny" onClick={toggleMenu}>
          <IconMenu />
        </button>

        <h1 {...bem('name')}>{title} </h1>
        <EditableContext.Provider value={true}>
          <nav {...bem('actions')}>
            {activeVersion && (
              <>
                <Dropdown
                  simple
                  direction="right"
                  options={versionOptions}
                  hideLabel
                  label={
                    activeVersion
                      ? getVersionTitle(activeVersion, activeVersionIndex + 1)
                      : 'Versjon mangler'
                  }
                />
                <Button size="small" to={`/wizard/${wizardId}/${versionId}/preview`}>
                  Forhåndsvisning
                </Button>

                {/* The user is on the draft version */}
                {wizard?.data.draftVersion?.id === activeVersion.id ? (
                  <Button size="small" primary onClick={() => setModal('publish')}>
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
                options={[{ value: '', label: 'Logg ut', onClick: logout }]}
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
            <Button size="small" primary to={`/wizard/${wizardId}/${wizard.data.draftVersion.id}`}>
              Gå til utkast
            </Button>
          ) : null}
          {/* No draft exist, so the user can create a new one */}
          {!wizard?.data.draftVersion ? (
            <Button size="small" primary onClick={() => setModal('draft')}>
              Lag nytt utkast
            </Button>
          ) : null}
        </div>
      )}
    </header>
  )
}
