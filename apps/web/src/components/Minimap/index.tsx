import { useEffect, useRef } from 'react'
import { useDraggable } from 'react-use-draggable-scroll'

// import Button from '@/components/Button'
import { IconContinue, IconStop } from '@/components/Icon'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { PageContent, WizardVersion } from 'types'
import useFirebase from '@/hooks/useFirebase'
import { addPage } from '@/services/firebase'
const bem = BEMHelper(styles)

interface Props {
  onClick: (id: string) => void
  selected?: string | null
  data: WizardVersion
  wizardId: string
  versionId: string
}

export default function Minimap({ onClick, selected, data, wizardId, versionId }: Props) {
  const contentRef = useRef<any>(null)
  const { firestore } = useFirebase()

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

  const handleAddPage = () => {
    addPage(firestore, wizardId, versionId, {})
  }

  const renderItem = (content: PageContent) => {
    switch (content.type) {
      case 'Text':
      case 'Radio':
      case 'Checkbox':
      case 'Select':
      case 'Input':
      case 'Number':
        return (
          <li {...bem('item')} key={content.id}>
            <h3 {...bem('sub-title')}>{content.heading || content.text}</h3>

            <span {...bem('icon')}>
              {content.flow === 'continue' && <IconContinue />}
              {content.flow === 'stop' && <IconStop />}
            </span>
          </li>
        )
      case 'Branch':
        return <li {...bem('item', 'branch')} key={content.id}></li>
      default:
        return null
    }
  }

  return (
    <ul {...bem('', { selected })} ref={contentRef} {...events}>
      {data?.pages?.map((item, index) => (
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
              {item.content.map((content) => {
                return renderItem(content)
              })}
            </ul>
          )}
        </li>
      ))}
      <li {...bem('page')} role="button" onClick={handleAddPage}>
        <h2 {...bem('title')}>Legg til side +</h2>
      </li>
    </ul>
  )
}
