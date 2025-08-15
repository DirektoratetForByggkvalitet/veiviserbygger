import { Error, Page, Result, WizardDefinition } from 'losen'
import { getCompleteWizard } from '../services/firestore'
import { getOrdered, getStorageRefs, trimText } from 'shared/utils'
import { Expression, Intro, OptionalExcept, PageContent, WizardIntro, WizardPage } from 'types'
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
) => Promise<Extract<Page['children'][number], { type: DestType }>[]>

async function getImageUrl(image: string, deps: DependencyContainer) {
  const [url] = await deps.storage.bucket().file(image).getSignedUrl({
    action: 'read',
    expires: '2099-01-01',
  })

  return url
}

async function processHtml(html: string | undefined, deps: DependencyContainer) {
  // trim whitespace and remove empty paragraphs
  let cleanHtml = trimText(html)

  if (!cleanHtml) {
    return cleanHtml
  }

  // extract all storage references from the HTML content
  const refs = getStorageRefs(cleanHtml)

  if (!refs.length) {
    return cleanHtml
  }

  // replace all image src attributes with the signed URL from Firebase storage
  for (const ref of refs) {
    const url = await getImageUrl(ref, deps)

    cleanHtml = cleanHtml.replace(
      new RegExp(`<img src="([^"]+)" ([^>]*)(data-firebase-storage="${ref}")([^>]*)>`),
      `<img src="${url}"$2$4>`,
    )
  }

  return cleanHtml
}

function expressionFilter(e: Expression) {
  // if the expression has a type, it's a complex expression and should be included
  if (e.type) {
    return true
  }

  // if the expression has no field or operator, it's not a valid expression
  if (!e.field?.id || !e.operator) {
    return false
  }

  // if the operator is one of these, we don't need a value
  if (['is', 'isNot', 'not', 'required'].includes(e.operator)) {
    return true
  }

  // if the value is undefined, it's not a valid expression
  if (typeof e.value === 'undefined') {
    return false
  }

  // if the value is not undefined, all is good
  return true
}

function transformExpression(expression: Expression, data: CompleteWizardData): LosenExpression {
  if (expression.type) {
    return {
      type: expression.type,
      clauses: getOrdered(expression.clauses)
        .filter(expressionFilter)
        .map((c) => transformExpression(c, data)),
    }
  }

  const field = data.nodes[expression.field.id]

  if (field?.type === 'Checkbox') {
    return {
      operator: expression.operator,
      field: `${expression.field.id}.${expression.value}`,
      value: true,
    }
  }

  return {
    operator: expression.operator,
    field: expression.field.id,
    value: expression.value || '',
  }
}

const transformText: TransformerFunc<'Text'> = async (node, data, deps) => {
  return [
    {
      id: node.id,
      type: 'Text',
      heading: node.heading,
      text: await processHtml(node.text, deps),
      show: node.show ? transformExpression(node.show, data) : undefined,
    },
  ]
}

const transformRadio: TransformerFunc<'Radio'> = async (node, data, deps) => {
  return [
    {
      id: node.id,
      type: 'Radio',
      property: node.id,
      heading: node.heading || 'Mangler navn',
      text: await processHtml(node.text, deps),
      show: node.show ? transformExpression(node.show, data) : undefined,
      image: node.image?.file
        ? {
            url: await getImageUrl(node.image?.file, deps),
            alt: node.image.alt || '',
          }
        : undefined,
      grid: node.grid,
      options: await Promise.all(
        getOrdered(node.options).map(async (o) => ({
          id: o.id,
          heading: o.heading,
          value: o.id,
          type: 'Answer',
          image: o.image?.file
            ? {
                url: await getImageUrl(o.image?.file, deps),
                alt: '',
              }
            : undefined,
        })),
      ),
    },
  ]
}

const transformCheckbox: TransformerFunc<'Checkbox'> = async (node, data, deps) => {
  return [
    {
      id: node.id,
      type: 'Checkbox',
      property: node.id,
      heading: node.heading || 'Mangler navn',
      text: await processHtml(node.text, deps),
      show: node.show ? transformExpression(node.show, data) : undefined,
      image: node.image?.file
        ? {
            url: await getImageUrl(node.image?.file, deps),
            alt: node.image.alt || '',
          }
        : undefined,
      grid: node.grid,
      options: await Promise.all(
        getOrdered(node.options).map(async (o) => ({
          id: o.id,
          heading: o.heading,
          value: o.id,
          type: 'Answer',
          image: o.image?.file
            ? {
                url: await getImageUrl(o.image?.file, deps),
                alt: '',
              }
            : undefined,
        })),
      ),
    },
  ]
}

