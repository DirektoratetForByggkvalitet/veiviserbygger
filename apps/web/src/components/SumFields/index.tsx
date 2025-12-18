import { useMemo } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import Button from '@/components/Button'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import Icon from '@/components/Icon'
import ErrorWrapper from '@/components/ErrorWrapper'
import { useEditable } from '@/hooks/useEditable'
import { useSortableList } from '@/hooks/useSortableList'
import { useVersion } from '@/hooks/useVersion'
import useErrors from '@/hooks/errors'
import BEMHelper from '@/lib/bem'
import { getTypeText } from '@/lib/content'
import { getOrdered, getWithIds } from 'shared/utils'
import { OptionalExcept, PageContent, Sum, SumField } from 'types'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

const SUPPORTED_NODE_TYPES: PageContent['type'][] = ['Number', 'Sum']

const OPERATION_OPTIONS: DropdownOptions = [
  { value: '+', icon: 'Plus', label: 'Addisjon (a + b)' },
  { value: '-', icon: 'Minus', label: 'Subtraksjon (a - b)' },
  { value: '*', icon: 'Asterisk', label: 'Multiplikasjon (a * b)' },
  { value: '/', icon: 'Slash', label: 'Divisjon (a / b)' },
  { value: '-/', icon: 'Slash', label: 'Omvendt divisjon (b / a)' },
  { value: '%', icon: 'Percent', label: 'Prosent (a % b)' },
]

type SumOperation = '+' | '-' | '*' | '/' | '-/' | '%'
type SumFieldItem = SumField

type SumFieldsProps = {
  node: Sum
  nodes: Record<string, OptionalExcept<PageContent, 'type' | 'id'>>
}

type SumFieldRowProps = {
  field: SumFieldItem
  nodeOptions: DropdownOptions
  isEditable: boolean
  onOperationChange: (fieldId: string, operation: SumOperation) => void
  onNodeChange: (field: SumFieldItem, nodeId: string) => void
  onRemove: (fieldId: string) => void
}

function SumFieldRow({
  field,
  nodeOptions,
  isEditable,
  onOperationChange,
  onNodeChange,
  onRemove,
}: SumFieldRowProps) {
  const sortable = useSortable({ id: field.id, disabled: !isEditable })
  const { attributes, listeners, setNodeRef, transform, transition } = sortable
  const selectedValue = field.value
  const selectedNodeId = selectedValue?.id
  const operation = field.operation as SumOperation | undefined

  const style = {
    transform: transform ? `translateY(${transform.y}px)` : undefined,
    transition,
  }

  const fieldActions: DropdownOptions = [
    {
      value: 'delete',
      icon: 'Trash',
      label: 'Fjern felt',
      styled: 'delete',
      onClick: () => onRemove(field.id),
    },
  ]

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
        <Icon name="Calculator" {...bem('option-icon')} />
      )}

      <Dropdown
        options={OPERATION_OPTIONS}
        value={operation}
        label="Operasjon"
        placeholder="Velg operasjon"
        showOptionIconAsValue
        hideLabel
        sentence
        onChange={(value) => onOperationChange(field.id, value as SumOperation)}
      />

      <Dropdown
        options={nodeOptions}
        value={selectedNodeId}
        label="Felt"
        placeholder="Velg felt"
        hideLabel
        sentence
        onChange={(value) => onNodeChange(field, value)}
      />

      {isEditable && (
        <div {...bem('option-actions')}>
          <Dropdown
            icon="Ellipsis"
            direction="right"
            options={fieldActions}
            label="Valg"
            iconOnly
          />
        </div>
      )}
    </li>
  )
}

export default function SumFields({ node, nodes }: SumFieldsProps) {
  const { addSumField, patchSumField, deleteSumField, reorderSumFields, getNodeRef } = useVersion()
  const isEditable = useEditable()
  const { getErrors } = useErrors()

  const orderedFields = getOrdered(node.fields)
  const { value, onSort } = useSortableList(orderedFields, (list) =>
    reorderSumFields(node.id, list).catch((error) => {
      console.error('Kunne ikke endre rekkefølgen på feltene', error)
    }),
  )

  const nodeOptions = useMemo<DropdownOptions>(() => {
    return getWithIds(nodes)
      .filter(
        (nodeOption) => SUPPORTED_NODE_TYPES.includes(nodeOption.type) && nodeOption.id !== node.id,
      )
      .map((nodeOption) => {
        const hasHeading = 'heading' in nodeOption
        const heading = hasHeading ? (nodeOption as { heading?: string }).heading : undefined
        const label = heading ? heading : getTypeText(nodeOption.type)

        return {
          value: nodeOption.id,
          label,
        }
      })
      .sort((a, b) => (a.label || '').localeCompare(b.label || ''))
  }, [nodes, node.id])

  const handleSortingDragEnd = (event: DragEndEvent) => {
    if (!isEditable) {
      return
    }

    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const newIndex = value.findIndex((field) => field.id === over.id)

    if (newIndex === -1) {
      console.error('Fant ikke ny indeks for feltet')
      return
    }

    onSort(active.id, newIndex)
  }

  const handleAddField = () => {
    addSumField(node.id, { operation: '+' }).catch((error) =>
      console.error('Kunne ikke legge til nytt felt', error),
    )
  }

  const handleRemoveField = (fieldId: string) => {
    deleteSumField(node.id, fieldId).catch((error) =>
      console.error('Kunne ikke fjerne feltet', error),
    )
  }

  const handleOperationChange = (fieldId: string, operation: SumOperation) => {
    patchSumField(node.id, fieldId, { operation }).catch((error) =>
      console.error('Kunne ikke oppdatere operasjon', error),
    )
  }

  const handleNodeChange = (field: SumFieldItem, nodeId: string) => {
    const docRef = getNodeRef(nodeId)

    patchSumField(node.id, field.id, { value: docRef }).catch((error) =>
      console.error('Kunne ikke oppdatere feltverdi', error),
    )
  }

  return (
    <section {...bem('')}>
      <div {...bem('sub-header')}>
        <h3 {...bem('sub-title')}>Summer felter</h3>
      </div>
      <DndContext onDragEnd={handleSortingDragEnd}>
        <SortableContext items={value}>
          <ErrorWrapper slice={['fields']}>
            <ul {...bem('options', { 'has-errors': getErrors(['fields']).length })}>
              {value.map((field) => (
                <SumFieldRow
                  key={field.id}
                  field={field}
                  nodeOptions={nodeOptions}
                  isEditable={isEditable}
                  onOperationChange={handleOperationChange}
                  onNodeChange={handleNodeChange}
                  onRemove={handleRemoveField}
                />
              ))}

              {value.length === 0 && (
                <li {...bem('option', 'placeholder')}>Ingen felt lagt til ennå</li>
              )}

              {isEditable && (
                <li key="add">
                  <Button type="button" size="small" icon="Plus" onClick={handleAddField}>
                    Legg til felt
                  </Button>
                </li>
              )}
            </ul>
          </ErrorWrapper>
        </SortableContext>
      </DndContext>
    </section>
  )
}
