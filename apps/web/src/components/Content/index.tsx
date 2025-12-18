import Button from '@/components/Button'
import ButtonBar from '@/components/ButtonBar'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import Editor from '@/components/Editor'
import File from '@/components/File'
import Help from '@/components/Help'
import Icon from '@/components/Icon'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import TableEditor from '@/components/TableEditor'
import SumFields from '@/components/SumFields'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { Fragment, useMemo, useRef, useState } from 'react'
import {
  Answer,
  Branch,
  DeepPartial,
  Error as ErrorNode,
  Information,
  Intro,
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

import { ref as storageRef } from 'firebase/storage'

import ValidationProvider from '@/context/ValidationProvider'
import useErrors from '@/hooks/errors'
import useFile from '@/hooks/useFile'
import useFirebase from '@/hooks/useFirebase'
import { useModal } from '@/hooks/useModal'
import { values } from 'lodash'
import { ReactNode } from 'react'
import { getOrdered } from 'shared/utils'
import ErrorWrapper from '../ErrorWrapper'
import Expression from '../Expression'
import ValidateDeps from '../ValidateDeps'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

type Props = {
  /**
   * Unique id for a page content node on this page. This is NOT the id of
   * the node, but the id of the reference to the node on this page.
   */
  id: PageContent['id']
  nodeId: DocumentReference['id']
  allNodes: Record<string, OptionalExcept<PageContent, 'type' | 'id'>>
  page: WizardPage | Intro
  path: string[]
}

type SourceRef = {
  doc: DocumentReference
  path: string[]
}

type NodeProps = {
  allNodes: Props['allNodes']
  node: OptionalExcept<PageContent, 'id' | 'type'>
  page: WizardPage | Intro
  sourceRef: SourceRef
}

function inRef(sourceRef: SourceRef, ...path: string[]): SourceRef {
  return {
    doc: sourceRef.doc,
    path: [...sourceRef.path, ...path],
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
    disabled,
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
    // contentAction({
    //   addNodes,
    //   nodeId,
    //   type: 'Select',
    //   disabled: true,
    //   defaultContent: {
    //     options: {
    //       [uuid()]: { heading: '', order: 0 },
    //     },
    //   },
    // }),
    contentAction({
      addNodes,
      nodeId,
      type: 'Checkbox',
      defaultContent: {
        options: {
          [uuid()]: { heading: '', order: 0 },
        },
      },
    }),
    contentAction({ addNodes, nodeId, type: 'Input', disabled: false }),
    contentAction({
      addNodes,
      nodeId,
      type: 'Number',
      disabled: false,
      defaultContent: {
        step: 1,
      },
    }),
    contentAction({
      addNodes,
      nodeId,
      type: 'Sum',
      defaultContent: {
        fields: {
          [uuid()]: { operation: '+', order: 0 },
        },
      },
      disabled: false,
    }),
    contentAction({
      addNodes,
      nodeId,
      type: 'Table',
      disabled: false,
    }),
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
  const { storage } = useFirebase()
  const { getNodeRef, patchAnswer, deleteAnswer, addNodes, updateAnswerImage } = useVersion()
  const imagePath = useMemo(
    () => storageRef(storage, `${getNodeRef(nodeId).path}/options/${id}/image`).fullPath,
    [nodeId, getNodeRef, id],
  )
  const { url, upload, remove } = useFile(imagePath)
  const sortable = useSortable({ id })
  const { attributes, listeners, setNodeRef, transform, transition } = sortable
  const isEditable = useEditable()

  const style = {
    transform: transform ? `translateY(${transform.y}px)` : undefined,
    transition,
  }

  const optionActions = (nodeId: string, optionId: string) =>
    [
      {
        group: 'Bilde',
      },
      {
        value: '0',
        icon: url ? 'Image' : 'ImagePlus',
        label: url ? 'Erstatt bilde' : 'Legg til bilde',
        onClick: async () => {
          const fileInput = document.createElement('input')
          fileInput.type = 'file'
          fileInput.accept = 'image/png, image/jpeg'
          fileInput.style.display = 'none'
          document.body.appendChild(fileInput)

          fileInput.onchange = async (event: Event) => {
            const file = (event.target as HTMLInputElement).files?.[0]

            if (file) {
              await upload(file)
              await updateAnswerImage(nodeId, optionId, imagePath)
              document.body.removeChild(fileInput)
            }
          }

          fileInput.click()
        },
      },
      ...(url
        ? [
            {
              value: '1',
              icon: 'Trash',
              label: 'Slett bilde',
              onClick: async () => {
                await remove()
                await updateAnswerImage(nodeId, optionId, undefined)
              },
              styled: 'delete',
            },
          ]
        : []),
      {
        group: 'Handlinger',
      },
      {
        value: '2',
        icon: 'Plus',
        label: 'Legg til innhold',
        onClick: async () => {
          await addNodes({ pageId, afterNodeId: nodeId }, [
            {
              type: 'Branch',
              preset: 'NewQuestions',
              test: {
                field: getNodeRef(nodeId),
                operator: 'eq',
                value: optionId,
              },
              content: [],
            },
          ])
        },
      },
      {
        value: '3',
        icon: 'OctagonX',
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
              content: [{ type: 'Error' }, { type: 'Result' }],
            },
          ])
        },
      },
      {
        value: '4',
        icon: 'ListPlus',
        label: 'Gir ekstra spørsmål',
        onClick: async () => {
          await addNodes({ pageId, afterNodeId: nodeId }, [
            {
              type: 'Branch',
              preset: 'NewQuestions',
              test: {
                field: getNodeRef(nodeId),
                operator: 'eq',
                value: optionId,
              },
              content: [],
            },
          ])
        },
      },
      {
        value: '5',
        icon: 'Info',
        label: 'Gir tilleggsinfo',
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
              content: [{ type: 'Information' }],
            },
          ])
        },
      },
      {
        value: '6',
        icon: 'Trash',
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
      {url && <div {...bem('option-image')} style={{ backgroundImage: `url(${url})` }} />}
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
  const { getErrors } = useErrors()

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
        <ErrorWrapper slice={['options']}>
          <ul {...bem('options', { 'has-errors': getErrors(['options']).length })}>
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
                <Button
                  type="button"
                  size="small"
                  icon="Plus"
                  onClick={() => addAnswer(node.id, {})}
                >
                  Legg til svaralternativ
                </Button>
              </li>
            )}
          </ul>
        </ErrorWrapper>
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
  const { patchNode, getNodeRef } = useVersion()

  const informationNodeId = values(node.content).find(
    (n) => nodes[n.node.id].type === 'Information',
  )?.node.id
  const informationNode = informationNodeId ? (nodes[informationNodeId] as Information) : undefined

  if (!node || node?.preset !== 'ExtraInformation' || !informationNodeId || !informationNode) {
    return null
  }

  return (
    <ValidationProvider slice={{ doc: getNodeRef(informationNodeId) }}>
      <h3 {...bem('sub-title')}>Vises følgende</h3>
      <ErrorWrapper slice={['heading']}>
        <Input
          label="Overskrift på tilleggsinfo"
          header
          value={informationNode.heading || ''}
          onChange={(v) => patchNode(informationNodeId, { heading: v })}
        />
      </ErrorWrapper>

      <ErrorWrapper slice={['text']}>
        <Editor
          label="Tilleggsinfo"
          value={informationNode.text || ''}
          onChange={(v) => patchNode(informationNodeId, { text: v })}
          sourceRef={{ doc: getNodeRef(informationNodeId), path: ['text'] }}
        />
      </ErrorWrapper>
    </ValidationProvider>
  )
}

