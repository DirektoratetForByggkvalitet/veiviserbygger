import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Help from '@/components/Help'
import Modal from '@/components/Modal'
import EmbedCode from '@/components/EmbedCode'
import { useModal } from '@/hooks/useModal'
import { useParams } from 'react-router'

export default function EmbedModal() {
  const { wizardId } = useParams()
  const { modal, setModal } = useModal()

  if (modal?.key !== 'embed') {
    return null
  }

  const onClose = () => setModal()

  return (
    <Modal title="Embed veiviser" expanded onClose={onClose}>
      <Help description="Nedenfor er koden du kan bruke for å bygge inn (embedde) veiviseren på ditt nettsted." />

      <EmbedCode
        value={`<!-- Wizard embed start --><div wizard-id="${wizardId}" host="${window.location.origin}"></div><script type="module" src="${window.location.origin}/embed.js"></script><!-- Wizard embed end -->`}
        label="Embed-kode"
      />

      <ButtonBar>
        <Button type="button" onClick={onClose}>
          Lukk
        </Button>
      </ButtonBar>
    </Modal>
  )
}
