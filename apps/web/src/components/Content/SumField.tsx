import Editor from '@/components/Editor'
import Input from '@/components/Input'
import Form from '@/components/Form'
import Help from '@/components/Help'
import ButtonBar from '@/components/ButtonBar'
import NodeSection from '@/components/NodeSection'
import SumFields from '@/components/SumFields'

import { useVersion } from '@/hooks/useVersion'
import { getTypeDescription } from '@/lib/content'
import ErrorWrapper from '../ErrorWrapper'
import AccordionFields from './shared/AccordionFields'
import FieldProperties from './shared/FieldProperties'
import InputWithSuggestions, { UNIT_SUGGESTIONS } from './shared/InputWithSuggestions'
import { FieldProps } from './types'

export default function SumField({
  id,
  path,
  node,
  allNodes,
  sourceRef,
}: FieldProps & { node: Extract<FieldProps['node'], { type: 'Sum' }> }) {
  const { patchNode, getNodeRef } = useVersion()

  return (
    <NodeSection id={id} path={path} type={node.type}>
      <NodeSection.Header type={node.type} node={node} sourceRef={sourceRef} title={node.heading} />
      <NodeSection.Main>
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
        <Form.Split>
          <ErrorWrapper slice={['unit']}>
            <InputWithSuggestions
              label="Enhet"
              placeholder="m², år, kg, osv."
              suggestions={UNIT_SUGGESTIONS}
              value={node.unit || ''}
              onChange={(v) => patchNode(node.id, { type: 'Sum', unit: v })}
            />
          </ErrorWrapper>
        </Form.Split>
        <SumFields node={node} nodes={allNodes} />
      </NodeSection.Main>
      <NodeSection.Sidebar>
        <Help description={getTypeDescription(node.type)} />
        <ButtonBar hideMarginTop list>
          <FieldProperties label="Feltegenskaper">
            <Form.Split>
              <ErrorWrapper slice={['minimum']}>
                <Input
                  label="Minimumsverdi"
                  placeholder="0"
                  type="number"
                  value={node.minimum}
                  onChange={(v) => patchNode(node.id, { type: 'Sum', minimum: v })}
                />
              </ErrorWrapper>
            </Form.Split>
          </FieldProperties>
          <AccordionFields node={node} getNodeRef={getNodeRef} patchNode={patchNode} />
        </ButtonBar>
      </NodeSection.Sidebar>
      {/* TODO: show */}
    </NodeSection>
  )
}
