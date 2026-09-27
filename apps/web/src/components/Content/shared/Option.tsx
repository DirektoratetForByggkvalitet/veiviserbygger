import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import Icon from '@/components/Icon'
import Input from '@/components/Input'
import { useSortable } from '@dnd-kit/sortable'
import { useMemo, useRef } from 'react'
import { Answer } from 'types'

import { useEditable } from '@/hooks/useEditable'
import { useVersion } from '@/hooks/useVersion'
import BEMHelper from '@/lib/bem'
import { getTypeIcon } from '@/lib/content'
import { ref as storageRef } from 'firebase/storage'

import useFile from '@/hooks/useFile'
import useFirebase from '@/hooks/useFirebase'
import styles from '../Styles.module.scss'

const bem = BEMHelper(styles)

export default function Option({
  pageId,
  nodeId,
  id,
  heading,
  nodeType,
}: {
  pageId: string
  nodeId: string
  nodeType: 'Radio' | 'Checkbox'
} & Answer) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { storage } = useFirebase()
  const { getNodeRef, patchAnswer, deleteAnswer, addNodes, updateAnswerImage } = useVersion()
  const imagePath = useMemo(
    () => storageRef(storage, `${getNodeRef(nodeId).path}/options/${id}/image`).fullPath,
    [nodeId, getNodeRef, id],
  )
  const { url, upload, remove } = useFile(imagePath)
  const sortable = useSortable({ id })
  const { attributes, listeners, setNodeRef, transform, transition } = sortable
  const isEditable = useEditable()

  const style = {
    transform: transform ? `translateY(${transform.y}px)` : undefined,
    transition,
  }

  const optionActions = (nodeId: string, optionId: string) =>
    [
      {
        group: 'Bilde',
      },
      {
        value: '0',
        icon: url ? 'Image' : 'ImagePlus',
        label: url ? 'Erstatt bilde' : 'Legg til bilde',
        onClick: async () => {
          const fileInput = document.createElement('input')
          fileInput.type = 'file'
          fileInput.accept = 'image/png, image/jpeg'
          fileInput.style.display = 'none'
          document.body.appendChild(fileInput)

          fileInput.onchange = async (event: Event) => {
            const file = (event.target as HTMLInputElement).files?.[0]

            if (file) {
              await upload(file)
              await updateAnswerImage(nodeId, optionId, imagePath)
              document.body.removeChild(fileInput)
            }
          }

          fileInput.click()
        },
      },
      ...(url
        ? [
            {
              value: '1',
              icon: 'Trash',
              label: 'Slett bilde',
              onClick: async () => {
                await remove()
                await updateAnswerImage(nodeId, optionId, undefined)
              },
              styled: 'delete',
            },
          ]
        : []),
      {
        group: 'Handlinger',
      },
      {
        value: '2',
        icon: 'Plus',
        label: 'Legg til innhold',
        onClick: async () => {
          await addNodes({ pageId, afterNodeId: nodeId }, [
            {
              type: 'Branch',
              preset: 'NewQuestions',
              test: {
                field: getNodeRef(nodeId),
                operator: 'eq',
                value: optionId,
              },
              content: [],
            },
          ])
        },
      },
      {
        value: '3',
        icon: 'OctagonX',
        label: 'Gir negativt resultat',
        onClick: async () => {
          await addNodes({ pageId: pageId, afterNodeId: nodeId }, [
            {
              type: 'Branch',
              preset: 'NegativeResult',
              test: {
                field: getNodeRef(nodeId),
                operator: 'eq',
                value: optionId,
              },
              content: [{ type: 'Error' }, { type: 'Result' }],
            },
          ])
        },
      },
      {
        value: '4',
        icon: 'ListPlus',
        label: 'Gir ekstra spørsmål',
        onClick: async () => {
          await addNodes({ pageId, afterNodeId: nodeId }, [
            {
              type: 'Branch',
              preset: 'NewQuestions',
              test: {
                field: getNodeRef(nodeId),
                operator: 'eq',
                value: optionId,
              },
              content: [],
            },
          ])
        },
      },
      {
        value: '5',
        icon: 'Info',
        label: 'Gir tilleggsinfo',
        onClick: async () => {
          await addNodes({ pageId, afterNodeId: nodeId }, [
            {
              type: 'Branch',
              preset: 'ExtraInformation',
              test: {
                field: getNodeRef(nodeId),
                operator: 'eq',
                value: optionId,
              },
              content: [{ type: 'Information' }],
            },
          ])
        },
      },
      {
        value: '6',
        icon: 'Trash',
        label: 'Slett',
        onClick: () => deleteAnswer(nodeId, optionId),
        styled: 'delete',
      },
    ] as DropdownOptions

  return (
    <li
      {...bem('option', { 'read-only': !isEditable })}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      {isEditable ? (
        <button type="button" {...bem('option-handle')} {...listeners}>
          <Icon name="GripVertical" />
        </button>
      ) : (
        <Icon name={getTypeIcon(nodeType)} {...bem('option-icon')} />
      )}
      <Input
        hideLabel
        label="Svar"
        placeholder="Svar"
        value={heading || ''}
        forwardedRef={inputRef}
        onChange={(v) => patchAnswer(nodeId, id, { heading: v })}
      />
      {url && <div {...bem('option-image')} style={{ backgroundImage: `url(${url})` }} />}
      <div {...bem('option-actions')}>
        <Dropdown
          icon="Ellipsis"
          direction="right"
          options={optionActions(nodeId, id)}
          label="Valg"
          iconOnly
        />
      </div>
    </li>
  )
}
