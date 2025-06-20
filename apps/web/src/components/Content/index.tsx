import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import Editor from '@/components/Editor'
import File from '@/components/File'
import Help from '@/components/Help'
import Icon from '@/components/Icon'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Fragment, useRef, useState } from 'react'
import {
  Answer,
  Branch,
  DeepPartial,
  Error as ErrorNode,
  Information,
  OptionalExcept,
  PageContent,
  PageContentWithOptions,
  Result,
  WizardPage,
} from 'types'
import { v4 as uuid } from 'uuid'

import { useEditable } from '@/hooks/useEditable'
import { useSortableList } from '@/hooks/useSortableList'
import { useVersion } from '@/hooks/useVersion'
import BEMHelper from '@/lib/bem'
import { getTypeDescription, getTypeIcon, getTypeText } from '@/lib/content'
import { DocumentReference } from 'firebase/firestore'
import { values } from 'lodash'
import { ReactNode } from 'react'
import { getOrdered } from 'shared/utils'
import Expression from '../Expression'
import styles from './Styles.module.scss'
import ValidateDeps from '../ValidateDeps'
const bem = BEMHelper(styles)

type Props = {
  /**
   * Unique id for a page content node on this page. This is NOT the id of
   * the node, but the id of the reference to the node on this page.
   */
  id: PageContent['id']
  nodeId: DocumentReference['id']
  allNodes: Record<string, OptionalExcept<PageContent, 'type' | 'id'>>
  pageId: WizardPage['id']
  path: string[]
}

type NodeProps = {
  allNodes: Props['allNodes']
  node: OptionalExcept<PageContent, 'id' | 'type'>
  pageId: WizardPage['id']
  sourceRef: {
    doc: DocumentReference
    path: string[]
  }
}

function contentAction<T extends PageContent['type']>({
  nodeId,
  type,
  preset,
  disabled,
  defaultContent,
  addNodes,
}: {
  nodeId: string
  type: T
  preset?: Branch['preset']
  disabled?: boolean
  defaultContent?: Omit<DeepPartial<Extract<PageContent, { type: T }>>, 'id' | 'type'>
  addNodes: ReturnType<typeof useVersion>['addNodes']
}) {
  return {
    value: preset || type,
    label: getTypeText(preset || type),
    icon: getTypeIcon(preset || type),
    onClick: () => addNodes({ parentNodeId: nodeId }, [{ type, ...defaultContent }]),
    disabled: disabled,
  }
}

const addNodeContentOptions = (
  nodeId: Branch['id'],
  addNodes: ReturnType<typeof useVersion>['addNodes'],
): DropdownOptions => {
  return [
    {
      group: 'Innhold',
    },
    contentAction({ addNodes, nodeId, type: 'Text' }),
    {
      group: 'Spørsmål',
    },
    contentAction({
      addNodes,
      nodeId,
      type: 'Radio',
      defaultContent: {
        options: {
          [uuid()]: { heading: '', order: 0 },
        },
      },
    }),
    contentAction({
      addNodes,
      nodeId,
      type: 'Select',
      disabled: true,
      defaultContent: {
        options: {
          [uuid()]: { heading: '', order: 0 },
        },
      },
    }),
    contentAction({
      addNodes,
      nodeId,
      type: 'Checkbox',
      defaultContent: {
        [uuid()]: { heading: '', order: 0 },
      },
    }),
    contentAction({ addNodes, nodeId, type: 'Input', disabled: false }),
    contentAction({ addNodes, nodeId, type: 'Number', disabled: false }),
  ]
}

