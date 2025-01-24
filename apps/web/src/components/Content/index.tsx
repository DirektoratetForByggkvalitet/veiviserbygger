import {
  PageContent,
  Answer,
  Branch,
  WizardVersion,
  OptionalExcept,
  PartialPageContent,
} from 'types'
import Input from '@/components/Input'
import Editor from '@/components/Editor'
import Button from '@/components/Button'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import Checkbox from '@/components/Checkbox'
import Expression from '@/components/Expression'
import Help from '@/components/Help'
import Icon from '@/components/Icon'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { ReactNode, useEffect } from 'react'
import { getTypeText, getTypeIcon, getTypeDescription } from '@/lib/content'
import { useNode } from '@/hooks/useNode'
import { DocumentReference } from 'firebase/firestore'
const bem = BEMHelper(styles)

type Props = {
  // node: PageContent
  nodeId: DocumentReference['id']
  // allNodes: WizardVersion['nodes']
}

type NodeProps = {
  node: ReturnType<typeof useNode>
  contentActions: DropdownOptions
}

function Node({ node, contentActions }: NodeProps) {
  if (!node.data) return null


  if (node.data.type === 'Text') {
    return <>
      <Header contentActions={contentActions} title="Tekst" icon="Text" />
      <Main full>
        <Input
          label="Tittel"
          value={node.data?.heading || ''}
          onChange={(v) => node.patch({ type: 'Text', heading: v })}
          hideIfEmpty
        />
        <Editor label="Innhold" value={node.data?.text || ''} hideIfEmpty onChange={(v) => node.patch({ type: 'Text', text: v })}
        />
      </Main>
      {/* TODO: summary, details, show */}
    </>
  }

  if (node.data.type === 'Radio') {
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
        <Header contentActions={contentActions} title="Spørsmål" icon="Diamond" />
        <Main>
          <Input
            label="Tittel"
            value={node.data.heading || ''}
            onChange={() => {
              console.log('Hej')
            }}
            header
          />
          <Editor label="Beskrivelse" value={node.data.text} hideIfEmpty />
          <h3 {...bem('sub-title')}>Svaralternativer</h3>
          {node.data.options && (
            <ul {...bem('options')}>
              {node.data.options.map((option: Answer) => (
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
              checked={node.data.grid}
              onChange={() => {
                console.log('Hej')
              }}
            />
            <Checkbox
              label="Valgfritt felt"
              checked={node.data.optional}
              disabled={node.data.allMandatory}
              onChange={() => {
                console.log('Hej')
              }}
            />
            <Checkbox
              label="Alle påkrevd"
              checked={node.data.allMandatory}
              disabled={node.data.optional}
              onChange={() => {
                console.log('Hej')
              }}
            />
          </div>
        </Aside>
      </>
    )
  }

  if (node.data.type === 'Branch') {
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
        <Header contentActions={contentActions}
          title={titlePresets[node.data.preset || '']?.title || 'Branch'}
          icon={titlePresets[node.data.preset || '']?.icon || 'option'}
        />
        <Main>
          <h3 {...bem('sub-title')}>Vises hvis følgende er sant</h3>
          <Expression expression={node.data.test} nodes={allNodes} />
          {node.data?.content?.map((child: PageContent, index: number) => (
            <div {...bem('inline-main')} key={child.id || index}>
              {(nodes[child.type] || nodes.Fallback)(child)}
            </div>
          ))}
        </Main>
        <Aside>
          <Help
            description={
              titlePresets[node.data.preset]?.description ||
              'Viser innhold avhengig av et tidligere valg.'
            }
          />
        </Aside>
      </>
    )
  }

  if (node.data.type === 'Error') {
    return (
      <>
        <Input
          label="Tittel"
          value={node.data.heading || ''}
          onChange={() => {
            console.log('Hej')
          }}
          header
        />
        <Editor label="Beskrivelse" value={node.data.text} hideIfEmpty />
      </>
    )
  }

  if (node.data.type === 'Information') {
    return (
      <>
        <Input
          label="Tittel"
          value={node.data.heading || ''}
          onChange={() => {
            console.log('Hej')
          }}
        />
        <Editor label="Beskrivelse" value={node.data.text} hideIfEmpty />
      </>
    )
  }

  // if (node.data.type === 'Result') {
  //   return (
  //     <>
  //       <Input
  //         label="Resultatside tittel"
  //         value={node.data.heading || ''}
  //         onChange={() => {
  //           console.log('Hej')
  //         }}
  //       />
  //     </>
  //   )
  // }
}

const Header = ({ title, icon, contentActions }: { title: string; icon: keyof typeof icons, contentActions: DropdownOptions }) => (
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

export default function Content({ nodeId }: Props) {
  const node = useNode(nodeId)

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

  return <section {...bem('')}>
    {node.data ? <Node node={node} contentActions={contentActions} /> : <>
      <p {...bem('error')}>Fant ikke node med id: {nodeId}</p>
    </>}
  </section>
}
