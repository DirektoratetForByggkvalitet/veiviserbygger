import Editor from '@/components/Editor'
import Input from '@/components/Input'
import Form from '@/components/Form'
import Help from '@/components/Help'
import Checkbox from '@/components/Checkbox'
import ButtonBar from '@/components/ButtonBar'
import NodeSection from '@/components/NodeSection'

import { useVersion } from '@/hooks/useVersion'
import { getTypeDescription, getTypeFieldProperties } from '@/lib/content'
import ErrorWrapper from '../ErrorWrapper'
import AccordionFields from './shared/AccordionFields'
import FieldProperties from './shared/FieldProperties'
import InputWithSuggestions, {
  STEP_SUGGESTIONS,
  UNIT_SUGGESTIONS,
} from './shared/InputWithSuggestions'
import { FieldProps } from './types'

export default function TextField({
  id,
  path,
  node,
  page,
  sourceRef,
}: FieldProps & { node: Extract<FieldProps['node'], { type: 'Text' | 'Number' | 'Input' }> }) {
  const { patchNode, getNodeRef } = useVersion()

  return (
    <NodeSection id={id} path={path} type={node.type}>
      <NodeSection.Header type={node.type} node={node} sourceRef={sourceRef} title={node.heading} />
      <NodeSection.Main>
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
        {node.type === 'Number' && (
          <Form.Split>
            <ErrorWrapper slice={['unit']}>
              <InputWithSuggestions
                label="Enhet"
                placeholder="m², år, kg, osv."
                suggestions={UNIT_SUGGESTIONS}
                value={node.unit || ''}
                onChange={(v) => patchNode(node.id, { type: 'Number', unit: v })}
              />
            </ErrorWrapper>
          </Form.Split>
        )}
      </NodeSection.Main>
      <NodeSection.Sidebar>
        <Help description={getTypeDescription(node.type)} />
        <ButtonBar hideMarginTop list>
          {(node.type === 'Number' || node.type === 'Input') && (
            <FieldProperties label="Feltegenskaper" description={getTypeFieldProperties(node.type)}>
              <ErrorWrapper slice={['optional']}>
                <Checkbox
                  label="Feltet er valgfritt"
                  large
                  checked={node.optional || false}
                  onChange={(v) => patchNode(node.id, { optional: v })}
                />
              </ErrorWrapper>
              {node.type === 'Number' && (
                <>
                  <Form.Split>
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
                  </Form.Split>
                  <Form.Split>
                    <ErrorWrapper slice={['step']}>
                      <InputWithSuggestions
                        label="Stegverdi"
                        placeholder="1, 0.1, 0.01, osv."
                        suggestions={STEP_SUGGESTIONS}
                        suggestionsLabel="Forslag til stegverdi"
                        type="number"
                        value={node.step}
                        onChange={(v) => patchNode(node.id, { type: 'Number', step: v })}
                      />
                    </ErrorWrapper>
                  </Form.Split>
                </>
              )}
            </FieldProperties>
          )}
          {node.type !== 'Text' && (
            <AccordionFields node={node} getNodeRef={getNodeRef} patchNode={patchNode} />
          )}
        </ButtonBar>
      </NodeSection.Sidebar>
    </NodeSection>
  )
}
