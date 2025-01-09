import { useState } from 'react'

import Form from '@/components/Form'
import Input from '@/components/Input'
import Meta from '@/components/Meta'
import Minimap from '@/components/Minimap'
import Panel from '@/components/Panel'
import Button from '@/components/Button'
import Content from '@/components/Content'
import DUMMY_DATA from '@/dummy_data'
import useWizard from '@/hooks/useWizard'
import { useNavigate, useParams } from 'react-router'
import Page from '@/components/Page'

export default function HomePage() {
  const [selected, setSelected] = useState<string | null>(null)
  const { wizardId, versionId } = useParams<{ wizardId?: string; versionId?: string }>()
  const { wizard, versions, version } = useWizard(wizardId, versionId)
  const navigate = useNavigate()

  const handleSelect = (id: string) => {
    setSelected((value) => (value === id ? null : id))
  }

  const handleClose = () => {
    setSelected(null)
  }

  const dataIndex = selected ? DUMMY_DATA.findIndex((item) => item.id === selected) : undefined
  const data = selected ? DUMMY_DATA[dataIndex ?? 0] : undefined
  const panelTitle = selected && data ? `${(dataIndex ?? 0) + 1}. ${data.heading}` : ''

  console.log(version, versions)

  return (
    <>
      {versions?.map((version) => (
        <Button
          key={version.id}
          type="button"
          onClick={() => navigate(`/wizard/${wizardId}/${version.id}`)}
        >
          {version.id}
        </Button>
      ))}

      <Page title={wizard?.data?.title}>
        <Meta title="Losen Veiviserbygger" />

        <Panel
          open={!!(selected && data)}
          onClose={handleClose}
          backdrop={false}
          title={panelTitle}
        >
          <Form>
            <Form.Split>
              <Input
                label="Tittel"
                value={data?.heading || ''}
                onChange={() => {
                  console.log('Hej')
                }}
              />
            </Form.Split>

            {data?.content?.map((node) => <Content key={node.id} type={node.type} data={node} />)}

            <Button type="button">Legg til innhold</Button>
          </Form>
        </Panel>

        {wizardId ? <Minimap onClick={handleSelect} selected={selected} data={DUMMY_DATA} /> : null}
        {/* {wizardId ? <Minimap onClick={handleSelect} selected={selected} data={version?.pages || []} /> : null} */}
      </Page>
    </>
  )
}
