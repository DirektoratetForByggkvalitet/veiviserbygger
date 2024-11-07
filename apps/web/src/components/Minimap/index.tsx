import { useRef } from 'react'
import { useDraggable } from 'react-use-draggable-scroll'

// import Button from '@/components/Button'
import { IconContinue, IconStop } from '@/components/Icon'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

const TEST = [
  {
    id: '123123',
    title: 'Startside',
    content: [{ title: 'Veileder for mikrohus', type: null }],
  },
  {
    id: '12323123',
    title: 'Bruksområde',
    content: [
      { title: 'Skal noen bo eller overnatte i Mikrohuset?', type: 'stop' },
      { title: 'Hva skal mikrohuset brukes til?', type: 'stop' },
    ],
  },
  {
    id: '44423',
    title: 'Plassering',
    content: [
      { title: 'Er bygningen frittliggende?', type: 'stop' },
      { title: 'Blir de minst 8 meter fra mikrohuset til nærmeste bygning?', type: 'continue' },
      { title: 'Skal mikrohuset ha en permantent plassering?', type: 'continue' },
    ],
  },
  {
    id: '4442123',
    title: 'Bygningen',
    content: [
      { title: 'Hvor stort bruksareal (BRA) får mikrohuset?', type: 'stop' },
      { title: 'Blir mikrohuset høyere enn 4,5 m over bakken?', type: 'stop' },
      { title: 'Skal mikrohuset ha mer en én etasje?', type: 'stop' },
      { title: 'Skal mikrohuset ha kjeller?', type: 'stop' },
      { title: 'Skal bygningen ha pipe eller skorstein?', type: 'continue' },
    ],
  },
  {
    id: '114442123',
    title: 'Hovedfunksjoner',
    content: [{ title: 'Har mikrohuset alle hovedfunksjoner på inngangsplanet?', type: 'stop' }],
  },
  {
    id: '22',
    title: 'Reguleringsplan',
    content: [
      { title: 'Finnes det en reguleringsplan for eiendommen?', type: 'continue' },
      { title: 'Hva er eiendommen regulert til?', type: 'continue' },
      { title: 'Er det lov å sette opp enda en boenhet på eiendommen?', type: 'continue' },
    ],
  },
  {
    id: '323',
    title: 'Grad av utnytting',
    content: [
      {
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

  const { events } = useDraggable(contentRef, {
    applyRubberBandEffect: true,
    decayRate: 0.94, // 6%
    safeDisplacement: 30, // px
  })

  const handlePageClick = (id: string) => () => {
    onClick(id)
  }

  return (
    <ul {...bem('')} ref={contentRef} {...events}>
      {TEST.map((item, index) => (
        <li
          key={item.id}
          {...bem('page', { selected: item.id === selected })}
          role="button"
          onClick={handlePageClick(item.id)}
          tabIndex={0}
        >
          <h2 {...bem('title')}>
            {index + 1}. {item.title}
          </h2>

          <ul {...bem('content')}>
            {item.content.map((content) => {
              return (
                <li {...bem('item')}>
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
