import Icon from '@/components/Icon'

import { useConstant } from './hooks/config'

export default function App() {
  const heyHoConstant = useConstant('HEY_HO')

  return (
    <div>
      <h1>Velkommen til internett. Vi tar det herifra</h1>
      <Icon name="ArrowRight" />
      <Icon name="ArrowLeft" />
      {heyHoConstant}
    </div>
  )
}
