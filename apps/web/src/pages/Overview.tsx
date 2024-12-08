import { useState } from 'react'

import Editor from '@/components/Editor'
import Form from '@/components/Form'
import Input from '@/components/Input'
import Meta from '@/components/Meta'
import Minimap from '@/components/Minimap'
import Panel from '@/components/Panel'
import DUMMY_DATA from '@/dummy_data'

export default function HomePage() {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    setSelected((value) => (value === id ? null : id))
  }

  const handleClose = () => {
    setSelected(null)
  }

  const dataIndex = selected ? DUMMY_DATA.findIndex((item) => item.id === selected) : undefined
  const data = selected ? DUMMY_DATA[dataIndex ?? 0] : undefined
  const panelTitle = selected && data ? `${(dataIndex ?? 0) + 1}. ${data.heading}` : ''

  return (
    <>
      <Meta title="Velkommen til internett. Vi tar det herfra" />
      <Panel open={!!(selected && data)} onClose={handleClose} backdrop={false} title={panelTitle}>
        <Form>
          <Form.Split>
            <Input
              label="Tittel"
              value=""
              onChange={() => {
                console.log('Hej')
              }}
            />
          </Form.Split>
          <Form.Split>
            <Editor label="Innhold" />
          </Form.Split>
        </Form>
      </Panel>
      <Minimap onClick={handleSelect} selected={selected} data={DUMMY_DATA} />
    </>
  )
}
