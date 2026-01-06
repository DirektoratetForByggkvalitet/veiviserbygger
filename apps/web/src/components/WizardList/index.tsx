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
      {wizards?.map((wizard) => {
        const tag = getTag(wizard)
        return (
          <li key={wizard.id}>
            <NavLink
              to={`/wizard/${wizard.id}/${wizard.data.publishedVersion?.id || wizard.data.draftVersion?.id}`}
              className={({ isActive, isPending }) =>
                bem('item', {
                  active: isActive || isPending,
                }).className
              }
              onClick={onLinkClick}
            >
              <span {...bem('label')}>{wizard.data.title || 'Uten tittel'}</span>
              <span {...bem('tag', tag.type)}>{tag.label}</span>
            </NavLink>
          </li>
        )
      })}
      {(!wizards || wizards.length === 0) && (
        <li key="none">
          <span {...bem('item', 'placeholder')}>Ingen veivisere</span>
        </li>
      )}
    </ul>
  )
}

function getTag(wizard: WrappedWithId<Wizard>): {
  label: string
  type: 'template' | 'draft' | 'public'
} {
  if (wizard.data.publishedVersion?.id) {
    return { label: 'Publisert', type: 'public' }
  }
  if (wizard.data.isTemplate) {
    return { label: 'Mal', type: 'template' }
  }

  return { label: 'Utkast', type: 'draft' }
}
