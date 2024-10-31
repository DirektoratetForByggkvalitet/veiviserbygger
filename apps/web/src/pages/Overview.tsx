import useAuth from '@/hooks/auth'

import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Meta from '@/components/Meta'

export default function HomePage() {
  const { logout } = useAuth()

  return (
    <>
      <Meta title="Velkommen til internett. Vi tar det herfra" />
      <h1>Velkommen til internett. Vi tar det herfra</h1>
      <Icon name="Globe" />
      <Button onClick={logout}>Logg ut av internett</Button>
    </>
  )
}
