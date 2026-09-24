import NodeSection from '@/components/NodeSection'
import { useVersion } from '@/hooks/useVersion'
import ValidationProvider from '@/context/ValidationProvider'
import { Props, FieldProps } from './types'

import BranchField from './BranchField'
import CheckboxField from './CheckboxField'
import ErrorField from './ErrorField'
import InformationField from './InformationField'
import RadioField from './RadioField'
import SumField from './SumField'
import TableField from './TableField'
import TextField from './TextField'

export function Node(props: FieldProps) {
  const { node } = props

  if (node.type === 'Text' || node.type === 'Number' || node.type === 'Input') {
    return <TextField {...props} node={node} />
  }

  if (node.type === 'Radio') {
    return <RadioField {...props} node={node} />
  }

  if (node.type === 'Checkbox') {
    return <CheckboxField {...props} node={node} />
  }

  if (node.type === 'Sum') {
    return <SumField {...props} node={node} />
  }

  if (node.type === 'Table') {
    return <TableField {...props} node={node} />
  }

  if (node.type === 'Branch') {
    return <BranchField {...props} node={node} />
  }

  if (node.type === 'Error') {
    return <ErrorField {...props} node={node} />
  }

  if (node.type === 'Information') {
    return <InformationField {...props} node={node} />
  }

  return null
}

export default function Content({ id, nodeId, allNodes, page, path }: Props) {
  const node = allNodes?.[nodeId]
  const { getVersionRef, getNodeRef } = useVersion()

  return (
    <>
      {node ? (
        <ValidationProvider slice={{ doc: getNodeRef(nodeId) }}>
          <Node
            id={id}
            path={path}
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
        <NodeSection id={id} path={path}>
          <NodeSection.Error>
            Klarte ikke laste innhold <small>node id: {nodeId}</small>
          </NodeSection.Error>
        </NodeSection>
      )}
    </>
  )
}
