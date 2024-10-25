import Icon from '@/components/Icon'
import Page from '@/components/Page'

import { useConstant } from './hooks/config'

export default function App() {
  const heyHoConstant = useConstant('HEY_HO')

  return (
    <Page>
      <h1>Velkommen til internett. Vi tar det herfra</h1>
      <Icon name="Globe" />
      {heyHoConstant}
    </Page>
  )
}
