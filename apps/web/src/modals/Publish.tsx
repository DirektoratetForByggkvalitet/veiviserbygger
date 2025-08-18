import { useEffect, useRef } from 'react'
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
import { useAtom } from 'jotai'
import validateStore from '@/store/validate'
import { keys } from 'lodash'
import { validate } from '@/services/firebase/utils/validator'
import Message from '@/components/Message'

export default function PublishModal() {
  const match = useMatch('/wizard/:wizardId/:versionId')
  const { version, nodes } = useWizard(match?.params.wizardId, match?.params.versionId)
  const { patchVersion, publishVersion, getVersionRef, getNodeRef } = useVersion()
  const [, setValidate] = useAtom(validateStore)
  const { modal, setModal } = useModal()
  const titleInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (modal?.key !== 'publish') return
    setValidate(true)
  }, [modal?.key])

  if (modal?.key !== 'publish') {
    return null
  }

  const onClose = () => setModal()
  const handlePublish = async () => {
    await publishVersion()
    onClose()
  }

  const validationResult =
    version && !version.publishedFrom
      ? validate(
          { ...version, doc: getVersionRef() },
          keys(nodes).map((id) => ({ ...nodes[id], doc: getNodeRef(id) })),
        )
      : []

  return (
    <Modal
      title="Publisér veiviser"
      expanded
      onClose={() => setModal()}
      afterOpen={() => titleInput && titleInput.current?.focus()}
    >
      {validationResult.length ? (
        <>
          <Message title="Valideringsfeil">
            Det er {validationResult.length} feil i veiviseren som må løses før den kan publiseres.
            Feilen er merket med gult i veiviseren.
          </Message>

          <ButtonBar>
            <Button type="button" onClick={onClose}>
              Lukk
            </Button>
          </ButtonBar>
        </>
      ) : null}

      {!validationResult.length ? (
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
      ) : null}
    </Modal>
  )
}
