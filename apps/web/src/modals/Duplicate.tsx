import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Form from '@/components/Form'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import { useModal } from '@/hooks/useModal'
import useWizard from '@/hooks/useWizard'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'

export default function DuplicateModal() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(false)
  const [name, setName] = useState<string | undefined>(undefined)
  const { wizardId = '', versionId = '' } = useParams()
  const { wizard, duplicateWizard } = useWizard(wizardId, versionId)
  const { modal, setModal } = useModal()

  if (modal?.key !== 'duplicate') {
    return null
  }

  const onClose = () => setModal()

  const title = wizard?.data.title + ' (kopi)' || ''

  const handleDuplicate = async () => {
    setLoading(true)
    const { id, versionId } = await duplicateWizard(name || title)

    if (id) {
      navigate(`/wizard/${id}/${versionId}`)
    } else {
      navigate('/')
    }

    onClose()
    setLoading(false)
  }

  return (
    <Modal title="Dupliser veiviser" expanded onClose={onClose}>
      <Form onSubmit={onClose}>
        <Input label="Navn" value={name || title} onChange={setName} forceAllowEdit />

        <ButtonBar>
          <Button type="button" onClick={handleDuplicate} primary loading={loading}>
            Dupliser
          </Button>
          <Button type="button" onClick={onClose}>
            Avbryt
          </Button>
        </ButtonBar>
      </Form>
    </Modal>
  )
}
