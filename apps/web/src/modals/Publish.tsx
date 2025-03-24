import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Form from '@/components/Form'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import { useModal } from '@/hooks/useModal'
import { useVersion } from '@/hooks/useVersion'
import useWizard from '@/hooks/useWizard'
import { useMatch } from 'react-router'

export default function PatchModal() {
  const match = useMatch('/wizard/:wizardId/:versionId')
  const { version } = useWizard(match?.params.wizardId, match?.params.versionId)
  const { patchVersion, publishVersion } = useVersion()
  const { modal, setModal } = useModal()

  if (modal !== 'publish') {
    return null
  }

  const onClose = () => setModal()
  const handlePublish = async () => {
    await publishVersion()
    onClose()
  }

  return (
    <Modal title="Publisér veiviser" expanded onClose={() => setModal()}>
      <Form onSubmit={onClose}>
        <Input
          label="Tittel på versjonen"
          value={version?.title || ''}
          onChange={(v) => patchVersion({ title: v })}
        />

        <ButtonBar>
          <Button type="button" primary onClick={handlePublish}>
            Publisér
          </Button>

          <Button type="button" onClick={onClose}>
            Lukk
          </Button>
        </ButtonBar>
      </Form>
    </Modal>
  )
}
