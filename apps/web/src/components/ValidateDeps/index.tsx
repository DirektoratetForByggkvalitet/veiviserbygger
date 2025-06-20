import useSWR from 'swr'
import { useVersion } from '@/hooks/useVersion'
import Help from '@/components/Help'
import Message from '@/components/Message'
import { OptionalExcept, PageContent } from 'types'
import { DocumentReference } from 'firebase/firestore'

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
  const { validateDelete, getNodeRef } = useVersion()

  const { isLoading, data: deleteValidationResult } = useSWR(
    `${sourceRef.doc.path} ${sourceRef.path}`,
    () =>
      validateDelete({
        node: getNodeRef(node.id),
        ref: sourceRef,
      }),
  )

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
                <dd>{dependency.type}</dd>
                <dt>
                  <strong>Dokument</strong>
                </dt>
                <dd>{dependency.doc.path}</dd>
                <dt>
                  <strong>Path</strong>
                </dt>
                <dd>{dependency.path ? dependency.path.join(' > ') : 'N/A'}</dd>
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
