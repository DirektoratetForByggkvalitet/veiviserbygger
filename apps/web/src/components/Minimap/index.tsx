import { useEffect, useRef, useState } from 'react'
import { useDraggable } from 'react-use-draggable-scroll'

import Icon, { IconContinue, IconStop } from '@/components/Icon'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { PageContent, WizardVersion } from 'types'
import NewPage from '../NewPage'
import { getOrdered } from '@/lib/ordered'

const bem = BEMHelper(styles)

interface Props {
  onClick: (id: string) => void
  selected?: string | null
  data: WizardVersion
}

export default function Minimap({ onClick, selected, data }: Props) {
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

  const { events } = useDraggable(contentRef, {
    applyRubberBandEffect: true,
    decayRate: 0.95, // 5%
    safeDisplacement: 30, // px
  })

  const handlePageClick = (id: string) => () => {
    onClick(id)
  }

  const toggleModal = (value: typeof modal) => () => {
    setModal(value)
  }

  const contentCleanup = (value?: string) => {
    const regex = /(<([^>]+)>)/gi
    return value?.substring(0, 80).replace(regex, ' ') || ''
  }

  const renderItem = (nodeId: string, nodes?: WizardVersion['nodes']) => {
    const node = nodes?.[nodeId]

    if (!node) {
      return null
    }

    switch (node.type) {
      case 'Text':
      case 'Radio':
      case 'Checkbox':
      case 'Select':
      case 'Input':
      case 'Number':
        return (
          <li {...bem('item')} key={node.id}>
            <h3 {...bem('sub-title')}>{node.heading || contentCleanup(node.text)}</h3>

            <span {...bem('icon')}>
              {node.flow === 'continue' && <IconContinue />}
              {node.flow === 'stop' && <IconStop />}
            </span>
          </li>
        )
      case 'Branch':
        return <li {...bem('item', 'branch')} key={node.id}></li>
      default:
        return null
    }
  }

  return (
    <>
      <ul {...bem('', { selected })} ref={contentRef} {...events}>
        {getOrdered(data?.pages)?.map((item, index) => {
          return (
            <li
              key={item.id}
              {...bem('page', { selected: item.id === selected })}
              role="button"
              onClick={handlePageClick(item.id)}
              tabIndex={0}
              id={`page-${item.id}`}
            >
              <h2 {...bem('title')} title={`${index + 1}. ${item.heading}`}>
                <span {...bem('title-text')}>
                  {index + 1}. {item.heading}
                </span>
              </h2>

              {item.content && (
                <ul {...bem('content')}>
                  {item.content.map((nodeId) => {
                    return renderItem(nodeId, data.nodes)
                  })}
                </ul>
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
