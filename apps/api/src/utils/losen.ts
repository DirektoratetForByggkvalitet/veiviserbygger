import { Error, Page, Result, WizardDefinition } from 'losen'
import { getCompleteWizard } from '../services/firestore'
import { getOrdered } from 'shared/utils'
import { Expression, OptionalExcept, PageContent, WizardPage } from 'types'
import { Expression as LosenExpression } from 'losen/utils/dsl'

type CompleteWizardData = Awaited<ReturnType<typeof getCompleteWizard>>
type ResolvedNode<T extends PageContent['type'] = any> = {
  id: string
} & Extract<OptionalExcept<PageContent, 'type'>, { type: T }>

type TransformerFunc<
  SourceType extends PageContent['type'],
  DestType extends Page['children'][number]['type'] = SourceType,
> = (
  node: ResolvedNode<SourceType>,
  data: CompleteWizardData,
  deps: DependencyContainer,
) => Extract<Page['children'][number], { type: DestType }>[]

function trimText(text?: string) {
  if (!text) {
    return text
  }

  if (text.match(/^<p>.*<\/p>$/) && Array.from(text.matchAll(/<\/p>/g)).length === 1) {
    return text.replace(/^<p>(.*)<\/p>$/, '$1')
  }

  return text
}

function getImageUrl(image: string, deps: DependencyContainer) {
  // const base = process.env.FIREBASE_STORAGE_EMULATOR_HOST

  return deps.storage.bucket().file(image).publicUrl()
}

function transformExpression(expression: Expression, data: CompleteWizardData): LosenExpression {
  if (expression.type) {
    return {
      type: expression.type,
      clauses: getOrdered(expression.clauses).map((c) => transformExpression(c, data)),
    }
  }

  return {
    operator: expression.operator,
    field: expression.field.id,
    value: expression.value,
  }
}

const transformText: TransformerFunc<'Text'> = (node, data) => {
  return [
    {
      id: node.id,
      type: 'Text',
      heading: node.heading,
      text: trimText(node.text),
      show: node.show ? transformExpression(node.show, data) : undefined,
    },
  ]
}

const transformRadio: TransformerFunc<'Radio'> = (node, data, deps) => {
  return [
    {
      id: node.id,
      type: 'Radio',
      property: node.id,
      heading: node.heading || 'Mangler navn',
      text: trimText(node.text),
      show: node.show ? transformExpression(node.show, data) : undefined,
      image: node.image?.file
        ? {
            url: getImageUrl(node.image?.file, deps),
            alt: node.image.alt || '',
          }
        : undefined,
      grid: node.grid,
      options: getOrdered(node.options).map((o) => ({
        id: o.id,
        heading: o.heading,
        value: o.id,
        type: 'Answer',
        // image: o.image, // TODO: Implement image support
      })),
    },
  ]
}

const transformCheckbox: TransformerFunc<'Checkbox'> = (node, data, deps) => {
  return [
    {
      id: node.id,
      type: 'Checkbox',
      property: node.id,
      heading: node.heading || 'Mangler navn',
      text: trimText(node.text),
      show: node.show ? transformExpression(node.show, data) : undefined,
      image: node.image?.file
        ? {
            url: getImageUrl(node.image?.file, deps),
            alt: node.image.alt || '',
          }
        : undefined,
      grid: node.grid,
      options: getOrdered(node.options).map((o) => ({
        id: o.id,
        heading: o.heading,
        value: o.id,
        type: 'Answer',
        // image: o.image, // TODO: Implement image support
      })),
    },
  ]
}

