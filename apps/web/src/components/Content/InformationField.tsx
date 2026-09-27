import Editor from '@/components/Editor'
import Input from '@/components/Input'
import NodeSection from '@/components/NodeSection'

import { useVersion } from '@/hooks/useVersion'
import ErrorWrapper from '../ErrorWrapper'
import { FieldProps, inRef } from './types'

export default function InformationField({
  id,
  path,
  node,
  sourceRef,
}: FieldProps & { node: Extract<FieldProps['node'], { type: 'Information' }> }) {
  const { patchNode } = useVersion()

  return (
    <NodeSection id={id} path={path} type={node.type}>
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
    </NodeSection>
  )
}
