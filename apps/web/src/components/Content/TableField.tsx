import Editor from '@/components/Editor'
import Input from '@/components/Input'
import NodeSection from '@/components/NodeSection'
import TableEditor from '@/components/TableEditor'

import { useVersion } from '@/hooks/useVersion'
import ErrorWrapper from '../ErrorWrapper'
import { FieldProps } from './types'

export default function TableField({
  id,
  path,
  node,
  page,
  allNodes,
  sourceRef,
}: FieldProps & { node: Extract<FieldProps['node'], { type: 'Table' }> }) {
  const { patchNode, getNodeRef } = useVersion()

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
    <NodeSection id={id} path={path} type={node.type}>
      <NodeSection.Header type={node.type} node={node} sourceRef={sourceRef} title={node.heading} />
      <NodeSection.Main full>
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
      </NodeSection.Main>
    </NodeSection>
  )
}
