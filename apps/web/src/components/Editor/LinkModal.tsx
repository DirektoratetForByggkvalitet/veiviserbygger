import { Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'

import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Checkbox from '@/components/Checkbox'
import Form from '@/components/Form'
import Input from '@/components/Input'
import Modal from '@/components/Modal'

interface Props {
  editor: Editor
  open: boolean
  onClose: () => void
}

function normalizeUrl(url: string) {
  const trimmed = url.trim()

  if (!trimmed) {
    return ''
  }

  if (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(trimmed)) {
    return trimmed
  }

  return `https://${trimmed}`
}

export default function LinkModal({ editor, open, onClose }: Props) {
  const [url, setUrl] = useState('')
  const [newTab, setNewTab] = useState(true)
  const urlInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      const attrs = editor.getAttributes('link')

      setUrl(attrs.href || '')
      setNewTab(attrs.target ? attrs.target === '_blank' : true)
    }
  }, [open, editor])

  const handleSave = (event: { preventDefault: () => void }) => {
    event.preventDefault()

    const normalized = normalizeUrl(url)

    if (!normalized) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: normalized, target: newTab ? '_blank' : null })
        .run()
    }

    onClose()
  }

  const handleRemove = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    onClose()
  }

  return (
    <Modal
      title="Legg til lenke"
      expanded={open}
      onClose={onClose}
      afterOpen={() => urlInput.current?.focus()}
    >
      <Form onSubmit={handleSave}>
        <Input
          label="URL"
          placeholder="https://..."
          value={url}
          onChange={(v) => setUrl(v || '')}
          forwardedRef={urlInput}
        />

        <Checkbox label="Åpne i ny fane" checked={newTab} onChange={setNewTab} />

        <ButtonBar>
          <Button type="submit" primary>
            {editor.isActive('link') ? 'Lagre endringer' : 'Legg til'}
          </Button>
          {editor.isActive('link') && (
            <Button type="button" subtle onClick={handleRemove}>
              Fjern lenke
            </Button>
          )}
        </ButtonBar>
      </Form>
    </Modal>
  )
}
