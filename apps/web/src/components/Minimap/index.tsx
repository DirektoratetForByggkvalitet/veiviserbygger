import { useEffect, useRef } from 'react'
import { useDraggable } from 'react-use-draggable-scroll'

// import Button from '@/components/Button'
import { IconContinue, IconStop } from '@/components/Icon'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

const TEST = [
  {
    id: '1223123',
    title: 'Startside',
    content: [{ id: '1', title: 'Veileder for mikrohus', type: null }],
  },
  {
    id: '12323123',
    title: 'Bruksområde',
    content: [
      { id: '2', title: 'Skal noen bo eller overnatte i Mikrohuset?', type: 'stop' },
      { id: '3', title: 'Hva skal mikrohuset brukes til?', type: 'stop' },
    ],
  },
  {
    id: '44423',
    title: 'Plassering',
    content: [
      { id: '4', title: 'Er bygningen frittliggende?', type: 'stop' },
      {
        id: '5',
        title: 'Blir de minst 8 meter fra mikrohuset til nærmeste bygning?',
        type: 'continue',
      },
      { id: '6', title: 'Skal mikrohuset ha en permantent plassering?', type: 'continue' },
    ],
  },
  {
    id: '4442123',
    title: 'Bygningen',
    content: [
      { id: '7', title: 'Hvor stort bruksareal (BRA) får mikrohuset?', type: 'stop' },
      { id: '8', title: 'Blir mikrohuset høyere enn 4,5 m over bakken?', type: 'stop' },
      { id: '9', title: 'Skal mikrohuset ha mer en én etasje?', type: 'stop' },
      { id: '10', title: 'Skal mikrohuset ha kjeller?', type: 'stop' },
      { id: '11', title: 'Skal bygningen ha pipe eller skorstein?', type: 'continue' },
    ],
  },
  {
    id: '114442123',
    title: 'Hovedfunksjoner',
    content: [
      { id: '12', title: 'Har mikrohuset alle hovedfunksjoner på inngangsplanet?', type: 'stop' },
    ],
  },
  {
    id: '221',
    title: 'Reguleringsplan',
    content: [
      { id: '13', title: 'Finnes det en reguleringsplan for eiendommen?', type: 'continue' },
      { id: '14', title: 'Hva er eiendommen regulert til?', type: 'continue' },
      {
        id: '15',
        title: 'Er det lov å sette opp enda en boenhet på eiendommen?',
        type: 'continue',
      },
    ],
  },
  {
    id: '323',
    title: 'Grad av utnytting',
    content: [
      {
        id: '16',
        title: 'Har eiendommen stort nok areal til bygningen du ønsker å sette opp?',
        type: 'continue',
      },
    ],
  },
  {
    id: '3232',
    title: 'Flom og skred',
    content: [
      {
        id: '17',
        title: 'Skal du bygge i et flom- eller skredutsatt område?',
        type: 'continue',
      },
    ],
  },
  {
    id: '32321',
    title: 'Andre begrensninger',
    content: [
      {
        id: '18',
        title: 'Begrenser kommunale planer eller andre horhold hva du kan bygge?',
        type: 'stop',
      },
    ],
  },
]

interface Props {
  onClick: (id: string) => void
  selected?: string | null
}

export default function Minimap({ onClick, selected }: Props) {
  const contentRef = useRef<any>(null)

  useEffect(() => {
    if (selected && contentRef.current) {
      const selectedElement = document.getElementById(`page-${selected}`)

      if (selectedElement) {
        contentRef.current.scrollTo({ left: selectedElement.offsetLeft, behavior: 'smooth' })
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
      {TEST.map((item, index) => (
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
