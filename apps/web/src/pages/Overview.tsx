import useAuth from '@/hooks/auth'

import Button from '@/components/Button'
import Container from '@/components/Container'
import Icon from '@/components/Icon'
import Meta from '@/components/Meta'
import Minimap from '@/components/Minimap'

export default function HomePage() {
  const { logout } = useAuth()

  return (
    <>
      <Meta title="Velkommen til internett. Vi tar det herfra" />
      <Minimap />
      <Container size="full">
        <h1>Velkommen til internett. Vi tar det herfra</h1>
        <Icon name="Globe" />
        <Button onClick={logout}>Logg ut av internett</Button>
      </Container>
    </>
  )
}