function NegativeResult({
  node,
  nodes,
}: {
  node: Extract<NodeProps['node'], { type: 'Branch' }>
  nodes: Props['allNodes']
}) {
  const { patchNode, getNodeRef } = useVersion()

  const resultNodeId = values(node.content).find((n) => nodes[n.node.id].type === 'Result')?.node.id
  const errorNodeId = values(node.content).find((n) => nodes[n.node.id].type === 'Error')?.node.id

  const resultNode = resultNodeId ? (nodes[resultNodeId] as Result) : undefined
  const errorNode = errorNodeId ? (nodes[errorNodeId] as ErrorNode) : undefined

  if (!node || node?.preset !== 'NegativeResult') {
    return null
  }

  return (
    <>
      <h3 {...bem('sub-title')}>Vises følgende</h3>

      {errorNodeId && errorNode && (
        <ValidationProvider slice={{ doc: getNodeRef(errorNodeId) }}>
          <ErrorWrapper slice={['heading']}>
            <Input
              label="Overskrift på feilmelding"
              header
              value={errorNode.heading || ''}
              onChange={(v) => patchNode(errorNodeId, { heading: v })}
            />
          </ErrorWrapper>

          <ErrorWrapper slice={['text']}>
            <Editor
              label="Feilforklaring"
              value={errorNode.text || ''}
              onChange={(v) => patchNode(errorNodeId, { text: v })}
              sourceRef={inRef({ doc: getNodeRef(errorNodeId), path: ['text'] })}
            />
          </ErrorWrapper>
        </ValidationProvider>
      )}

      {resultNodeId && resultNode && (
        <ValidationProvider slice={{ doc: getNodeRef(resultNodeId) }}>
          <ErrorWrapper slice={['heading']}>
            <Input
              label="Overskrift på resultatside"
              header
              value={resultNode.heading || ''}
              onChange={(v) => patchNode(resultNodeId, { heading: v })}
            />
          </ErrorWrapper>
        </ValidationProvider>
      )}
    </>
  )
}

