import Button from '@/components/Button'
import Editor from '@/components/Editor'
import File from '@/components/File'
import Help from '@/components/Help'
import Icon from '@/components/Icon'
import Input from '@/components/Input'
import ButtonBar from '@/components/ButtonBar'
import NodeSection from '@/components/NodeSection'

import { useEditable } from '@/hooks/useEditable'
import { useVersion } from '@/hooks/useVersion'
import BEMHelper from '@/lib/bem'
import { getTypeDescription } from '@/lib/content'
import ErrorWrapper from '../ErrorWrapper'
import AccordionFields from './shared/AccordionFields'
import Options from './shared/Options'
import { FieldProps, inRef } from './types'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

export default function RadioField({
  id,
  path,
  node,
  page,
  sourceRef,
}: FieldProps & { node: Extract<FieldProps['node'], { type: 'Radio' }> }) {
  const { patchNode, getNodeRef } = useVersion()
  const isEditable = useEditable()

  return (
    <NodeSection id={id} path={path} type={node.type}>
      <NodeSection.Header
        type={node.type}
        title={node.heading || 'Hva er det til middag i dag?'}
        node={node}
        sourceRef={sourceRef}
      />

      <NodeSection.Main>
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
      </NodeSection.Main>

      <NodeSection.Sidebar>
        <Help description={getTypeDescription(node.type)} />

        <ButtonBar hideMarginTop list>
          <AccordionFields node={node} getNodeRef={getNodeRef} patchNode={patchNode} />
        </ButtonBar>
      </NodeSection.Sidebar>
    </NodeSection>
  )
}
