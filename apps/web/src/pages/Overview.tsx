import { useState } from 'react'
import { PageContent } from 'types'
import { useSetAtom } from 'jotai'
import Form from '@/components/Form'
import Input from '@/components/Input'
import Meta from '@/components/Meta'
import Minimap from '@/components/Minimap'
import Panel from '@/components/Panel'
import Button from '@/components/Button'
import Content from '@/components/Content'
import Help from '@/components/Help'
import menuState from '@/store/menu'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import DUMMY_DATA from '@/dummy_data'
import useWizard from '@/hooks/useWizard'
import { useParams } from 'react-router'
import Page from '@/components/Page'
import { useVersion } from '@/hooks/useVersion'

export default function HomePage() {
  const [selected, setSelected] = useState<string | null>(null)
  const { wizardId, versionId } = useParams<{ wizardId?: string; versionId?: string }>()
  const { wizard, versions, version } = useWizard(wizardId, versionId)
  const { patchPage, deletePage } = useVersion()
  const showFrontpage = !wizardId
  const setOpenMenu = useSetAtom(menuState)

  const handleSelect = (id: string) => {
    setSelected((value) => (value === id ? null : id))
  }

  const handleClose = () => {
    setSelected(null)
  }

  const handleDelete = (pageId?: string) => () => {
    if (!pageId) {
      return
    }

    deletePage(pageId)
    handleClose()
  }

  // const dataIndex = selected ? version?.pages?.find(p => p.id === selected) || DUMMY_DATA.findIndex((item) => item.id === selected) : undefined
  const data = selected
    ? version?.pages?.find((p) => p.id === selected) ||
      DUMMY_DATA.find((item) => item.id === selected)
    : undefined
  const panelTitle = data?.heading ?? 'Uten tittel'

  if (showFrontpage) {
    setOpenMenu(true) // Open menu if no wizards is selected
  }

  const addContentActions: DropdownOptions = [
    {
      group: 'Innhold',
    },
    {
      value: '0',
      label: 'Tekst',
      onClick: () => console.log('Radiobutton'),
    },
    {
      group: 'Spørsmål',
    },
    {
      value: '0',
      label: 'Radiovalg',
      onClick: () => console.log('Radiobutton'),
    },
    {
      value: '0',
      label: 'Sjekkbokser',
      onClick: () => console.log('Che'),
    },
    {
      value: '0',
      label: 'Tekstfelt',
      onClick: () => console.log('Flytt'),
    },
    {
      value: '0',
      label: 'Nummerfelt',
      onClick: () => console.log('Fjern'),
    },
    {
      group: 'Hendelser',
    },
    {
      value: '0',
      label: 'Vis ekstra informasjon',
      onClick: () => console.log('Branch'),
    },
    {
      value: '0',
      label: 'Vis ekstra spørsmål',
      onClick: () => console.log('Branch'),
      disabled: true,
    },
    {
      value: '0',
      label: 'Negativt resultat',
      onClick: () => console.log('Branch'),
    },
  ]

  return (
    <>
      <Page title={wizard?.data?.title} versions={versions} wizard={wizard}>
        <Meta title="Losen Veiviserbygger" />

        <Panel
          open={!!data}
          onClose={handleClose}
          backdrop={false}
          optionsLabel="Sidevalg"
          options={[
            {
              value: '1',
              label: 'Fjern siden',
              styled: 'delete',
              onClick: handleDelete(data?.id),
            },
          ]}
          title={panelTitle}
        >
          {data?.id ? (
            <>
              <Form>
                <Form.Split>
                  <Input
                    label="Sidetittel"
                    value={data?.heading || ''}
                    onChange={(v) => patchPage(data.id, { heading: v })}
                    header
                  />
                  {data?.type === 'Intro' && (
                    <>
                      <Help description="Introsiden er en obligatorisk start på veiviseren. Her bør man fortelle besøkende kort hva man kan få svar på ved å bruke veiviseren." />
                    </>
                  )}
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
                {!data?.content && (
                  <Help
                    description="Legg til spørsmål, tekst eller andre elementer som skal vises på denne siden i
                      veiviseren."
                  />
                )}
                <Dropdown
                  options={addContentActions}
                  trigger={({ onClick }) => (
                    <Button type="button" primary={!data?.content} icon="Plus" onClick={onClick}>
                      Legg til innhold
                    </Button>
                  )}
                />
                {data?.type === 'Intro' && (
                  <>
                    <Help description='Introsiden vil avsluttes med en "Start veiviseren" knapp som starter veiviseren. Prøv å hold innholdet på siden kort slik at besøkende ikke trenger å scrolle ned til denne knappen.' />
                  </>
                )}
              </Form>
            </>
          ) : null}
        </Panel>

        {wizardId ? (
          <Minimap
            onClick={handleSelect}
            selected={selected}
            data={{
              ...version,
              pages: [...DUMMY_DATA, ...(version?.pages || [])],
            }}
          />
        ) : null}
      </Page>
    </>
  )
}
