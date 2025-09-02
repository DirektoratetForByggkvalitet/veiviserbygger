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
    <Modal title="Bygg inn veiviser" expanded onClose={onClose}>
      <EmbedCode
        value={`<!-- Wizard embed start --><div wizard-id="${wizardId}" host="${window.location.origin}"></div><script type="module" src="${window.location.origin}/embed.js"></script><!-- Wizard embed end -->`}
        label="Innbyggingskode"
      />
      <Help description="Ovenfor finner du koden du kan bruke for å bygge inn (embedde) veiviseren på nettstedet ditt." />
      <Help
        description={
          'For å legge den inn må du lime inn kodesnutten i et innholdsfelt som tillater HTML eller embed-kode. I DIBK sin Enonic legges det inn i malen "Wizard/veiviser". I andre CMS kan det hete ting som "Embed", "Custom HTML", "Code Block" eller direkte i en HTML-visning.'
        }
      />
      <Help description="Når du har lagt inn koden, vil den alltid vise den siste publiserte versjonen av veiviseren for dine besøkende. Publiserer man nye utkast i samme veiviser vil endringene dukke opp automatisk." />
    </Modal>
  )
}
