import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Editor from '@/components/Editor'
import Help from '@/components/Help'
import Input from '@/components/Input'
import Form from '@/components/Form'
import Modal from '@/components/Modal'
import { useState } from 'react'

import { useEditable } from '@/hooks/useEditable'
import { useVersion } from '@/hooks/useVersion'
import { unset } from '@/lib/merge'
import { trimText } from 'shared/utils'
import ErrorWrapper from '../../ErrorWrapper'

export default function AccordionFields({
  node,
  getNodeRef,
  patchNode,
}: {
  node: { id: string; summary?: string; details?: string }
  getNodeRef: ReturnType<typeof useVersion>['getNodeRef']
  patchNode: ReturnType<typeof useVersion>['patchNode']
}) {
  const isEditable = useEditable()
  const [expanded, setExpanded] = useState(false)
  const [showMissingSummaryError, setShowMissingSummaryError] = useState(false)

  const missingSummary = !!trimText(node.details) && !node.summary

  const closeModal = () => {
    // read-only users can't fix the error, so don't trap them in the modal
    if (isEditable && missingSummary) {
      setShowMissingSummaryError(true)
      return
    }

    setShowMissingSummaryError(false)
    setExpanded(false)
  }

  const deleteAccordion = (nodeId: string) => {
    patchNode(nodeId, { summary: unset, details: unset })
    setShowMissingSummaryError(false)
    setExpanded(false)
  }

  return (
    <>
      {/* surface validation errors outside the modal, since they block publishing */}
      <ErrorWrapper slice={['summary']}>
        <Button
          type="button"
          list
          size="small"
          icon="MessageSquareText"
          onClick={() => setExpanded(true)}
        >
          Faktaboks
        </Button>
      </ErrorWrapper>
      <Modal title="Faktaboks" expanded={expanded} onClose={closeModal}>
        <Form.Presentational marginBottom>
          <ErrorWrapper
            slice={['summary']}
            messages={
              showMissingSummaryError && missingSummary
                ? [
                    'Faktaboksen trenger en tittel for å kunne vises. Legg til en tittel eller fjern faktaboksen.',
                  ]
                : undefined
            }
          >
            <Input
              header
              label="Vis faktaboks knapp"
              placeholder="Mer forklart"
              value={node.summary || ''}
              onChange={(v) => patchNode(node.id, { summary: v })}
            />
          </ErrorWrapper>
          <ErrorWrapper slice={['details']}>
            <Editor
              label="Faktaboks"
              value={node.details || ''}
              onChange={(v) => patchNode(node.id, { details: v })}
              sourceRef={{ doc: getNodeRef(node.id), path: ['details'] }}
            />
          </ErrorWrapper>
        </Form.Presentational>
        <Help description="Faktaboks brukes når du vil legge til mer beskrivelse til et spørsmål. Brukeren må trykke på en knapp etter beskrivelsen for å få vist en faktaboksen med mer informasjon." />
        <ButtonBar>
          <Button type="button" onClick={closeModal}>
            Lukk
          </Button>
          {isEditable && (node.summary || node.details) && (
            <Button type="button" icon="Trash" subtle onClick={() => deleteAccordion(node.id)}>
              Fjern faktaboks
            </Button>
          )}
        </ButtonBar>
      </Modal>
    </>
  )
}
