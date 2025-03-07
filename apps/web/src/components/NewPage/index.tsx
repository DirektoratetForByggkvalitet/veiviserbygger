import { useEffect, useState, useRef } from 'react'
import Button from '../Button'
import Form from '../Form'
import Input from '../Input'
import Modal from '../Modal'
import Checkbox from '../Checkbox'
import Message from '../Message'
import { createPage } from '@/services/firebase'
import useFirebase from '@/hooks/useFirebase'
import { useParams } from 'react-router'
import { WizardPage } from 'types'

type Props = {
  open: boolean
  closeModal: () => void
}

const defaultState: Partial<WizardPage> = { heading: '', type: 'Page' }

export default function NewPage({ open, closeModal }: Props) {
  const { wizardId, versionId } = useParams()
  const [newPage, setNewPage] = useState<Partial<WizardPage>>(defaultState)
  const { firestore } = useFirebase()
  const titleInput = useRef<HTMLElement>(null)

  useEffect(
    () => () => {
      setNewPage(defaultState)
    },
    [],
  )

  const close = () => {
    setNewPage(defaultState)
    closeModal()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!wizardId || !versionId) {
      return
    }

    await createPage({ db: firestore, wizardId, versionId }, newPage)

    close()
  }

  if (!wizardId || !versionId) {
    return (
      <Modal title="Ny side" expanded={open} onClose={close} preventClickOutside>
        <Message title="En feil oppsto">
          Fant ikke <code>wizardId</code> eller <code>versionId</code>.
        </Message>
      </Modal>
    )
  }

  return (
    <Modal
      title="Ny side"
      expanded={open}
      onClose={close}
      afterOpen={() => titleInput && titleInput.current?.focus()}
    >
      <Form onSubmit={handleSubmit}>
        <Input
          label="Overskrift"
          value={newPage?.heading || ''}
          onChange={(heading) => setNewPage((v) => ({ ...v, heading }))}
          forwardedRef={titleInput}
        />
        <Checkbox
          toggle
          label="Resultatside"
          checked={newPage?.type === 'Result'}
          onChange={() =>
            setNewPage((v) => ({ ...v, type: newPage?.type === 'Result' ? 'Page' : 'Result' }))
          }
        />
        <Button type="submit" primary disabled={!newPage.heading}>
          Opprett
        </Button>
      </Form>
    </Modal>
  )
}
