import Intro from '@/components/Intro'
import usePreview from '@/hooks/usePreview'
import { getStore } from '@/store/preview'
import { Wizard } from 'losen'
import { Provider } from 'react-redux'
import { useParams } from 'react-router'
import PreviewBody from '@/components/PreviewBody'
import PageSimple from '@/components/PageSimple'

export default function PreviewPage() {
  const { versionId } = useParams()

  const { loading, data, error } = usePreview()

  if (loading) {
    return null
  }

  if (error?.status === 404) {
    return (
      <PageSimple title="Fant ikke veiviseren">
        {versionId ? (
          <p>
            Lenken du har åpnet refererer til en spesifikk versjon av veiviseren. Denne versjonen{' '}
            <em>kan</em> være slettet etter at du fikk lenken.
          </p>
        ) : null}
      </PageSimple>
    )
  }

  if (!data) {
    return <div>Ingen data</div>
  }

  return (
    <Provider store={getStore(data)}>
      <PreviewBody title={data?.meta?.title || 'Forhåndsvisning'}>
        <Intro
          wizard={data}
          render={({ toggleIntro }) => <Wizard wizard={data} showIntro={toggleIntro(true)} />}
        />
      </PreviewBody>
    </Provider>
  )
}
