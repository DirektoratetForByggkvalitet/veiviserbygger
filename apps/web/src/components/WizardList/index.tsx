import { Link } from 'react-router-dom'
import Icon from '@/components/Icon'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { WrappedWithId, Wizard } from 'types'
const bem = BEMHelper(styles)

interface Props {
  wizards?: WrappedWithId<Wizard>[]
  toggleNewModal?: () => void
  onLinkClick?: () => void
  compact?: boolean
  selected?: string
}

export default function WizardList({
  wizards,
  toggleNewModal,
  compact,
  selected,
  onLinkClick,
}: Props) {
  return (
    <ul {...bem('', { compact })}>
      {wizards?.map((wizard) => (
        <li key={wizard.id}>
          <Link
            to={`/wizard/${wizard.id}/${wizard.data.publishedVersionId || wizard.data.draftVersionId}`}
            {...bem('item', { open: selected == wizard.id })}
            onClick={onLinkClick}
          >
            <span {...bem('label')}>{wizard.data.title}</span>
            {!wizard.data.publishedVersionId ? (
              <span {...bem('tag')}>Utkast</span>
            ) : (
              <span {...bem('tag', 'public')}>Publisert</span>
            )}
          </Link>
        </li>
      ))}
      {!wizards ||
        (wizards.length === 0 && (
          <li key="none">
            <span {...bem('item', 'placeholder')}>Ingen veivisere</span>
          </li>
        ))}

      {toggleNewModal && (
        <li>
          <button {...bem('item', 'new')} onClick={() => toggleNewModal()}>
            <Icon name="Plus" />
            <span {...bem('label')}>Ny veiviser</span>
          </button>
        </li>
      )}
    </ul>
  )
}
