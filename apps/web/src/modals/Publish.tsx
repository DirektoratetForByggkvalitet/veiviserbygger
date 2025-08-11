import { useRef } from 'react'
import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Form from '@/components/Form'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import Help from '@/components/Help'
import { useModal } from '@/hooks/useModal'
import { useVersion } from '@/hooks/useVersion'
import useWizard from '@/hooks/useWizard'
import { useMatch } from 'react-router'

export default function PatchModal() {
  const match = useMatch('/wizard/:wizardId/:versionId')
  const { version } = useWizard(match?.params.wizardId, match?.params.versionId)
  const { patchVersion, publishVersion } = useVersion()
  const { modal, setModal } = useModal()
  const titleInput = useRef<HTMLInputElement>(null)

  if (modal?.key !== 'publish') {
    return null
  }

  const onClose = () => setModal()
  const handlePublish = async () => {
    await publishVersion()
    onClose()
  }

  return (
    <Modal
      title="Publisér veiviser"
      expanded
      onClose={() => setModal()}
      afterOpen={() => titleInput && titleInput.current?.focus()}
    >
      <Form onSubmit={onClose}>
        <Input
          label="Beskrivelse av versjonen"
          value={version?.title || ''}
          onChange={(v) => patchVersion({ title: v })}
          forwardedRef={titleInput}
        />

        <ButtonBar margins>
          <Button type="button" icon="CloudUpload" primary onClick={handlePublish}>
            Publisér
          </Button>

          <Button type="button" onClick={onClose}>
            Lukk
          </Button>
        </ButtonBar>
        <Help description="Når du publiserer en veiviser vil den kunne bli tilgjengelig for besøkende der veiviseren er innebygget. Publiserer man et utkast vil det erstatte tidligere publiserte versjoner. Beskrivelsen er kun til bruk internt for å skille endringer i en versjon fra en annen." />
      </Form>
    </Modal>
  )
}
