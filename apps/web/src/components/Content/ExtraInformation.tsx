import Editor from '@/components/Editor'
import Input from '@/components/Input'
import { Information } from 'types'
import { values } from 'lodash'

import { useVersion } from '@/hooks/useVersion'
import BEMHelper from '@/lib/bem'
import ValidationProvider from '@/context/ValidationProvider'
import ErrorWrapper from '../ErrorWrapper'
import { NodeProps, Props } from './types'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

export default function ExtraInformation({
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
