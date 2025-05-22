import RenameModal from './Rename'
import DeleteModal from './Delete'
import PublishModal from './Publish'
import DraftModal from './Draft'
import DeleteDraftModal from './DeleteDraft'
import { useParams } from 'react-router'

export default function Modals() {
  const { wizardId = '', versionId = '' } = useParams()

  if (!wizardId || !versionId) {
    return null
  }

  return (
    <>
      <RenameModal />
      <DeleteModal />
      <DeleteDraftModal />
      <DraftModal />
      <PublishModal />
    </>
  )
}
