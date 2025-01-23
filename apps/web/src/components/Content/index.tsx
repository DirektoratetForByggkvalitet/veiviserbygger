import { PageContent, Answer } from 'types'
import Input from '@/components/Input'
import Editor from '@/components/Editor'
import Button from '@/components/Button'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import Checkbox from '@/components/Checkbox'
import Expression from '@/components/Expression'
import Help from '@/components/Help'
import Icon from '@/components/Icon'
import { icons } from 'lucide-react'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { ReactNode } from 'react'
const bem = BEMHelper(styles)

type Props = {
  type: PageContent['type']
  data: PageContent
  allNodes: PageContent[]
}

export default function Content({ type, data, allNodes }: Props) {
  if (!data) return null

  const contentActions: DropdownOptions = [
    {
      value: '0',
      label: 'Flytt til annen side',
      onClick: () => console.log('Flytt'),
    },
    {
      value: '0',
      label: 'Dupliser',
      onClick: () => console.log('Flytt'),
    },
    {
      value: '0',
      label: 'Fjern spørsmål',
      onClick: () => console.log('Fjern'),
      styled: 'delete',
    },
  ]

  const Header = ({ title, icon }: { title: string; icon: keyof typeof icons }) => (
    <header {...bem('header')}>
      <Icon name={icon} size="20" {...bem('header-icon')} />
      <h2 {...bem('title')}>{title}</h2>
      <Dropdown icon="Ellipsis" direction="right" options={contentActions} label="Valg" iconOnly />
    </header>
  )

  const Main = ({ children, full }: { children: ReactNode; full?: boolean }) => (
    <div {...bem('main', { full })}>{children}</div>
  )

  const Aside = ({ children }: { children: ReactNode }) => <div {...bem('aside')}>{children}</div>

  const nodes: any = {
    Text: (data: any) => {
      return (
        <>
          <Header title="Tekst" icon="Text" />
          <Main full>
            <Input
              label="Tittel"
              value={data?.heading || ''}
              onChange={() => {
                console.log('Hej')
              }}
              hideIfEmpty
            />
            <Editor label="Innhold" value={data?.text} hideIfEmpty />
          </Main>
          {/* TODO: summary, details, show */}
        </>
      )
    },
    Radio: (data: any) => {
      const optionActions = [
        {
          value: '0',
          label: 'Gir negativt resultat',
          onClick: () => console.log(''),
        },
        {
          value: '1',
          label: 'Gir ekstra informasjon',
          onClick: () => console.log(''),
        },
        {
          value: '2',
          label: 'Slett',
          onClick: () => console.log(''),
          styled: 'delete',
        },
      ] as DropdownOptions
      return (
        <>
          <Header title="Spørsmål" icon="Diamond" />
          <Main>
            <Input
              label="Tittel"
              value={data?.heading || ''}
              onChange={() => {
                console.log('Hej')
              }}
              header
            />
            <Editor label="Beskrivelse" value={data?.text} hideIfEmpty />
            <h3 {...bem('sub-title')}>Svaralternativer</h3>
            {data?.options && (
              <ul {...bem('options')}>
                {data?.options.map((option: Answer) => (
                  <li key={option.id} {...bem('option')}>
                    <Input
                      label="Svar"
                      value={option?.heading || ''}
                      onChange={() => {
                        console.log('Hej')
                      }}
                    />
                    <div {...bem('option-actions')}>
                      <Dropdown
                        icon="Ellipsis"
                        direction="right"
                        options={optionActions}
                        label="Valg"
                        iconOnly
                      />
                    </div>
                    {/* TODO: Dropdown menu with actions "Slett", "Gir negativt resultat", "Gir ekstra informasjon"  */}
                  </li>
                ))}
              </ul>
            )}
            <Button type="button" size="small" subtle icon="Plus">
              Legg til svaralternativ
            </Button>
          </Main>
          <Aside>
            {/* TODO: summary, details, show */}
            <Help
              description="Dette er et flervalgspørsmål vi stiller brukeren som de kan svare på. Avhengig av hva
              de svarer kan vi respondere med resultater eller informasjon."
            />
            <h3 {...bem('sub-title')}>Instillinger</h3>
            <Dropdown
              label="Spørsmålstype"
              hideLabel
              value={'Radio'}
              options={[
                {
                  value: 'Radio',
                  label: 'Radioknapper',
                },
                {
                  value: 'Select',
                  label: 'Nedtrekksmeny',
                },
              ]}
            />
            <div {...bem('field-list')}>
              <Checkbox
                label="Grid visning"
                checked={data?.grid}
                onChange={() => {
                  console.log('Hej')
                }}
              />
              <Checkbox
                label="Valgfritt felt"
                checked={data?.optional}
                disabled={data?.allMandatory}
                onChange={() => {
                  console.log('Hej')
                }}
              />
              <Checkbox
                label="Alle påkrevd"
                checked={data?.allMandatory}
                disabled={data?.optional}
                onChange={() => {
                  console.log('Hej')
                }}
              />
            </div>
          </Aside>
        </>
      )
    },
    Branch: (data: any) => {
      const titlePresets: any = {
        NegativeResult: {
          title: 'Negativt resultat',
          icon: 'TriangleAlert',
          description:
            'Gir et negativt resultat hvor brukeren ikke kan fortsette i veiviseren, men går videre til en resultatside.',
        },
        ExtraInformation: {
          title: 'Ekstra informasjon',
          icon: 'Info',
          description:
            'Gir ekstra informasjon til brukeren, mens brukeren får mulighet til å fortsette veiviseren. Ekstra informasjon blir gjentatt på resultatsider.',
        },
        NewQuestions: {
          title: 'Nye spørsmål',
          icon: 'Option',
          description: 'Viser et nytt spørsmål som ikke tidligere var synlig.',
        },
      }
      return (
        <>
          <Header
            title={titlePresets[data.preset]?.title || 'Branch'}
            icon={titlePresets[data.preset]?.icon || 'option'}
          />
          <Main>
            <h3 {...bem('sub-title')}>Vises hvis følgende er sant</h3>
            <Expression expression={data.test} nodes={allNodes} />
            {data?.content?.map((child: PageContent, index: number) => (
              <div {...bem('inline-main')} key={child.id || index}>
                {(nodes[child.type] || nodes.Fallback)(child)}
              </div>
            ))}
          </Main>
          <Aside>
            <Help
              description={
                titlePresets[data.preset]?.description ||
                'Viser innhold avhengig av et tidligere valg.'
              }
            />
          </Aside>
        </>
      )
    },
    Error: (data: any) => {
      return (
        <>
          <Input
            label="Tittel"
            value={data?.heading || ''}
            onChange={() => {
              console.log('Hej')
            }}
            header
          />
          <Editor label="Beskrivelse" value={data?.text} hideIfEmpty />
        </>
      )
    },
    Information: (data: any) => {
      return (
        <>
          <Input
            label="Tittel"
            value={data?.heading || ''}
            onChange={() => {
              console.log('Hej')
            }}
          />
          <Editor label="Beskrivelse" value={data?.text} hideIfEmpty />
        </>
      )
    },
    Result: (data: any) => {
      return (
        <>
          <Input
            label="Resultatside tittel"
            value={data?.heading || ''}
            onChange={() => {
              console.log('Hej')
            }}
          />
        </>
      )
    },
    Fallback: (data: any) => {
      return <p style={{ color: 'red' }}>Unknown node type: {data?.type}</p>
    },
  }

  return <section {...bem('')}>{(nodes[type] || nodes.Fallback)(data)}</section>
}
