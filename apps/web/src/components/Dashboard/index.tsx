import { useState } from 'react'
import useWizards from '@/hooks/useWizards'
import NewWizard from '@/components/NewWizard'
import WizardList from '@/components/WizardList'
import Help from '@/components/Help'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

export default function Dashboard() {
  const { wizards } = useWizards(true)
  const [modal, setModal] = useState(false)
  const toggleModal = (value: boolean) => () => {
    setModal(value)
  }
  const draftWizards = wizards?.filter((wizard) => !wizard.data.publishedVersion?.id) ?? []
  const publisedWizards = wizards?.filter((wizard) => wizard.data.publishedVersion?.id) ?? []
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

      <section {...bem('section')}>
        <h2 {...bem('section-title')}>Hjelp</h2>
        <Help
          description='Dette verktøyet lar deg opprette og redigere veivisere for nettstedet dibk.no. Du kan
          definere spørsmål, sette opp svarlogikk og bestemme hvilke resultater brukerne skal få
          basert på sine valg. Når en veiviser er klar for publisering, må den legges inn i Enonic
          ved hjelp av blokken "Veiviser" for å bli synlig på nettsiden.'
        />
      </section>
    </div>
  )
}
