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
    return (
      <>
        <Header type={node.data.type} contentActions={contentActions} />
        <Main>
          <Input
            label="Tittel"
            value={node.data?.heading || ''}
            onChange={(v) => node.patch({ type: 'Text', heading: v })}
            hideIfEmpty
            header
          />
          <Editor
            label="Innhold"
            value={node.data?.text || ''}
            hideIfEmpty
            onChange={(v) => node.patch({ type: 'Text', text: v })}
          />
        </Main>
        <Aside>
          <Help description={getTypeDescription(node.data.type)} />
        </Aside>
        {/* TODO: summary, details, show */}
      </>
    )
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
        <Header type={node.data.type} contentActions={contentActions} />
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
          <Button type="button" size="small" icon="Plus">
            Legg til svaralternativ
          </Button>
        </Main>
        <Aside>
          {/* TODO: summary, details, show */}
          <Help description={getTypeDescription(node.data.type)} />
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
              checked={false}
              onChange={() => {
                console.log('Hej')
              }}
            />

            <Checkbox
              label="Valgfritt felt"
              checked={false}
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
    return (
      <>
        <Header type={node.data.preset || node.data.type} contentActions={contentActions} />
        <Main>
          <h3 {...bem('sub-title')}>Vises hvis følgende er sant</h3>
          {/*<Expression expression={node.data.test} nodes={allNodes} />
          {node.data?.content?.map((child: PageContent, index: number) => (
            <div {...bem('inline-main')} key={child.id || index}>
              {(nodes[child.type] || nodes.Fallback)(child)}
            </div>
          ))}
          */}
        </Main>
        <Aside>
          <Help description={getTypeDescription(node.data.type)} />
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

const Header = ({
  type,
  contentActions,
}: {
  type: PageContent['type'] | Branch['preset']
  contentActions: DropdownOptions
}) => (
  <header {...bem('header')}>
    <Icon name={getTypeIcon(type)} size="20" {...bem('header-icon')} />
    <h2 {...bem('title')}>{getTypeText(type)}</h2>
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

  return (
    <section {...bem('')}>
      {node.data ? (
        <Node node={node} contentActions={contentActions} />
      ) : (
        <>
          <p {...bem('error')}>Fant ikke node med id: {nodeId}</p>
        </>
      )}
    </section>
  )
}
