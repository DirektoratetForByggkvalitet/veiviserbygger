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
import { ReactNode } from 'react'
import { useVersion } from '@/hooks/useVersion'
import { getTypeText, getTypeIcon, getTypeDescription } from '@/lib/content'
const bem = BEMHelper(styles)

type Props = {
  node: PageContent
  // nodeId: PageContent['id']
  // allNodes: WizardVersion['nodes']
}

export default function Content({ node }: Props) {
  const { patchNode } = useVersion()

  // if (!nodeId) return null

  // const node = allNodes?.[nodeId]

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

  const Header = ({ type }: { type: PageContent['type'] | Branch['preset'] }) => (
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

  const nodes: any = {
    Text: (data: PartialPageContent<'Text'>) => {
      return (
        <>
          <Header type={data.type} />
          <Main>
            <Input
              label="Tittel"
              value={data?.heading || ''}
              onChange={(v) => patchNode(node.id, { type: 'Text', heading: v })}
              hideIfEmpty
            />
            <Editor
              label="Innhold"
              value={data?.text || ''}
              hideIfEmpty
              onChange={(v) => patchNode(node.id, { type: 'Text', heading: v })}
            />
          </Main>
          <Aside>
            {/* TODO: summary, details, show */}
            <Help description={getTypeDescription(data.type)} />
          </Aside>
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
          <Header type={data.type} />
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
            <Button type="button" size="small" icon="Plus">
              Legg til svaralternativ
            </Button>
          </Main>
          <Aside>
            {/* TODO: summary, details, show */}
            <Help description={getTypeDescription(data.type)} />
            <h3 {...bem('sub-title')}>Innstillinger</h3>
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
      return (
        <>
          <Header type={data.preset} />
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
            <Help description={getTypeDescription(data.preset)} />
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
  }

  return <section {...bem('')}>
    {node?.type && nodes?.[node.type] ? nodes?.[node.type]?.(node) : <>
      {!node ? <p {...bem('error')}>Fant ikke node med id: {nodeId}</p> : null}
      {node?.type && !nodes[node.type] ? <p {...bem('error')}>Ukjent nodetype: {node.type}</p> : null}
    </>}
  </section>
}
