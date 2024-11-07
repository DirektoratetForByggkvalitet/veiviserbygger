import { useEffect, useRef } from 'react'
import { useDraggable } from 'react-use-draggable-scroll'

// import Button from '@/components/Button'
import { IconContinue, IconStop } from '@/components/Icon'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

export type MinimapData = {
  id: string
  title: string
  content: {
    id: string
    title: string
    type: 'stop' | 'continue' | null
  }[]
}[]

interface Props {
  onClick: (id: string) => void
  selected?: string | null
  data: MinimapData
}

export default function Minimap({ onClick, selected, data }: Props) {
  const contentRef = useRef<any>(null)

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

  return (
    <ul {...bem('', { selected })} ref={contentRef} {...events}>
      {data.map((item, index) => (
        <li
          key={item.id}
          {...bem('page', { selected: item.id === selected })}
          role="button"
          onClick={handlePageClick(item.id)}
          tabIndex={0}
          id={`page-${item.id}`}
        >
          <h2 {...bem('title')}>
            {index + 1}. {item.title}
          </h2>

          <ul {...bem('content')}>
            {item.content.map((content) => {
              return (
                <li {...bem('item')} key={content.id}>
                  <h3 {...bem('sub-title')}>{content.title}</h3>

                  <span {...bem('icon')}>
                    {content.type === 'continue' && <IconContinue />}
                    {content.type === 'stop' && <IconStop />}
                  </span>
                </li>
              )
            })}
          </ul>
        </li>
      ))}
    </ul>
  )
}
