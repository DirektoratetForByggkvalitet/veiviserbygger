import { useState, useMemo } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { useSortable, SortableContext } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  PageContent,
  OptionalExcept,
  Branch,
  WizardPage,
  PageContentWithOptions,
  Answer,
} from 'types'
import Input from '@/components/Input'
import Editor from '@/components/Editor'
import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import Checkbox from '@/components/Checkbox'
import Help from '@/components/Help'
import Icon from '@/components/Icon'
import Modal from '@/components/Modal'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import { ReactNode } from 'react'
import { DocumentReference } from 'firebase/firestore'
import { useVersion } from '@/hooks/useVersion'
import { getTypeDescription, getTypeIcon, getTypeText } from '@/lib/content'
import { getOrdered } from '@/lib/ordered'
import Expression from '../Expression'
const bem = BEMHelper(styles)

type Props = {
  nodeId: DocumentReference['id']
  allNodes: Record<string, OptionalExcept<PageContent, 'type' | 'id'>>
  pageId: WizardPage['id']
}

type NodeProps = {
  allNodes: Props['allNodes']
  node: OptionalExcept<PageContent, 'id' | 'type'>
  pageId: WizardPage['id']
}
function Option({ pageId, nodeId, id, heading }: { pageId: any; nodeId: any } & Answer) {
  const { getNodeRef, patchAnswer, deleteAnswer, addNodes } = useVersion()
  const sortable = useSortable({ id })
  const { attributes, listeners, setNodeRef, transform, transition } = sortable

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const optionActions = (nodeId: string, optionId: string) =>
    [
      {
        value: '0',
        label: 'Gir negativt resultat',
        onClick: async () => {
          const [alertNodeRef, resultRef] = await addNodes(undefined, [
            {
              type: 'Error',
            },
            {
              type: 'Result',
            },
          ])

          await addNodes(pageId, [
            {
              type: 'Branch',
              preset: 'NegativeResult',
              test: {
                field: getNodeRef(nodeId),
                operator: 'eq',
                value: optionId,
              },
              content: [alertNodeRef, resultRef],
            },
          ])
        },
      },
      {
        value: '1',
        label: 'Gir ekstra informasjon',
        onClick: () => console.log(''),
      },
      {
        value: '2',
        label: 'Slett',
        onClick: () => deleteAnswer(nodeId, optionId),
        styled: 'delete',
      },
    ] as DropdownOptions

  return (
    <li {...bem('option')} ref={setNodeRef} style={style} {...attributes}>
      <button type="button" {...bem('option-handle')} {...listeners}>
        <Icon name="GripVertical" />
      </button>
      <Input
        hideLabel
        label="Svar"
        value={heading || ''}
        onChange={(v) => patchAnswer(nodeId, id, { heading: v })}
      />
      <div {...bem('option-actions')}>
        <Dropdown
          icon="Ellipsis"
          direction="right"
          options={optionActions(nodeId, id)}
          label="Valg"
          iconOnly
        />
      </div>
    </li>
  )
}
function Options({
  node,
  pageId,
}: {
  node: OptionalExcept<PageContentWithOptions, 'id'>
  pageId: WizardPage['id']
}) {
  const { addAnswer } = useVersion()

  const handleSortingDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    console.log('TODO: Handle sort as we do in Minimap.tsx just for options', active, over)
  }

  if (!node?.options) {
    return null
  }

  const orderedOptions: Answer[] = useMemo(() => getOrdered(node.options), [node.options]) ?? []

  return (
    <DndContext onDragEnd={handleSortingDragEnd}>
      <SortableContext items={orderedOptions}>
        <ul {...bem('options')}>
          {orderedOptions.map((option) => (
            <Option key={option.id} pageId={pageId} nodeId={node.id} {...option} />
          ))}
          {!orderedOptions ||
            (orderedOptions.length === 0 && <li {...bem('option', 'placeholder')}>Ingen ...</li>)}
          <li key="add">
            <Button type="button" size="small" icon="Plus" onClick={() => addAnswer(node.id, {})}>
              Legg til svaralternativ
            </Button>
          </li>
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function Node({ node, pageId, allNodes }: NodeProps) {
  const { patchNode } = useVersion()

  if (node.type === 'Text' || node.type === 'Number' || node.type === 'Input') {
    return (
      <>
        <Header type={node.type} node={node} />
        <Main>
          <Input
            label="Tittel"
            value={node.heading || ''}
            onChange={(v) => patchNode(node.id, { heading: v })}
            hideIfEmpty
            header
          />

          <Editor
            label="Innhold"
            value={node.text || ''}
            hideIfEmpty
            onChange={(v) => patchNode(node.id, { text: v })}
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
    return (
      <>
        <Header
          type={node.type}
          title={node.heading || 'Hva er det til middag i dag?'}
          node={node}
        />

        <Main>
          <Input
            label="Tittel"
            value={node.heading || ''}
            onChange={(v) => patchNode(node.id, { type: 'Radio', heading: v })}
            header
          />

          <Editor
            label="Beskrivelse"
            value={node.text || ''}
            hideIfEmpty
            onChange={(v) => patchNode(node.id, { type: 'Radio', text: v })}
          />

          <h3 {...bem('sub-title')}>Svaralternativer</h3>
          <Options node={node} pageId={pageId} />
        </Main>

        <Aside>
          {/* TODO: summary, details, show */}
          <Help description={getTypeDescription(node.type)} />
          <h3 {...bem('sub-title')}>Innstillinger</h3>
          <div {...bem('field-list')}>
            <Checkbox
              label="Gridvisning"
              checked={node.grid}
              onChange={(v) => patchNode(node.id, { type: 'Radio', grid: v })}
            />
          </div>
        </Aside>
      </>
    )
  }

  if (node.type === 'Checkbox') {
    return (
      <>
        <Header
          type={node.type}
          title={node.heading || 'Hva er det til middag i dag?'}
          node={node}
        />

        <Main>
          <Input
            label="Tittel"
            value={node.heading || ''}
            onChange={(v) => patchNode(node.id, { type: 'Checkbox', heading: v })}
            header
          />

          <Editor
            label="Beskrivelse"
            value={node.text || ''}
            hideIfEmpty
            onChange={(v) => patchNode(node.id, { type: 'Checkbox', text: v })}
          />

          <h3 {...bem('sub-title')}>Svaralternativer</h3>
          <Options node={node} pageId={pageId} />
        </Main>

        <Aside>
          <Help description={getTypeDescription(node.type)} />
          <h3 {...bem('sub-title')}>Innstillinger</h3>
          <div {...bem('field-list')}>
            <Checkbox
              label="Gridvisning"
              checked={node.grid}
              onChange={(v) => patchNode(node.id, { type: 'Checkbox', grid: v })}
            />
          </div>
        </Aside>
      </>
    )
  }

  if (node.type === 'Branch') {
    return (
      <>
        <Header type={node.preset || node.type} node={node} />
        <Main>
          <Expression expression={node.test} nodes={allNodes} nodeId={node.id} />
          <h3 {...bem('sub-title')}>Vises følgende melding</h3>
          {node?.content?.map((nodeRef) => {
            const node = allNodes[nodeRef.id]

            return <Node node={{ ...node, id: node.id }} pageId={pageId} allNodes={allNodes} />
          })}
        </Main>

        <Aside>
          <Help description={getTypeDescription(node.preset || node.type)} />
        </Aside>
      </>
    )
  }

  if (node.type === 'Error') {
    return (
      <>
        <Input
          label="Tittel"
          value={node.heading || ''}
          onChange={(v) => patchNode(node.id, { type: 'Error', heading: v })}
          header
        />
        <Editor
          label="Beskrivelse"
          value={node.text || ''}
          hideIfEmpty
          onChange={(v) => patchNode(node.id, { type: 'Error', text: v })}
        />
      </>
    )
  }

  if (node.type === 'Information') {
    return (
      <>
        <Input
          label="Tittel"
          value={node.heading || ''}
          onChange={(v) => patchNode(node.id, { type: 'Information', heading: v })}
        />

        <Editor
          label="Beskrivelse"
          value={node.text || ''}
          hideIfEmpty
          onChange={(v) => patchNode(node.id, { type: 'Information', text: v })}
        />
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
  title,
  node,
}: {
  type: PageContent['type'] | Branch['preset']
  node: NodeProps['node']
  title?: string
}) => {
  const [showMoveNode, setShowMoveNode] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const { deleteNode } = useVersion()

  const contentActions: DropdownOptions = [
    {
      value: '0',
      label: 'Flytt til annen side',
      onClick: () => setShowMoveNode(true),
    },
    {
      value: '0',
      label: 'Dupliser',
      onClick: () => console.log('Dupliser direkte og legg under med "[Header] (kopi)"'),
    },
    {
      value: '0',
      label: 'Fjern innhold',
      onClick: () => setShowConfirmDelete(true),
      styled: 'delete',
    },
  ]

  return (
    <header {...bem('header')}>
      <Icon name={getTypeIcon(type)} size="20" {...bem('header-icon')} />
      <h2 {...bem('title')}>{getTypeText(type)}</h2>
      <Dropdown icon="Ellipsis" direction="right" options={contentActions} label="Valg" iconOnly />

      <Modal
        title="Flytt til annen side"
        expanded={showMoveNode}
        onClose={() => setShowMoveNode(false)}
      >
        <Help
          description={`Velg hvilken side du ønsker å flytte ${title ? `"${title}"` : 'dette innholdet'} til.`}
        />
        <ButtonBar>
          <Button type="button">Side 1</Button>
          <Button type="button">Side 2</Button>
          <Button type="button">Side 3</Button>
        </ButtonBar>
      </Modal>

      <Modal
        title="Fjern innhold"
        expanded={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
      >
        <Help
          description={`Vil du slette ${title ? `"${title}"` : 'dette innholdet'} ? Handlingen kan ikke angres.`}
        />
        <ButtonBar>
          <Button
            type="button"
            warning
            onClick={async () => {
              await deleteNode(node.id)
              setShowConfirmDelete(false)
            }}
          >
            Slett
          </Button>

          <Button type="button" onClick={() => setShowConfirmDelete(false)}>
            Avbryt
          </Button>
        </ButtonBar>
      </Modal>
    </header>
  )
}

const Main = ({ children, full }: { children: ReactNode; full?: boolean }) => (
  <div {...bem('main', { full })}>{children}</div>
)

const Aside = ({ children }: { children: ReactNode }) => <div {...bem('aside')}>{children}</div>

export default function Content({ nodeId, allNodes, pageId }: Props) {
  const node = allNodes?.[nodeId]

  return (
    <section {...bem('')}>
      {node ? (
        <Node node={{ ...node, id: nodeId }} pageId={pageId} allNodes={allNodes} />
      ) : (
        <>
          <p {...bem('error')}>Fant ikke node med id: {nodeId}</p>
        </>
      )}
    </section>
  )
}
