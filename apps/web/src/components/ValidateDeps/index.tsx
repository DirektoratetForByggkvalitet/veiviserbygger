import useSWR from 'swr'
import { useVersion } from '@/hooks/useVersion'
import { OptionalExcept, PageContent } from 'types'
import { DocumentReference } from 'firebase/firestore'

type Props = {
  children?: React.ReactNode
  node: OptionalExcept<PageContent, 'id'>
  sourceRef: {
    doc: DocumentReference
    path: string[]
  }
}

export default function ValidateDeps({ children, node, sourceRef }: Props) {
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
    return <div>Loading...</div>
  }

  if (!deleteValidationResult) {
    return <div>Error loading validation result</div>
  }

  if (!deleteValidationResult.allowed) {
    return (
      <div>
        <h3>Noden kan ikke slettes</h3>
        <p>Dette skyldes at noen er referert til et annet sted i veiviseren.</p>

        <ul>
          {deleteValidationResult.blockedBy?.map((dependency, index) => (
            <li key={index}>
              <br />
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
        <div>
          <p>
            Når noden slettes vil også{' '}
            <strong>
              {deleteValidationResult.additionalDeletes?.length} andre noder bli slettet
            </strong>
            . Disse refereres ikke til noe sted etter sletting av denne noden, og blir derfor tatt
            bort.
          </p>
        </div>
        {children}
      </>
    )
  }

  return children
}
