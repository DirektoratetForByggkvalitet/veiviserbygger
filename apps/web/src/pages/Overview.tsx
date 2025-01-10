import { useState } from 'react'
import { PageContent } from '@/types'
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

  const versionsOptions = versions?.map((version) => ({
    value: version.id,
    label: `Versjon: ${version.id}`,
    onClick: () => navigate(`/wizard/${wizardId}/${version.id}`),
  }))

  return (
    <>
      <Page title={wizard?.data?.title} versions={versionsOptions} version={versionId}>
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

            {data?.content?.map((node) => (
              <Content
                key={node.id}
                type={node.type}
                data={node}
                allNodes={
                  data?.content as PageContent[] /* TODO: Alle tilgjengelige nodes i wizard */
                }
              />
            ))}

            <Button type="button">Legg til innhold</Button>
          </Form>
        </Panel>

        {/* {wizardId ? (
          <Minimap onClick={handleSelect} selected={selected} data={version || {}} />
        ) : null} */}
        {wizardId && versionId ? (
          <Minimap
            wizardId={wizardId}
            versionId={versionId}
            onClick={handleSelect}
            selected={selected}
            data={{ pages: DUMMY_DATA }}
          />
        ) : null}
      </Page>
    </>
  )
}