const transformBranch: TransformerFunc<'Branch', 'Result' | 'Branch'> = async (
  node,
  data,
  deps,
) => {
  if (node.preset === 'NegativeResult') {
    const content = getOrdered(node.content).map((n) => data.nodes[n.node.id])
    const errorNode = content.find((n) => n.type === 'Error')
    const resultNode = content.find((n) => n.type === 'Result')

    if (!errorNode || !resultNode) {
      return []
    }

    const errorNodeText = await processHtml(errorNode.text, deps)

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
                    heading: errorNode?.heading,
                    text: await processHtml(errorNode?.text, deps),
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
                children: errorNodeText?.length
                  ? [
                      {
                        id: `${resultNode?.id}.error`,
                        type: 'Error',
                        children: [
                          {
                            id: `${resultNode?.id}.error.msg`,
                            type: 'Text',
                            heading: errorNode?.heading,
                            text: errorNodeText,
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

  const branchChildren = (
    await Promise.all(getOrdered(node.content).flatMap((n) => transformNode(n, data, deps)))
  ).flat()

  return [
    {
      id: node.id,
      type: 'Branch',
      branches: [
        {
          test: transformExpression(node.test!, data),
          children: branchChildren,
        },
      ],
    },
  ]
}

const transformInformation: TransformerFunc<'Information'> = async (node, data, deps) => {
  return [
    {
      id: node.id,
      type: 'Information',
      heading: node.heading || 'Informasjon uten navn',
      text: await processHtml(node.text, deps),
    },
  ]
}

const transformInput: TransformerFunc<'Input'> = async (node, data, deps) => {
  return [
    {
      id: node.id,
      type: 'Input',
      heading: node.heading || 'Input uten navn',
      property: node.id,
      text: await processHtml(node.text, deps),
      show: node.show ? transformExpression(node.show, data) : undefined,
    },
  ]
}

const transformNumber: TransformerFunc<'Number'> = async (node, data, deps) => {
  return [
    {
      id: node.id,
      type: 'Number',
      heading: node.heading || 'Tallfelt uten navn',
      property: node.id,
      text: await processHtml(node.text, deps),
      show: node.show ? transformExpression(node.show, data) : undefined,
    },
  ]
}

const transformError: TransformerFunc<'Error'> = async (node, data, deps) => {
  return [
    {
      id: node.id,
      type: 'Error',
      heading: node.heading || 'Feil uten navn',
      text: await processHtml(node.text, deps),
      children: [
        {
          id: `${node.id}.msg`,
          type: 'Text',
          text: await processHtml(node.text, deps),
          warning: true,
        },
      ],
    },
  ]
}

async function transformNode(
  nodeRef: WizardPage['content'][number],
  data: CompleteWizardData,
  deps: DependencyContainer,
): Promise<Page['children']> {
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

async function transformPage(
  page: WizardPage,
  data: CompleteWizardData,
  deps: DependencyContainer,
): Promise<Page[]> {
  const children = await (
    await Promise.all(getOrdered(page.content || []).map((n) => transformNode(n, data, deps)))
  ).flat()

  return [
    {
      id: page.id,
      type: page.type as any,
      heading: page.heading,
      lead: page.lead,
      children,
      show: page.show ? transformExpression(page.show, data) : undefined,
    },
  ]
}

async function transformIntro(
  intro: Intro | undefined,
  data: CompleteWizardData,
  deps: DependencyContainer,
): Promise<WizardIntro | null> {
  if (!intro) {
    return null
  }

  const content = (
    await Promise.all(
      getOrdered(intro.content || []).flatMap(async ({ node: { id } }) => {
        const node = data.nodes[id]

        if (node?.type !== 'Text') {
          return []
        }

        if (node.type === 'Text') {
          return (await transformText(node, data, deps)).map((n) => ({
            id: n.id,
            heading: n.heading || '',
            text: n.text || '',
          }))
        }

        return []
      }),
    )
  ).flat()

  return {
    heading: intro.heading,
    lead: intro.lead,
    content,
  }
}

export async function transformWizardDataToLosen(
  data: CompleteWizardData,
  deps: DependencyContainer,
): Promise<
  WizardDefinition & {
    intro?: WizardIntro
  }
> {
  const intro = await transformIntro(data.version?.intro, data, deps)
  const schema = (
    await Promise.all(getOrdered(data.version?.pages).flatMap((p) => transformPage(p, data, deps)))
  ).flat()

  return {
    meta: {
      name: data.wizard?.title || 'Veiviser uten navn',
      title: data.wizard?.title || 'Veiviser uten navn',
      localStorageKey: data.version.id,
    },
    schema: !schema?.[0]?.children?.[0]?.type
      ? [
          {
            type: 'Page',
            id: schema?.[0]?.id || 'empty',
            heading: schema?.[0]?.heading || 'Tom veiviser',
            children: [
              {
                id: 'empty-text',
                type: 'Text',
                heading: schema?.[0]?.id ? 'Tom side' : 'Ingen sider',
                text: `${schema?.[0]?.id ? 'Denne veiviseren har en side, men ikke noe innhold' : 'Denne veiviseren har ingen sider'}. Legg til innhold i redigeringsverktøyet.`,
              },
            ],
          },
        ]
      : schema,
    ...(intro ? { intro } : {}),
  }
}
