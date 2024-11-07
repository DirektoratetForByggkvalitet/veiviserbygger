import { useState } from 'react'

import Editor from '@/components/Editor'
import Input from '@/components/Input'
import Meta from '@/components/Meta'
import Minimap, { type MinimapData } from '@/components/Minimap'
import Panel from '@/components/Panel'

const DUMMY_DATA: MinimapData = [
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

export default function HomePage() {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    setSelected((value) => (value === id ? null : id))
  }

  const handleClose = () => {
    setSelected(null)
  }

  const dataIndex = selected ? DUMMY_DATA.findIndex((item) => item.id === selected) : undefined
  const data = selected ? DUMMY_DATA[dataIndex ?? 0] : undefined
  const panelTitle = selected && data ? `${(dataIndex ?? 0) + 1}. ${data.title}` : ''

  return (
    <>
      <Meta title="Velkommen til internett. Vi tar det herfra" />
      <Panel open={!!(selected && data)} onClose={handleClose} backdrop={false} title={panelTitle}>
        <Input label="Tittel" />
        <Editor label="Innhold" />
      </Panel>
      <Minimap onClick={handleSelect} selected={selected} data={DUMMY_DATA} />
    </>
  )
}