function Node({ node, page, allNodes, sourceRef }: NodeProps) {
  const { patchNode, addNodes, getNodeRef } = useVersion()
  const isEditable = useEditable()

  if (node.type === 'Text' || node.type === 'Number' || node.type === 'Input') {
    return (
      <Fragment key={node.id}>
        <Header type={node.type} node={node} sourceRef={sourceRef} title={node.heading} />
        <Main>
          {/**
           * Text on result pages does not have a heading, so we show it only if the node
           * is not a Text node or if the page is not a Result page 🙃
           */}
          {node.type !== 'Text' || page.type !== 'Result' ? (
            <ErrorWrapper slice={['heading']}>
              <Input
                label="Ledetekst"
                value={node.heading || ''}
                onChange={(v) => patchNode(node.id, { heading: v })}
                header
              />
            </ErrorWrapper>
          ) : null}

          <ErrorWrapper slice={['text']}>
            <Editor
              label="Beskrivelse"
              value={node.text || ''}
              onChange={(v) => patchNode(node.id, { text: v })}
              sourceRef={{ doc: getNodeRef(node.id), path: ['text'] }}
            />
          </ErrorWrapper>
          {node.type === 'Number' ? (
            <>
              <div {...bem('grid')}>
                <ErrorWrapper slice={['unit']}>
                  <Input
                    label="Enhet"
                    placeholder="m², år, kg, osv."
                    value={node.unit || ''}
                    onChange={(v) => patchNode(node.id, { type: 'Number', unit: v })}
                  />
                </ErrorWrapper>
                <ErrorWrapper slice={['step']}>
                  <Input
                    label="Stegverdi"
                    placeholder="1, 0.1, 0.01, osv."
                    type="number"
                    value={node.step}
                    onChange={(v) => patchNode(node.id, { type: 'Number', step: v })}
                  />
                </ErrorWrapper>
              </div>
              <div {...bem('grid')}>
                <ErrorWrapper slice={['minimum']}>
                  <Input
                    label="Minimumsverdi"
                    placeholder="0"
                    type="number"
                    value={node.minimum}
                    onChange={(v) => patchNode(node.id, { type: 'Number', minimum: v })}
                  />
                </ErrorWrapper>
                <ErrorWrapper slice={['maximum']}>
                  <Input
                    label="Maksimumsverdi"
                    type="number"
                    value={node.maximum}
                    onChange={(v) => patchNode(node.id, { type: 'Number', maximum: v })}
                  />
                </ErrorWrapper>
              </div>
            </>
          ) : null}
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
          <ErrorWrapper slice={['heading']}>
            <Input
              label="Tittel"
              value={node.heading || ''}
              onChange={(v) => patchNode(node.id, { type: 'Radio', heading: v })}
              header
            />
          </ErrorWrapper>

          <ErrorWrapper slice={['text']}>
            <Editor
              label="Beskrivelse"
              value={node.text || ''}
              onChange={(v) => patchNode(node.id, { type: 'Radio', text: v })}
              sourceRef={inRef(sourceRef, 'text')}
            />
          </ErrorWrapper>

          <File
            label="Bilde"
            value={node.image}
            sourceRef={{
              doc: getNodeRef(node.id),
              path: ['image'],
            }}
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
                  Vis svaralternativer som rutenett
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
          <Options node={node} pageId={page.id} />
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
          <ErrorWrapper slice={['heading']}>
            <Input
              label="Tittel"
              value={node.heading || ''}
              onChange={(v) => patchNode(node.id, { type: 'Checkbox', heading: v })}
              header
            />
          </ErrorWrapper>

          <ErrorWrapper slice={['text']}>
            <Editor
              label="Beskrivelse"
              value={node.text || ''}
              onChange={(v) => patchNode(node.id, { type: 'Checkbox', text: v })}
              sourceRef={inRef(sourceRef, 'text')}
            />
          </ErrorWrapper>

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
                  Vis svaralternativer som rutenett
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
          <Options node={node} pageId={page.id} />
        </Main>

        <Aside>
          <Help description={getTypeDescription(node.type)} />
        </Aside>
      </Fragment>
    )
  }

  if (node.type === 'Sum') {
    return (
      <Fragment key={node.id}>
        <Header type={node.type} node={node} sourceRef={sourceRef} title={node.heading} />
        <Main>
          <ErrorWrapper slice={['heading']}>
            <Input
              label="Ledetekst"
              value={node.heading || ''}
              onChange={(v) => patchNode(node.id, { heading: v })}
              header
            />
          </ErrorWrapper>

          <ErrorWrapper slice={['text']}>
            <Editor
              label="Beskrivelse"
              value={node.text || ''}
              onChange={(v) => patchNode(node.id, { text: v })}
              sourceRef={{ doc: getNodeRef(node.id), path: ['text'] }}
            />
          </ErrorWrapper>

          <SumFields node={node} nodes={allNodes} />

          <div {...bem('grid')}>
            <ErrorWrapper slice={['unit']}>
              <Input
                label="Enhet"
                placeholder="m², år, kg, osv."
                value={node.unit || ''}
                onChange={(v) => patchNode(node.id, { type: 'Sum', unit: v })}
              />
            </ErrorWrapper>
            <ErrorWrapper slice={['minimum']}>
              <Input
                label="Minimumsverdi"
                placeholder="0"
                type="number"
                value={node.minimum}
                onChange={(v) => patchNode(node.id, { type: 'Sum', minimum: v })}
              />
            </ErrorWrapper>
          </div>
        </Main>
        <Aside>
          <Help description={getTypeDescription(node.type)} />
        </Aside>
        {/* TODO: summary, details, show */}
      </Fragment>
    )
  }

  if (node.type === 'Table') {
    /*const exampleTable = [
      [
        {
          id: 'possibleRoles.function',
          type: 'Heading',
          text: 'Hei',
        },
        {
          id: 'possibleRoles.class',
          type: 'Heading',
          text: 'På deg',
        },
      ],
    ]*/
    return (
      <Fragment key={node.id}>
        <Header type={node.type} node={node} sourceRef={sourceRef} title={node.heading} />
        <Main full>
          <ErrorWrapper slice={['heading']}>
            <Input
              label="Tittel"
              value={node.heading || ''}
              onChange={(v) => patchNode(node.id, { heading: v })}
              header
            />
          </ErrorWrapper>
          <ErrorWrapper slice={['text']}>
            <Editor
              label="Beskrivelse"
              value={node.text || ''}
              onChange={(v) => patchNode(node.id, { text: v })}
              sourceRef={{ doc: getNodeRef(node.id), path: ['text'] }}
            />
          </ErrorWrapper>
          <ErrorWrapper slice={['cells']}>
            <TableEditor nodeId={node.id} pageId={page.id} cells={node.cells} nodes={allNodes} />
          </ErrorWrapper>
        </Main>
      </Fragment>
    )
  }

  if (node.type === 'Branch') {
    return (
      <Fragment key={node.id}>
        <Header type={node.preset || node.type} node={node} sourceRef={sourceRef} />

        <Main>
          <ErrorWrapper>
            <Expression expression={node.test} nodes={allNodes} nodeId={node.id} />
          </ErrorWrapper>
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
                      page={page}
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
        <ErrorWrapper slice={['heading']}>
          <Input
            label="Tittel"
            value={node.heading || ''}
            onChange={(v) => patchNode(node.id, { type: 'Error', heading: v })}
            header
          />
        </ErrorWrapper>

        <ErrorWrapper slice={['text']}>
          <Editor
            label="Beskrivelse"
            value={node.text || ''}
            onChange={(v) => patchNode(node.id, { type: 'Error', text: v })}
            sourceRef={inRef(sourceRef, 'text')}
          />
        </ErrorWrapper>
      </Fragment>
    )
  }

  if (node.type === 'Information') {
    return (
      <Fragment key={node.id}>
        <ErrorWrapper slice={['heading']}>
          <Input
            label="Tittel"
            value={node.heading || ''}
            onChange={(v) => patchNode(node.id, { type: 'Information', heading: v })}
          />
        </ErrorWrapper>

        <ErrorWrapper slice={['text']}>
          <Editor
            label="Beskrivelse"
            value={node.text || ''}
            onChange={(v) => patchNode(node.id, { type: 'Information', text: v })}
            sourceRef={inRef(sourceRef, 'text')}
          />
        </ErrorWrapper>
      </Fragment>
    )
  }

  return null
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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const { deleteNode } = useVersion()
  const { setModal } = useModal()

  const contentActions: DropdownOptions = [
    {
      value: '0',
      icon: 'ArrowRight',
      label: 'Flytt til annen side',
      onClick: () => setModal({ key: 'move-node', data: { nodeId: node.id } }),
    },
    /* TODO
    {
      value: '0',
      icon: 'Copy',
      label: 'Dupliser',
      onClick: () => console.log('Dupliser direkte og legg under med "[Header] (kopi)"')
    }*/
    {
      value: '0',
      icon: 'Trash',
      label: 'Fjern innhold',
      onClick: () => setShowConfirmDelete(true),
      styled: 'delete',
    },
  ]

  return (
    <header {...bem('header', { negative: type === 'NegativeResult' })}>
      <Icon name={getTypeIcon(type)} size="20" {...bem('header-icon')} />
      <h2 {...bem('title')}>{getTypeText(type)}</h2>
      <Dropdown icon="Ellipsis" direction="right" options={contentActions} label="Valg" iconOnly />

      <Modal
        title="Fjern innhold"
        expanded={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
      >
        <ValidateDeps node={node} sourceRef={sourceRef} title={title || getTypeText(type)}>
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

export default function Content({ id, nodeId, allNodes, page, path }: Props) {
  const node = allNodes?.[nodeId]
  const { getVersionRef, getNodeRef } = useVersion()

  return (
    <section {...bem('')} id={id} data-path={path.join('.')}>
      {node ? (
        <ValidationProvider slice={{ doc: getNodeRef(nodeId) }}>
          <Node
            node={{ ...node, id: nodeId }}
            page={page}
            allNodes={allNodes}
            sourceRef={{
              doc: getVersionRef(),
              path: [...path, 'node'],
            }}
          />
        </ValidationProvider>
      ) : (
        <>
          <p {...bem('error')}>Fant ikke node med id: {nodeId}</p>
        </>
      )}
    </section>
  )
}
