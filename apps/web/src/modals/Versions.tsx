import Help from '@/components/Help'
import Modal from '@/components/Modal'
import VersionsList from '@/components/VersionsList'
import { useModal } from '@/hooks/useModal'
import useWizard from '@/hooks/useWizard'
import { useParams } from 'react-router'

export default function VersionsModal() {
  const { versionId } = useParams()
  const { wizardId } = useParams()
  const { versions } = useWizard(wizardId, versionId)
  const { modal, setModal } = useModal()

  if (modal?.key !== 'versions') {
    return null
  }

  const onClose = () => setModal()

  return (
    <Modal title="Velg versjon" expanded onClose={onClose}>
      <VersionsList
        versions={versions}
        wizardId={wizardId}
        activeId={versionId}
        onLinkClick={onClose}
      />
      <Help description="En veiviser kan ha flere versjoner av innholdet. Etter at man har publisert en veiviser første gangen kan man opprette et nytt utkast. Når utkastet blir publisert vil det bli en ny versjon." />
    </Modal>
  )
}
