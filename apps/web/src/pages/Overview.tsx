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
    id: '1',
    type: 'Intro',
    heading: 'Mikrohus som helårsbolig',
    lead: 'Ta vår veiviser for å finne ut om mikrohuset er omfattet av forenklingene.',
    children: [
      {
        id: '1',
        type: 'Text',
        text: '<p>Fra 1. juli 2023 gjelder nye regler for oppføring av mikrohus som skal brukes til helårsbolig. Slike boliger må være frittliggende, ikke større enn 30 m² BRA, ha kun én boenhet, én etasje uten kjeller og ikke være høyere enn 4,5 m over bakken.</p><figure><img src="https://dibk.no/globalassets/2.-verktoy-og-veivisere/mikrohus/illustrasjon-til-mikrohus-1.png" alt="Figur av et mikrohus med høyde på 4,5 meter."><figcaption>Mikrohus kan ikke være høyere enn 4,5 m over bakken.</figcaption></figure><h2>For slike boliger gjelder:</h2><ul><li>Du kan søke om tillatelse og bygge mikrohuset selv. Det vil si at du ikke trenger å bruke ansvarlige foretak.</li><li>Færre byggtekniske krav og enklere krav i byggesaksforskriften. Du kan lese mer om forenklingene i artikkelen <a href="https://dibk.no/byggtekniske-omrader/regler-for-mikrohus-til-boligformal" target="_blank" rel="noopener noreferrer">Regler for mikrohus til boligformål</a>.</li><li>Bestemmelsene i plan- og bygningsloven gjelder fortsatt. Mikrohuset må ha tilfredsstillende renovasjonsløsning, atkomst, parkering og løsning for vann og avløp. Også reglene om sikker byggegrunn, avstand til nabogrense og visuelle kvaliteter gjelder for mikrohus.</li></ul><h2>Veiviseren hjelper deg med å finne ut:</h2><ul><li>om et mikrohus er omfattet av forenklingene</li><li>om det er mulig å plassere mikrohuset der du ønsker</li><li>om du kan søke selv</li></ul><h2>Start nå og fullfør senere</h2><p>Er det noen spørsmål du er usikker på underveis? Du kan ta en pause og fortsette senere. Nettleseren husker hvor du var.</p>', // Mulig denne bør brytes opp
      },
    ],
  },
  {
    id: '2',
    type: 'Page',
    heading: 'Bruksområde',
    children: [
      {
        id: 'inhabited',
        type: 'Radio',
        heading: 'Skal noen bo eller overnatte i Mikrohuset?',
        flow: 'stop',
        options: [
          {
            id: 'inhabited.yes',
            type: 'Answer',
            heading: 'Ja, noen skal bo eller overnatte i mikrohuset',
            value: 'yes',
          },
          {
            id: 'inhabited.no',
            type: 'Answer',
            heading: 'Nei, ingen skal bo eller overnatte i mikrohuset',
            value: 'no',
          },
        ],
      },
      {
        id: 'notInhabitedNotCoveredBranch',
        type: 'Branch',
        test: {
          field: 'inhabited',
          operator: 'eq',
          value: 'no',
        },
        children: [
          {
            id: 'notInhabitedNotCoveredError',
            type: 'Error',
            heading:
              'Hvis ingen skal bo eller sove i mikrohuset, er det ikke omfattet av de nye reglene',
            text: '<p>Det kan hende det finnes andre forenklinger i regelverket som gjelder deg.</p><p><strong>Skal dette være en frittliggende bygning?</strong><br/>Da anbefaler vi deg å ta vår veiviser «<a href="https://dibk.no/bygge-selv/dette-kan-du-bygge-uten-a-soke/bygg-garasje-uten-a-soke" target="_blank" rel="noopener noreferrer">Bygg uten å søke for frittliggende bygninger</a>».</p><p><strong>Skal dette være et tilbygg til eksisterende bygning?</strong><br/>Da anbefaler vi deg å ta vår veiviser «<a href="https://dibk.no/bygge-selv/dette-kan-du-bygge-uten-a-soke/sett-opp-tilbygg-uten-a-soke" target="_blank" rel="noopener noreferrer">Bygg uten å søke - terrasser og tilbygg</a>».</p>',
          },
          {
            id: 'notInhabitedNotCoveredResult',
            type: 'Result',
            heading: 'Ikke omfattet av de nye reglene',
          },
        ],
      },
      {
        id: '3',
        type: 'Radio',
        heading: 'Hva skal mikrohuset brukes til?',
        text: 'Det har ikke noe å si om mikrohuset er forankret i bakken, står på tilhenger eller har hjul.',
        flow: 'stop',
        options: [
          {
            id: 'microhouseUsage.allYear',
            type: 'Answer',
            heading: 'Helårsbolig',
            value: 'allYear',
          },
          {
            id: 'microhouseUsage.cabin',
            type: 'Answer',
            heading: 'Fritidsbolig (hytte)',
            value: 'cabin',
          },
          {
            id: 'microhouseUsage.caravan',
            type: 'Answer',
            heading: 'Campingvogn',
            value: 'caravan',
          },
          {
            id: 'microhouseUsage.other',
            type: 'Answer',
            heading: 'Noe annet',
            value: 'other',
          },
        ],
      },
      {
        id: 'cabinNotCovered',
        type: 'Branch',
        test: {
          field: 'usage',
          operator: 'eq',
          value: 'cabin',
        },
        children: [
          {
            id: 'cabinNotCoveredError',
            type: 'Error',

            heading: 'Mikrohus brukt som fritidsbolig er ikke omfattet av forenklingene',
            text: '<p>Vi anbefaler deg å få hjelp fra kommunen, en fagperson eller en leverandør av mikrohus for å finne ut om det er tillatt å oppføre en fritidsbolig der du ønsker.</p><p>Dersom det er tillatt, så finnes det allerede enklere byggtekniske krav for fritidsbolig med én boenhet. Disse kan du lese mer om i TEK17 § 1-2 andre ledd. Du må bruke ansvarlige foretak eller søke om å være selvbygger.</p>',
          },
          {
            id: 'cabinNotCoveredResult',
            type: 'Result',
            heading: 'Ikke omfattet av de nye reglene',
          },
        ],
      },
      {
        id: 'caravanNotCoveredE',
        type: 'Branch',
        test: {
          field: 'usage',
          operator: 'eq',
          value: 'caravan',
        },
        children: [
          {
            id: 'caravanNotCoveredError',
            type: 'Error',
            heading:
              'Om mikrohuset skal brukes som campingvogn er det ikke omfattet av forenklingene',
            text: '<p>Vi anbefaler deg å få hjelp fra kommunen for å høre hvilke regler som gjelder for plassering av campingvogn i din kommune.</p>',
          },
          {
            id: 'caravanNotCoveredResult',
            type: 'Result',
            heading: 'Ikke omfattet av de nye reglene',
          },
        ],
      },
      {
        id: 'otherNotCovered',
        type: 'Branch',
        test: {
          field: 'usage',
          operator: 'eq',
          value: 'other',
        },
        children: [
          {
            id: 'otherNotCoveredError',
            type: 'Error',
            heading:
              'Beklager, men veiviseren dekker ikke ditt tilfelle. Det er kun mikrohus brukt som helårsbolig som er omfattet av forenklingene.',
            text: '<p>Vi anbefaler deg å få hjelp fra kommunen for å høre hvilke regler som gjelder for plassering av mikrohus i din kommune.</p>',
          },
          {
            id: 'otherNotCoveredResult',
            type: 'Result',
            heading: 'Ikke omfattet av de nye reglene',
          },
        ],
      },
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
    children: [
      {
        id: '',
        type: 'Text',
        text: '<h2>Du må søke kommunen før du setter opp mikrohuset</h2><p>Det er søknadspliktig å oppføre et mikrohus som skal brukes til helårsbolig. Du kan søke selv, eller få hjelp av en fagperson, et profesjonelt foretak eller en leverandør av mikrohus til å lage søknaden.</p><h2>Mikrohuset du ønsker deg er omfattet av forenklingene</h2><p>Ut fra dine svar har du et mikrohus som får færre byggtekniske krav enn en ordinær helårsbolig. Les mer om dette i <a href="https://dibk.no/byggtekniske-omrader/regler-for-mikrohus-til-boligformal" target="_blank" rel="noopener noreferrer">Regler for mikrohus til boligformål</a>.</p><p>De grunnleggende kravene til sikkerhet gjelder fremdeles. Mikrohus må dessuten ha tilfredsstillende renovasjonsløsning, atkomst, parkering og løsninger for vann og avløp. Også reglene om sikker byggegrunn, avstand til nabogrense, utforming og visuelle kvaliteter gjelder for mikrohus.</p><h2>Ditt ansvar at regelverket blir fulgt</h2><p>Du har ansvar for at regelverket blir fulgt. Vi anbefaler å bruke fagpersoner, profesjonelle foretak eller leverandører av mikrohus. Disse kan hjelpe deg med å ivareta både de byggtekniske kravene, søknadsprosessen og byggeprosessen.</p><h2>Husk nabovarsel og byggesøknad</h2><p>Søknadsskjema på papir finner du her <a href="https://dibk.no/soknad-og-skjema/soknadsskjemaer-for-byggesak/soknadsskjema-pa-papir">Søknadsskjema på papir</a>. Vi anbefaler å sende inn nabovarselet digitalt, se <a href="https://dibk.no/soknad-og-skjema/soknadsskjemaer-for-byggesak">Søknadsskjemaer for byggesak</a>. Du kan få tips og råd til hva som må med i søknaden i <a href="https://dibk.no/verktoy-og-veivisere/atte-steg-fra-ide-til-ferdig-soknad">Åtte steg fra ide til ferdig søknad</a>.</p><p>Dersom du skal benytte ansvarlig foretak i byggeprosjektet, kan du bruke en digital løsning for dette, se <a href="https://dibk.no/soknad-og-skjema/soknadsskjemaer-for-byggesak">Søknadsskjemaer for byggesak.</a></p>',
      },
    ],
  },
  {
    id: '32323',
    type: 'Result',
    heading:
      'Mikrohuset er omfattet av forenklingene og du må ha profesjonelle i hele byggeprosessen',
    children: [
      {
        id: '',
        type: 'Text',
        text: '<h2>Du må bruke profesjonelle i hele byggeprosessen</h2><p>Du må som hovedregel bruke ansvarlige foretak som tar hånd om hele søknadsprosessen og  byggeprosessen for deg. De sender inn byggesøknaden på dine vegne og har også ansvar for at alle byggtekniske krav blir fulgt.</p><h2>Skal du bygge selv?</h2><p>Dersom du vil bygge selv og kan sannsynliggjøre at du har de riktige kvalifikasjonene, kan du søke kommunen om å få lov til å være selvbygger. Da kan du sende inn byggesøknad selv. Du må likevel bruke fagpersoner for de delene du ikke er kvalifisert til selv.</p><h2>Mikrohuset du ønsker deg er omfattet av forenklingene</h2><p>Ut fra dine svar har du et mikrohus som får færre byggtekniske krav enn en ordinær helårsbolig. Les mer om dette i <a href="https://dibk.no/byggtekniske-omrader/regler-for-mikrohus-til-boligformal" target="_blank" rel="noopener noreferrer">Regler for mikrohus til boligformål</a>.</p><p>Det er likevel mange byggtekniske krav som gjelder, slik som kravene til sikkerhet. I tillegg må mikrohuset  ha tilfredsstillende renovasjonsløsning, atkomst, parkering og løsninger for vann og avløp. Krav til ventilasjon kan oppfylles med lufteventiler og vinduer som kan åpnes.</p>',
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
