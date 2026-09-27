import { DropdownOptions } from '@/components/Dropdown'
import { useVersion } from '@/hooks/useVersion'
import { getTypeIcon, getTypeText } from '@/lib/content'
import { Branch, DeepPartial, PageContent } from 'types'
import { v4 as uuid } from 'uuid'

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

export const addNodeContentOptions = (
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
