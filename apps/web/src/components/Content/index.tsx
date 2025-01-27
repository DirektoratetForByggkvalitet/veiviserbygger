import {
  PageContent,
  Answer,
  WizardVersion,
  OptionalExcept,
  Branch,
} from 'types'
import Input from '@/components/Input'
import Editor from '@/components/Editor'
import Button from '@/components/Button'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import Checkbox from '@/components/Checkbox'
import Help from '@/components/Help'
import Icon from '@/components/Icon'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { ReactNode } from 'react'
import { DocumentReference } from 'firebase/firestore'
import { useVersion } from '@/hooks/useVersion'
import { getTypeDescription, getTypeIcon, getTypeText } from '@/lib/content'
const bem = BEMHelper(styles)

type Props = {
  nodeId: DocumentReference['id']
  allNodes: WizardVersion['nodes']
}

type NodeProps = {
  node: OptionalExcept<PageContent, 'id' | 'type'>
  contentActions: DropdownOptions
}

function Node({ node, contentActions }: NodeProps) {
  const { patchNode } = useVersion()

  if (node.type === 'Text') {
    return (
      <>
        <Header type={node.type} contentActions={contentActions} />
        <Main>
          <Input
            label="Tittel"
            value={node.heading || ''}
            onChange={(v) => patchNode(node.id, { type: 'Text', heading: v })}
            hideIfEmpty
            header
          />
          <Editor
            label="Innhold"
            value={node.text || ''}
            hideIfEmpty
            onChange={(v) => patchNode(node.id, { type: 'Text', text: v })}
          />
        </Main>
        <Aside>
          <Help description={getTypeDescription(node.type)} />
        </Aside>
        {/* TODO: summary, details, show */}
      </>
    )
  }

  if (node.type === 'Radio') {
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
        <Header type={node.type} contentActions={contentActions} />

        <Main>
          <Input
            label="Tittel"
            value={node.heading || ''}
            onChange={v => patchNode(node.id, { type: 'Radio', heading: v })}
            header
          />

          <Editor label="Beskrivelse" value={node.text || ''} hideIfEmpty onChange={(v) => patchNode(node.id, { type: 'Radio', text: v })} />

          <h3 {...bem('sub-title')}>Svaralternativer</h3>
          {node.options && (
            <ul {...bem('options')}>
              {node.options.map((option: Answer) => (
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
          <Help description={getTypeDescription(node.type)} />
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
              checked={node.grid}
              onChange={() => {
                console.log('Hej')
              }}
            />
          </div>
        </Aside>
      </>
    )
  }

  if (node.type === 'Branch') {
    return (
      <>
        <Header type={node.preset || node.type} contentActions={contentActions} />
        <Main>
          <h3 {...bem('sub-title')}>Vises hvis følgende er sant</h3>

          {/*
          <Expression expression={node.test} nodes={allNodes} />
          {node?.content?.map((child: PageContent, index: number) => (
            <div {...bem('inline-main')} key={child.id || index}>
              {(nodes[child.type] || nodes.Fallback)(child)}
            </div>
          ))}
          */}
        </Main>

        <Aside>
          <Help description={getTypeDescription(node.type)} />
        </Aside >
      </>
    )
  }

  if (node.type === 'Error') {
    return (
      <>
        <Input
          label="Tittel"
          value={node.heading || ''}
          onChange={v => patchNode(node.id, { type: 'Error', heading: v })}
          header
        />
        <Editor label="Beskrivelse" value={node.text || ''} hideIfEmpty onChange={(v) => patchNode(node.id, { type: 'Error', text: v })} />
      </>
    )
  }

  if (node.type === 'Information') {
    return (
      <>
        <Input
          label="Tittel"
          value={node.heading || ''}
          onChange={v => patchNode(node.id, { type: 'Information', heading: v })}
        />

        <Editor label="Beskrivelse" value={node.text || ''} hideIfEmpty onChange={(v) => patchNode(node.id, { type: 'Information', text: v })} />
      </>
    )
  }

  // if (node.type === 'Result') {
  //   return (
  //     <>
  //       <Input
  //         label="Resultatside tittel"
  //         value={node.heading || ''}
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

export default function Content({ nodeId, allNodes }: Props) {
  const node = allNodes?.[nodeId]

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
      {node ? (
        <Node node={node} contentActions={contentActions} />
      ) : (
        <>
          <p {...bem('error')}>Fant ikke node med id: {nodeId}</p>
        </>
      )}
    </section>
  )
}
