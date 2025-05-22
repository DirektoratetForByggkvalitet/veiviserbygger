import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Form from '@/components/Form'
import Help from '@/components/Help'
import Modal from '@/components/Modal'
import { useModal } from '@/hooks/useModal'
import useWizard from '@/hooks/useWizard'
import { useMatch, useNavigate } from 'react-router'

export default function DeleteDraftModal() {
  const match = useMatch('/wizard/:wizardId/:versionId')
  const { wizard, deleteVersion } = useWizard(match?.params.wizardId, match?.params.versionId)
  const { modal, setModal } = useModal()
  const navigate = useNavigate()

  if (modal !== 'delete-draft') {
    return null
  }

  const deletionAllowed =
    wizard?.data.publishedVersion && match?.params.versionId === wizard?.data.draftVersion?.id

  const onClose = () => setModal()
  const handleDelete = async () => {
    if (!match?.params.versionId || !deletionAllowed) {
      return
    }

    await deleteVersion(match?.params.versionId)

    // Navigate to the published version of the wizard
    navigate(`/wizard/${match?.params.wizardId}/${wizard?.data.publishedVersion?.id || ''}`)

    // Close the modal
    onClose()
  }

  return (
    <Modal title="Slett utkast" expanded onClose={onClose}>
      <Help
        description={
          <>
            Du er i ferd med å slette utkastet på ny versjon av veiviseren. Dette{' '}
            <strong>kan ikke angres</strong>.
          </>
        }
      />

      <Form onSubmit={onClose}>
        <ButtonBar>
          <Button type="button" disabled={!deletionAllowed} onClick={handleDelete} warning>
            Slett utkastet
          </Button>

          <Button type="button" onClick={onClose}>
            Lukk
          </Button>
        </ButtonBar>
      </Form>
    </Modal>
  )
}
