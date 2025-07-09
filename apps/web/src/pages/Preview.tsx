import Intro from '@/components/Intro'
import usePreview from '@/hooks/usePreview'
import { getStore } from '@/store/preview'
import { Wizard } from 'losen'
import { Provider } from 'react-redux'
import { useParams } from 'react-router'

export default function PreviewPage() {
  const { versionId } = useParams()

  const { loading, data, error } = usePreview()

  if (loading) {
    return null
  }

  if (error?.status === 404) {
    return (
      <div>
        <h1>Fant ikke veiviseren</h1>

        {versionId ? (
          <p>
            URLen du har åpnet refererer til en spesifikk versjon av veiviseren. Denne versjonen{' '}
            <em>kan</em> være slettet etter at du fikk lenken.
          </p>
        ) : null}
      </div>
    )
  }

  if (!data) {
    return <div>Ingen data</div>
  }

  return (
    <Provider store={getStore(data)}>
      <Intro
        wizard={data}
        render={({ toggleIntro }) => <Wizard wizard={data} showIntro={toggleIntro(true)} />}
      />
    </Provider>
  )
}
