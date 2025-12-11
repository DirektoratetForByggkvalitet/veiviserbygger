import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Checkbox from '@/components/Checkbox'
import Help from '@/components/Help'
import Modal from '@/components/Modal'
import { useModal } from '@/hooks/useModal'
import useWizard from '@/hooks/useWizard'
import { useParams } from 'react-router'

export default function MakeTemplateModal() {
  const { wizardId = '', versionId = '' } = useParams()
  const { wizard, patchWizard } = useWizard(wizardId, versionId)
  const { modal, setModal } = useModal()

  if (modal?.key !== 'make-template') {
    return null
  }

  const onClose = () => setModal()

  return (
    <Modal title="Merk som mal" expanded onClose={onClose}>
      <Help description="Ved å merke som mal kan du gjenbruke denne veiviseren som en mal for fremtidige prosjekter. Maler kan ikke publiseres." />
      <Checkbox
        label="Merk veiviseren som en mal"
        checked={wizard?.data.isTemplate || false}
        onChange={(v) => patchWizard({ isTemplate: v })}
        toggle
        // forceAllowEdit
      />
      <ButtonBar>
        <Button type="button" onClick={onClose}>
          Lukk
        </Button>
      </ButtonBar>
    </Modal>
  )
}
