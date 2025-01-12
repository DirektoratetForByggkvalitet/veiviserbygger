import { useEffect, useState } from 'react'
import Button from '../Button'
import Form from '../Form'
import Input from '../Input'
import Modal from '../Modal'
import { createWizard } from '@/services/firebase'
import useFirebase from '@/hooks/useFirebase'
import { useNavigate } from 'react-router'

type Props = {
  open: boolean
  toggleModal: (value: boolean) => () => void
}

const defaultState = { title: '' }

export default function NewWizard({ open, toggleModal }: Props) {
  const [newWizard, setNewWizard] = useState<{ title: string }>(defaultState)
  const navigate = useNavigate()
  const { firestore } = useFirebase()

  useEffect(
    () => () => {
      setNewWizard(defaultState)
    },
    [],
  )

  const close = () => {
    setNewWizard(defaultState)
    toggleModal(false)()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { id, versionId } = await createWizard(firestore, newWizard)

    toggleModal(false)()
    navigate(`/wizard/${id}/${versionId}`)
  }

  return (
    <Modal title="Ny veiviser" expanded={open} onClose={close} preventClickOutside>
      <Form onSubmit={handleSubmit}>
        <Input
          label="Tittel"
          value={newWizard?.title || ''}
          onChange={(title) => setNewWizard((v) => ({ ...v, title }))}
          autoFocus
        />

        <p>
          Navnet til veiviseren er synlig for sluttbrukere og bør være kort og beskrivende.
          Veiviseren vil bli synlig for andre i ditt arbeidsområde, men ikke publisert til
          sluttbrukere.
        </p>

        <Button type="submit" primary disabled={!newWizard.title}>
          Opprett
        </Button>
      </Form>
    </Modal>
  )
}
