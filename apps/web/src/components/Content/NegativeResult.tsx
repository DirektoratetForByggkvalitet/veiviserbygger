import Editor from '@/components/Editor'
import Input from '@/components/Input'
import NodeSection from '@/components/NodeSection'
import { Error as ErrorNode, Result } from 'types'
import { values } from 'lodash'

import { useVersion } from '@/hooks/useVersion'
import BEMHelper from '@/lib/bem'
import ValidationProvider from '@/context/ValidationProvider'
import ErrorWrapper from '../ErrorWrapper'
import { inRef, NodeProps, Props } from './types'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

export default function NegativeResult({
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
      <h3 {...bem('sub-title')}>Da vises følgende</h3>

      {errorNodeId && errorNode && (
        <NodeSection.Presentational title="Resultat i skjema" type="NegativeResult">
          <NodeSection.Branch>
            <ValidationProvider slice={{ doc: getNodeRef(errorNodeId) }}>
              <ErrorWrapper slice={['heading']}>
                <Input
                  label="Overskrift"
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
          </NodeSection.Branch>
        </NodeSection.Presentational>
      )}

      {resultNodeId && resultNode && (
        <NodeSection.Presentational title="Resultatside" type="NegativeResult">
          <NodeSection.Branch>
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
          </NodeSection.Branch>
        </NodeSection.Presentational>
      )}
    </>
  )
}
