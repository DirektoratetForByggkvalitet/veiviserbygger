import RenameModal from './Rename'
import DeleteModal from './Delete'
import PublishModal from './Publish'
import DraftModal from './Draft'
import DeleteDraftModal from './DeleteDraft'

export default function Modals() {
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
