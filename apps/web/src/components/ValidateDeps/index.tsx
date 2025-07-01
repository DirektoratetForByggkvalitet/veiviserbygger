import useSWR from 'swr'
import { useVersion } from '@/hooks/useVersion'
import Help from '@/components/Help'
import Message from '@/components/Message'
import { Expression, OptionalExcept, PageContent } from 'types'
import { DocumentReference } from 'firebase/firestore'
import useWizard from '@/hooks/useWizard'
import { useParams } from 'react-router'
import { get } from 'lodash'
import { getOrdered } from 'shared/utils'

type Props = {
  children?: React.ReactNode
  node: OptionalExcept<PageContent, 'id'>
  sourceRef: {
    doc: DocumentReference
    path: string[]
  }
  title?: string
}

export default function ValidateDeps({ children, node, sourceRef, title }: Props) {
  const { wizardId, versionId } = useParams()
  const { version, nodes } = useWizard(wizardId, versionId)

  const { validateDelete, getNodeRef } = useVersion()

  const { isLoading, data: deleteValidationResult } = useSWR(
    `${sourceRef.doc.path} ${sourceRef.path}`,
    () =>
      validateDelete({
        node: getNodeRef(node.id),
        ref: sourceRef,
      }),
  )

  const vocalizeExpression = (expression?: Expression): string => {
    if (!expression) {
      return 'Ukjent uttrykk'
    }

    const clauses = getOrdered(expression?.clauses)
    const node = nodes[expression.field?.id || '']
    const value = get(
      node,
      ['options', expression?.value ?? ('' as any), 'heading'],
      expression.value,
    )

    if (clauses.length) {
      return clauses
        .map((clause) => `(${vocalizeExpression(clause)})`)
        .join(expression.type === 'and' ? ' og ' : ' eller ')
    }

    let simpleExpression = `«${get(node, 'heading') || expression.field?.id || 'Ukjent felt'}»`

    if (expression.operator === 'between') {
      simpleExpression += ` mellom ${expression.value?.from} og ${expression.value?.to}`
    } else if (expression.operator === 'eq') {
      simpleExpression += ` er lik «${value}»`
    } else if (expression.operator === 'neq') {
      simpleExpression += ` er ikke lik «${value}»`
    } else if (expression.operator === 'gt') {
      simpleExpression += ` er større enn «${expression.value}»`
    } else if (expression.operator === 'lt') {
      simpleExpression += ` er mindre enn «${expression.value}»`
    } else if (expression.operator === 'gte') {
      simpleExpression += ` er større enn eller lik «${expression.value}»`
    } else if (expression.operator === 'lte') {
      simpleExpression += ` er mindre enn eller lik «${expression.value}»`
    } else if (expression.operator === 'is') {
      simpleExpression += ` er satt`
    } else if (expression.operator === 'not') {
      simpleExpression += ` er ikke satt`
    } else if (expression.operator === 'isnot') {
      simpleExpression += ` er ikke satt`
    } else if (expression.operator === 'required') {
      simpleExpression += ` er påkrevd`
    } else {
      simpleExpression += ` ${expression.operator} `
    }

    return simpleExpression
  }

  const vocalizeLocation = (docRef: DocumentReference, path: string[]) => {
    if (docRef.path.includes('/nodes/') && nodes[docRef.id]) {
      const node = nodes[docRef.id]

      if (node.type !== 'Branch') {
        // do nothing, we only vocalize branches
      } else if (node.preset === 'ExtraInformation') {
        return `Ekstra informasjon hvis: ${vocalizeExpression(node.test)}`
      } else if (node.preset === 'NegativeResult') {
        return `Negativt resultat hvis: ${vocalizeExpression(node.test)}`
      } else if (node.preset === 'NewQuestions') {
        return `Nye spørsmål hvis: ${vocalizeExpression(node.test)}`
      }

      if (get(node, 'heading')) {
        return get(node, 'heading')
      }

      return `Node: ${docRef.id}`
    }

    if (path.includes('pages')) {
      return `Siden «${get(version, [...path.slice(0, 2), 'heading'], 'Ukjent side')}»`
    }

    return `${docRef.path} ${path.join('.')}`
  }

  if (isLoading) {
    return <div>Laster...</div>
  }

  if (!deleteValidationResult) {
    return <Message title="Error ved validering av innhold før sletting" />
  }

  if (!deleteValidationResult.allowed) {
    return (
      <div>
        <Message title="Innholdet kan ikke slettes">
          <p>
            Dette skyldes at {title ? `"${title}` : ' dette innholdet'} referes til fra et annet
            sted i veiviseren. Det kan for eksempel være i logikk for vis eller skjul av innhold. Du
            trenger å fjerne denne referansen før du kan slette innholdet.
          </p>
        </Message>

        <ul
          style={{
            fontSize: '14px',
            backgroundColor: '#f8f8f8',
            padding: '10px',
          }}
        >
          {deleteValidationResult.blockedBy?.map((dependency, index) => (
            <li key={index} style={{ padding: '10px 0' }}>
              <dl style={{ display: 'grid', gridTemplateColumns: '150px auto' }}>
                <dt>
                  <strong>Type</strong>
                </dt>
                <dd>
                  {dependency.type === 'content-node' ? 'Vises på en side' : null}
                  {dependency.type === 'in-expression' ? 'Er brukt i et logisk uttrykk' : null}
                  {dependency.type === 'unknown' ? 'Ukjent type' : null}
                  {dependency.path?.[0] === 'pages' && dependency.path.slice(-2)[0] === 'show'
                    ? ' som bestemmer om siden vises'
                    : null}
                </dd>
                <dt>
                  <strong>Hvor</strong>
                </dt>
                <dd>{vocalizeLocation(dependency.doc, dependency.path)}</dd>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (deleteValidationResult.additionalDeletes?.length) {
    return (
      <>
        <Help
          description={
            <>
              Vil du slette {title ? `"${title}"` : 'dette innholdet'} og alt innhold som ligger
              inni elementet? Handlingen kan ikke angres.
              {/* <strong>
                  {deleteValidationResult.additionalDeletes?.length} underliggende innhold bli
                  slettet
                </strong>
                */}
            </>
          }
        />
        {children}
      </>
    )
  }

  return children
}
