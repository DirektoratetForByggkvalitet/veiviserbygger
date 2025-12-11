import { useParams } from 'react-router'
import DeleteModal from './Delete'
import DeleteDraftModal from './DeleteDraft'
import DraftModal from './Draft'
import DuplicateModal from './Duplicate'
import EmbedModal from './Embed'
import MoveNodeModal from './MoveNode'
import PublishModal from './Publish'
import RenameModal from './Rename'
import VersionsModal from './Versions'

export default function Modals() {
  const { wizardId = '', versionId = '' } = useParams()

  if (!wizardId || !versionId) {
    return null
  }

  return (
    <>
      <RenameModal />
      <DeleteModal />
      <DuplicateModal />
      <DeleteDraftModal />
      <DraftModal />
      <VersionsModal />
      <PublishModal />
      <EmbedModal />
      <MoveNodeModal />
    </>
  )
}
