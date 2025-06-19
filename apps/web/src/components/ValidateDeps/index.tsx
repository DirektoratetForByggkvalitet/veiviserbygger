import useSWR from 'swr'
import { useVersion } from '@/hooks/useVersion'
import { OptionalExcept, PageContent } from 'types'

type Props = {
  children?: React.ReactNode
  node: OptionalExcept<PageContent, 'id'>
  path: string[]
}

export default function ValidateDeps({ children, node, path }: Props) {
  const { validateDelete, getNodeRef, getVersionRef } = useVersion()

  const { isLoading, data: deleteValidationResult } = useSWR(path, () =>
    validateDelete({
      node: getNodeRef(node.id),
      ref: {
        doc: getVersionRef(),
        path,
      },
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

  return children
}
