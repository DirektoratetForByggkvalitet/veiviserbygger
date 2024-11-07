import { useState } from 'react'

import Meta from '@/components/Meta'
import Minimap from '@/components/Minimap'
import Panel from '@/components/Panel'

export default function HomePage() {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    setSelected((value) => (value === id ? null : id))
  }

  const handleClose = () => {
    setSelected(null)
  }

  return (
    <>
      <Meta title="Velkommen til internett. Vi tar det herfra" />
      <Panel open={!!selected} onClose={handleClose}>
        Velkommen til internett. Vi tar det herfra!
      </Panel>
      <Minimap onClick={handleSelect} selected={selected} />
    </>
  )
}