const transformBranch: TransformerFunc<'Branch', 'Result' | 'Branch'> = (node, data, deps) => {
  if (node.preset === 'NegativeResult') {
    const content = getOrdered(node.content).map((n) => data.nodes[n.node.id])
    const errorNode = content.find((n) => n.type === 'Error')
    const resultNode = content.find((n) => n.type === 'Result')

    if (!errorNode || !resultNode) {
      return []
    }

    return [
      {
        id: node.id,
        type: 'Branch',
        branches: [
          {
            test: transformExpression(node.test!, data),
            children: [
              // Show an error message
              {
                id: errorNode.id,
                type: 'Error',
                children: [
                  {
                    id: `${errorNode.id}.msg`,
                    type: 'Text',
                    heading: resultNode?.heading,
                    text: trimText(errorNode?.text),
                    warning: true,
                  },
                ],
              } as Error,

              // and a result page that short circuits the wizard
              {
                id: resultNode?.id,
                type: 'Result',
                heading: resultNode?.heading,

                // if the error node has a text, show it as a warning on the result page
                // to give context to the user about why the wizard was short circuited
                children: trimText(errorNode?.text)?.length
                  ? [
                      {
                        id: `${resultNode?.id}.error`,
                        type: 'Error',
                        children: [
                          {
                            id: `${resultNode?.id}.error.msg`,
                            type: 'Text',
                            text: trimText(errorNode?.text),
                            warning: true,
                          },
                        ],
                      } as Error,
                    ]
                  : [],
              } as Result,
            ],
          },
        ],
      },
    ]
  }

  return [
    {
      id: node.id,
      type: 'Branch',
      branches: [
        {
          test: transformExpression(node.test!, data),
          children: getOrdered(node.content).flatMap((n) => transformNode(n, data, deps)),
        },
      ],
    },
  ]
}

const transformInformation: TransformerFunc<'Information'> = (node) => {
  return [
    {
      id: node.id,
      type: 'Information',
      heading: node.heading || 'Informasjon uten navn',
      text: trimText(node.text),
    },
  ]
}

const transformInput: TransformerFunc<'Input'> = (node, data) => {
  return [
    {
      id: node.id,
      type: 'Input',
      heading: node.heading || 'Input uten navn',
      property: node.id,
      text: trimText(node.text),
      show: node.show ? transformExpression(node.show, data) : undefined,
    },
  ]
}

const transformNumber: TransformerFunc<'Number'> = (node, data) => {
  return [
    {
      id: node.id,
      type: 'Number',
      heading: node.heading || 'Tallfelt uten navn',
      property: node.id,
      text: trimText(node.text),
      show: node.show ? transformExpression(node.show, data) : undefined,
    },
  ]
}

const transformError: TransformerFunc<'Error'> = (node) => {
  return [
    {
      id: node.id,
      type: 'Error',
      heading: node.heading || 'Feil uten navn',
      text: trimText(node.text),
      children: [
        {
          id: `${node.id}.msg`,
          type: 'Text',
          text: trimText(node.text),
          warning: true,
        },
      ],
    },
  ]
}

function transformNode(
  nodeRef: WizardPage['content'][number],
  data: CompleteWizardData,
  deps: DependencyContainer,
): Page['children'] {
  const node = data.nodes[nodeRef.node.id]

  if (!node) {
    return []
  }

  if (node.type === 'Text') {
    return transformText(node, data, deps)
  }

  if (node.type === 'Radio') {
    return transformRadio(node, data, deps)
  }

  if (node.type === 'Checkbox') {
    return transformCheckbox(node, data, deps)
  }

  if (node.type === 'Branch') {
    return transformBranch(node, data, deps)
  }

  if (node.type === 'Information') {
    return transformInformation(node, data, deps)
  }

  if (node.type === 'Input') {
    return transformInput(node, data, deps)
  }

  if (node.type === 'Number') {
    return transformNumber(node, data, deps)
  }

  if (node.type === 'Error') {
    return transformError(node, data, deps)
  }

  return [
    {
      id: node.id,
      type: 'Text',
      heading: 'ℹ️ Ukjent type: ' + node.type,
      text: `Noden ${node.id} er av en type som ikke er implementert i transformeringen, ennå.`,
    },
  ]
}

function transformPage(
  page: WizardPage,
  data: CompleteWizardData,
  deps: DependencyContainer,
): Page[] {
  return [
    {
      id: page.id,
      type: page.type as any,
      heading: page.heading,
      lead: page.lead,
      children: getOrdered(page.content || {}).flatMap((n) => transformNode(n, data, deps)),
    },
  ]
}

export function transformWizardDataToLosen(
  data: CompleteWizardData,
  deps: DependencyContainer,
): WizardDefinition {
  return {
    meta: {
      name: data.wizard?.title || 'Veiviser uten navn',
      title: data.wizard?.title || 'Veiviser uten navn',
    },
    schema: getOrdered(data.version?.pages).flatMap((p) => transformPage(p, data, deps)),
  }
}
