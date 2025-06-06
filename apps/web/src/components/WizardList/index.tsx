import BEMHelper from '@/lib/bem'
import { NavLink } from 'react-router-dom'
import { Wizard, WrappedWithId } from 'types'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

interface Props {
  wizards?: WrappedWithId<Wizard>[]
  onLinkClick?: () => void
  large?: boolean
}

export default function WizardList({ wizards, large, onLinkClick }: Props) {
  return (
    <ul {...bem('', { large })}>
      {wizards?.map((wizard) => (
        <li key={wizard.id}>
          <NavLink
            to={`/wizard/${wizard.id}/${wizard.data.publishedVersion?.id || wizard.data.draftVersion?.id}`}
            className={({ isActive, isPending }) =>
              bem('item', { active: isActive || isPending }).className
            }
            onClick={onLinkClick}
          >
            <span {...bem('label')}>{wizard.data.title}</span>
            {!wizard.data.publishedVersion?.id ? (
              <span {...bem('tag')}>Utkast</span>
            ) : (
              <span {...bem('tag', 'public')}>Publisert</span>
            )}
          </NavLink>
        </li>
      ))}
      {(!wizards || wizards.length === 0) && (
        <li key="none">
          <span {...bem('item', 'placeholder')}>Ingen veivisere</span>
        </li>
      )}
    </ul>
  )
}
