import { useEffect, useRef, useState, useCallback, useMemo, MouseEventHandler } from 'react'
import { useDraggable } from 'react-use-draggable-scroll'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { useSortable, SortableContext } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import Icon from '@/components/Icon'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { PageContent, Result, WizardPage, WizardVersion } from 'types'
import NewPage from '../NewPage'
import { getTypeText, getTypeIcon } from '@/lib/content'
import { getOrdered } from '@/lib/ordered'
import { getPageTypeDescription, getPageTypeTitle } from '@/lib/page'
import { useVersion } from '@/hooks/useVersion'
import { useSortableList } from '@/hooks/useSortableList'
import { values } from 'lodash'
const bem = BEMHelper(styles)

interface Props {
  onClick: (id: string) => void
  selected?: string | null
  data: WizardVersion
  allNodes: Record<string, PageContent>
}

const contentCleanup = (value?: string) => {
  const regex = /(<([^>]+)>)/gi
  return value?.substring(0, 80).replace(regex, ' ') || ''
}

const ContentItem = ({
  id,
  node,
  draggable,
  allNodes,
  onClick,
}: {
  id: string
  node: PageContent
  draggable?: boolean
  allNodes: Record<string, PageContent>
  onClick?: MouseEventHandler
}) => {
  const sortable = useSortable({ id, disabled: !draggable })

  if (!node) return null

  const { attributes, listeners, setNodeRef, transform, transition } = sortable

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (
    node.type === 'Text' ||
    node.type === 'Radio' ||
    node.type === 'Checkbox' ||
    node.type === 'Select' ||
    node.type === 'Input' ||
    node.type === 'Number'
  ) {
    return (
      <li
        {...bem('item', { draggable })}
        key={id}
        ref={setNodeRef}
        style={style}
        onClick={onClick}
        {...attributes}
        {...listeners}
      >
        <Icon name={draggable ? 'GripVertical' : getTypeIcon(node.type)} {...bem('icon')} />
        <h3 {...bem('sub-title', { placeholder: !node.heading && !node.text })}>
          {node.heading || contentCleanup(node.text) || `${getTypeText(node.type)}`}
        </h3>

        {/*<span {...bem('icon')}>
            {node.flow === 'continue' && <IconContinue />}
            {node.flow === 'stop' && <IconStop />}
          </span>*/}
      </li>
    )
  }

  if (node.type === 'Branch') {
    const resultNodeId = values(node.content).find((n) => allNodes?.[n.node.id].type === 'Result')
      ?.node.id
    const resultNode = resultNodeId ? (allNodes?.[resultNodeId] as Result) : undefined

    return (
      <li
        {...bem('item', { branch: true, draggable })}
        key={id}
        ref={setNodeRef}
        style={style}
        onClick={onClick}
        {...attributes}
        {...listeners}
      >
        <Icon name={draggable ? 'GripVertical' : getTypeIcon(node.type)} {...bem('icon')} />
        <h3 {...bem('sub-title', { placeholder: true /*TODO */ })}>
          {resultNode?.heading || getTypeText(node.preset || 'Branch')}
        </h3>
        {/* <span {...bem('icon')}>{<Icon name={getTypeIcon(node.preset || 'Branch')} />}</span>*/}
      </li>
    )
  }

  return null
}

