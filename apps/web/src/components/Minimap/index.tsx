import { useEffect, useRef, useState } from 'react'
import { useDraggable } from 'react-use-draggable-scroll'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { useSortable, SortableContext } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import Icon from '@/components/Icon'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { WizardVersion } from 'types'
import { getTypeText } from '@/lib/content'
import NewPage from '../NewPage'
import { getOrdered } from '@/lib/ordered'
const bem = BEMHelper(styles)

interface Props {
  onClick: (id: string) => void
  selected?: string | null
  data: WizardVersion
  allNodes: WizardVersion['nodes']
}

const contentCleanup = (value?: string) => {
  const regex = /(<([^>]+)>)/gi
  return value?.substring(0, 80).replace(regex, ' ') || ''
}

const ContentItem = ({
  nodeId,
  nodes,
  draggable,
}: {
  nodeId: string
  nodes?: WizardVersion['nodes']
  draggable?: boolean
}) => {
  const sortable = useSortable({ id: nodeId })

  const node = nodes?.[nodeId]
  if (!node) return null

  const { attributes, listeners, setNodeRef, transform, transition } = sortable

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  switch (node.type) {
    case 'Text':
    case 'Radio':
    case 'Checkbox':
    case 'Select':
    case 'Input':
    case 'Number':
      return (
        <li {...bem('item')} key={node.id} ref={setNodeRef} style={style} {...attributes}>
          <h3 {...bem('sub-title', { placeholder: !node.heading })}>
            {node.heading || contentCleanup(node.text) || `${getTypeText(node.type)}`}
          </h3>
          {draggable && (
            <button
              {...bem('drag')}
              aria-label="Endre rekkefølge"
              title="Endre rekkefølge"
              {...listeners}
            >
              <Icon name="Grip" />
            </button>
          )}

          {/*<span {...bem('icon')}>
            {node.flow === 'continue' && <IconContinue />}
            {node.flow === 'stop' && <IconStop />}
          </span>*/}
        </li>
      )
    case 'Branch':
      return (
        <li
          {...bem('item', 'branch')}
          key={node.id}
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
        >
          <h3 {...bem('sub-title', { placeholder: true /*TODO */ })}>
            {getTypeText(node.preset || 'Branch')}
          </h3>
          {draggable && (
            <button
              {...bem('drag')}
              aria-label="Endre rekkefølge"
              title="Endre rekkefølge"
              {...listeners}
            >
              <Icon name="Grip" />
            </button>
          )}
          {/* <span {...bem('icon')}>{<Icon name={getTypeIcon(node.preset || 'Branch')} />}</span>*/}
        </li>
      )
    default:
      return null
  }
}

export default function Minimap({ onClick, selected, data, allNodes }: Props) {
  const contentRef = useRef<any>(null)
  const [modal, setModal] = useState<'page' | null>(null)

  useEffect(() => {
    if (selected && contentRef.current) {
      const selectedElement = document.getElementById(`page-${selected}`)

      if (selectedElement) {
        const diff = Math.abs(selectedElement.offsetWidth - contentRef.current.offsetWidth)
        contentRef.current.scrollTo({ left: selectedElement.offsetLeft - diff, behavior: 'smooth' })
      }
    }
  }, [selected])

  const draggable = useDraggable(contentRef, {
    applyRubberBandEffect: true,
    decayRate: 0.95, // 5%
    safeDisplacement: 30, // px
  })

  const draggableEvents = selected ? {} : draggable.events // Disable dragging when a page is selected

  const handlePageClick = (id: string) => () => {
    onClick(id)
  }

  const toggleModal = (value: typeof modal) => () => {
    setModal(value)
  }

  const handleSortingDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      console.log('TODO: Store new sorting in Minimap')
      {
        /* TODO: Storing of new order
        setItems((items) => {
          const oldIndex = items.indexOf(active.id)
          const newIndex = items.indexOf(over.id)

          return arrayMove(items, oldIndex, newIndex)
        })
        */
      }
    }
  }

  return (
    <>
      <ul {...bem('', { selected })} ref={contentRef} {...draggableEvents}>
        {getOrdered(data?.pages)?.map((item, index) => {
          return (
            <li
              key={item.id}
              {...bem('page', { selected: item.id === selected })}
              role="button"
              tabIndex={0}
              id={`page-${item.id}`}
              onClick={handlePageClick(item.id)}
            >
              <h2 {...bem('title')} title={`${index + 1}. ${item.heading}`}>
                <span {...bem('title-text')}>
                  {index + 1}. {item.heading}
                </span>
              </h2>

              {item.content && (
                <DndContext onDragEnd={handleSortingDragEnd}>
                  <SortableContext items={item.content} disabled={item.id !== selected}>
                    <ul {...bem('content')}>
                      {item.content.map((ref) => (
                        <ContentItem
                          nodeId={ref.id}
                          nodes={allNodes}
                          key={ref.id}
                          draggable={item.id === selected}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}

              {!item.content?.length && !selected && (
                <div {...bem('placeholder')}>
                  <span {...bem('placeholder-text')}>Legg til innhold </span>
                  <span {...bem('icon')}>
                    <Icon name="Plus" />
                  </span>
                </div>
              )}
            </li>
          )
        })}

        <li {...bem('page')} role="button" onClick={toggleModal('page')}>
          <h2 {...bem('title')}>Legg til side +</h2>
          <div {...bem('content', 'placeholder')}></div>
        </li>
      </ul>

      <NewPage open={modal === 'page'} closeModal={toggleModal(null)} />
    </>
  )
}
