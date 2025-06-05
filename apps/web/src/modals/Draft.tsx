import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Dropdown from '@/components/Dropdown'
import Form from '@/components/Form'
import Modal from '@/components/Modal'
import Help from '@/components/Help'
import { useModal } from '@/hooks/useModal'
import { useVersion } from '@/hooks/useVersion'
import useWizard from '@/hooks/useWizard'
import { EditableContext } from '@/context/EditableContext'
import { useState } from 'react'
import { useMatch, useNavigate } from 'react-router'

export default function DraftModal() {
  const match = useMatch('/wizard/:wizardId/:versionId')
  const { loading, wizard, versions } = useWizard(match?.params.wizardId, match?.params.versionId)
  const { modal, setModal } = useModal()
  const { createDraftVersion } = useVersion()
  const [baseOn, setBaseOn] = useState<string>()
  const navigate = useNavigate()

  if (modal !== 'draft' || loading) {
    return null
  }

  const handlePublish = async () => {
    const draftVersionId = await createDraftVersion(baseOn === 'from-scratch' ? undefined : baseOn)
    onClose()
    navigate(`/wizard/${match?.params.wizardId}/${draftVersionId}`)
  }

  const onClose = () => {
    setModal()
    setBaseOn(undefined)
  }

  const publishedVersion = versions?.find?.((v) => v.id === wizard?.data.publishedVersion?.id)

  return (
    <EditableContext.Provider value={true}>
      <Modal title="Lag nytt utkast" expanded onClose={() => setModal()}>
        <Form onSubmit={onClose}>
          <Dropdown
            label="Lag et utkast fra versjon"
            placeholder="Velg utgangspunkt"
            value={baseOn}
            onChange={setBaseOn}
            options={[
              ...(publishedVersion
                ? [
                    {
                      value: publishedVersion.id,
                      label: `Siste publiserte versjon (${publishedVersion.title || 'Uten navn'})`,
                    },
                  ]
                : []),
              { value: 'from-scratch', label: 'Jeg vil starte fra scratch' },
            ]}
          />
          <Help description="Det nye utkastet tar utgangspunkt i den valgte versjon, som regel er det siste publiserte versjon. Du kan jobbe videre med innholdet derfra, uten at dette påvirker den versjonen som er publisert. Hvis du publiserer et utkast med endringer vil dette erstatte dagens publiserte versjon." />
          <ButtonBar>
            <Button type="button" primary onClick={handlePublish} disabled={!baseOn}>
              Lag utkast
            </Button>

            <Button type="button" onClick={onClose}>
              Lukk
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </EditableContext.Provider>
  )
}
