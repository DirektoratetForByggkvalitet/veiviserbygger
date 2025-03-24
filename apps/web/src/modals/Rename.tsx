import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Form from '@/components/Form'
import Help from '@/components/Help'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import { useModal } from '@/hooks/useModal'
import useWizard from '@/hooks/useWizard'
import { useMatch } from 'react-router'

export default function RenameModal() {
  const match = useMatch('/wizard/:wizardId/:versionId')
  const { wizard, patchWizard } = useWizard(match?.params.wizardId, match?.params.versionId)
  const { modal, setModal } = useModal()

  if (modal !== 'rename') {
    return null
  }

  const onClose = () => setModal()

  return (
    <Modal title="Endre navn" expanded onClose={onClose}>
      <Help description="Endringen lagres løpende mens du skriver." />

      <Form onSubmit={onClose}>
        <Input
          label="Navn"
          value={wizard?.data.title || ''}
          onChange={(v) => patchWizard({ title: v })}
        />

        <ButtonBar>
          <Button type="button" onClick={onClose}>
            Lukk
          </Button>
        </ButtonBar>
      </Form>
    </Modal>
  )
}
