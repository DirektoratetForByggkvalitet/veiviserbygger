import { useState } from 'react'
import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Form from '@/components/Form'
import Help from '@/components/Help'
import Modal from '@/components/Modal'
import Message from '@/components/Message'
import { useModal } from '@/hooks/useModal'
import useWizard from '@/hooks/useWizard'
import { useMatch, useNavigate } from 'react-router'

export default function DeleteDraftModal() {
  const match = useMatch('/wizard/:wizardId/:versionId')
  const { wizard, versions, deleteVersion } = useWizard(
    match?.params.wizardId,
    match?.params.versionId,
  )
  const { modal, setModal } = useModal()
  const [deletionInProgress, setDeletionInProgress] = useState(false)
  const navigate = useNavigate()

  if (modal?.key !== 'delete-draft') {
    return null
  }

  const activeVersion = versions?.find((version) => version.id === match?.params.versionId)
  const deletionAllowed = Boolean(
    wizard?.data.publishedVersion &&
      match?.params.versionId &&
      activeVersion &&
      !activeVersion.publishedFrom,
  )

  const onClose = () => setModal()
  const handleDelete = async () => {
    if (!match?.params.versionId || !deletionAllowed) {
      return
    }
    // Prevent error message flickering on modal animate out
    setDeletionInProgress(true)

    // Delete the draft version
    await deleteVersion(match?.params.versionId)

    // Navigate to the published version of the wizard
    navigate(`/wizard/${match?.params.wizardId}/${wizard?.data.publishedVersion?.id || ''}`)

    // Close the modal
    onClose()
  }

  return (
    <Modal title="Slett siste utkast" expanded onClose={onClose}>
      <Help
        description={
          <>
            Du er i ferd med å slette det siste utkastet av veiviseren. Dette{' '}
            <strong>kan ikke angres</strong>. Dette vil ikke påvirke den siste publiserte versjonen
            av veiviseren.
          </>
        }
      />
      {!deletionAllowed && !deletionInProgress ? (
        <Message title="Versjonen kan ikke slettes">
          Prøv å lukk nettleseren og åpne veiviseren på ny.
        </Message>
      ) : null}
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
