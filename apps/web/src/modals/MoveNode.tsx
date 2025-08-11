import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Modal from '@/components/Modal'
import { useModal } from '@/hooks/useModal'
import { useMatch } from 'react-router'
import useWizard from '@/hooks/useWizard'
import { getOrdered } from 'shared/utils'
import { useVersion } from '@/hooks/useVersion'
import Message from '@/components/Message'

export default function MoveNodeModal() {
  const match = useMatch('/wizard/:wizardId/:versionId')
  const { loading, version } = useWizard(match?.params.wizardId, match?.params.versionId)
  const { moveNode } = useVersion()

  const { modal, setModal } = useModal()

  if (loading || modal?.key !== 'move-node') {
    return null
  }

  const onClose = () => setModal()

  const handleMove = (pageId: string) => async () => {
    await moveNode(modal.data.nodeId, pageId)
    onClose()
  }

  // get the page where the node is currently located
  const currentPageId = getOrdered(version?.pages)?.find((page) =>
    getOrdered(page.content).some((node) => node.node.id === modal.data.nodeId),
  )?.id

  // get all pages except the one where the node is currently located
  const possiblePages = getOrdered(version?.pages).filter((p) => p.id !== currentPageId)

  return (
    <Modal title="Flytt node" expanded onClose={onClose}>
      {possiblePages.length ? (
        <>
          Velg siden du vil flytte noden til.
          <ButtonBar>
            {possiblePages.map((page) => (
              <Button key={page.id} onClick={handleMove(page.id)}>
                {page.heading}
              </Button>
            ))}
          </ButtonBar>
        </>
      ) : (
        <Message title="Det er ingen andre sider å flytte til">
          <p>
            Du kan ikke flytte noden til en annen side, fordi det ikke finnes andre sider i denne
            veiviseren.
          </p>
        </Message>
      )}

      <ButtonBar>
        <Button type="button" onClick={onClose}>
          Lukk
        </Button>
      </ButtonBar>
    </Modal>
  )
}
