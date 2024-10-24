import { getConstant } from '@/lib/config'

import Icon from '@/components/Icon'

export default function App() {
  return (
    <div>
      <h1>Velkommen til internett. Vi tar det herifra</h1>
      <Icon name="Search" />
      {getConstant('HEY_HO')}
    </div>
  )
}
