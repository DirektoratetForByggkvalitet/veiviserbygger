import usePreview from '@/hooks/usePreview'
import { getStore } from '@/store/preview'
import { Wizard } from 'losen'
import { Provider } from 'react-redux'

export default function PreviewPage() {
  const {
    loading,
    data,
    // reload
  } = usePreview()

  if (loading) {
    return null
  }

  if (!data) {
    return <div>Fant ikke veiviseren</div>
  }

  return (
    <Provider store={getStore(data)}>
      <Wizard wizard={data} />
    </Provider>
  )
}
