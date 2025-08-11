import RenameModal from './Rename'
import DeleteModal from './Delete'
import PublishModal from './Publish'
import DraftModal from './Draft'
import VersionsModal from './Versions'
import DeleteDraftModal from './DeleteDraft'
import EmbedModal from './Embed'
import { useParams } from 'react-router'
import MoveNodeModal from './MoveNode'

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
      <VersionsModal />
      <PublishModal />
      <EmbedModal />
      <MoveNodeModal />
    </>
  )
}
