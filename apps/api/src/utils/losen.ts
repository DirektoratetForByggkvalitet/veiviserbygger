import { Page, WizardDefinition } from 'losen'
import { getCompleteWizard } from '../services/firestore'
import { getOrdered } from 'shared/utils'

export function transformWizardDataToLosen(
  data: Awaited<ReturnType<typeof getCompleteWizard>>,
): WizardDefinition {
  return {
    meta: {
      name: data.wizard?.title || 'Veiviser uten navn',
      title: data.wizard?.title || 'Veiviser uten navn',
    },
    schema: getOrdered(data.version?.pages).map((page) => ({
      id: page.id,
      type: 'Page',
      title: page.heading,
      heading: page.heading,
      children: getOrdered(page.content).reduce<Page['children']>(
        (res, nodeRef) => {
          const node = data.nodes.find((n) => n.id === nodeRef.node.id)

          if (!node) {
            console.log('Node not found', nodeRef, 'on page', page.id)
            return res
          }

          return [
            ...res,
            {
              id: node.id,
              type: node.type,
              branches: [],
              options: [],
            },
          ]
        },
        [] as Page['children'],
      ),
    })),
  }
}