function PageMap({
  page,
  index,
  selected,
  onPageClick,
  onNodeClick,
  allNodes,
}: {
  page: WizardPage
  index: number
  selected: boolean
  onPageClick: MouseEventHandler
  onNodeClick: (nodeId: string) => MouseEventHandler
  allNodes: Props['allNodes']
}) {
  const { reorderNodes } = useVersion()

  const content = getOrdered(page.content)

  /* TODO: Implement reordering of content */
  const { value, onSort, inSync } = useSortableList(content, (list) => reorderNodes(page.id, list))

  const handleSortingDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const newIndex = content?.findIndex((r) => r.id === over?.id)

      if (newIndex === undefined) {
        console.error('Could not find new index')
        return
      }

      onSort(active.id, newIndex)
    }
  }

  return (
    <li
      {...bem('page', { selected, dirty: !inSync })}
      role="button"
      tabIndex={0}
      id={`page-${page.id}`}
      onClick={!selected ? onPageClick : undefined}
    >
      <h2 {...bem('title')} title={`${index + 1}. ${page.heading}`}>
        {page.type === 'Page' ? (
          <span {...bem('title-type')}>{index}.</span>
        ) : (
          <span {...bem('title-type', 'tag')} title={getPageTypeDescription(page.type)}>
            {getPageTypeTitle(page.type)}
          </span>
        )}
        <span {...bem('title-text')}>{page.heading}</span>
      </h2>

      {!value.length && !selected && (
        <div {...bem('placeholder')}>
          <span {...bem('placeholder-text')}>Legg til innhold </span>
          <span {...bem('icon')}>
            <Icon name="Plus" />
          </span>
        </div>
      )}

      <DndContext onDragEnd={handleSortingDragEnd}>
        {value && (
          <SortableContext items={value} disabled={!selected}>
            <ul {...bem('content')}>
              {value.map((ref) => {
                return (
                  <ContentItem
                    id={ref.id}
                    node={allNodes[ref.node.id]}
                    key={ref.id}
                    draggable={selected}
                    allNodes={allNodes}
                    onClick={onNodeClick(ref.id)}
                  />
                )
              })}
            </ul>
          </SortableContext>
        )}
      </DndContext>
    </li>
  )
}

export default function Minimap({ onClick, selected, data, allNodes }: Props) {
  const contentRef = useRef<HTMLUListElement>(null)
  const [modal, setModal] = useState<'page' | null>(null)

  useEffect(() => {
    if (selected && contentRef.current) {
      const selectedElement = document.getElementById(`page-${selected}`)

      if (selectedElement) {
        requestAnimationFrame(() => {
          if (!contentRef.current) return
          contentRef.current.style.marginLeft = `-${selectedElement.offsetLeft}px`
        })
      }
    } else {
      contentRef.current?.style.removeProperty('margin-left')
    }
  }, [selected])

  const draggable = useDraggable(contentRef as any, {
    applyRubberBandEffect: true,
    decayRate: 0.95, // 5%
    safeDisplacement: 30, // px
  })

  const draggableEvents = selected ? draggable.events : {} // Disable dragging when a page is not selected

  const handlePageClick = useCallback((id: string) => () => onClick(id), [onClick])

  const handleNodeClick =
    (pageId: string) =>
    (id: string): MouseEventHandler =>
    (e) => {
      e.stopPropagation()
      handlePageClick(pageId)()

      // wait for 100ms to ensure the page has opened before we scroll
      setTimeout(() => {
        // find the page node
        const node = document.getElementById(id)

        if (node) {
          // scroll to the node if we found it
          node.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }

  const toggleModal = (value: typeof modal) => () => {
    setModal(value)
  }

  const orderedPages = useMemo(() => getOrdered(data?.pages), [data?.pages]) ?? []

  return (
    <>
      <ul {...bem('', { selected })} ref={contentRef} {...draggableEvents}>
        {orderedPages.map((item, index) => {
          return (
            <PageMap
              key={item.id}
              page={item}
              index={index}
              onPageClick={handlePageClick(item.id)}
              onNodeClick={handleNodeClick(item.id)}
              selected={item.id === selected}
              allNodes={allNodes}
            />
          )
        })}

        <li {...bem('page', 'placeholder')} role="button" onClick={toggleModal('page')}>
          <h2 {...bem('title')}>Legg til side +</h2>
          <div {...bem('content', 'placeholder')}></div>
        </li>
      </ul>

      <NewPage open={modal === 'page'} closeModal={toggleModal(null)} />
    </>
  )
}
