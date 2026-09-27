import Button from '@/components/Button'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { PageContentWithOptions, WizardPage } from 'types'

import { useEditable } from '@/hooks/useEditable'
import useErrors from '@/hooks/errors'
import { useSortableList } from '@/hooks/useSortableList'
import { useVersion } from '@/hooks/useVersion'
import BEMHelper from '@/lib/bem'
import { OptionalExcept } from 'types'
import { getOrdered } from 'shared/utils'
import ErrorWrapper from '../../ErrorWrapper'
import Option from './Option'
import styles from '../Styles.module.scss'

const bem = BEMHelper(styles)

export default function Options({
  node,
  pageId,
}: {
  node: OptionalExcept<PageContentWithOptions, 'id'>
  pageId: WizardPage['id']
}) {
  const { addAnswer, reorderAnswers } = useVersion()
  const options = getOrdered(node.options)
  const isEditable = useEditable()
  const { value, onSort } = useSortableList(options, (list) => reorderAnswers(node.id, list))
  const { getErrors } = useErrors()

  const handleSortingDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const newIndex = options?.findIndex((r) => r.id === over?.id)

      if (newIndex === undefined) {
        console.error('Could not find new index')
        return
      }

      onSort(active.id, newIndex)
    }
  }

  return (
    <DndContext onDragEnd={handleSortingDragEnd}>
      <SortableContext items={value}>
        <ErrorWrapper slice={['options']}>
          <ul {...bem('options', { 'has-errors': getErrors(['options']).length })}>
            {value.map(({ id }) => {
              const option = options.find((o) => o.id === id)

              if (!option) {
                return null
              }

              return (
                <Option
                  key={option.id}
                  pageId={pageId}
                  nodeType={node.type === 'Radio' ? 'Radio' : 'Checkbox'}
                  nodeId={node.id}
                  {...option}
                />
              )
            })}

            {!value || (value.length === 0 && <li {...bem('option', 'placeholder')}>Ingen ...</li>)}
            {isEditable && (
              <li key="add">
                <Button
                  type="button"
                  size="small"
                  icon="Plus"
                  onClick={() => addAnswer(node.id, {})}
                >
                  Legg til svaralternativ
                </Button>
              </li>
            )}
          </ul>
        </ErrorWrapper>
      </SortableContext>
    </DndContext>
  )
}
