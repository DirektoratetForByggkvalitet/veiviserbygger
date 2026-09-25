import Dropdown from '@/components/Dropdown'
import Button from '@/components/Button'
import Help from '@/components/Help'
import NodeSection from '@/components/NodeSection'

import { useVersion } from '@/hooks/useVersion'
import { getTypeDescription } from '@/lib/content'
import { getOrdered } from 'shared/utils'
import BEMHelper from '@/lib/bem'
import ErrorWrapper from '../ErrorWrapper'
import Expression from '../Expression'
import ExtraInformation from './ExtraInformation'
import NegativeResult from './NegativeResult'
import { Node } from './'
import { addNodeContentOptions } from './shared/addNodeContentOptions'
import { FieldProps } from './types'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

export default function BranchField({
  id,
  path,
  node,
  page,
  allNodes,
  sourceRef,
}: FieldProps & { node: Extract<FieldProps['node'], { type: 'Branch' }> }) {
  const { addNodes, getNodeRef } = useVersion()

  return (
    <NodeSection id={id} path={path} type={node.type}>
      <NodeSection.Header type={node.preset || node.type} node={node} sourceRef={sourceRef} />

      <NodeSection.Main>
        <ErrorWrapper>
          <Expression expression={node.test} nodes={allNodes} nodeId={node.id} />
        </ErrorWrapper>

        {node.preset === 'NegativeResult' && <NegativeResult node={node} nodes={allNodes} />}
        {node.preset === 'ExtraInformation' && <ExtraInformation node={node} nodes={allNodes} />}
      </NodeSection.Main>

      <NodeSection.Sidebar>
        <Help description={getTypeDescription(node.preset || node.type)} />
      </NodeSection.Sidebar>

      {/**
       * This is the "recursive" part of the branch, where the branch can contain a list
       * of nodes that are displayed when the branch predicate yields a truthy value.
       */}
      {node.preset === 'NewQuestions' && (
        <NodeSection.Branch>
          <h3 {...bem('sub-title')}>Da vises følgende</h3>
          {getOrdered(node?.content)?.map((nodeRef) => {
            const childNode = allNodes[nodeRef?.node?.id]

            return (
              <Node
                id={nodeRef.id}
                path={[...path, 'content', nodeRef.id]}
                node={{ ...childNode, id: nodeRef.node.id }}
                page={page}
                allNodes={allNodes}
                key={nodeRef.id}
                sourceRef={{
                  doc: getNodeRef(node.id),
                  path: ['content', nodeRef.id, 'node'],
                }}
              />
            )
          })}

          <Dropdown
            options={addNodeContentOptions(node.id, addNodes)}
            trigger={({ onClick }) => (
              <Button type="button" size="small" icon="Plus" onClick={onClick}>
                Legg til nye spørsmål
              </Button>
            )}
          />
        </NodeSection.Branch>
      )}
    </NodeSection>
  )
}
