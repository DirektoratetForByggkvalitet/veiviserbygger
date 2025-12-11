import Help from '@/components/Help'
import NewWizard from '@/components/NewWizard'
import WizardList from '@/components/WizardList'
import useWizards from '@/hooks/useWizards'
import BEMHelper from '@/lib/bem'
import { copy } from '@/lib/copy'
import { useState } from 'react'
import Button from '../Button'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

export default function Dashboard() {
  const { wizards } = useWizards(true)
  const [modal, setModal] = useState(false)
  const toggleModal = (value: boolean) => () => {
    setModal(value)
  }
  const templates =
    wizards?.filter((wizard) => wizard.data.isTemplate && !wizard.data.publishedVersion?.id) ?? []
  const draftWizards =
    wizards?.filter((wizard) => !wizard.data.publishedVersion?.id && !wizard.data.isTemplate) ?? []
  const publisedWizards = wizards?.filter((wizard) => wizard.data.publishedVersion?.id) ?? []

  return (
    <div {...bem('')}>
      <NewWizard open={modal} toggleModal={toggleModal} />

      {publisedWizards.length > 0 && (
        <section {...bem('section')}>
          <h2 {...bem('section-title')}>Publisert</h2>
          <WizardList wizards={publisedWizards} large />
        </section>
      )}

      <section {...bem('section')}>
        <h2 {...bem('section-title')}>Maler</h2>
        <WizardList wizards={templates} large />
      </section>

      <section {...bem('section')}>
        <h2 {...bem('section-title')}>Utkast</h2>
        <WizardList wizards={draftWizards} large />
      </section>

      <section {...bem('section')}>
        <Button onClick={toggleModal(true)} icon="Plus">
          Ny veiviser
        </Button>

        <br />
        <br />

        <Help description={copy.dashboard.description} />
      </section>
    </div>
  )
}
