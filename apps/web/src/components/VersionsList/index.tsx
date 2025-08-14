import BEMHelper from '@/lib/bem'
import { NavLink } from 'react-router-dom'
import { useModal } from '@/hooks/useModal'
import Button from '@/components/Button'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import { Timestamp } from 'firebase/firestore'
import { getVersionTitle, getVersionState, getVersionDate } from '@/lib/versions'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

interface Props {
  versions?: { id: string; title?: string; publishedFrom?: Timestamp; publishedTo?: Timestamp }[]
  wizardId?: string
  activeId?: string
  onLinkClick?: () => void
}

export default function VersionsList({ versions, wizardId, activeId, onLinkClick }: Props) {
  const { setModal } = useModal()
  const activeDraftOptions = [
    { group: 'Utkast' },
    {
      value: '4',
      label: 'Slett dette utkastet',
      styled: 'delete',
      onClick: () => setModal({ key: 'delete-draft' }),
    },
  ] as DropdownOptions
  const noDraftVersion = versions && versions[0].publishedFrom !== undefined

  return (
    <ul {...bem('')}>
      {versions?.map((v, i) => (
        <li key={v.id} {...bem('list-item')}>
          <NavLink
            to={`/wizard/${wizardId}/${v.id}`}
            {...bem('item', {
              active: v.id === activeId,
              'options-right': versions?.length > 1 && !v.publishedFrom && v.id === activeId,
            })}
            onClick={onLinkClick}
          >
            <div {...bem('header')}>
              <span {...bem('label')}>{getVersionTitle(v, (versions?.length || 0) - i)}</span>
              <span {...bem('date')}>{getVersionDate(v)}</span>
              {v.publishedFrom && !v.publishedTo && (
                <span {...bem('tag', 'public')}>{getVersionState(v)}</span>
              )}
              {v.publishedFrom && v.publishedTo && (
                <span {...bem('tag', 'pre-public')}>{getVersionState(v)}</span>
              )}
              {!v.publishedFrom && <span {...bem('tag')}>{getVersionState(v)}</span>}
            </div>
            {v.title && <div {...bem('description')}>{v.title}</div>}
          </NavLink>
          {versions?.length > 1 && !v.publishedFrom && v.id === activeId && (
            <span {...bem('options')}>
              <Dropdown
                iconOnly
                icon="Ellipsis"
                direction="left"
                options={activeDraftOptions}
                label="Handlinger"
              />
            </span>
          )}
        </li>
      ))}
      {noDraftVersion ? (
        <li key="new">
          <Button icon="Plus" size="small" onClick={() => setModal({ key: 'draft' })}>
            Lag nytt utkast
          </Button>
        </li>
      ) : null}
    </ul>
  )
}
