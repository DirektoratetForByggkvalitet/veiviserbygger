import { useState } from 'react'

import Editor from '@/components/Editor'
import Form from '@/components/Form'
import Input from '@/components/Input'
import Meta from '@/components/Meta'
import Minimap from '@/components/Minimap'
import Panel from '@/components/Panel'
import { Wizard } from '@/types'

const DUMMY_DATA: Wizard = [
  {
    id: '1223123',
    type: 'Page',
    heading: 'Startside',
    children: [{ id: '1', type: 'Radio', heading: 'Veileder for mikrohus', flow: null }],
  },
  {
    id: '12323123',
    type: 'Page',
    heading: 'Bruksområde',
    children: [
      {
        id: '2',
        type: 'Radio',
        heading: 'Skal noen bo eller overnatte i Mikrohuset?',
        flow: 'stop',
      },
      { id: '3', type: 'Radio', heading: 'Hva skal mikrohuset brukes til?', flow: 'stop' },
    ],
  },
  {
    id: '44423',
    type: 'Page',
    heading: 'Plassering',
    children: [
      { id: '4', type: 'Radio', heading: 'Er bygningen frittliggende?', flow: 'stop' },
      {
        id: '5',
        type: 'Radio',
        heading: 'Blir de minst 8 meter fra mikrohuset til nærmeste bygning?',
        flow: 'continue',
      },
      {
        id: '6',
        type: 'Radio',
        heading: 'Skal mikrohuset ha en permantent plassering?',
        flow: 'continue',
      },
    ],
  },
  {
    id: '4442123',
    type: 'Page',
    heading: 'Bygningen',
    children: [
      {
        id: '7',
        type: 'Radio',
        heading: 'Hvor stort bruksareal (BRA) får mikrohuset?',
        flow: 'stop',
      },
      {
        id: '8',
        type: 'Radio',
        heading: 'Blir mikrohuset høyere enn 4,5 m over bakken?',
        flow: 'stop',
      },
      { id: '9', type: 'Radio', heading: 'Skal mikrohuset ha mer en én etasje?', flow: 'stop' },
      { id: '10', type: 'Radio', heading: 'Skal mikrohuset ha kjeller?', flow: 'stop' },
      {
        id: '11',
        type: 'Radio',
        heading: 'Skal bygningen ha pipe eller skorstein?',
        flow: 'continue',
      },
    ],
  },
  {
    id: '114442123',
    type: 'Page',
    heading: 'Hovedfunksjoner',
    children: [
      {
        id: '12',
        type: 'Radio',
        heading: 'Har mikrohuset alle hovedfunksjoner på inngangsplanet?',
        flow: 'stop',
      },
    ],
  },
  {
    id: '221',
    type: 'Page',
    heading: 'Reguleringsplan',
    children: [
      {
        id: '13',
        type: 'Radio',
        heading: 'Finnes det en reguleringsplan for eiendommen?',
        flow: 'continue',
      },
      { id: '14', type: 'Radio', heading: 'Hva er eiendommen regulert til?', flow: 'continue' },
      {
        id: '15',
        type: 'Radio',
        heading: 'Er det lov å sette opp enda en boenhet på eiendommen?',
        flow: 'continue',
      },
    ],
  },
  {
    id: '323',
    type: 'Page',
    heading: 'Grad av utnytting',
    children: [
      {
        id: '16',
        type: 'Radio',
        heading: 'Har eiendommen stort nok areal til bygningen du ønsker å sette opp?',
        flow: 'continue',
      },
    ],
  },
  {
    id: '3232',
    type: 'Page',
    heading: 'Flom og skred',
    children: [
      {
        id: '17',
        type: 'Radio',
        heading: 'Skal du bygge i et flom- eller skredutsatt område?',
        flow: 'continue',
      },
    ],
  },
  {
    id: '32321',
    type: 'Page',
    heading: 'Andre begrensninger',
    children: [
      {
        id: '18',
        type: 'Radio',
        heading: 'Begrenser kommunale planer eller andre horhold hva du kan bygge?',
        flow: 'stop',
      },
    ],
  },
  {
    id: '32322',
    type: 'Result',
    heading: 'Mikrohuset er omfattet av forenklingene og du kan søke og bygge selv!',
    lead: '<p><strong>Du må søke kommunen før du setter opp mikrohuset</strong><br/>Det er søknadspliktig å oppføre et mikrohus som skal brukes til helårsbolig. Du kan søke selv, eller få hjelp av en fagperson, et profesjonelt foretak eller en leverandør av mikrohus til å lage søknaden.</p>',
  },
  {
    id: '32323',
    type: 'Result',
    heading:
      'Mikrohuset er omfattet av forenklingene og du må ha profesjonelle i hele byggeprosessen',
    lead: '<p><strong>Du må bruke profesjonelle i hele byggeprosessen</strong><br/>Du må som hovedregel bruke ansvarlige foretak som tar hånd om hele søknadsprosessen og  byggeprosessen for deg. De sender inn byggesøknaden på dine vegne og har også ansvar for at alle byggtekniske krav blir fulgt.</p>',
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
  const panelTitle = selected && data ? `${(dataIndex ?? 0) + 1}. ${data.heading}` : ''

  return (
    <>
      <Meta title="Velkommen til internett. Vi tar det herfra" />
      <Panel open={!!(selected && data)} onClose={handleClose} backdrop={false} title={panelTitle}>
        <Form>
          <Form.Split>
            <Input
              label="Tittel"
              value=""
              onChange={() => {
                console.log('Hej')
              }}
            />
          </Form.Split>
          <Form.Split>
            <Editor label="Innhold" />
          </Form.Split>
        </Form>
      </Panel>
      <Minimap onClick={handleSelect} selected={selected} data={DUMMY_DATA} />
    </>
  )
}