function Option({
  pageId,
  nodeId,
  id,
  heading,
  nodeType,
}: {
  pageId: string
  nodeId: string
  nodeType: 'Radio' | 'Checkbox'
} & Answer) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { getNodeRef, patchAnswer, deleteAnswer, addNodes } = useVersion()
  const sortable = useSortable({ id })
  const { attributes, listeners, setNodeRef, transform, transition } = sortable
  const isEditable = useEditable()

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
          await addNodes({ pageId: pageId, afterNodeId: nodeId }, [
            {
              type: 'Branch',
              preset: 'NegativeResult',
              test: {
                field: getNodeRef(nodeId),
                operator: 'eq',
                value: optionId,
              },
              content: (
                await addNodes({}, [
                  {
                    type: 'Error',
                  },
                  {
                    type: 'Result',
                  },
                ])
              ).reduce(
                (res, node, index) => ({
                  ...res,
                  [uuid()]: {
                    order: index + 1,
                    node,
                  },
                }),
                {},
              ),
            },
          ])
        },
      },
      {
        value: '1',
        label: 'Gir ekstra informasjon',
        onClick: async () => {
          await addNodes({ pageId, afterNodeId: nodeId }, [
            {
              type: 'Branch',
              preset: 'ExtraInformation',
              test: {
                field: getNodeRef(nodeId),
                operator: 'eq',
                value: optionId,
              },
              content: {
                [uuid()]: {
                  order: 0,
                  node: (
                    await addNodes({}, [
                      {
                        type: 'Information',
                      },
                    ])
                  )[0],
                },
              },
            },
          ])
        },
      },
      {
        value: '2',
        label: 'Slett',
        onClick: () => deleteAnswer(nodeId, optionId),
        styled: 'delete',
      },
    ] as DropdownOptions

  return (
    <li
      {...bem('option', { 'read-only': !isEditable })}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      {isEditable ? (
        <button type="button" {...bem('option-handle')} {...listeners}>
          <Icon name="GripVertical" />
        </button>
      ) : (
        <Icon name={getTypeIcon(nodeType)} {...bem('option-icon')} />
      )}
      <Input
        hideLabel
        label="Svar"
        placeholder="Svar"
        value={heading || ''}
        forwardedRef={inputRef}
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
  const { addAnswer, reorderAnswers } = useVersion()
  const options = getOrdered(node.options)
  const isEditable = useEditable()
  const { value, onSort } = useSortableList(options, (list) => reorderAnswers(node.id, list))

  const handleSortingDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const newIndex = options?.findIndex((r) => r.id === over?.id)

      if (newIndex === undefined) {
        console.error('Could not find new index')
        return
      }

      onSort(active.id, newIndex)
    }
  }

  return (
    <DndContext onDragEnd={handleSortingDragEnd}>
      <SortableContext items={value}>
        <ul {...bem('options')}>
          {value.map(({ id }) => {
            const option = options.find((o) => o.id === id)

            if (!option) {
              return null
            }

            return (
              <Option
                key={option.id}
                pageId={pageId}
                nodeType={node.type === 'Radio' ? 'Radio' : 'Checkbox'}
                nodeId={node.id}
                {...option}
              />
            )
          })}

          {!value || (value.length === 0 && <li {...bem('option', 'placeholder')}>Ingen ...</li>)}
          {isEditable && (
            <li key="add">
              <Button type="button" size="small" icon="Plus" onClick={() => addAnswer(node.id, {})}>
                Legg til svaralternativ
              </Button>
            </li>
          )}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function ExtraInformation({
  node,
  nodes,
}: {
  node: Extract<NodeProps['node'], { type: 'Branch' }>
  nodes: Props['allNodes']
}) {
  const { patchNode, addNodes } = useVersion()

  const informationNodeId = values(node.content).find(
    (n) => nodes[n.node.id].type === 'Information',
  )?.node.id
  const informationNode = informationNodeId ? (nodes[informationNodeId] as Information) : undefined

  // this shouldn't really happen, but just in case an extra information node
  // exists without content, we allow it to be created
  const createContent = async () => {
    if (!informationNode) {
      return
    }

    const newInformationNodeRef = (
      await addNodes({}, [
        {
          type: 'Information',
        },
      ])
    )[0]

    await patchNode(node.id, {
      content: {
        [uuid()]: {
          order: 0,
          node: newInformationNodeRef,
        },
      },
    })
  }

  if (!node || node?.preset !== 'ExtraInformation') {
    return null
  }

  if (!informationNodeId || !informationNode) {
    return (
      <div>
        <Button size="small" onClick={createContent}>
          Legg til innhold
        </Button>
      </div>
    )
  }

  return (
    <>
      <h3 {...bem('sub-title')}>Vises følgende ekstrainformasjon</h3>

      <Editor
        label="Ekstra informasjon"
        value={informationNode.text || ''}
        onChange={(v) => patchNode(informationNodeId, { text: v })}
      />
    </>
  )
}

function NegativeResult({
  node,
  nodes,
}: {
  node: Extract<NodeProps['node'], { type: 'Branch' }>
  nodes: Props['allNodes']
}) {
  const { patchNode } = useVersion()

  if (!node || node?.preset !== 'NegativeResult') {
    return null
  }

  const resultNodeId = values(node.content).find((n) => nodes[n.node.id].type === 'Result')?.node.id
  const errorNodeId = values(node.content).find((n) => nodes[n.node.id].type === 'Error')?.node.id

  const resultNode = resultNodeId ? (nodes[resultNodeId] as Result) : undefined
  const errorNode = errorNodeId ? (nodes[errorNodeId] as ErrorNode) : undefined

  return (
    <>
      <h3 {...bem('sub-title')}>Vises følgende</h3>

      {resultNodeId && resultNode && (
        <Input
          label="Tittel på resultatsiden"
          value={resultNode.heading || ''}
          onChange={(v) => patchNode(resultNodeId, { heading: v })}
        />
      )}

      {errorNodeId && errorNode && (
        <Editor
          label="Feilmelding"
          value={errorNode.text || ''}
          onChange={(v) => patchNode(errorNodeId, { text: v })}
        />
      )}
    </>
  )
}

function Node({ node, pageId, allNodes, sourceRef }: NodeProps) {
  const { patchNode, addNodes, getNodeRef } = useVersion()
  const isEditable = useEditable()

  if (node.type === 'Text' || node.type === 'Number' || node.type === 'Input') {
    return (
      <Fragment key={node.id}>
        <Header type={node.type} node={node} sourceRef={sourceRef} />
        <Main>
          <Input
            label="Tittel"
            value={node.heading || ''}
            onChange={(v) => patchNode(node.id, { heading: v })}
            header
          />
          <Editor
            label="Innhold"
            value={node.text || ''}
            onChange={(v) => patchNode(node.id, { text: v })}
          />
        </Main>
        <Aside>
          <Help description={getTypeDescription(node.type)} />
        </Aside>
        {/* TODO: summary, details, show */}
      </Fragment>
    )
  }

  if (node.type === 'Radio') {
    return (
      <Fragment key={node.id}>
        <Header
          type={node.type}
          title={node.heading || 'Hva er det til middag i dag?'}
          node={node}
          sourceRef={sourceRef}
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
            onChange={(v) => patchNode(node.id, { type: 'Radio', text: v })}
          />
          <File
            label="Bilde"
            image={node?.image?.url}
            alt={node?.image?.alt}
            onAltChange={() => console.log('update alt')}
            onFileUpload={(file) => console.log(file)}
            removeFile={() => console.log('remove')}
          />
          <div {...bem('sub-header')}>
            <h3 {...bem('sub-title')}>Svaralternativer</h3>
            {isEditable ? (
              <>
                <Button
                  iconOnly
                  toggle
                  size="small"
                  icon="LayoutGrid"
                  pressed={node.grid}
                  onClick={() => patchNode(node.id, { type: 'Radio', grid: !node.grid })}
                >
                  Vis svaralternativer som grid
                </Button>
                <Button
                  iconOnly
                  toggle
                  size="small"
                  icon="Rows3"
                  pressed={!node.grid}
                  onClick={() => patchNode(node.id, { type: 'Radio', grid: !node.grid })}
                >
                  Vis svaralternativer som liste
                </Button>
              </>
            ) : (
              <span title={node.grid ? 'Gridvisning' : 'Listevisning'}>
                <Icon name={node.grid ? 'LayoutGrid' : 'Rows3'} {...bem('option-icon')} />
              </span>
            )}
          </div>
          <Options node={node} pageId={pageId} />
        </Main>

        <Aside>
          {/* TODO: summary, details, show */}
          <Help description={getTypeDescription(node.type)} />
        </Aside>
      </Fragment>
    )
  }

  if (node.type === 'Checkbox') {
    return (
      <Fragment key={node.id}>
        <Header
          type={node.type}
          title={node.heading || 'Hva er det til middag i dag?'}
          node={node}
          sourceRef={sourceRef}
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
            onChange={(v) => patchNode(node.id, { type: 'Checkbox', text: v })}
          />

          <div {...bem('sub-header')}>
            <h3 {...bem('sub-title')}>Svaralternativer</h3>
            {isEditable ? (
              <>
                <Button
                  iconOnly
                  toggle
                  size="small"
                  icon="LayoutGrid"
                  pressed={node.grid}
                  onClick={() => patchNode(node.id, { type: 'Checkbox', grid: !node.grid })}
                >
                  Vis svaralternativer som grid
                </Button>
                <Button
                  iconOnly
                  toggle
                  size="small"
                  icon="Rows3"
                  pressed={!node.grid}
                  onClick={() => patchNode(node.id, { type: 'Checkbox', grid: !node.grid })}
                >
                  Vis svaralternativer som liste
                </Button>
              </>
            ) : (
              <span title={node.grid ? 'Gridvisning' : 'Listevisning'}>
                <Icon name={node.grid ? 'LayoutGrid' : 'Rows3'} {...bem('option-icon')} />
              </span>
            )}
          </div>
          <Options node={node} pageId={pageId} />
        </Main>

        <Aside>
          <Help description={getTypeDescription(node.type)} />
        </Aside>
      </Fragment>
    )
  }

  if (node.type === 'Branch') {
    return (
      <Fragment key={node.id}>
        <Header type={node.preset || node.type} node={node} sourceRef={sourceRef} />

        <Main>
          <Expression expression={node.test} nodes={allNodes} nodeId={node.id} />
          {node.preset === 'NegativeResult' && <NegativeResult node={node} nodes={allNodes} />}
          {node.preset === 'ExtraInformation' && <ExtraInformation node={node} nodes={allNodes} />}

          {/**
           * This is the "recursive" part of the branch, where the branch can contain a list
           * of nodes that are displayed when the branch predicate yields a truthy value.
           */}
          {node.preset === 'NewQuestions' && (
            <>
              {getOrdered(node?.content)?.map((nodeRef) => {
                const childNode = allNodes[nodeRef?.node?.id]

                return (
                  <>
                    <Node
                      node={{ ...childNode, id: nodeRef.node.id }}
                      pageId={pageId}
                      allNodes={allNodes}
                      key={nodeRef.id}
                      sourceRef={{
                        doc: getNodeRef(node.id),
                        path: ['content', nodeRef.id, 'node'],
                      }}
                    />
                  </>
                )
              })}

              <Dropdown
                options={addNodeContentOptions(node.id, addNodes)}
                trigger={({ onClick }) => (
                  <Button type="button" size="small" icon="Plus" onClick={onClick}>
                    Legg til innhold
                  </Button>
                )}
              />
            </>
          )}
        </Main>

        <Aside>
          <Help description={getTypeDescription(node.preset || node.type)} />
        </Aside>
      </Fragment>
    )
  }

  if (node.type === 'Error') {
    return (
      <Fragment key={node.id}>
        <Input
          label="Tittel"
          value={node.heading || ''}
          onChange={(v) => patchNode(node.id, { type: 'Error', heading: v })}
          header
        />

        <Editor
          label="Beskrivelse"
          value={node.text || ''}
          onChange={(v) => patchNode(node.id, { type: 'Error', text: v })}
        />
      </Fragment>
    )
  }

  if (node.type === 'Information') {
    return (
      <Fragment key={node.id}>
        <Input
          label="Tittel"
          value={node.heading || ''}
          onChange={(v) => patchNode(node.id, { type: 'Information', heading: v })}
        />

        <Editor
          label="Beskrivelse"
          value={node.text || ''}
          onChange={(v) => patchNode(node.id, { type: 'Information', text: v })}
        />
      </Fragment>
    )
  }
}

const Header = ({
  type,
  title,
  node,
  sourceRef,
}: {
  type: PageContent['type'] | Branch['preset']
  node: NodeProps['node']
  title?: string
  /**
   * The document in which the node is referenced, and the path inside
   * the document where this refrence is located.
   */
  sourceRef: {
    doc: DocumentReference
    path: string[]
  }
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
          description={`Vil du slette ${title ? `"${title}"` : 'dette innholdet'}? Handlingen kan ikke angres.`}
        />

        <ValidateDeps node={node} sourceRef={sourceRef}>
          <ButtonBar>
            <Button
              type="button"
              warning
              onClick={async () => {
                await deleteNode(node.id, sourceRef)
                setShowConfirmDelete(false)
              }}
            >
              Slett
            </Button>

            <Button type="button" onClick={() => setShowConfirmDelete(false)}>
              Avbryt
            </Button>
          </ButtonBar>
        </ValidateDeps>
      </Modal>
    </header>
  )
}

const Main = ({ children, full }: { children: ReactNode; full?: boolean }) => (
  <div {...bem('main', { full })}>{children}</div>
)

const Aside = ({ children }: { children: ReactNode }) => <div {...bem('aside')}>{children}</div>

export default function Content({ id, nodeId, allNodes, pageId, path }: Props) {
  const node = allNodes?.[nodeId]
  const { getVersionRef } = useVersion()

  return (
    <section {...bem('')} id={id} data-path={path.join('.')}>
      {node ? (
        <Node
          node={{ ...node, id: nodeId }}
          pageId={pageId}
          allNodes={allNodes}
          sourceRef={{
            doc: getVersionRef(),
            path: [...path, 'node'],
          }}
        />
      ) : (
        <>
          <p {...bem('error')}>Fant ikke node med id: {nodeId}</p>
        </>
      )}
    </section>
  )
}
