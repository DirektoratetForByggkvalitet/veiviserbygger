import { useState } from 'react'
import useWizards from '@/hooks/useWizards'
import NewWizard from '@/components/NewWizard'
import WizardList from '@/components/WizardList'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

export default function Dashboard() {
  const { wizards } = useWizards(true)
  const [modal, setModal] = useState(false)
  const toggleModal = (value: boolean) => () => {
    setModal(value)
  }
  const draftWizards = wizards?.filter((wizard) => !wizard.data.publishedVersionId) ?? []
  const publisedWizards = wizards?.filter((wizard) => wizard.data.publishedVersionId) ?? []
  return (
    <div {...bem('')}>
      <NewWizard open={modal} toggleModal={toggleModal} />
      <section {...bem('section')}>
        <h2 {...bem('section-title')}>Utkast</h2>
        <WizardList wizards={draftWizards} toggleNewModal={toggleModal(true)} />
      </section>

      <section {...bem('section')}>
        <h2 {...bem('section-title')}>Publisert</h2>
        <WizardList wizards={publisedWizards} />
      </section>
    </div>
  )
}
