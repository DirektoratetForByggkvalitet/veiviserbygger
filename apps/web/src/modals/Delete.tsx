import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Form from '@/components/Form'
import Help from '@/components/Help'
import Modal from '@/components/Modal'
import { useModal } from '@/hooks/useModal'
import useWizard from '@/hooks/useWizard'
import { useMatch, useNavigate } from 'react-router'

export default function DeleteModal() {
  const match = useMatch('/wizard/:wizardId/:versionId')
  const { wizard, deleteWizard } = useWizard(match?.params.wizardId, match?.params.versionId)
  const { modal, setModal } = useModal()
  const navigate = useNavigate()

  if (modal !== 'delete') {
    return null
  }

  const deletionAllowed = !wizard?.data.publishedVersionId

  const onClose = () => setModal()
  const handleDelete = async () => {
    if (!deletionAllowed) {
      return
    }

    await deleteWizard()

    // Navigate to the root page
    navigate('/')

    // Close the modal
    onClose()
  }

  return (
    <Modal title="Slett veiviser" expanded onClose={onClose}>
      <Help
        description={
          <>
            Du er i ferd med å slette veiviseren. Dette <strong>kan ikke angres</strong>.
          </>
        }
      />

      <Form onSubmit={onClose}>
        <ButtonBar>
          <Button type="button" disabled={!deletionAllowed} onClick={handleDelete} warning>
            Slett veiviseren
          </Button>

          <Button type="button" onClick={onClose}>
            Lukk
          </Button>
        </ButtonBar>
      </Form>
    </Modal>
  )
}
