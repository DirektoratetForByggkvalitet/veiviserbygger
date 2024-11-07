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
]

interface Props {
  onClick: (id: string) => void
  selected?: string | null
}

export default function Minimap({ onClick, selected }: Props) {
  const handlePageClick = (id: string) => () => {
    onClick(id)
  }

  return (
    <ul {...bem('')}>
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
